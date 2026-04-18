import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white/40 backdrop-blur-lg border-t border-white/60 text-gray-800 py-12 mt-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
        <div className="flex flex-col md:flex-row items-center justify-between w-full mb-8 gap-6">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">
              ITM Buy & Sell
            </h2>
            <p className="text-center md:text-right text-base text-gray-600 max-w-sm font-medium leading-relaxed">
              A marketplace for students, by students. <br/> Sell smart, buy smarter 💼📱📚
            </p>
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent mb-8"></div>
        
        <p className="text-sm text-gray-500 font-medium">
          © {new Date().getFullYear()} ITM Buy & Sell. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
