'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { FiUpload, FiVideo, FiX, FiTrash2 } from 'react-icons/fi';

interface VideoUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    label?: string;
    required?: boolean;
}

export default function VideoUpload({ value, onChange, onRemove, label, required }: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPreview(value || null);
    }, [value]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setError('Please select a video file');
            return;
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB
            setError('Video size must be less than 50MB');
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('video', file);

            const response = await api.post('/upload/video', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const baseUrl = apiUrl.replace(/\/api$/, '');
                const videoUrl = `${baseUrl}${response.data.data.url}`;

                setPreview(videoUrl);
                onChange(videoUrl);
            } else {
                setError(response.data.message || 'Failed to upload video');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to upload video';
            const responseMessage = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
            setError(responseMessage || message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        setPreview(null);
        onChange('');
        if (onRemove) onRemove();
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div className="space-y-4">
                {preview && (
                    <div className="relative group border border-border rounded-xl overflow-hidden shadow-sm bg-muted aspect-video">
                        <video
                            src={preview}
                            className="w-full h-full object-cover"
                            controls
                        />

                        <div className="absolute inset-0 bg-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-10">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-background/10 text-background rounded-lg hover:bg-background/20 backdrop-blur-sm transition-colors"
                                title="Replace"
                            >
                                <FiUpload size={20} />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="p-2 bg-red-500/80 text-background rounded-lg hover:bg-red-600 backdrop-blur-sm transition-colors"
                                title="Remove"
                            >
                                <FiTrash2 size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {!preview && (
                    <div
                        className={`group relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 w-full ${uploading
                            ? 'border-border bg-muted'
                            : 'border-border hover:border-foreground hover:bg-muted/50 cursor-pointer'
                            } ${error ? 'border-red-300 bg-red-50/10' : ''}`}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                            disabled={uploading}
                        />

                        {uploading ? (
                            <div className="py-4 space-y-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto"></div>
                                <p className="text-sm font-medium text-muted-foreground">Uploading Video...</p>
                            </div>
                        ) : (
                            <div className="py-4 space-y-3">
                                <div className="w-12 h-12 mx-auto rounded-full bg-muted/80 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors text-muted-foreground">
                                    <FiVideo size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Click to upload video</p>
                                    <p className="text-xs text-muted-foreground mt-1">MP4, WEBM, OGG (max. 50MB)</p>
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
