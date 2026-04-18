import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProductForm, resetProductForm, setUploadLoading, setUploadError, addMyProduct } from '../utils/productSlice';
import { setCurrentPage } from '../utils/appSlice';
import { useAuth } from '../utils/authUtils';
import HomeHeader from '../Component/HomeHeader';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

function ListProductForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { productForm, uploadLoading, uploadError } = useSelector(store => store.product);
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    dispatch(setCurrentPage('sell'));
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    return () => {
      dispatch(resetProductForm());
      if (newSocket) newSocket.disconnect();
    };
  }, [dispatch]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    const invalidFiles = files.filter(file => !validImageTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setImageError('Please select only image files (JPG, PNG, JPEG, GIF, WEBP)');
      dispatch(updateProductForm({ images: [] }));
      return;
    }
    
    setImageError('');
    dispatch(updateProductForm({ images: files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (productForm.images.length === 0) {
      dispatch(setUploadError('Please select at least one image.'));
      return;
    }
    
    if (imageError) {
      dispatch(setUploadError(imageError));
      return;
    }
    
    dispatch(setUploadLoading(true));
    dispatch(setUploadError(null));
    
    const formData = new FormData();
    formData.append('title', productForm.title);
    formData.append('description', productForm.description);
    formData.append('category', productForm.category);
    formData.append('condition', productForm.condition);
    formData.append('price', productForm.price);
    formData.append('negotiable', productForm.negotiable);

    const tags = (productForm.tags || '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    tags.forEach((tag) => formData.append('tags', tag));

    productForm.images.forEach((img) => {
      formData.append('images', img);
    });

    try {
      const res = await fetch('http://localhost:5000/api/product/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      const data = await res.json();
      
      if (res.ok) {
        dispatch(addMyProduct(data.product));
        if (socket) {
          socket.emit('new_product', data.product);
        }
        dispatch(resetProductForm());
        
        // Show success popup and navigate after 3 seconds
        setShowSuccessPopup(true);
        setTimeout(() => {
          setShowSuccessPopup(false);
          navigate('/home');
        }, 3000);
        
      } else {
        dispatch(setUploadError(data.error || data.message || 'Something went wrong.'));
      }
    } catch (err) {
      dispatch(setUploadError('Error submitting form.'));
    } finally {
      dispatch(setUploadLoading(false));
    }
  };

  return (
    <section className="bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50 min-h-screen pb-12">
      <HomeHeader />
      <div className="container mx-auto px-4 mt-8 sm:mt-12">
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white/60 backdrop-blur-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2.5rem] p-6 sm:p-10 max-w-3xl mx-auto w-full relative overflow-hidden"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          {/* Decorative blur blobs behind the form (optional but adds premium feel) */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-purple-400/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            <div className="mb-8 text-center">
              <motion.h2
                className="text-3xl sm:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 tracking-tight mb-2"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                List Your Product
              </motion.h2>
              <motion.p 
                className="text-gray-500 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                Fill in the details below to list your item for sale.
              </motion.p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="title">Product Title</label>
                <motion.input
                  id="title"
                  type="text"
                  value={productForm.title}
                  onChange={(e) => dispatch(updateProductForm({ title: e.target.value }))}
                  placeholder="E.g., Wireless Bluetooth Speaker"
                  required
                  className="w-full bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 text-gray-800 placeholder-gray-400 shadow-sm transition-all outline-none font-medium"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="description">Description</label>
                <motion.textarea
                  id="description"
                  rows={4}
                  value={productForm.description}
                  onChange={(e) => dispatch(updateProductForm({ description: e.target.value }))}
                  placeholder="Describe your product's features, age, and condition in detail..."
                  required
                  className="w-full resize-none bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 text-gray-800 placeholder-gray-400 shadow-sm transition-all outline-none font-medium leading-relaxed"
                  whileFocus={{ scale: 1.01 }}
                />
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="category">Category</label>
                  <div className="relative">
                    <motion.select
                      id="category"
                      value={productForm.category}
                      onChange={(e) => dispatch(updateProductForm({ category: e.target.value }))}
                      required
                      className="w-full appearance-none bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-5 pr-12 py-3.5 text-gray-800 shadow-sm transition-all outline-none font-medium cursor-pointer"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <option value="" disabled hidden>Select category</option>
                      <option value="electronics">Electronics</option>
                      <option value="furniture">Furniture</option>
                      <option value="vehicles">Vehicles</option>
                      <option value="fashion">Fashion</option>
                      <option value="books">Books</option>
                      <option value="others">Others</option>
                    </motion.select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="condition">Condition</label>
                  <div className="relative">
                    <motion.select
                      id="condition"
                      value={productForm.condition}
                      onChange={(e) => dispatch(updateProductForm({ condition: e.target.value }))}
                      required
                      className="w-full appearance-none bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-5 pr-12 py-3.5 text-gray-800 shadow-sm transition-all outline-none font-medium cursor-pointer"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <option value="" disabled hidden>Select condition</option>
                      <option value="new">New</option>
                      <option value="like-new">Like New</option>
                      <option value="used">Used</option>
                    </motion.select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.45 }}>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="tags">Tags</label>
                <motion.input
                  id="tags"
                  type="text"
                  value={productForm.tags}
                  onChange={(e) => dispatch(updateProductForm({ tags: e.target.value }))}
                  placeholder="Add tags separated by commas (e.g. laptop, gaming, computer)"
                  className="w-full bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-5 py-3.5 text-gray-800 placeholder-gray-400 shadow-sm transition-all outline-none font-medium"
                />
                <p className="mt-2 text-xs text-gray-500">Tags help buyers find your product faster.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.5 }}>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="price">Price (₹)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold text-lg">₹</span>
                    </div>
                    <motion.input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => dispatch(updateProductForm({ price: e.target.value }))}
                      placeholder="0.00"
                      required
                      className="w-full bg-white/70 backdrop-blur-md border border-gray-200/80 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-10 pr-5 py-3.5 text-gray-900 shadow-sm transition-all outline-none font-bold text-lg"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>
                
                <motion.div 
                  className="flex items-center md:mt-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50"
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ duration: 0.3, delay: 0.6 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <label className="relative flex items-center cursor-pointer w-full" htmlFor="negotiable">
                    <input 
                      type="checkbox" 
                      id="negotiable" 
                      checked={productForm.negotiable}
                      onChange={(e) => dispatch(updateProductForm({ negotiable: e.target.checked }))}
                      className="peer sr-only" 
                    />
                    <div className="w-6 h-6 rounded-md border-2 border-indigo-200 bg-white peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-all flex items-center justify-center">
                      <svg className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <span className="ml-3 font-bold text-gray-700 select-none">Price is Negotiable</span>
                  </label>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1" htmlFor="images">Upload Images</label>
                <motion.div
                  className="relative border-2 border-dashed border-indigo-300 bg-indigo-50/30 hover:bg-indigo-50/80 transition-colors rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer group"
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  </div>
                  <p className="text-base font-bold text-gray-700 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs font-medium text-gray-400">JPG, PNG, JPEG, GIF, WEBP (Max 5 images)</p>
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={productForm.images.length === 0}
                  />
                </motion.div>

                {/* Image Previews */}
                {productForm.images && productForm.images.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {productForm.images.map((file, i) => (
                      <motion.div 
                        key={i} 
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md flex-shrink-0 bg-gray-100"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: i * 0.1 }}
                      >
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="preview" 
                          className="w-full h-full object-cover" 
                          onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              <AnimatePresence>
                {imageError && (
                  <motion.div
                    className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <p className="text-sm font-bold">{imageError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {uploadError && (
                  <motion.div
                    className="bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 flex items-center gap-3"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                    <p className="text-sm font-bold">{uploadError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="pt-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.8 }}>
                <motion.button
                  type="submit"
                  disabled={uploadLoading || !!imageError}
                  className={`w-full font-bold py-4 rounded-2xl text-lg shadow-lg flex items-center justify-center gap-2 ${
                    uploadLoading || imageError
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-indigo-500/30'
                  }`}
                  whileHover={!(uploadLoading || imageError) ? { scale: 1.02, y: -2 } : {}}
                  whileTap={!(uploadLoading || imageError) ? { scale: 0.98 } : {}}
                >
                  {uploadLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading...
                    </>
                  ) : (
                    'Post Product'
                  )}
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.form>
      </div>

      {/* Success Popup */}
      <AnimatePresence>
        {showSuccessPopup && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl text-center border border-white max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: -20 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Success!</h3>
              <p className="text-gray-600 font-medium">Your product has been listed successfully and is now visible to other students.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default ListProductForm;
