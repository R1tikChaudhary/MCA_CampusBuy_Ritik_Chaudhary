import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import HomeHeader from "../Component/HomeHeader";
import { addNotification, setCurrentPage } from "../utils/appSlice";
import socket from "../utils/socket";
import { motion, AnimatePresence } from "framer-motion";
import TicketMapView from "../Component/TicketMapView";

import {
  Search, PlusCircle, Calendar, MapPin, User, CheckCircle2,
  Image as ImageIcon, MessageCircle, AlertCircle, FileText,
  Tag, UploadCloud, X, Map,
} from "lucide-react";

const ticketCategories = ["Electronics", "ID Card", "Books", "Bag", "Accessories", "Other"];

const LostFound = () => {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "", description: "", category: "Other", location: "", lostDate: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [activeCategory, setActiveCategory] = useState("All");
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState({ lat: null, lng: null });

  const notify = (message, type = "info") => {
    dispatch(addNotification({ id: `lf-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type, message }));
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/lost-found");
      setTickets(Array.isArray(res.data) ? res.data : []);
    } catch { notify("Failed to fetch tickets", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { dispatch(setCurrentPage("lost-found")); fetchTickets(); }, [dispatch]);

  useEffect(() => {
    const onCreate = (ticket) => setTickets((prev) => [ticket, ...prev]);
    socket.on("lost_found_ticket_created", onCreate);
    return () => socket.off("lost_found_ticket_created", onCreate);
  }, []);

  useEffect(() => { return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); }; }, [imagePreview]);

  const handleInputChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { notify("Select a valid image", "error"); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { notify("Geolocation not supported", "error"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); notify("Location captured!", "success"); setLocating(false); },
      () => { notify("Could not get location", "error"); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!token) { notify("Login required", "error"); return; }
    if (!formData.itemName.trim() || !formData.description.trim() || !formData.location.trim() || !formData.lostDate) {
      notify("Fill all required fields", "error"); return;
    }
    try {
      setSubmitting(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));
      if (coords.lat) payload.append("lat", coords.lat);
      if (coords.lng) payload.append("lng", coords.lng);
      if (imageFile) payload.append("image", imageFile);
      await axios.post("http://localhost:5000/api/lost-found", payload, { headers: { Authorization: `Bearer ${token}` } });
      notify("Ticket created!", "success");
      setFormData({ itemName: "", description: "", category: "Other", location: "", lostDate: "" });
      setImageFile(null); setImagePreview(""); setCoords({ lat: null, lng: null });
      setShowModal(false);
    } catch (err) {
      notify(err.response?.data?.error || "Failed to create ticket", "error");
    } finally { setSubmitting(false); }
  };

  const handleResolve = async (ticketId) => {
    try {
      const res = await axios.patch(`http://localhost:5000/api/lost-found/${ticketId}/resolve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setTickets((prev) => prev.map((t) => (t._id === res.data._id ? res.data : t)));
      notify("Marked as resolved", "success");
    } catch (err) { notify(err.response?.data?.error || "Failed", "error"); }
  };

  const contactOwner = (ticket) => {
    const w = ticket?.user?.whatsapp?.replace(/[^0-9]/g, "");
    if (!w) { notify("Owner has no WhatsApp listed", "error"); return; }
    window.open(`https://wa.me/${w}?text=${encodeURIComponent(`Hi ${ticket.user?.name || ""}, I saw your Lost & Found ticket for "${ticket.itemName}".`)}`, "_blank");
  };

  // Only show OPEN tickets
  const filteredTickets = tickets
    .filter((t) => t.status !== "Resolved")
    .filter((t) => activeCategory === "All" || t.category === activeCategory);

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <HomeHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Top Header Bar ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Lost &amp; Found
            </h1>
            <p className="text-sm text-gray-500 mt-1">Showing <span className="font-semibold text-indigo-600">{filteredTickets.length}</span> active tickets</p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.4)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.5)] transition-all"
          >
            <PlusCircle size={18} /> Report Lost Item
          </motion.button>
        </motion.div>

        {/* ── Filter + View Toggle Bar ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap">
            {["All", ...ticketCategories].map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                    : "bg-white/70 border border-indigo-100 text-gray-600 hover:bg-indigo-50"
                }`}>{cat}</button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-white/70 border border-indigo-100 rounded-xl p-1 shadow-sm flex-shrink-0">
            <button onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "grid" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-indigo-600"}`}>
              <Search size={11} /> Grid
            </button>
            <button onClick={() => setViewMode("map")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === "map" ? "bg-indigo-600 text-white shadow" : "text-gray-500 hover:text-indigo-600"}`}>
              <Map size={11} /> Map
            </button>
          </div>
        </motion.div>

        {/* ── Map View ── */}
        <AnimatePresence>
          {viewMode === "map" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
              <TicketMapView tickets={filteredTickets} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Tickets Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map((n) => (
              <div key={n} className="bg-white/50 rounded-2xl h-56 animate-pulse border border-white/60" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-16 text-center shadow-sm"
          >
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-1">No active tickets</h3>
            <p className="text-gray-400 text-sm mb-4">Be the first to report a lost item.</p>
            <button onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm shadow-md hover:shadow-lg transition-all">
              Report Lost Item
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredTickets.map((ticket, index) => {
                const isOwner = ticket?.user?._id === currentUser?._id;
                return (
                  <motion.div key={ticket._id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="group bg-white/70 backdrop-blur-xl border border-white/50 hover:border-indigo-200 shadow-sm hover:shadow-[0_8px_30px_rgba(79,70,229,0.12)] rounded-3xl overflow-hidden transition-all duration-300 flex flex-col"
                  >
                    {/* Image / Header Band */}
                    {ticket.image ? (
                      <div className="relative h-40 w-full overflow-hidden">
                        <img src={ticket.image} alt={ticket.itemName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/90 text-indigo-700">{ticket.category}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-12 bg-gradient-to-r from-indigo-100 to-purple-100 relative flex items-center px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white text-indigo-700 border border-indigo-100">{ticket.category}</span>
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-1">{ticket.itemName}</h3>
                      <p className="text-gray-500 text-xs mb-2 line-clamp-2">{ticket.description}</p>

                      {/* Tags */}
                      {ticket.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {ticket.tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 text-xs rounded-full border border-indigo-100">#{tag}</span>
                          ))}
                        </div>
                      )}

                      {/* Meta */}
                      <div className="space-y-1 mb-3 pt-2 border-t border-gray-100 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={11} className="text-indigo-400 flex-shrink-0" />
                          <span className="truncate">{ticket.location}</span>
                          {ticket.coordinates?.lat && <span className="ml-auto text-green-500 flex items-center gap-0.5 flex-shrink-0"><Map size={9} />GPS</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="text-indigo-400" />
                          <span>{new Date(ticket.lostDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={11} className="text-indigo-400" />
                          <span className="truncate">{ticket.user?.name || "Unknown"} <span className="opacity-60">({ticket.user?.branch || "N/A"})</span></span>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="mt-auto">
                        {!isOwner ? (
                          <button onClick={() => contactOwner(ticket)}
                            className="w-full py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 transition-all">
                            <MessageCircle size={12} /> Contact Owner
                          </button>
                        ) : (
                          <button onClick={() => handleResolve(ticket._id)}
                            className="w-full py-2 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 bg-white text-green-600 hover:bg-green-600 hover:text-white border border-green-200 shadow-sm transition-all">
                            <CheckCircle2 size={12} /> Mark as Resolved
                          </button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Add Ticket Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600"><PlusCircle size={20} /></div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Report Lost Item</h2>
                    <p className="text-xs text-gray-500">Tags auto-generated for smart matching</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Item Name */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><FileText size={12} className="text-indigo-500" /> Item Name</label>
                  <input name="itemName" value={formData.itemName} onChange={handleInputChange}
                    placeholder="e.g. Black Leather Wallet"
                    className="w-full px-3 py-2.5 bg-white/70 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" required />
                </div>

                {/* Category + Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><Tag size={12} className="text-indigo-500" /> Category</label>
                    <div className="relative">
                      <select name="category" value={formData.category} onChange={handleInputChange}
                        className="w-full pl-3 pr-6 py-2.5 bg-white/70 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm appearance-none">
                        {ticketCategories.map((cat) => <option key={cat}>{cat}</option>)}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><Calendar size={12} className="text-indigo-500" /> Lost Date</label>
                    <input type="date" name="lostDate" value={formData.lostDate} onChange={handleInputChange}
                      className="w-full px-3 py-2.5 bg-white/70 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-gray-700" required />
                  </div>
                </div>

                {/* Location + GPS */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><MapPin size={12} className="text-indigo-500" /> Last Seen Location</label>
                  <div className="flex gap-2">
                    <input name="location" value={formData.location} onChange={handleInputChange}
                      placeholder="e.g. Library, 2nd Floor"
                      className="flex-1 px-3 py-2.5 bg-white/70 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm" required />
                    <button type="button" onClick={handleGetLocation} disabled={locating} title="Pin GPS coordinates"
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${coords.lat ? "bg-green-50 text-green-600 border-green-200" : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"}`}>
                      {locating ? <span className="h-3 w-3 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : <Map size={12} />}
                      {coords.lat ? "✓ GPS" : "GPS"}
                    </button>
                  </div>
                  {coords.lat && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><MapPin size={10} />{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><AlertCircle size={12} className="text-indigo-500" /> Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange}
                    placeholder="Color, marks, contents..." rows={3}
                    className="w-full px-3 py-2.5 bg-white/70 border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none" required />
                </div>

                {/* Image */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1"><ImageIcon size={12} className="text-indigo-500" /> Image (optional)</label>
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer bg-white/40 hover:bg-white/60 transition-colors group">
                      <UploadCloud className="w-5 h-5 mb-1 text-indigo-300 group-hover:text-indigo-500" />
                      <p className="text-xs text-gray-400">Click to upload</p>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden group h-28">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); }} className="p-1.5 bg-red-500 text-white rounded-full"><X size={14} /></button>
                      </div>
                    </div>
                  )}
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" disabled={submitting}
                  className={`w-full py-3 rounded-xl text-white font-bold shadow-[0_4px_14px_rgba(79,70,229,0.4)] flex items-center justify-center gap-2 text-sm transition-all ${submitting ? "bg-indigo-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"}`}>
                  {submitting ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><PlusCircle size={16} /> Create Ticket</>}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default LostFound;
