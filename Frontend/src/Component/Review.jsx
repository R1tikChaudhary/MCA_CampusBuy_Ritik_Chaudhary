// src/components/CallToAction.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Review() {
  return (
    <div className="max-w-6xl w-full mx-auto my-16 px-4">
      <div className="relative overflow-hidden flex flex-col items-center justify-center text-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 rounded-[2.5rem] p-12 sm:p-20 text-white shadow-2xl shadow-indigo-500/20 border border-white/10">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-500/20 to-transparent blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg mb-8">
            <div className="flex -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                alt="user 1"
                className="w-10 h-10 rounded-full border-2 border-indigo-900 z-[1] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                alt="user 2"
                className="w-10 h-10 rounded-full border-2 border-indigo-900 z-[2] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                alt="user 3"
                className="w-10 h-10 rounded-full border-2 border-indigo-900 z-[3] object-cover"
              />
            </div>
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, idx) => (
                  <svg key={idx} width="14" height="14" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.85536 0.463527C6.00504 0.00287118 6.65674 0.00287028 6.80642 0.463526L7.82681 3.60397C7.89375 3.80998 8.08572 3.94946 8.30234 3.94946H11.6044C12.0888 3.94946 12.2901 4.56926 11.8983 4.85397L9.22687 6.79486C9.05162 6.92219 8.97829 7.14787 9.04523 7.35388L10.0656 10.4943C10.2153 10.955 9.68806 11.338 9.2962 11.0533L6.62478 9.11244C6.44954 8.98512 6.21224 8.98512 6.037 9.11244L3.36558 11.0533C2.97372 11.338 2.44648 10.955 2.59616 10.4943L3.61655 7.35388C3.68349 7.14787 3.61016 6.92219 3.43491 6.79486L0.763497 4.85397C0.37164 4.56927 0.573027 3.94946 1.05739 3.94946H4.35944C4.57606 3.94946 4.76803 3.80998 4.83497 3.60397L5.85536 0.463527Z" fill="#FF8F20"/>
                  </svg>
                ))}
              </div>
              <p className="text-sm font-medium text-indigo-100">Used by ITM Students</p>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-br from-white via-indigo-100 to-[#CAABFF] text-transparent bg-clip-text drop-shadow-sm tracking-tight">
            Ready to try-out this app?
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200/90 font-medium max-w-2xl mb-10">
            Your next favourite tool is just one click away. Join our growing community of smart buyers and sellers.
          </p>
          
          <Link to="/signup">
            <button className="px-10 py-4 bg-white text-indigo-900 font-bold rounded-full text-lg shadow-xl hover:shadow-indigo-500/40 hover:scale-105 hover:-translate-y-1 transition-all duration-300 border border-white/50">
              Get Started Now ➔
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
