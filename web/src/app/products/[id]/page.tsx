'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiChevronLeft, FiShoppingCart, FiHeart, FiShare2, FiCheck, FiMinus, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchPublicProducts } from '@/lib/slices/productSlice';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';
import { addToWishlist, removeFromWishlist } from '@/lib/slices/profileSlice';

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { products, isLoading } = useAppSelector((state) => state.product);
    const { profile } = useAppSelector((state) => state.profile);
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const { addItem } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);

    const productId = typeof params.id === 'string' ? params.id : '';

    useEffect(() => {
        dispatch(fetchPublicProducts());
    }, [dispatch]);

    // Check if product is in wishlist
    useEffect(() => {
        if (isAuthenticated && profile && profile.wishlist && productId) {
            const inWishlist = profile.wishlist.some((item: any) =>
                (typeof item === 'string' ? item === productId : item._id === productId)
            );
            setIsFavorite(inWishlist);
        }
    }, [profile, isAuthenticated, productId]);

    const product = products.find((p) => p._id === productId);
    const relatedProducts = products
        .filter((p) => {
            if (!product || p._id === productId) return false;
            const productCatId = typeof product.category === 'object' ? product.category?._id : product.category;
            const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
            return productCatId === pCatId;
        })
        .slice(0, 4);

    if (isLoading) {
        return (
            <div className="min-h-screen pt-32 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-gray-200 border-t-[#C5A059] rounded-full animate-spin"></div>
                    <span className="text-xs uppercase tracking-widest text-gray-400">Loading Product...</span>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen pt-32 text-center">
                <div className="max-w-md mx-auto px-6">
                    <div className="text-6xl mb-6">💎</div>
                    <h1 className="text-3xl font-serif text-gray-900 mb-4">Product Not Found</h1>
                    <p className="text-gray-500 font-light mb-8">
                        The product you're looking for doesn't exist or has been removed.
                    </p>
                    <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#C5A059] to-[#B8935A] text-white rounded-lg font-semibold text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <FiChevronLeft size={16} />
                        Browse All Products
                    </Link>
                </div>
            </div>
        );
    }

    const displayImage = product.mainImage || product.image || '';
    const displayPrice = product.discountedPrice ?? product.price ?? 0;
    const hasDiscount = product.discountedPrice !== undefined && product.discountedPrice < product.price;
    const discountPercentage = hasDiscount && product.discountedPrice !== undefined
        ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        addItem(
            {
                id: product._id,
                name: product.name,
                price: displayPrice,
                image: displayImage,
            },
            quantity
        );
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.shortDescription || product.name,
                    url: window.location.href,
                });
            } catch (err) {
                // Share cancelled or failed silently
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isFavorite) {
            await dispatch(removeFromWishlist(productId));
            setIsFavorite(false);
        } else {
            await dispatch(addToWishlist(productId));
            setIsFavorite(true);
        }
    };

    const productImages = Array.from(new Set([
        product.mainImage,
        product.image,
        ...(product.images || [])
    ])).filter(Boolean) as string[];

    const activeImage = productImages[selectedImage] || displayImage;

    return (
        <div className="pt-24 pb-24 bg-white min-h-screen">
            {/* Breadcrumb */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12 py-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400"
                >
                    <Link href="/" className="hover:text-[#C5A059] transition-colors">
                        Home
                    </Link>
                    <span className="text-gray-200">/</span>
                    <Link href="/products" className="hover:text-[#C5A059] transition-colors">
                        Products
                    </Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </motion.div>
            </div>

            {/* Product Detail */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-32">
                    {/* Left: Images */}
                    {/* Left: Images Gallery */}
                    <div className="flex flex-col-reverse lg:flex-row gap-6 h-fit lg:sticky lg:top-24">
                        {/* Thumbnails - Sidebar on Desktop, Row on Mobile */}
                        {productImages.length > 1 && (
                            <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[70vh] custom-scrollbar lg:w-20 xl:w-24 shrink-0 pb-2 lg:pb-0 snap-x">
                                {productImages.map((img, idx) => (
                                    <motion.button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`relative w-20 h-24 lg:w-full lg:aspect-[4/5] shrink-0 border transition-all duration-300 snap-start overflow-hidden ${selectedImage === idx
                                            ? 'border-[#C5A059] ring-1 ring-[#C5A059] shadow-md opacity-100'
                                            : 'border-transparent opacity-60 hover:opacity-100 hover:border-gray-200'
                                            }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Main Image Display */}
                        <div className="flex-1 relative group w-full">
                            <div className="relative aspect-[3/4] md:aspect-[4/5] bg-[#F9F9F9] w-full overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeImage}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="w-full h-full"
                                    >
                                        {activeImage ? (
                                            <motion.img
                                                src={activeImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                whileHover={{ scale: 1.05 }}
                                                transition={{ duration: 0.7 }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 italic">
                                                Image Not Available
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Badges */}
                                <div className="absolute top-0 left-0 p-6 z-10 flex flex-col gap-2">
                                    {product.isBestSeller && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-gray-900 bg-white/90 backdrop-blur-md px-4 py-2 shadow-sm border border-white/20"
                                        >
                                            Best Seller
                                        </motion.span>
                                    )}
                                    {product.isNewArrival && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-white bg-[#C5A059]/90 backdrop-blur-md px-4 py-2 shadow-sm border border-white/10"
                                        >
                                            New Arrival
                                        </motion.span>
                                    )}
                                    {hasDiscount && (
                                        <motion.span
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="text-[9px] font-extrabold tracking-[0.25em] uppercase text-white bg-red-600/90 backdrop-blur-md px-4 py-2 shadow-sm border border-white/10"
                                        >
                                            -{discountPercentage}%
                                        </motion.span>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-6 right-6 flex flex-col gap-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleToggleWishlist}
                                        className={`w-10 h-10 rounded-full backdrop-blur-md shadow-lg flex items-center justify-center transition-colors duration-300 border border-white/40 ${isFavorite
                                            ? 'bg-red-500 text-white border-transparent'
                                            : 'bg-white/90 text-gray-900 hover:bg-gray-900 hover:text-white'
                                            }`}
                                    >
                                        <FiHeart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleShare}
                                        className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/40 flex items-center justify-center text-gray-900 hover:bg-[#C5A059] hover:text-white transition-colors duration-300"
                                    >
                                        <FiShare2 size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="flex flex-col">
                        {/* Material/Category Label */}
                        <div className="mb-4">
                            <div className="flex items-center gap-3 mb-1">
                                <span className="text-[10px] font-extrabold tracking-[0.3em] text-[#C5A059] uppercase">
                                    {product.material || (typeof product.category === 'object' ? product.category?.name : 'Exclusive Piece')}
                                </span>
                                {product.sku && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="text-[9px] text-gray-400 uppercase tracking-[0.2em] font-medium">Ref: {product.sku}</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-5xl font-serif text-gray-900 leading-tight mb-6">{product.name}</h1>

                        <div className="flex items-baseline gap-4 mb-10">
                            <span className="text-2xl md:text-4xl font-light text-gray-900 tracking-tight">
                                $ {displayPrice.toLocaleString('en-US')}
                            </span>
                            {hasDiscount && (
                                <span className="text-xl text-gray-300 line-through decoration-gray-200">
                                    $ {product.price.toLocaleString('en-US')}
                                </span>
                            )}
                        </div>

                        {/* Description */}
                        {product.shortDescription && (
                            <div className="mb-10 pb-10 border-b border-gray-100">
                                <p className="text-gray-500 leading-relaxed text-base font-light antialiased">{product.shortDescription}</p>
                            </div>
                        )}

                        {/* Order Options */}
                        <div className="space-y-8">
                            {/* Stock & Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-sm">
                                    <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Availability</h4>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${product.stock && product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                            {product.stock && product.stock > 0 ? `Ships in 24h (${product.stock} left)` : 'Waitlist Only'}
                                        </span>
                                    </div>
                                </div>
                                {product.material && (
                                    <div className="p-4 bg-gray-50/50 border border-gray-100/50 rounded-sm">
                                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Craftsmanship</h4>
                                        <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">{product.material}</span>
                                    </div>
                                )}
                            </div>

                            {/* Quantity & Actions */}
                            <div className="space-y-5">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Select Quantity</label>
                                    <div className="flex items-center w-fit bg-white border border-gray-200 shadow-sm">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors border-r border-gray-100"
                                            disabled={quantity <= 1}
                                        >
                                            <FiMinus size={12} className="text-gray-400" />
                                        </button>
                                        <span className="w-14 h-12 flex items-center justify-center font-bold text-sm text-gray-900">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                                            className="w-12 h-12 flex items-center justify-center hover:bg-gray-50 transition-colors border-l border-gray-100"
                                            disabled={quantity >= (product.stock || 99)}
                                        >
                                            <FiPlus size={12} className="text-gray-400" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={!product.stock || product.stock === 0}
                                        className="w-full py-5 bg-[#1A1A1A] text-white font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-[#C5A059] transition-all duration-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-4 group relative overflow-hidden shadow-xl"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            <FiPlus size={16} className="group-hover:rotate-90 transition-transform duration-500" />
                                            {product.stock && product.stock > 0 ? 'Add to Shopping Bag' : 'Out of Stock'}
                                        </span>
                                    </button>

                                    <Link
                                        href="/products"
                                        className="w-full py-4 bg-white border border-gray-100 text-gray-400 font-bold text-[9px] uppercase tracking-[0.2em] hover:text-[#C5A059] hover:border-[#C5A059]/30 transition-all duration-500 flex items-center justify-center gap-2"
                                    >
                                        <FiChevronLeft size={12} />
                                        Discover More Pieces
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges - Luxury Standard */}
                        <div className="mt-12 pt-10 border-t border-gray-50 grid grid-cols-3 gap-4 text-center">
                            <div className="space-y-2">
                                <div className="text-[#C5A059] flex justify-center"><FiCheck size={18} /></div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">Genuine<br />Quality</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[#C5A059] flex justify-center"><FiShare2 size={18} /></div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">Secure<br />Shipping</p>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[#C5A059] flex justify-center"><FiHeart size={18} /></div>
                                <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">Ethical<br />Source</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32 pt-32 border-t border-gray-100">
                        <div className="text-center mb-20">
                            <span className="text-[11px] font-bold tracking-[0.4em] text-[#C5A059] uppercase block mb-4">Curated Collection</span>
                            <h2 className="text-2xl md:text-5xl font-serif text-gray-900">You May Also Like</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {relatedProducts.map((relatedProduct, index) => (
                                <div
                                    key={relatedProduct._id}
                                    className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
                                    style={{
                                        animationDelay: `${index * 150}ms`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <ProductCard
                                        product={relatedProduct}
                                        onAddToCart={(p) =>
                                            addItem(
                                                {
                                                    id: p._id,
                                                    name: p.name,
                                                    price: p.discountedPrice ?? p.price,
                                                    image: p.mainImage || p.image || '',
                                                },
                                                1
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>


            <style jsx>{`
                /* Custom Scrollbar Styling */
                .custom-scrollbar::-webkit-scrollbar {
                    height: 3px;
                    width: 3px;
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background-color: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #e5e7eb;
                    border-radius: 9999px;
                    transition: background-color 0.3s ease;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #d1d5db;
                }
                
                /* Hide on mobile/tablet if preferred, but user asked for "like previous" which was hidden on mobile but here vertical scroll happens on large screens */
                /* For consistent experience, we keep it visible but subtle on all sizes as requested "like previous one" */
                 @media (max-width: 1024px) {
                  .custom-scrollbar::-webkit-scrollbar {
                    display: none;
                    width: 0px;
                    background: transparent;
                  }
                }
            `}</style>
        </div>
    );
}
