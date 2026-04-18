import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HomeHeader from "../Component/HomeHeader";
import { API_BASE_URL } from "../utils/authUtils";
import { motion, AnimatePresence } from "framer-motion";

const SellerProfile = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/auth/seller/${sellerId}`);
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Seller profile not found");
        }
        const data = await response.json();
        setSeller(data);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load seller profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerProfile();
  }, [sellerId]);

  return (
    <section className="min-h-screen app-theme-surface bg-slate-50">
      <HomeHeader />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/90 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          ← Back
        </button>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-8 text-center text-rose-700">
            <p>{error}</p>
          </div>
        ) : seller ? (
          <div className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  <img
                    src={seller.seller.profileImage || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                    alt={seller.seller.name || "Seller"}
                    className="h-28 w-28 rounded-full object-cover border-4 border-indigo-100 shadow-lg"
                  />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-indigo-600">Top Seller</p>
                    <h1 className="mt-2 text-4xl font-extrabold text-slate-900">{seller.seller.name}</h1>
                    <p className="mt-2 text-sm text-slate-500">{seller.seller.branch || "Student"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Products</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{seller.productCount}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Reviews</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{seller.reviewCount}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-sm text-slate-500">Rating</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">{seller.averageRating.toFixed(1)} / 5</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-3xl bg-indigo-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-700">Contact</p>
                  <p className="mt-3 text-sm text-slate-600">{seller.seller.email}</p>
                  <p className="mt-2 text-sm text-slate-600">{seller.seller.whatsapp || "WhatsApp not shared"}</p>
                </div>
                <div className="rounded-3xl bg-indigo-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-700">Joined</p>
                  <p className="mt-3 text-sm text-slate-600">{new Date(seller.seller.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="rounded-3xl bg-indigo-50 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-indigo-700">Status</p>
                  <p className="mt-3 text-sm text-slate-600">Verified Seller</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Recent listings</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Seller's latest items</h2>
                </div>
                <button
                  onClick={() => navigate('/home')}
                  className="rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Browse all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {seller.topProducts.length > 0 ? (
                  seller.topProducts.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-left transition hover:shadow-lg"
                    >
                      <img
                        src={product.images?.[0] || "https://placehold.co/400x280?text=No+Image"}
                        alt={product.title}
                        className="h-44 w-full rounded-3xl object-cover"
                      />
                      <div className="mt-4">
                        <p className="text-lg font-semibold text-slate-900 line-clamp-2">{product.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{product.category || "General"}</p>
                        <p className="mt-3 text-lg font-bold text-emerald-600">₹{product.price}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                    No recent listings to show yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SellerProfile;
