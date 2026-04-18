import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import HomeHeader from "../Component/HomeHeader";
import { addNotification, setCurrentPage } from "../utils/appSlice";
import { ShieldCheck, Package, SearchCheck, Flag, RefreshCw, Clock3 } from "lucide-react";

const PAGE_SIZE = 20;

const AdminModeration = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState("products");
  const [actionLoading, setActionLoading] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);
  const [totals, setTotals] = useState({ products: 0, tickets: 0, reports: 0 });
  const [hasMore, setHasMore] = useState({ products: false, tickets: false, reports: false });
  const [userSearch, setUserSearch] = useState("");
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userResults, setUserResults] = useState([]);

  const notify = (message, type = "info") => {
    dispatch(
      addNotification({
        id: `admin-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        message,
        type,
      })
    );
  };

  const fetchModerationData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/admin/moderation/overview", {
        params: { limit: PAGE_SIZE },
      });
      setProducts(Array.isArray(response.data?.products) ? response.data.products : []);
      setTickets(Array.isArray(response.data?.tickets) ? response.data.tickets : []);
      setReports(Array.isArray(response.data?.reports) ? response.data.reports : []);
      setTotals(response.data?.totals || { products: 0, tickets: 0, reports: 0 });
      setHasMore(response.data?.hasMore || { products: false, tickets: false, reports: false });
    } catch (error) {
      notify(error.response?.data?.error || "Failed to load moderation data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(setCurrentPage("admin"));
    fetchModerationData();
  }, [dispatch]);

  useEffect(() => {
    const trimmed = userSearch.trim();
    if (!trimmed) {
      setUserResults([]);
      setUserSearchLoading(false);
      return;
    }

    let cancelled = false;
    setUserSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/admin/users/search", {
          params: { q: trimmed, limit: 20 },
        });
        if (!cancelled) {
          setUserResults(Array.isArray(response.data?.users) ? response.data.users : []);
        }
      } catch (error) {
        if (!cancelled) {
          notify(error.response?.data?.error || "Failed to search users", "error");
        }
      } finally {
        if (!cancelled) {
          setUserSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [userSearch]);

  const loadMoreForActiveTab = async () => {
    try {
      setLoadingMore(true);

      if (activeTab === "products") {
        const response = await axios.get("http://localhost:5000/api/admin/moderation/products", {
          params: { skip: products.length, limit: PAGE_SIZE },
        });
        const newItems = Array.isArray(response.data?.items) ? response.data.items : [];
        setProducts((prev) => [...prev, ...newItems]);
        setHasMore((prev) => ({ ...prev, products: !!response.data?.hasMore }));
        setTotals((prev) => ({ ...prev, products: response.data?.total ?? prev.products }));
      } else if (activeTab === "tickets") {
        const response = await axios.get("http://localhost:5000/api/admin/moderation/tickets", {
          params: { skip: tickets.length, limit: PAGE_SIZE },
        });
        const newItems = Array.isArray(response.data?.items) ? response.data.items : [];
        setTickets((prev) => [...prev, ...newItems]);
        setHasMore((prev) => ({ ...prev, tickets: !!response.data?.hasMore }));
        setTotals((prev) => ({ ...prev, tickets: response.data?.total ?? prev.tickets }));
      } else {
        const response = await axios.get("http://localhost:5000/api/admin/moderation/reports", {
          params: { skip: reports.length, limit: PAGE_SIZE },
        });
        const newItems = Array.isArray(response.data?.items) ? response.data.items : [];
        setReports((prev) => [...prev, ...newItems]);
        setHasMore((prev) => ({ ...prev, reports: !!response.data?.hasMore }));
        setTotals((prev) => ({ ...prev, reports: response.data?.total ?? prev.reports }));
      }
    } catch (error) {
      notify(error.response?.data?.error || "Failed to load more data", "error");
    } finally {
      setLoadingMore(false);
    }
  };

  const moderateProduct = async (productId, action) => {
    try {
      setActionLoading(`product-${productId}-${action}`);
      const response = await axios.patch(`http://localhost:5000/api/admin/moderation/products/${productId}`, { action });
      if (action === "remove") {
        setProducts((prev) => prev.filter((item) => item._id !== productId));
        setTotals((prev) => ({ ...prev, products: Math.max(prev.products - 1, 0) }));
      } else {
        setProducts((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)));
      }
      notify(`Product ${action === "approve" ? "approved" : "removed"}`, "success");
    } catch (error) {
      notify(error.response?.data?.error || "Failed to moderate product", "error");
    } finally {
      setActionLoading("");
    }
  };

  const moderateTicket = async (ticketId, action) => {
    try {
      setActionLoading(`ticket-${ticketId}-${action}`);
      const response = await axios.patch(`http://localhost:5000/api/admin/moderation/lost-found/${ticketId}`, { action });
      if (action === "remove") {
        setTickets((prev) => prev.filter((item) => item._id !== ticketId));
        setTotals((prev) => ({ ...prev, tickets: Math.max(prev.tickets - 1, 0) }));
      } else {
        setTickets((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)));
      }
      notify(`Ticket ${action === "approve" ? "approved" : "removed"}`, "success");
    } catch (error) {
      notify(error.response?.data?.error || "Failed to moderate ticket", "error");
    } finally {
      setActionLoading("");
    }
  };

  const moderateReport = async (reportId, status) => {
    try {
      setActionLoading(`report-${reportId}-${status}`);
      const response = await axios.patch(`http://localhost:5000/api/admin/moderation/reports/${reportId}`, { status });
      setReports((prev) => prev.map((item) => (item._id === response.data._id ? response.data : item)));
      notify(`Report marked as ${status}`, "success");
    } catch (error) {
      notify(error.response?.data?.error || "Failed to update report", "error");
    } finally {
      setActionLoading("");
    }
  };

  const openReportsCount = useMemo(
    () => reports.filter((item) => (item.reportStatus || "open") === "open").length,
    [reports]
  );

  const tabStyles = (tab) =>
    `inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
      activeTab === tab
        ? "bg-slate-900 text-white shadow-lg"
        : "bg-white/70 text-slate-700 border border-slate-200 hover:bg-white"
    }`;

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_8%_15%,_rgba(251,191,36,0.18),_transparent_28%),radial-gradient(circle_at_90%_0%,_rgba(56,189,248,0.18),_transparent_25%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <HomeHeader />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
        <div className="bg-white/70 backdrop-blur-xl border border-white rounded-3xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-7">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700 mb-3">
                <ShieldCheck size={14} /> Moderation Console
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Admin Moderation Panel</h1>
              <p className="mt-2 text-slate-600 text-sm sm:text-base">
                Review listings, Lost and Found posts, and user reports from one control center.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition"
              onClick={fetchModerationData}
            >
              <RefreshCw size={16} /> Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Products</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totals.products}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Lost & Found</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totals.tickets}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Reports</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{totals.reports}</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">Open Reports</p>
              <p className="text-2xl font-black text-rose-600 mt-1">{openReportsCount}</p>
            </div>
          </div>

          <div className="mb-6 rounded-2xl bg-white border border-slate-200 p-4">
            <label className="text-sm font-semibold text-slate-800">Find User by Name or Branch</label>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search user by name or branch..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 transition"
            />

            {userSearchLoading && (
              <p className="text-xs text-slate-500 mt-2">Searching users...</p>
            )}

            {!userSearchLoading && userSearch.trim() && (
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {userResults.length === 0 ? (
                  <p className="text-sm text-slate-500">No users found.</p>
                ) : (
                  userResults.map((user) => (
                    <div key={user._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="font-semibold text-slate-900">{user.name || "Unnamed User"}</p>
                      <p className="text-xs text-slate-600 mt-1">{user.email || "No email"}</p>
                      <p className="text-xs text-slate-600">Branch: {user.branch || "N/A"}</p>
                      <p className="text-xs text-slate-600">WhatsApp: {user.whatsapp || "N/A"}</p>
                      {user.isAdmin && (
                        <span className="inline-block mt-2 text-[10px] px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-semibold">
                          Admin
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button className={tabStyles("products")} onClick={() => setActiveTab("products")}>
              <Package size={16} /> Products ({totals.products})
            </button>
            <button className={tabStyles("tickets")} onClick={() => setActiveTab("tickets")}>
              <SearchCheck size={16} /> Lost & Found ({totals.tickets})
            </button>
            <button className={tabStyles("reports")} onClick={() => setActiveTab("reports")}>
              <Flag size={16} /> Reports ({totals.reports})
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600 inline-flex items-center gap-2">
              <Clock3 size={16} className="animate-pulse" /> Loading moderation data...
            </div>
          ) : (
            <>
              {activeTab === "products" && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {products.map((product) => (
                      <article key={product._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="overflow-hidden rounded-2xl bg-slate-100 h-48 mb-4">
                          <img
                            src={product.images?.[0] || "https://placehold.co/600x400?text=No+Image"}
                            alt={product.title || "Product image"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{product.title}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${product.moderationStatus === "Removed" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {product.moderationStatus || "Approved"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2 min-h-[2.5rem]">{product.description}</p>
                        <p className="text-xs text-slate-500 mt-3">Seller: {product.user?.name || "Unknown"}</p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => moderateProduct(product._id, "approve")}
                            disabled={actionLoading === `product-${product._id}-approve`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 transition"
                          >
                            {actionLoading === `product-${product._id}-approve` ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => moderateProduct(product._id, "remove")}
                            disabled={actionLoading === `product-${product._id}-remove`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300 transition"
                          >
                            {actionLoading === `product-${product._id}-remove` ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {hasMore.products && (
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={loadMoreForActiveTab}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:bg-slate-400"
                      >
                        {loadingMore ? "Loading..." : "Load 20 More"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "tickets" && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {tickets.map((ticket) => (
                      <article key={ticket._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{ticket.itemName}</h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ticket.moderationStatus === "Removed" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {ticket.moderationStatus || "Approved"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2 min-h-[2.5rem]">{ticket.description}</p>
                        <p className="text-xs text-slate-500 mt-3">User: {ticket.user?.name || "Unknown"}</p>
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => moderateTicket(ticket._id, "approve")}
                            disabled={actionLoading === `ticket-${ticket._id}-approve`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 transition"
                          >
                            {actionLoading === `ticket-${ticket._id}-approve` ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => moderateTicket(ticket._id, "remove")}
                            disabled={actionLoading === `ticket-${ticket._id}-remove`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:bg-slate-300 transition"
                          >
                            {actionLoading === `ticket-${ticket._id}-remove` ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {hasMore.tickets && (
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={loadMoreForActiveTab}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:bg-slate-400"
                      >
                        {loadingMore ? "Loading..." : "Load 20 More"}
                      </button>
                    </div>
                  )}
                </>
              )}

              {activeTab === "reports" && (
                <>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {reports.map((report) => (
                      <article key={report._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-lg text-slate-900">
                            {report.feedbackType === "report" ? "User Report" : "General Feedback"}
                          </h3>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                            (report.reportStatus || "open") === "resolved"
                              ? "bg-emerald-100 text-emerald-700"
                              : (report.reportStatus || "open") === "dismissed"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-sky-100 text-sky-700"
                          }`}>
                            {report.reportStatus || "open"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 min-h-[2.5rem]">{report.improve || report.like || "No details"}</p>
                        <p className="text-xs text-slate-500 mt-3">
                          {report.email || "No email"} | {report.reportTargetType || "general"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => moderateReport(report._id, "resolved")}
                            disabled={actionLoading === `report-${report._id}-resolved`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300 transition"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => moderateReport(report._id, "dismissed")}
                            disabled={actionLoading === `report-${report._id}-dismissed`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-amber-500 text-white hover:bg-amber-600 disabled:bg-slate-300 transition"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => moderateReport(report._id, "open")}
                            disabled={actionLoading === `report-${report._id}-open`}
                            className="px-3.5 py-2 text-sm rounded-xl bg-slate-800 text-white hover:bg-black disabled:bg-slate-300 transition"
                          >
                            Reopen
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                  {hasMore.reports && (
                    <div className="mt-5 flex justify-center">
                      <button
                        onClick={loadMoreForActiveTab}
                        disabled={loadingMore}
                        className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold disabled:bg-slate-400"
                      >
                        {loadingMore ? "Loading..." : "Load 20 More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default AdminModeration;
