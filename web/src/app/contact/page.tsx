'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiMapPin, FiPhone, FiMail, FiClock, FiShare2 } from 'react-icons/fi';
import api from '@/lib/api';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

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
        <div className="min-h-screen bg-white pt-24 pb-24">
            {/* Hero Section */}
            <div className="pt-12 pb-16 flex items-center justify-center text-center px-6">
                <div>
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="block text-[#C5A059] text-xs font-bold tracking-[0.3em] uppercase mb-4"
                    >
                        Get in Touch
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-light text-gray-900 serif tracking-wide"
                    >
                        Contact Us
                    </motion.h1>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                    {/* Contact Info */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <h2 className="text-3xl font-light text-gray-900 mb-8 serif">Visit Our Showroom</h2>
                            <p className="text-gray-500 font-light leading-relaxed mb-8 max-w-md">
                                Experience the brilliance of our collection in person. Our dedicated consultants are ready to assist you in finding the perfect piece.
                            </p>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-8 mb-12">
                            {/* LA Location */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="space-y-4"
                            >
                                <div className="text-[#C5A059] mb-2">
                                    <FiMapPin size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-2">
                                    Los Angeles <span className="w-1 h-1 bg-[#C5A059] rounded-full"></span> Atelier
                                </h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <p className="text-sm text-gray-500 font-light flex-1">
                                        608 S Hill St<br />
                                        LA, CA 90014<br />
                                        United States
                                    </p>
                                    <div className="w-20 h-20 relative bg-gray-50 p-1 border border-gray-100 flex-shrink-0">
                                        <Image
                                            src="/image/qr_for_england.jpeg"
                                            alt="LA Location QR"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Istanbul Location */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="text-[#C5A059] mb-2">
                                    <FiMapPin size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900 flex items-center gap-2">
                                    Istanbul <span className="w-1 h-1 bg-[#C5A059] rounded-full"></span> Showroom
                                </h3>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <p className="text-sm text-gray-500 font-light flex-1">
                                        Nuruosmaniye, Fatih<br />
                                        Istanbul, TR<br />
                                        Turkey
                                    </p>
                                    <div className="w-20 h-20 relative bg-gray-50 p-1 border border-gray-100 flex-shrink-0">
                                        <Image
                                            src="/image/qr_for_ist.jpeg"
                                            alt="Istanbul Location QR"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Contact Details */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4"
                            >
                                <div className="text-[#C5A059] mb-2">
                                    <FiMail size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900">Get in Touch</h3>
                                <p className="text-sm text-gray-500 font-light">
                                    oceangem.us@outlook.com<br />
                                    +1 (213) 555-0188
                                </p>
                            </motion.div>

                            {/* WhatsApp Connect */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                className="space-y-4"
                            >
                                <div className="text-[#25D366] mb-2">
                                    <FiShare2 size={24} strokeWidth={1} />
                                </div>
                                <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-900">WhatsApp</h3>
                                <div className="w-20 h-20 relative bg-gray-50 p-1 border border-gray-100 flex-shrink-0">
                                    <Image
                                        src="/image/qr_for_whatsapp.png"
                                        alt="WhatsApp QR"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="p-8 md:pl-12"
                    >
                        <h2 className="text-2xl font-light text-gray-900 mb-8 serif">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#C5A059] transition-colors placeholder-gray-300 font-light"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-transparent border-b border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#C5A059] transition-colors placeholder-gray-300 font-light"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="subject" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Subject</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#C5A059] transition-colors placeholder-gray-300 font-light"
                                    placeholder="Inquiry about..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="w-full bg-transparent border-b border-gray-200 py-3 text-gray-900 focus:outline-none focus:border-[#C5A059] transition-colors placeholder-gray-300 font-light resize-none"
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
                                className="w-full bg-gray-900 text-white py-4 px-8 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#C5A059] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
