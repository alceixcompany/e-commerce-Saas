'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import api from '@/lib/api';

interface ContactSplitFormProps {
    data: {
        isVisible: boolean;
        title: string;
        description: string;
        mediaUrl: string;
        mediaType: 'image' | 'video' | 'map';
    }
}

export default function ContactSplitForm({ data }: ContactSplitFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    if (!data.isVisible) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');

        try {
            await api.post('/contact', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Contact form error:', error);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                {/* Media Side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="w-full h-full min-h-[400px] lg:min-h-[600px] relative bg-foreground/5 rounded-2xl overflow-hidden shadow-lg"
                >
                    {data.mediaType === 'image' && data.mediaUrl && (
                        <Image
                            src={data.mediaUrl}
                            alt={data.title}
                            fill
                            className="object-cover"
                        />
                    )}
                    {data.mediaType === 'map' && data.mediaUrl && (
                        <iframe
                            src={data.mediaUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="absolute inset-0"
                        ></iframe>
                    )}
                    {data.mediaType === 'video' && data.mediaUrl && (
                        <video 
                            src={data.mediaUrl}
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-4 md:p-8"
                >
                    <h2 className="text-3xl font-light text-foreground mb-4 serif">{data.title}</h2>
                    {data.description && (
                        <p className="text-foreground/50 font-light leading-relaxed mb-8 max-w-md italic">
                            {data.description}
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-primary transition-colors placeholder-foreground/20 font-light"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-primary transition-colors placeholder-foreground/20 font-light"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-primary transition-colors placeholder-foreground/20 font-light"
                                placeholder="Inquiry about..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-primary transition-colors placeholder-foreground/20 font-light resize-none"
                                placeholder="How can we help you?"
                            />
                        </div>

                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-green-50 text-green-800 text-sm p-4 rounded-sm border border-green-100"
                            >
                                Thank you for your message. We will get back to you shortly.
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-50 text-red-800 text-sm p-4 rounded-sm border border-red-100"
                            >
                                Something went wrong. Please try again later.
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-foreground text-background py-4 px-8 text-xs font-bold tracking-[0.3em] uppercase hover:bg-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
