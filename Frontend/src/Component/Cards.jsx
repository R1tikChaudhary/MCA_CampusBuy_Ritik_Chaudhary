import React from 'react';

const Cards = () => {
    const [stopScroll, setStopScroll] = React.useState(false);
    const cardData = [
        {
            title: "Unlock Your Creative Flow",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244559/Bycycle_oyeesu.png",
        },
        {
            title: "Design Your Digital Future",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244399/induction_cnkdrh.png",
        },
        {
            title: "Build with Passion, Ship with Pride",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244397/utensils_jmyj8b.png",
        },
        {
            title: "Think Big, Code Smart",
            image: "https://res.cloudinary.com/dzkprawxw/image/upload/v1754244395/Laptop_2_hug9gx.png",
        },
    ];

    return (
        <section className="py-16 w-full max-w-7xl mx-auto px-4 overflow-hidden">
            <style>{`
                .marquee-inner {
                    animation: marqueeScroll linear infinite;
                }

                @keyframes marqueeScroll {
                    0% {
                        transform: translateX(0%);
                    }

                    100% {
                        transform: translateX(-50%);
                    }
                }
            `}</style>
            
            <div className="text-center mb-10">
                <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-700 to-purple-600 bg-clip-text text-transparent inline-block pb-2">
                    Discover Hidden Gems
                </h2>
                <p className="text-lg text-gray-500 font-medium mt-3 max-w-2xl mx-auto">
                    Explore top-rated products listed by your peers. Something new to discover every day!
                </p>
            </div>

            <div className="my-7 overflow-hidden w-full relative" onMouseEnter={() => setStopScroll(true)} onMouseLeave={() => setStopScroll(false)}>
                <div className="absolute left-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-r from-[#f8fafc] to-transparent" />
                
                <div className="marquee-inner flex w-fit py-4" style={{ animationPlayState: stopScroll ? "paused" : "running", animationDuration: cardData.length * 4000 + "ms" }}>
                    <div className="flex">
                        {[...cardData, ...cardData].map((card, index) => (
                            <div key={index} className="w-72 sm:w-80 mx-4 h-80 sm:h-[22rem] relative group hover:-translate-y-2 transition-all duration-300 rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden cursor-pointer border border-white/60 bg-white/40 flex-shrink-0">
                                <img src={card.image} alt="card" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-8 px-6 backdrop-blur-[2px]">
                                    <p className="text-white text-xl sm:text-2xl font-bold text-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-lg">
                                        {card.title}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="absolute right-0 top-0 h-full w-24 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-[#f1f5f9] to-transparent" />
            </div>
        </section>
    );
};

export default Cards;