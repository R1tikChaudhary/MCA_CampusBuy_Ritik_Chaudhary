const fs = require('fs');
let content = fs.readFileSync('src/page/Home.jsx', 'utf8');

// Normalize line endings for replacement
content = content.replace(/\r\n/g, '\n');

// 1. Heading
const oldHeading = `        {/* main header is here */}
        <motion.div
          className="flex items-center justify-center gap-1 sm:gap-3"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{
            scale: [0.95, 1.02, 1],
            opacity: 1,
            y: [0, -4, 0],
          }}
          transition={{
            scale: { duration: 0.4 },
            y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
            opacity: { duration: 0.4 },
          }}
        >

          <motion.h1
            className="font-bold text-2xl text-blue-900 tracking-wide p-6"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            🛍️ ITM Buy & Sell
          </motion.h1>
        </motion.div>`;

const newHeading = `        {/* main header is here */}
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
        </div>`;

content = content.replace(oldHeading, newHeading);

// 2. Sort Select and Clear Filters
const oldSort = `            {/* Price Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort:</span>
              <select
                value={priceSort}
                onChange={(e) => handlePriceSort(e.target.value)}
                className="px-3 py-1 rounded-full text-xs sm:text-sm border border-gray-300 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Default</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(selectedCategory || priceSort || searchQuery) && (
              <motion.button
                onClick={clearFilters}
                className="px-3 py-1 rounded-full text-xs sm:text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}`;

const newSort = `            {/* Right side: Sort and Clear */}
            <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
              <select
                value={priceSort}
                onChange={(e) => handlePriceSort(e.target.value)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white/80 border border-indigo-100 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 shadow-sm cursor-pointer"
              >
                <option value="">Sort by: Default</option>
                <option value="low-to-high">Price: Low to High</option>
                <option value="high-to-low">Price: High to Low</option>
              </select>

              {/* Clear Filters */}
              <AnimatePresence>
                {(selectedCategory || priceSort || searchQuery) && (
                  <motion.button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all shadow-sm"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear
                  </motion.button>
                )}
              </AnimatePresence>
            </div>`;
content = content.replace(oldSort, newSort);

// 3. New Badge
const oldBadge = `                <motion.div
                  className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow font-bold px-3 py-1 rounded-bl-lg z-10"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  NEW
                </motion.div>`;
const newBadge = `                <motion.div
                  className="absolute top-3 right-3 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] tracking-wider uppercase font-extrabold px-3 py-1 rounded-full shadow-lg shadow-teal-500/30 z-10 backdrop-blur-sm"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  NEW
                </motion.div>`;
content = content.replace(oldBadge, newBadge);

// 4. Product Title
const oldTitle = `                  <motion.h2
                    className="font-semibold text-indigo-700 text-base sm:text-lg line-clamp-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.title}
                  </motion.h2>`;
const newTitle = `                  <motion.h2
                    className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 text-base sm:text-lg line-clamp-1 mb-1"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {product.title}
                  </motion.h2>`;
content = content.replace(oldTitle, newTitle);

// 5. Product Contact
const oldContact = `                      <motion.button
                        className="text-indigo-600 text-[10px] sm:text-xs hover:underline font-medium"
                        whileHover={{ scale: 1.05, color: "#4338ca" }}`;
const newContact = `                      <motion.button
                        className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 hover:from-indigo-600 hover:to-purple-600 hover:text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition-all shadow-sm"
                        whileHover={{ scale: 1.05 }}`;
content = content.replace(oldContact, newContact);

// Write back with CRLF
fs.writeFileSync('src/page/Home.jsx', content.replace(/\n/g, '\r\n'));
console.log('Done!');
