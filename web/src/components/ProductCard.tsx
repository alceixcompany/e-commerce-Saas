'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPlus, FiHeart } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToWishlist, removeFromWishlist } from '@/lib/slices/profileSlice';

interface Product {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  mainImage?: string;
  image?: string;
  images?: string[];
  category?: any;
  stock?: number;
  sku?: string;
  shortDescription?: string;
  tags?: string[];
  material?: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const { addItem } = useCart();

  if (!product) {
    return null;
  }

  const { _id, name, price, discountedPrice, mainImage, image, images, category, material, isBestSeller, isNewArrival, stock } = product;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { profile } = useAppSelector((state) => state.profile);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const isFavorite = useMemo(() => {
    if (!profile || !profile.wishlist) return false;
    return profile.wishlist.some((item: any) =>
      (typeof item === 'string' ? item === _id : item._id === _id)
    );
  }, [profile, _id]);

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isFavorite) {
      await dispatch(removeFromWishlist(_id));
    } else {
      await dispatch(addToWishlist(_id));
    }
  };

  // Prioritize mainImage, then image (fallback), then empty string
  const displayImage = mainImage || image || '';
  const displayPrice = discountedPrice || price || 0;

  const allImages = useMemo(() => {
    return Array.from(new Set([displayImage, ...(images || [])].filter(Boolean)));
  }, [displayImage, images]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && allImages.length > 1) {
      interval = setInterval(() => {
        setActiveImageIndex((prev) => (prev + 1) % allImages.length);
      }, 2500);
    } else {
      setActiveImageIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, allImages.length]);

  const currentImage = allImages[activeImageIndex] || displayImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem({
        id: product._id,
        name: product.name,
        price: displayPrice,
        image: displayImage,
      }, 1);
    }
  };

  const displayMaterial = material || (typeof category === 'object' ? category?.name : 'Collection');

  return (
    <div
      className="group relative w-full h-full cursor-pointer overflow-hidden bg-white shadow-sm hover:shadow-xl transition-shadow duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Wrapper */}
      <div className="relative w-full h-full aspect-[3/4] bg-gray-50 overflow-hidden">
        <Link href={`/products/${_id}`} className="block w-full h-full relative">

          {/* Skeleton Loader - BEHIND everything (z-0) */}
          <div
            className={`absolute inset-0 bg-gray-200 animate-pulse z-0 flex items-center justify-center`}
          >
            <svg className="w-10 h-10 text-gray-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>

          {allImages.length > 0 ? (
            allImages.map((imgUrl, index) => {
              const isBase = index === 0;
              const isActive = index === activeImageIndex;
              // Show image if it's the base image (always visible once loaded) 
              // OR if it's the active image (visible on hover/slideshow once loaded)
              const showImage = (isBase && loadedImages.has(imgUrl)) || (isActive && loadedImages.has(imgUrl));

              return (
                <img
                  key={imgUrl}
                  src={imgUrl}
                  alt={`${name} - View ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${showImage ? 'opacity-100' : 'opacity-0'} ${index === 0 ? 'z-1' : 'z-2'}`}
                  onLoad={() => setLoadedImages(prev => { const n = new Set(prev); n.add(imgUrl); return n; })}
                  onError={() => setLoadedImages(prev => { const n = new Set(prev); n.add(imgUrl); return n; })}
                />
              );
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50 italic font-light z-10">
              Image Not Available
            </div>
          )}
        </Link>

        {/* Segmented Slideshow Progress Bar */}
        {isHovered && allImages.length > 1 && (
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-30">
            {allImages.map((_, idx) => (
              <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-300 ${idx < activeImageIndex ? 'w-full' : idx === activeImageIndex ? 'animate-segment-progress' : 'w-0'
                    }`}
                  style={
                    idx === activeImageIndex
                      ? {
                        animationDuration: '2500ms',
                        animationTimingFunction: 'linear',
                        animationFillMode: 'forwards',
                      }
                      : {}
                  }
                />
              </div>
            ))}
            <style jsx>{`
              @keyframes segment-progress {
                from { width: 0%; }
                to { width: 100%; }
              }
              .animate-segment-progress {
                animation-name: segment-progress;
              }
            `}</style>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-0 left-0 p-4 z-20 flex flex-col gap-2">
          {isBestSeller && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-900 bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm w-fit">
              Best Seller
            </span>
          )}
          {isNewArrival && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white bg-[#C5A059]/90 backdrop-blur-sm px-3 py-1.5 shadow-sm w-fit">
              New Arrival
            </span>
          )}
          {stock !== undefined && stock > 0 && stock < 10 && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-red-600 bg-white/90 backdrop-blur-sm px-3 py-1.5 shadow-sm w-fit">
              Low Stock
            </span>
          )}
          {stock === 0 && (
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-500 bg-gray-100/90 backdrop-blur-sm px-3 py-1.5 shadow-sm w-fit">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons - Top Right */}
        <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            className={`w-10 h-10 rounded-full backdrop-blur-sm shadow-md flex items-center justify-center transition-all duration-300 border border-white/40 transform translate-y-4 group-hover:translate-y-0 ${isFavorite
                ? 'bg-red-500 text-white border-transparent'
                : 'bg-white/90 text-gray-900 hover:bg-gray-900 hover:text-white'
              }`}
            title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <FiHeart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={handleAddToCart}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-900 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#C5A059] hover:text-white shadow-md border border-white/40"
            title="Add to Shopping Bag"
          >
            <FiPlus size={20} />
          </button>
        </div>

        {/* Info Overlay - Light Glassmorphism with Hover Effect */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-5 text-center transition-all duration-500 shadow-sm border border-white/40 translate-y-2 group-hover:translate-y-0 group-hover:bg-white/95 group-hover:shadow-2xl group-hover:border-white/80 z-20">
          <p className="text-[9px] text-gray-500 group-hover:text-[#C5A059] transition-colors duration-300 font-bold uppercase tracking-[0.25em] mb-2">{displayMaterial}</p>
          <Link href={`/products/${_id}`}>
            <h3 className="text-lg font-serif text-gray-900 leading-none mb-2 hover:text-[#C5A059] transition-colors">{name}</h3>
          </Link>
          <div className="flex items-center justify-center gap-2">
            {discountedPrice && discountedPrice < price ? (
              <>
                <span className="text-sm font-medium text-gray-900">$ {discountedPrice.toLocaleString('en-US')}</span>
                <span className="text-xs text-gray-400 line-through decoration-gray-300">$ {price.toLocaleString('en-US')}</span>
              </>
            ) : (
              <span className="text-sm font-medium text-gray-900 tracking-wide">
                $ {price.toLocaleString('en-US')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
