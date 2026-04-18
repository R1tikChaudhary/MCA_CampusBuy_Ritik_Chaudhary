import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setCurrentPage } from '../utils/appSlice';
import HomeHeader from '../Component/HomeHeader';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Calendar, Trash2, AlertCircle, PlusCircle, ExternalLink } from 'lucide-react';

function History() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(setCurrentPage('history'));
        fetchUserProducts();
    }, [dispatch]);

    const fetchUserProducts = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please login to view your listed products');
                setLoading(false);
                return;
            }
            const response = await axios.get('http://localhost:5000/api/product/user', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProducts(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            const errorMessage = error.response?.data?.error || 'Failed to fetch products';
            setError(errorMessage);
            setLoading(false);
        }
    };

    const confirmDelete = (productId) => {
        setDeleteConfirm(productId);
    };

    const cancelDelete = () => {
        setDeleteConfirm(null);
    };

    const handleDelete = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Please login to delete products');
                return;
            }

            await axios.delete(`http://localhost:5000/api/product/${productId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setProducts(products.filter(product => product._id !== productId));
            setDeleteConfirm(null);
            toast.success('Product deleted successfully');
        } catch (error) {
            console.error('Error deleting product:', error);
            const errorMessage = error.response?.data?.error || 'Failed to delete product';
            toast.error(errorMessage);
            setDeleteConfirm(null);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'sold':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <section className="bg-gradient-to-b from-[#fcfdfd] via-[#fffbee] to-[#f7f9ff] h-full">
            <HomeHeader />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                My Products
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Manage your listed products and track their status
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/sell')}
                            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                            <PlusCircle size={20} />
                            List New Product
                        </motion.button>
                    </div>
                </motion.div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full"
                        />
                        <p className="text-gray-600 mt-4">Loading your products...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-50 border border-red-200 rounded-xl p-8 text-center"
                    >
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-red-800 mb-2">Oops!</h3>
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchUserProducts}
                            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </motion.div>
                )}

                {/* Empty State */}
                {!loading && !error && products.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20"
                    >
                        <Package className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
                        <p className="text-gray-500 mb-6">Start selling by listing your first product!</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/sell')}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all"
                        >
                            <PlusCircle size={20} />
                            List Your First Product
                        </motion.button>
                    </motion.div>
                )}

                {/* Products Grid */}
                {!loading && !error && products.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onMouseEnter={() => setHoveredProduct(product._id)}
                                onMouseLeave={() => setHoveredProduct(null)}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                            >
                                {/* Product Image */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={product.images[0] || "https://placehold.co/400x300?text=No+Image"}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(product.status || 'available')}`}>
                                            {product.status || 'Available'}
                                        </span>
                                    </div>

                                    {/* Hover Actions - REMOVED */}
                                </div>

                                {/* Product Details */}
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-1">
                                        {product.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {product.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-2xl font-bold text-indigo-600">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.originalPrice && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            <span>{new Date(product.createdAt).toLocaleDateString('en-IN', { 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}</span>
                                        </div>
                                        <span className="text-gray-600">
                                            {product.branch || 'General'}
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                        <AnimatePresence>
                                            {deleteConfirm === product._id ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex gap-2 w-full"
                                                >
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={cancelDelete}
                                                        className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-semibold"
                                                    >
                                                        Cancel
                                                    </button>
                                                </motion.div>
                                            ) : (
                                                <motion.button
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    onClick={() => confirmDelete(product._id)}
                                                    className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 font-semibold"
                                                >
                                                    <Trash2 size={16} />
                                                    Remove
                                                </motion.button>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}

export default History;