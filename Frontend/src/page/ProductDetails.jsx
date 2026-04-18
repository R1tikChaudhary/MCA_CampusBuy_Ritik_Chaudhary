import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import HomeHeader from "../Component/HomeHeader";
import { useAuth, getAuthHeaders, API_BASE_URL } from "../utils/authUtils";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products } = useSelector((store) => store.app);
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [savedProductIds, setSavedProductIds] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const userIsSeller = product?.user?._id === user?._id;

  const fetchSellerReviews = async (sellerId, signal) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/review/seller/${sellerId}`,
        {
          signal,
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Could not load seller reviews");
      }
      const data = await response.json();
      setReviews(data.reviews || []);
      setReviewCount(data.reviewCount || 0);
      setAverageRating(data.averageRating || 0);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Error loading seller reviews:", err);
      }
    }
  };

  const fetchFavorites = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await fetch(`${API_BASE_URL}/auth/favorites`, {
        headers: {
          Authorization: `Bearer ${user?.token || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return;
      const data = await response.json();
      const ids = Array.isArray(data.savedProducts)
        ? data.savedProducts.map((item) => item._id)
        : [];
      setSavedProductIds(ids);
    } catch (err) {
      console.error("Error loading favorites:", err);
    }
  };

  const fetchRecommendations = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/recommendations/${productId}`);
      if (!response.ok) {
        throw new Error("Failed to load recommendations");
      }
      const data = await response.json();
      setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    }
  };

  const toggleFavorite = async () => {
    if (!product || !isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setFavoriteLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/favorites/${product._id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user?.token || localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update favorites");
      }
      const data = await response.json();
      const ids = Array.isArray(data.savedProducts)
        ? data.savedProducts.map((item) => item._id)
        : [];
      setSavedProductIds(ids);
    } catch (err) {
      console.error(err);
    } finally {
      setFavoriteLoading(false);
    }
  };

  useEffect(() => {
    const localProduct = products.find((item) => item._id === productId);
    if (localProduct) {
      setProduct(localProduct);
      setSelectedImage(localProduct.images?.[0] || "");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/product/${productId}`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Product not found");
        }

        const data = await response.json();
        setProduct(data);
        setSelectedImage(data.images?.[0] || "");
      } catch (err) {
        console.error("Error loading product details:", err);
        setError(err.message || "Unable to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [productId, products]);

  useEffect(() => {
    if (!product?.user?._id) return;
    const controller = new AbortController();
    fetchSellerReviews(product.user._id, controller.signal);
    fetchRecommendations(product._id);
    if (isAuthenticated) {
      fetchFavorites();
    }
    return () => controller.abort();
  }, [product, isAuthenticated]);

  const handleContactSeller = () => {
    if (!product) return;
    const whatsappNumber = product.user?.whatsapp;
    if (!whatsappNumber) {
      window.alert("Seller has not provided WhatsApp contact information");
      return;
    }
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const message = encodeURIComponent(
      `Hi! I'm interested in your product: ${product.title}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, "_blank");
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!product) {
      return;
    }

    if (userIsSeller) {
      setReviewError("You cannot review your own listing.");
      return;
    }

    if (!reviewRating) {
      setReviewError("Please select a rating.");
      return;
    }

    setReviewLoading(true);
    setReviewError("");
    setReviewSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/review`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          seller: product.user._id,
          product: product._id,
          rating: reviewRating,
          comment: reviewComment.trim(),
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          (data && (data.error || data.message)) ||
            text ||
            "Failed to submit review."
        );
      }

      setReviewSuccess("Review submitted successfully.");
      setReviewComment("");
      setReviewRating(5);
      fetchSellerReviews(product.user._id, new AbortController().signal);
    } catch (err) {
      console.error("Review submission failed:", err);
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-transparent app-theme-surface">
        <HomeHeader />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
          >
            ← Back to products
          </button>

          <AnimatePresence>
            {loading ? (
              <motion.div
                key="loading"
                className="flex justify-center py-24"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="rounded-3xl border border-red-200 bg-red-50 px-6 py-8 text-center text-red-700"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p className="text-lg font-semibold">{error}</p>
                <p className="mt-2 text-sm text-red-600">
                  Please go back and try again.
                </p>
              </motion.div>
            ) : product ? (
              <motion.div
                key="product-detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]"
              >
                <div className="space-y-6">
                  <div className="rounded-[2rem] bg-white/80 p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)] backdrop-blur-xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">
                          {product.category || "Other"}
                        </p>
                        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                          {product.title}
                        </h1>
                      </div>
                      <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
                        {product.status || "Available"}
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {product.description}
                    </p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-slate-50 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Price</p>
                        <p className="mt-2 text-3xl font-bold text-slate-900">
                          ₹{product.price}
                          {product.negotiable && (
                            <span className="ml-2 text-base font-medium text-slate-500">
                              Negotiable
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-5">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Condition</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                          {product.condition || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-[2rem] overflow-hidden bg-white shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                      <img
                        src={selectedImage || product.images?.[0] || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                        alt={product.title}
                        className="h-[28rem] w-full object-cover"
                      />
                    </div>
                    <div className="space-y-3 rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                      <p className="text-sm uppercase tracking-[0.26em] text-slate-400">Product gallery</p>
                      <div className="grid grid-cols-3 gap-3">
                        {(product.images || []).map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(image)}
                            className={`overflow-hidden rounded-3xl border p-0 transition duration-200 ${
                              selectedImage === image
                                ? "border-indigo-500 ring-2 ring-indigo-200"
                                : "border-slate-200 hover:border-indigo-300"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="h-24 w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Seller
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {product.user?.name || "Unknown Seller"}
                        </p>
                      </div>
                      <div className="rounded-full bg-indigo-50 px-4 py-2 text-sm text-indigo-700">
                        {product.user?.branch || "Student"}
                      </div>
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-slate-600">
                      <div>
                        <p className="font-semibold text-slate-800">WhatsApp</p>
                        <p>{product.user?.whatsapp || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Email</p>
                        <p>{product.user?.email || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">Listed</p>
                        <p>{new Date(product.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <button
                        onClick={handleContactSeller}
                        className="w-full rounded-full bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700"
                      >
                        Contact Seller on WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={toggleFavorite}
                        disabled={favoriteLoading}
                        className="w-full rounded-full bg-white border border-indigo-200 px-5 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50"
                      >
                        {favoriteLoading ? "Updating..." : savedProductIds.includes(product._id) ? "Remove from Saved" : "Save for later"}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/seller/${product.user?._id}`)}
                        className="w-full rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        View Seller Profile
                      </button>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Seller rating
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">
                          {reviewCount > 0 ? `${averageRating.toFixed(1)} / 5` : "No rating yet"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {Array.from({ length: 5 }, (_, index) => (
                            <span
                              key={index}
                              className={
                                index < Math.round(averageRating)
                                  ? "text-amber-400"
                                  : "text-slate-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {reviewCount} review{reviewCount === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6">
                      {reviewSuccess && (
                        <div className="rounded-3xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 mb-4">
                          {reviewSuccess}
                        </div>
                      )}
                      {reviewError && (
                        <div className="rounded-3xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700 mb-4">
                          {reviewError}
                        </div>
                      )}

                      {isAuthenticated ? (
                        userIsSeller ? (
                          <p className="text-sm text-slate-600">
                            You cannot review your own listing.
                          </p>
                        ) : (
                          <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700">
                                Rating
                              </label>
                              <select
                                value={reviewRating}
                                onChange={(e) => setReviewRating(Number(e.target.value))}
                                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 transition"
                              >
                                {[5, 4, 3, 2, 1].map((value) => (
                                  <option key={value} value={value}>
                                    {value} star{value === 1 ? "" : "s"}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-slate-700">
                                Review
                              </label>
                              <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={4}
                                className="mt-2 w-full rounded-3xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-400 transition"
                                placeholder="Tell buyers about this seller"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={reviewLoading}
                              className={`w-full rounded-full px-5 py-3 text-sm font-bold transition ${
                                reviewLoading
                                  ? "bg-slate-400 cursor-not-allowed text-white"
                                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
                              }`}
                            >
                              {reviewLoading ? "Submitting..." : "Submit review"}
                            </button>
                          </form>
                        )
                      ) : (
                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          <p>
                            Please{' '}
                            <button
                              type="button"
                              onClick={() => navigate("/login")}
                              className="font-semibold text-indigo-600 underline"
                            >
                              log in
                            </button>{' '}
                            to review this seller.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Seller reviews
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-900">
                          What buyers say
                        </h2>
                      </div>
                      <p className="text-sm text-slate-500">
                        {reviewCount} review{reviewCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    {reviews.length === 0 ? (
                      <p className="mt-6 text-sm text-slate-600">
                        No reviews yet. Be the first to review this seller.
                      </p>
                    ) : (
                      <div className="mt-6 space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review._id}
                            className="rounded-3xl border border-slate-200 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={review.reviewer?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                                  alt={review.reviewer?.name || "Reviewer"}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-semibold text-slate-900">
                                    {review.reviewer?.name || "Anonymous"}
                                  </p>
                                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }, (_, index) => (
                                  <span
                                    key={index}
                                    className={
                                      index < review.rating
                                        ? "text-amber-400"
                                        : "text-slate-300"
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                            {review.comment && (
                              <p className="mt-4 text-sm leading-7 text-slate-600">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_40px_rgb(15,23,42,0.05)]">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          Recommended for you
                        </p>
                        <h2 className="mt-2 text-xl font-semibold text-slate-900">
                          Similar listings
                        </h2>
                      </div>
                      <p className="text-sm text-slate-500">
                        Based on category and tags
                      </p>
                    </div>
                    {recommendations.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        No recommendations available for this item.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {recommendations.map((item) => (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() => navigate(`/product/${item._id}`)}
                            className="group grid grid-cols-[1fr_2fr] gap-4 rounded-3xl border border-slate-200 p-4 text-left transition hover:shadow-lg"
                          >
                            <img
                              src={item.images?.[0] || "https://placehold.co/300x220?text=No+Image"}
                              alt={item.title}
                              className="h-24 w-24 rounded-3xl object-cover"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">{item.category || "Other"}</p>
                              <p className="mt-3 text-sm font-bold text-emerald-600">₹{item.price}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>
    </>
  );
};

export default ProductDetails;
