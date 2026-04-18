import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "../Component/HomeHeader";
import { useAuth, API_BASE_URL, getAuthHeaders } from "../utils/authUtils";
import { motion, AnimatePresence } from "framer-motion";
import { AiFillHeart } from "react-icons/ai";

const Favorites = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/favorites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to load saved products");
      }
      const data = await response.json();
      setSavedProducts(Array.isArray(data.savedProducts) ? data.savedProducts : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load saved products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  const handleToggleFavorite = async (productId) => {
    if (!productId || savingId) return;

    try {
      setSavingId(productId);
      const response = await fetch(`${API_BASE_URL}/auth/favorites/${productId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Unable to update saved products.");
      }
      const data = await response.json();
      setSavedProducts(Array.isArray(data.savedProducts) ? data.savedProducts : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to update favorites.");
    } finally {
      setSavingId("");
    }
  };

  return (
    <section className="min-h-screen app-theme-surface bg-slate-50">
      <HomeHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Saved Products</h1>
          <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
            Keep track of the listings you are watching. Remove items when you no longer need them.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700">
            <p>{error}</p>
          </div>
        ) : savedProducts.length === 0 ? (
          <div className="rounded-3xl border border-indigo-100 bg-white px-8 py-14 text-center">
            <p className="text-xl font-semibold text-slate-900">No saved products yet.</p>
            <p className="mt-3 text-gray-500">Browse the marketplace and save items to return to later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {savedProducts.map((product) => (
              <motion.div
                key={product._id}
                layout
                whileHover={{ y: -5 }}
                className="group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="absolute right-4 top-4 z-20 rounded-full bg-white/90 p-2 shadow-sm">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(product._id);
                    }}
                    className="text-rose-500 hover:text-rose-600"
                  >
                    <AiFillHeart className="h-5 w-5" />
                  </button>
                </div>
                <img
                  src={product.images?.[0] || "https://placehold.co/400x280?text=No+Image"}
                  alt={product.title}
                  className="h-52 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">{product.title}</h2>
                      <p className="text-sm text-slate-500">{product.category || "General"}</p>
                    </div>
                    <p className="text-lg font-bold text-emerald-600">₹{product.price}</p>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{product.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(product.tags || []).slice(0, 3).map((tag, index) => (
                      <span key={index} className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Favorites;
