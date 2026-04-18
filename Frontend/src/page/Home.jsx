import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import {
  setProducts,
  setLoading,
  setError,
  setCurrentPage as setAppCurrentPage,
  addProduct,
  updateProduct,
  removeProduct,
} from "../utils/appSlice";
import HomeHeader from "../Component/HomeHeader";
import { useAuth, API_BASE_URL } from "../utils/authUtils";
import socket from "../utils/socket";

const ITEMS_PER_PAGE = 20;
const ACTIVITY_KEY = "marketplace_user_activity_v1";

const readActivity = () => {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    if (!raw) {
      return { productScores: {}, categoryScores: {} };
    }
    const parsed = JSON.parse(raw);
    return {
      productScores: parsed.productScores || {},
      categoryScores: parsed.categoryScores || {},
    };
  } catch {
    return { productScores: {}, categoryScores: {} };
  }
};

const saveActivity = (activity) => {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity));
};

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products, loading, error } = useSelector((store) => store.app);
  const [savedProductIds, setSavedProductIds] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated, token } = useAuth();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceSort, setPriceSort] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Electronics", "Furniture", "Books", "Fashion", "Vehicles"];

  const recordProductActivity = (product, type = "view") => {
    if (!product?._id) return;

    const activity = readActivity();
    const increment = type === "favorite" ? 3 : 1;

    activity.productScores[product._id] = (activity.productScores[product._id] || 0) + increment;

    if (product.category) {
      activity.categoryScores[product.category] =
        (activity.categoryScores[product.category] || 0) + increment;
    }

    saveActivity(activity);
  };

  const applyFilters = () => {
    let filtered = [...products];
    const normalizedSearch = searchQuery.trim().toLowerCase();

    if (normalizedSearch) {
      filtered = filtered.filter((product) =>
        product.title?.toLowerCase().includes(normalizedSearch)
      );
    }

    if (selectedCategory && selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (priceSort === "low-to-high") {
      filtered = filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (priceSort === "high-to-low") {
      filtered = filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [products, selectedCategory, priceSort, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products, selectedCategory, priceSort, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const recommendedProducts = useMemo(() => {
    if (!products.length) return [];

    const activity = readActivity();
    const hasActivity =
      Object.keys(activity.productScores).length > 0 ||
      Object.keys(activity.categoryScores).length > 0 ||
      savedProductIds.length > 0;

    if (!hasActivity) {
      return products.slice(0, 6);
    }

    const scored = products
      .map((product) => {
        const byProduct = activity.productScores[product._id] || 0;
        const byCategory = activity.categoryScores[product.category] || 0;
        const favoriteBoost = savedProductIds.includes(product._id) ? 3 : 0;
        const recencyBoost =
          new Date(product.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 ? 0.5 : 0;

        return {
          ...product,
          recommendationScore: byProduct * 2 + byCategory + favoriteBoost + recencyBoost,
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    return scored.filter((p) => p.recommendationScore > 0).slice(0, 6);
  }, [products, savedProductIds]);

  const fetchFavorites = async () => {
    if (!isAuthenticated || !token) {
      setSavedProductIds([]);
      return;
    }

    try {
      setFavoritesLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) return;

      const data = await response.json();
      const ids = Array.isArray(data.savedProducts)
        ? data.savedProducts.map((item) => item._id)
        : [];
      setSavedProductIds(ids);
    } catch (err) {
      console.error("Favorite loading failed:", err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleToggleFavorite = async (e, productId) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      setFavoritesLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/favorites/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Unable to update saved items");
      }

      const data = await response.json();
      const ids = Array.isArray(data.savedProducts)
        ? data.savedProducts.map((item) => item._id)
        : [];
      setSavedProductIds(ids);

      const activityProduct = products.find((item) => item._id === productId);
      if (activityProduct) {
        recordProductActivity(activityProduct, "favorite");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFavoritesLoading(false);
    }
  };

  const handleProductOpen = (product) => {
    recordProductActivity(product, "view");
    navigate(`/product/${product._id}`);
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated, token]);

  useEffect(() => {
    dispatch(setAppCurrentPage("home"));
    dispatch(setLoading(true));

    fetch(`${API_BASE_URL}/product/all`, {
      signal: AbortSignal.timeout(5000),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        dispatch(setProducts(data));
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        dispatch(setError("Failed to fetch products"));
      })
      .finally(() => dispatch(setLoading(false)));

    socket.on("new_product", (product) => {
      dispatch(addProduct(product));
    });

    socket.on("update_product", (product) => {
      dispatch(updateProduct(product));
    });

    socket.on("delete_product", (productId) => {
      dispatch(removeProduct(productId));
    });

    return () => {
      socket.off("new_product");
      socket.off("update_product");
      socket.off("delete_product");
    };
  }, [dispatch]);

  const handleCategoryFilter = (category) => setSelectedCategory(category);
  const handlePriceSort = (sortOrder) => setPriceSort(sortOrder);
  const handleSearch = () => setSearchQuery(searchInput);

  const clearFilters = () => {
    setSelectedCategory("");
    setPriceSort("");
    setSearchInput("");
    setSearchQuery("");
  };

  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <section className="min-h-screen bg-transparent app-theme-surface">
      <HomeHeader />

      <motion.div
        className="min-h-screen px-3 sm:px-4 py-4 pb-20 sm:pb-28"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex flex-col items-center justify-center text-center mt-6 mb-8">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight pb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            Explore the Marketplace
          </motion.h1>
          <motion.p
            className="text-gray-500 font-medium mt-2 max-w-lg mx-auto px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover items listed by your fellow students. From textbooks to electronics, find exactly what you need.
          </motion.p>
        </div>

        <motion.div
          className="max-w-6xl mx-auto mb-8 p-5 sm:p-6 bg-white/40 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:max-w-md flex items-center">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  placeholder="Search products..."
                  className="w-full pl-11 pr-28 py-3.5 rounded-full text-sm font-medium bg-white/70 backdrop-blur-md border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all placeholder-gray-400 text-gray-800"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-full text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
                >
                  Search
                </button>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <select
                    value={priceSort}
                    onChange={(e) => handlePriceSort(e.target.value)}
                    className="w-full md:w-auto appearance-none pl-5 pr-10 py-3.5 rounded-full text-sm font-bold bg-white/70 backdrop-blur-md border border-white/50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-sm cursor-pointer transition-all hover:bg-white/90"
                  >
                    <option value="">Sort by: Featured</option>
                    <option value="low-to-high">Price: Low to High</option>
                    <option value="high-to-low">Price: High to Low</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>

                <AnimatePresence>
                  {(selectedCategory || priceSort || searchQuery) && (
                    <motion.button
                      onClick={clearFilters}
                      className="px-4 py-3.5 rounded-full text-sm font-bold bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 transition-all shadow-sm flex items-center gap-2"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      <span className="hidden sm:inline">Clear</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex-shrink-0 mr-1">
                  Categories
                </span>
                <div className="flex gap-2.5">
                  {categories.map((category) => {
                    const isActive = selectedCategory === category || (category === "All" && !selectedCategory);
                    return (
                      <motion.button
                        key={category}
                        onClick={() => handleCategoryFilter(category)}
                        className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 border-transparent"
                            : "bg-white/50 backdrop-blur-sm border border-white/60 text-gray-600 hover:bg-white/80 hover:text-indigo-600 hover:shadow-md"
                        }`}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {category}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {recommendedProducts.length > 0 && (
          <section className="max-w-6xl mx-auto mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">Recommended For You</h2>
              <p className="text-xs sm:text-sm text-gray-500">Based on your recent activity</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedProducts.map((product) => (
                <button
                  key={`rec-${product._id}`}
                  onClick={() => handleProductOpen(product)}
                  className="text-left bg-white/70 backdrop-blur-xl border border-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
                >
                  <img
                    src={product.images?.[0] || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                    alt={product.title}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="font-bold text-gray-800 line-clamp-1">{product.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    <p className="text-emerald-600 font-bold mt-3">?{product.price}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <AnimatePresence>
          {loading && (
            <motion.div
              className="flex justify-center items-center py-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-2xl mx-auto mb-4"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredProducts.length > 0 && (
          <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">All Products</h2>
            <p className="text-xs sm:text-sm text-gray-500">{filteredProducts.length} listing{filteredProducts.length !== 1 ? "s" : ""} available</p>
          </div>
        )}

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.08 },
            },
          }}
        >
          {paginatedProducts.map((product, index) => (
            <motion.div
              key={product._id || index}
              className="cursor-pointer bg-white/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/80 transition-all duration-300 relative flex flex-col group hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] hover:border-white hover:bg-white/90"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              onClick={() => handleProductOpen(product)}
            >
              <button
                type="button"
                onClick={(e) => handleToggleFavorite(e, product._id)}
                className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 text-slate-400 shadow-sm transition hover:text-rose-500"
              >
                {savedProductIds.includes(product._id) ? (
                  <AiFillHeart className="h-5 w-5 text-rose-500" />
                ) : (
                  <AiOutlineHeart className="h-5 w-5" />
                )}
              </button>

              <div className="relative h-48 sm:h-56 w-full overflow-hidden rounded-t-[2rem] bg-gray-100/50">
                {new Date(product.createdAt).getTime() > Date.now() - 86400000 && (
                  <motion.div
                    className="absolute top-4 right-4 bg-emerald-400 text-white text-[10px] tracking-widest uppercase font-extrabold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 z-20"
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    NEW
                  </motion.div>
                )}

                {product.images?.length > 0 ? (
                  <>
                    <motion.img
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
                    <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-3 gap-3">
                  <motion.div
                    className="space-y-2"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="font-extrabold text-indigo-950 text-lg sm:text-xl line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {product.title}
                    </h2>
                  </motion.div>
                  <motion.span
                    className="bg-indigo-50/80 text-indigo-700 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap border border-indigo-100/50"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.category || "Other"}
                  </motion.span>
                </div>

                <motion.p
                  className="text-gray-500 text-sm mb-5 line-clamp-2 leading-relaxed"
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {product.description}
                </motion.p>

                <div className="mt-auto flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <motion.p
                        className="text-2xl font-black text-emerald-500 flex items-baseline gap-1 tracking-tight"
                        initial={{ scale: 0.9, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <span className="text-lg">?</span>{product.price}
                      </motion.p>
                      {product.negotiable && (
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          (Negotiable)
                        </span>
                      )}
                    </div>
                    <motion.p
                      className="text-[11px] font-medium text-gray-400/80"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {new Date(product.createdAt).toLocaleDateString()}
                    </motion.p>
                  </div>

                  <div className="h-px w-full bg-gray-100"></div>

                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.user?.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                          alt={product.user?.name || "Seller"}
                          className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (product.user?._id) {
                              navigate(`/seller/${product.user._id}`);
                            }
                          }}
                          className="text-left"
                        >
                          <motion.div
                            className="text-xs font-bold text-gray-700 hover:text-indigo-600 transition"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {product.user?.name || "Unknown Seller"}
                          </motion.div>
                          <motion.div
                            className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                            initial={{ opacity: 0.7 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {product.user?.branch || "Student"}
                          </motion.div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {!loading && filteredProducts.length > 0 && (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">
                Showing {startItem}-{endItem} of {filteredProducts.length} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-700 px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white border border-gray-200 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && products.length === 0 && (
          <motion.div
            className="text-center py-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-gray-500">No products available at the moment.</p>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

export default Home;
