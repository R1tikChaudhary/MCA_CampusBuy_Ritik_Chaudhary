import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPage, addNotification } from '../utils/appSlice';
import HomeHeader from '../Component/HomeHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquareHeart, Flag, Sparkles, SendHorizontal, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../utils/authUtils';

function Feedback() {
  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackType, setFeedbackType] = useState('feedback');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setCurrentPage('feedback'));
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target;
    const name = form.querySelector('#name').value;
    const email = form.querySelector('#email').value;
    const rating = form.querySelector('#rating').value;
    const like = form.querySelector('#like').value;
    const improve = form.querySelector('#improve').value;
    const reportTargetType = form.querySelector('#reportTargetType')?.value || '';
    const reportTargetId = form.querySelector('#reportTargetId')?.value || '';

    if (!rating || !improve.trim()) {
      dispatch(addNotification({ id: Date.now(), type: 'error', message: 'Please fill all required fields.' }));
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/feedback/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          rating,
          like,
          improve,
          feedbackType,
          reportTargetType,
          reportTargetId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowPopup(true);
        form.reset();
        setFeedbackType('feedback');
        dispatch(addNotification({ id: Date.now(), type: 'success', message: 'Feedback submitted successfully!' }));
        setTimeout(() => setShowPopup(false), 2800);
      } else {
        dispatch(addNotification({ id: Date.now(), type: 'error', message: data.message || 'Failed to send feedback.' }));
      }
    } catch (err) {
      dispatch(addNotification({ id: Date.now(), type: 'error', message: 'Server error while submitting feedback.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_12%_15%,_rgba(16,185,129,0.12),_transparent_24%),radial-gradient(circle_at_88%_2%,_rgba(59,130,246,0.14),_transparent_26%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
      <HomeHeader />

      <motion.div
        className="min-h-screen px-4 sm:px-6 py-7 sm:py-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
          <div className="bg-white/75 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 mb-4 uppercase tracking-wider">
              <Sparkles size={14} /> Help Us Improve
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              Share Feedback,
              <br />
              Shape the Product
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-4 leading-relaxed">
              Your input helps us fix issues faster and build features that matter. You can also report suspicious listings directly from here.
            </p>

            <div className="mt-6 space-y-3">
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Response time</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Usually within 24 hours</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Best use</p>
                <p className="text-lg font-bold text-slate-900 mt-1">UI feedback, bugs, suspicious posts</p>
              </div>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="bg-white/90 backdrop-blur-xl border border-white rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] space-y-5"
            initial={{ scale: 0.985, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900">We'd Love Your Feedback</h2>
                <p className="text-sm text-slate-600 mt-1">Quick form, real impact.</p>
              </div>
              <div className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <MessageSquareHeart size={20} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-semibold text-slate-700">Your Name (optional)</label>
                <input id="name" type="text" placeholder="Enter your name" className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email (optional)</label>
                <input id="email" type="email" placeholder="you@example.com" className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 transition" />
              </div>
            </div>

            <div>
              <label htmlFor="rating" className="text-sm font-semibold text-slate-700">How would you rate your overall experience? <span className="text-rose-600">*</span></label>
              <select id="rating" required className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 transition">
                <option value="">Choose a rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>

            <div>
              <label htmlFor="like" className="text-sm font-semibold text-slate-700">What did you like about our app?</label>
              <textarea id="like" rows={3} placeholder="Simple flow, useful features, fast browsing..." className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition" />
            </div>

            <div>
              <label htmlFor="improve" className="text-sm font-semibold text-slate-700">What can we improve? <span className="text-rose-600">*</span></label>
              <textarea id="improve" required rows={3} placeholder="What should we fix next?" className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 resize-none transition" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <label className="text-sm font-semibold text-slate-700">Submission Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFeedbackType('feedback')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${feedbackType === 'feedback' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                >
                  <MessageSquareHeart size={16} /> General Feedback
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackType('report')}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${feedbackType === 'report' ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}
                >
                  <Flag size={16} /> Report Content
                </button>
              </div>

              {feedbackType === 'report' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                    <ShieldAlert size={16} /> Add details so admins can investigate quickly.
                  </div>
                  <div>
                    <label htmlFor="reportTargetType" className="text-sm font-semibold text-slate-700">Report Target Type</label>
                    <select id="reportTargetType" className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-rose-300 transition">
                      <option value="product">Product Listing</option>
                      <option value="lost_found">Lost and Found Ticket</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="reportTargetId" className="text-sm font-semibold text-slate-700">Target ID (optional)</label>
                    <input id="reportTargetId" type="text" placeholder="Paste product/ticket ID if available" className="w-full mt-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-rose-300 transition" />
                  </div>
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={!isSubmitting ? { scale: 1.01 } : {}}
              whileTap={!isSubmitting ? { scale: 0.99 } : {}}
              className={`w-full rounded-xl py-3 font-bold inline-flex justify-center items-center gap-2 transition ${
                isSubmitting
                  ? 'bg-slate-400 cursor-not-allowed text-white'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-[0_8px_25px_rgba(37,99,235,0.35)]'
              }`}
            >
              <SendHorizontal size={16} />
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </motion.button>
          </motion.form>
        </div>

        <AnimatePresence>
          {showPopup && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-slate-900/35 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-2xl shadow-2xl text-center border border-emerald-200 max-w-sm mx-4"
                initial={{ y: -10, opacity: 0, scale: 0.98 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0 }}
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Thank you!</h3>
                <p className="text-sm text-slate-600 mt-1">Your feedback has been submitted successfully.</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default Feedback;
