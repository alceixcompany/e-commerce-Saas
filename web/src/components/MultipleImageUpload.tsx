'use client';

import { useState, useRef } from 'react';
import api from '@/lib/api';
import { FiUpload, FiX, FiPlus, FiImage } from 'react-icons/fi';

interface MultipleImageUploadProps {
  mainImage?: string;
  images?: string[];
  onMainImageChange: (url: string) => void;
  onImagesChange: (urls: string[]) => void;
}

export default function MultipleImageUpload({
  mainImage,
  images = [],
  onMainImageChange,
  onImagesChange,
}: MultipleImageUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const additionalImageInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File): Promise<string> => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    // Upload image
    const response = await api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const baseUrl = apiUrl.replace(/\/api$/, '');
      return `${baseUrl}${response.data.data.url}`;
    } else {
      throw new Error(response.data.message || 'Failed to upload image');
    }
  };

  const handleMainImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading('main');

    try {
      const imageUrl = await uploadImage(file);
      onMainImageChange(imageUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload main image');
    } finally {
      setUploading(null);
    }
  };

  const handleAdditionalImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploading('additional');

    try {
      const uploadPromises = files.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (err: any) {
      setError(err.message || 'Failed to upload images');
    } finally {
      setUploading(null);
      if (additionalImageInputRef.current) {
        additionalImageInputRef.current.value = '';
      }
    }
  };

  const removeMainImage = () => {
    onMainImageChange('');
  };

  const removeAdditionalImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Left: Main Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Main Image <span className="text-red-500">*</span>
        </label>
        {mainImage ? (
          <div className="relative w-full aspect-square border border-gray-200 rounded-xl overflow-hidden group bg-gray-50">
            <img
              src={mainImage}
              alt="Main product image"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
              }}
            />
            {/* Fallback for error */}
            <div className="hidden text-gray-400 flex-col items-center gap-2">
              <FiImage size={32} />
              <span>Image Error</span>
            </div>

            <button
              type="button"
              onClick={removeMainImage}
              className="absolute top-3 right-3 p-2 bg-white/90 text-red-600 rounded-lg shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              title="Remove Image"
            >
              <FiX size={18} />
            </button>
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/70 text-white text-xs rounded backdrop-blur-md">
              Main Image
            </div>
          </div>
        ) : (
          <div
            className={`w-full aspect-square border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 group ${uploading === 'main'
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-black hover:bg-gray-50/50 cursor-pointer'
              }`}
            onClick={() => !uploading && mainImageInputRef.current?.click()}
          >
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/*"
              onChange={handleMainImageSelect}
              className="hidden"
              disabled={uploading === 'main'}
            />
            {uploading === 'main' ? (
              <div className="space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="text-sm font-medium text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors text-gray-500">
                  <FiUpload size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload Main Image</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Additional Images (8 slots) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gallery Images (Max 8)
        </label>
        <div className="grid grid-cols-4 gap-3">
          {/* Existing Images */}
          {images.slice(0, 8).map((imageUrl, index) => (
            <div key={index} className="relative aspect-square border border-gray-200 rounded-lg overflow-hidden group bg-gray-50">
              <img
                src={imageUrl}
                alt={`Gallery ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
              <div className="hidden text-gray-300">
                <FiImage size={20} />
              </div>

              <button
                type="button"
                onClick={() => removeAdditionalImage(index)}
                className="absolute top-1 right-1 p-1 bg-white/90 text-red-600 rounded-md shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 backdrop-blur-sm"
              >
                <FiX size={14} />
              </button>
            </div>
          ))}

          {/* Empty Slots + Upload Button */}
          {images.length < 8 && (
            <div
              className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${uploading === 'additional'
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-black hover:bg-gray-50/50 cursor-pointer'
                }`}
              onClick={() => !uploading && additionalImageInputRef.current?.click()}
            >
              {uploading === 'additional' ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
              ) : (
                <FiPlus size={24} className="text-gray-400" />
              )}
            </div>
          )}

          {/* Fill remaining slots with placeholders to keep grid structure if needed, or just leave empty space. 
               The design looks better if we just show the Add button. 
               But to match previous behavior of showing placeholders: */}
          {Array.from({ length: Math.max(0, 7 - images.length) }).map((_, i) => (
            <div key={`placeholder-${i}`} className="aspect-square border border-gray-100 rounded-lg bg-gray-50/50"></div>
          ))}

        </div>
        <input
          ref={additionalImageInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleAdditionalImageSelect}
          className="hidden"
          disabled={uploading === 'additional'}
        />
        <p className="mt-3 text-xs text-gray-500">
          Add up to 8 additional images to show different angles or details.
        </p>
      </div>

      {error && (
        <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <FiX size={16} />
          {error}
        </div>
      )}
    </div>
  );
}

