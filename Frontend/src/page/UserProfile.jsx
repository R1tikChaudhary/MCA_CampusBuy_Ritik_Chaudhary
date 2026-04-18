import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCurrentPage } from "../utils/appSlice";
import { setProfile, updateProfileImage } from "../utils/userSlice";
import { useAuth } from "../utils/authUtils";
import HomeHeader from "../Component/HomeHeader.jsx";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserProfile = () => {
  const dispatch = useDispatch();
  const { token } = useAuth();
  const defaultProfileImage =
    "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    branch: "",
    whatsapp: "",
    profileImage: defaultProfileImage,
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableWhatsapp, setEditableWhatsapp] = useState("");
  const [editableBranch, setEditableBranch] = useState("");
  const [listedProducts, setListedProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [deletingProductId, setDeletingProductId] = useState("");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatBranchName = (branch) => {
    if (!branch) return "Not specified";
    return branch
      .split(/\s+|-|_/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await axios.get(
        "http://localhost:5000/api/auth/profile",
        authHeaders
      );

      if (response.data) {
        setUserData(response.data);
        setEditableWhatsapp(response.data.whatsapp || "");
        setEditableBranch(response.data.branch || "");
        dispatch(setProfile(response.data));
      }
    } catch (error) {
      toast.error("Failed to load profile data");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      setInventoryLoading(true);
      const [listedResult, purchaseResult] = await Promise.allSettled([
        axios.get("http://localhost:5000/api/product/user", authHeaders),
        axios.get("http://localhost:5000/api/product/purchases/me", authHeaders),
      ]);

      if (listedResult.status === "fulfilled") {
        setListedProducts(
          Array.isArray(listedResult.value.data) ? listedResult.value.data : []
        );
      } else {
        // Fallback: derive user listings from all products endpoint
        const allProductsResponse = await axios.get(
          "http://localhost:5000/api/product/all"
        );
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = storedUser?._id;
        const allProducts = Array.isArray(allProductsResponse.data)
          ? allProductsResponse.data
          : [];
        const myProducts = allProducts.filter(
          (item) => item?.user?._id === currentUserId
        );
        setListedProducts(myProducts);
      }

      if (purchaseResult.status === "fulfilled") {
        setPurchaseHistory(
          Array.isArray(purchaseResult.value.data) ? purchaseResult.value.data : []
        );
      } else {
        // Graceful fallback: keep profile functional even if purchase API fails
        setPurchaseHistory([]);
      }
    } catch (error) {
      toast.error("Failed to load some profile product data");
      // Last-resort fallback for listings
      try {
        const allProductsResponse = await axios.get(
          "http://localhost:5000/api/product/all"
        );
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const currentUserId = storedUser?._id;
        const allProducts = Array.isArray(allProductsResponse.data)
          ? allProductsResponse.data
          : [];
        const myProducts = allProducts.filter(
          (item) => item?.user?._id === currentUserId
        );
        setListedProducts(myProducts);
      } catch (fallbackError) {
        setListedProducts([]);
      }
      setPurchaseHistory([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setCurrentPage("profile"));
    if (!token) return;

    fetchUserProfile();
    fetchInventoryData();
  }, [dispatch, token]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localPreviewUrl = URL.createObjectURL(file);
    setUserData((prev) => ({ ...prev, profileImage: localPreviewUrl }));

    try {
      const formData = new FormData();
      formData.append("image", file);

      const uploadResponse = await axios.post(
        "http://localhost:5000/api/auth/upload-image",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const imageUrl = uploadResponse.data?.imageUrl;
      if (!imageUrl) {
        throw new Error("Image upload failed");
      }

      const cacheBustedUrl = `${imageUrl}?t=${Date.now()}`;
      const updateResponse = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        {
          whatsapp: editableWhatsapp,
          branch: editableBranch || userData.branch,
          profileImage: cacheBustedUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = updateResponse.data?.user;
      if (updatedUser) {
        setUserData(updatedUser);
        dispatch(setProfile(updatedUser));
        dispatch(updateProfileImage(cacheBustedUrl));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile image updated");
      }
    } catch (error) {
      toast.error("Failed to update profile image");
      fetchUserProfile();
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        {
          whatsapp: editableWhatsapp,
          branch: editableBranch || userData.branch,
          profileImage: defaultProfileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = response.data?.user;
      if (updatedUser) {
        setUserData(updatedUser);
        dispatch(setProfile(updatedUser));
        dispatch(updateProfileImage(defaultProfileImage));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        toast.success("Profile photo removed");
      }
    } catch (error) {
      toast.error("Failed to remove profile photo");
    }
  };

  const handleToggleEdit = () => {
    if (isEditMode) {
      setEditableWhatsapp(userData.whatsapp || "");
      setEditableBranch(userData.branch || "");
    }
    setIsEditMode((prev) => !prev);
  };

  const handleSaveProfile = async () => {
    if (isSavingProfile || !isEditMode) return;

    const cleanedWhatsapp = editableWhatsapp.replace(/\D/g, "").slice(0, 10);
    if (cleanedWhatsapp && cleanedWhatsapp.length !== 10) {
      toast.error("WhatsApp number must be exactly 10 digits");
      return;
    }

    try {
      setIsSavingProfile(true);
      const response = await axios.put(
        "http://localhost:5000/api/auth/update-profile",
        {
          whatsapp: cleanedWhatsapp,
          branch: editableBranch,
          profileImage: userData.profileImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updatedUser = response.data?.user;
      if (updatedUser) {
        setUserData(updatedUser);
        setEditableWhatsapp(updatedUser.whatsapp || "");
        setEditableBranch(updatedUser.branch || "");
        dispatch(setProfile(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditMode(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId || deletingProductId) return;

    try {
      setDeletingProductId(productId);
      await axios.delete(`http://localhost:5000/api/product/${productId}`, authHeaders);
      setListedProducts((prev) => prev.filter((item) => item._id !== productId));
      toast.success("Product removed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to remove product");
    } finally {
      setDeletingProductId("");
    }
  };

  return (
    <>
      <HomeHeader />
      <ToastContainer position="top-center" />
      <section className="min-h-screen app-theme-surface px-4 py-8 sm:px-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl rounded-[2rem] p-6 sm:p-8 border border-gray-200/70 dark:border-slate-700/70 overflow-hidden profile-top-card">
            <div className="absolute -left-12 top-10 h-44 w-44 rounded-full bg-indigo-200 opacity-50 blur-3xl pointer-events-none"></div>
            <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-fuchsia-200 opacity-40 blur-3xl pointer-events-none"></div>
            <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-10">
              <div className="flex flex-col items-center lg:items-start gap-5">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-1 shadow-2xl profile-avatar-ring">
                  <img
                    src={userData.profileImage || defaultProfileImage}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
                  />
                </div>
                <div className="text-center lg:text-left">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                    {loadingProfile ? "Loading..." : userData.name || "Your Name"}
                  </h1>
                  <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xs">
                    Manage your profile, listings and purchases in one elegant dashboard.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <label className="block text-center">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                    <span className="inline-block cursor-pointer text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full shadow-lg transition-all">
                      Change Photo
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-sm bg-red-100 text-red-700 hover:bg-red-200 px-5 py-2 rounded-full shadow-lg transition-all"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    Full Name
                  </label>
                  <div className="w-full px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm">
                    {loadingProfile ? "Loading..." : userData.name || "Not available"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    Email
                  </label>
                  <div className="w-full px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 break-all shadow-sm">
                    {loadingProfile ? "Loading..." : userData.email || "Not available"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    Branch
                  </label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editableBranch}
                      onChange={(e) => setEditableBranch(e.target.value)}
                      placeholder="Enter your branch"
                      className="w-full px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <div className="w-full px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 shadow-sm">
                      {formatBranchName(userData.branch)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-600 dark:text-slate-300">
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    value={editableWhatsapp}
                    maxLength={10}
                    onChange={(e) =>
                      setEditableWhatsapp(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="10-digit number"
                    disabled={!isEditMode}
                    className={`w-full px-5 py-3 rounded-3xl border border-slate-200 dark:border-slate-700 ${
                      isEditMode ? "bg-white dark:bg-slate-950" : "bg-slate-100 dark:bg-slate-800"
                    } text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400`}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleToggleEdit}
                      className={`px-6 py-3 rounded-full text-white font-semibold transition shadow-lg ${
                        isEditMode
                          ? "bg-slate-500 hover:bg-slate-600"
                          : "bg-indigo-600 hover:bg-indigo-700"
                      }`}
                    >
                      {isEditMode ? "Cancel" : "Edit Profile"}
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSavingProfile || !isEditMode}
                      className={`px-6 py-3 rounded-full text-white font-semibold transition shadow-lg ${
                        isSavingProfile || !isEditMode
                          ? "bg-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      }`}
                    >
                      {isSavingProfile ? "Saving..." : "Save Profile"}
                    </button>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {listedProducts.length} listed products · {purchaseHistory.length} purchases
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-2xl border border-gray-200 shadow-lg p-5">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">
                My Listed Products
              </h2>
              {inventoryLoading ? (
                <p className="text-gray-500">Loading your listed products...</p>
              ) : listedProducts.length === 0 ? (
                <p className="text-gray-500">You have not listed any products yet.</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {listedProducts.map((product) => (
                    <div
                      key={product._id}
                      className="rounded-xl border border-gray-200 bg-white p-3 flex gap-3"
                    >
                      <img
                        src={product.images?.[0] || "https://placehold.co/200x140?text=No+Image"}
                        alt={product.title}
className="w-20 h-20 rounded-3xl object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{product.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {product.category || "General"} | {product.condition || "Used"}
                    </p>
                    <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Added on {new Date(product.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    disabled={deletingProductId === product._id}
                    className={`h-fit px-4 py-2 rounded-2xl text-sm transition ${
                      deletingProductId === product._id
                        ? "bg-slate-300 text-slate-600"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {deletingProductId === product._id ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/80 rounded-2xl border border-gray-200 shadow-lg p-5">
              <h2 className="text-xl font-semibold text-indigo-700 mb-4">
                My Purchase History
              </h2>
              {inventoryLoading ? (
                <p className="text-gray-500">Loading purchase history...</p>
              ) : purchaseHistory.length === 0 ? (
                <p className="text-gray-500">No purchases recorded yet.</p>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {purchaseHistory.map((purchase) => (
                    <div
                      key={purchase._id}
                      className="rounded-xl border border-gray-200 bg-white p-3 flex gap-3"
                    >
                      <img
                        src={purchase.images?.[0] || "https://placehold.co/200x140?text=No+Image"}
                        alt={purchase.title}
                        className="w-20 h-20 rounded-3xl object-cover border border-gray-200 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{purchase.title}</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 font-semibold">
                          Purchased for {formatPrice(purchase.price)}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Seller: {purchase.user?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Purchased on {new Date(purchase.soldAt || purchase.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default UserProfile;
