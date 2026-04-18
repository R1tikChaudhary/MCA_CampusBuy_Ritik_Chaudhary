import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection = () => {

  return (
    <section
      id="section"
      className="min-h-[calc(100vh-80px)] bg-transparent pt-16 pb-12"
    >
      <main className="flex-grow flex flex-col items-center px-6 sm:px-10 max-w-7xl mx-auto w-full">

        <h1 className="mt-12 text-center font-bold text-5xl sm:text-6xl md:text-7xl max-w-3xl leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 drop-shadow-sm pb-2">
          🛍️ ITM Buy & Sell
        </h1>      

        <p className="mt-4 text-center text-gray-600 max-w-2xl text-lg sm:text-xl md:text-2xl leading-relaxed font-medium">
          The smart way to buy, sell & grow. <br />
          Built by hustlers. Trusted by doers. <br />
          <span className="text-indigo-500 font-semibold">💞 Loved by customers.</span>
        </p>
        
        <Link to="/signup" className="mt-8 mb-4">
          <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg sm:text-xl font-bold shadow-xl hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300">
            <span>Swipe, Sell, Success. Explore. ➔ </span>
          </button>
        </Link>


        {/* Images */}
        <div
          aria-label="Product Images"
          className="mt-12 mb-8 flex flex-wrap justify-center gap-6 max-w-8xl w-full mx-auto px-6"
        >
          {[
            
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232332/Shoes_fxiaqm.png",
              price: "₹299/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232329/cooler_qqlfi2.png",
              price: "₹999/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232338/Books_t3pxjf.png",
              price: "₹99/-"
            },
            {
              src: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754232327/Iphone_xrfzpd.png",
              price: "₹10,999/-"
            }
          ].map((item, index) => (
            <Link to="/login" key={index} className="relative w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden hover:-translate-y-4 shadow-xl hover:shadow-2xl border border-white/50 transition-all duration-300 flex-shrink-0 group">
              <img
                src={item.src}
                alt={`Product ${index + 1}`}
                className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-gray-900 text-sm sm:text-base font-bold px-4 py-2 rounded-xl shadow-lg border border-white/50">
                Starting from <span className="text-indigo-600">{item.price}</span>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </section>
  );
};

export default HeroSection;