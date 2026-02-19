'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { FiUpload, FiImage, FiX, FiTrash2, FiLoader } from 'react-icons/fi';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  required?: boolean;
  isBanner?: boolean; // Banner resmi için özel mod
}

export default function ImageUpload({ value, onChange, onRemove, label, required, isBanner = false }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update preview when value prop changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
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
        // Backend returns: /api/upload/image/{id}
        // We need: http://localhost:5001/api/upload/image/{id}
        // Backend returns: /api/upload/image/{id}
        // Construct full URL using API_URL from environment variable
        // If NEXT_PUBLIC_API_URL includes '/api', we need to strip it to get the base URL
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const baseUrl = apiUrl.replace(/\/api$/, '');
        const imageUrl = `${baseUrl}${response.data.data.url}`;

        setPreview(imageUrl);
        onChange(imageUrl);
      } else {
        setError(response.data.message || 'Failed to upload image');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (onRemove) {
      onRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="space-y-4">
        {/* Preview */}
        {preview && (
          <div className={`relative group border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-gray-50 ${isBanner
            ? 'w-full aspect-[21/9] max-h-[300px]'
            : 'w-48 h-48'
            }`}>
            <>
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const placeholder = e.currentTarget.nextElementSibling;
                  if (placeholder) {
                    (placeholder as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className="hidden w-full h-full items-center justify-center flex-col gap-2 text-gray-400 bg-gray-100">
                <FiImage size={24} />
                <span className="text-xs">Image Error</span>
              </div>
            </>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 backdrop-blur-sm transition-colors"
                title="Replace"
              >
                <FiUpload size={20} />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-600 backdrop-blur-sm transition-colors"
                title="Remove"
              >
                <FiTrash2 size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Upload Area - Only show if no preview */}
        {!preview && (
          <div
            className={`group relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${isBanner ? 'w-full' : 'w-full max-w-sm'
              } ${uploading
                ? 'border-gray-300 bg-gray-50'
                : 'border-gray-300 hover:border-black hover:bg-gray-50/50 cursor-pointer'
              } ${error ? 'border-red-300 bg-red-50/10' : ''}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            {uploading ? (
              <div className="py-4 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
                <p className="text-sm font-medium text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="py-4 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors text-gray-500">
                  <FiUpload size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Click to upload image</p>
                  <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
            <FiX size={16} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

