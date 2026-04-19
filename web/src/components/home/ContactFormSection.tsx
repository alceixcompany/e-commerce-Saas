'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';
import api from '@/lib/api';

interface ContactFormSectionProps {
    instanceId?: string;
    data?: {
        title: string;
        description: string;
        mediaType: 'image' | 'video' | 'map';
        mediaUrl: string;
        buttonText?: string;
    };
}

type ContactFormContent = {
    title: string;
    description: string;
    mediaType: 'image' | 'video' | 'map';
    mediaUrl: string;
    buttonText?: string;
    variant?: 'side-by-side' | 'stacked' | 'clean';
};

export default function ContactFormSection({ instanceId, data: directData }: ContactFormSectionProps) {
    const { t } = useTranslation();
    const { instances } = useCmsStore();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    const instanceData = instance?.data as Partial<ContactFormContent> | undefined;

    const data: ContactFormContent = {
        title: t('home.contact.form.title'),
        description: t('home.contact.form.subtitle'),
        mediaType: 'image',
        mediaUrl: '/image/alceix/hero.png',
        variant: 'side-by-side',
        ...instanceData,
        ...directData
    };

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

    const variant = data.variant || 'side-by-side';
    const mediaType = data.mediaType || 'image';
    const formShellClassName = useMemo(() => {
        if (variant === 'clean') {
            return 'rounded-[2rem] border border-foreground/5 bg-background shadow-[0_24px_80px_rgba(0,0,0,0.05)] p-6 md:p-10';
        }

        if (variant === 'stacked') {
            return 'rounded-[2rem] border border-foreground/5 bg-background/95 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-6 md:p-10';
        }

        return 'rounded-[2rem] border border-foreground/5 bg-background/95 backdrop-blur-sm shadow-[0_24px_80px_rgba(0,0,0,0.06)] p-6 md:p-10 lg:p-12';
    }, [variant]);

    const renderMediaElement = () => (
        <div className="w-full h-full min-h-[400px] lg:min-h-[600px] relative bg-foreground/5 rounded-2xl overflow-hidden shadow-sm border border-foreground/5">
            {mediaType === 'image' && data.mediaUrl && (
                <Image
                    src={data.mediaUrl}
                    alt={data.title}
                    fill
                    unoptimized
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            {mediaType === 'map' && data.mediaUrl && (
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
            {mediaType === 'video' && data.mediaUrl && (
                <video 
                    src={data.mediaUrl}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            )}
            {!data.mediaUrl && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/5 italic text-foreground/20 text-xs tracking-widest">
                    Media Placeholder
                </div>
            )}
        </div>
    );

    const renderFormElement = () => (
        <div className={`w-full relative overflow-hidden ${formShellClassName}`}>
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/8 to-transparent pointer-events-none" />
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/6 blur-3xl pointer-events-none" />
            <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {t('home.contact.form.send')}
            </div>
            <h2 className="text-3xl md:text-4xl font-light text-foreground mb-4 serif tracking-wide leading-tight">{data.title}</h2>
            {data.description && (
                <p className="text-foreground/50 font-light leading-relaxed mb-8 max-w-xl text-sm md:text-[15px]">
                    {data.description}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 ml-1">
                            {t('home.contact.form.name')}
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 text-sm text-foreground outline-none transition-all placeholder-foreground/25 font-light focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                            placeholder={t('home.contact.form.namePlaceholder')}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 ml-1">
                            {t('home.contact.form.email')}
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 text-sm text-foreground outline-none transition-all placeholder-foreground/25 font-light focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                            placeholder={t('home.contact.form.emailPlaceholder')}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="subject" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 ml-1">
                        {t('home.contact.form.subject')}
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 text-sm text-foreground outline-none transition-all placeholder-foreground/25 font-light focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                        placeholder={t('home.contact.form.subjectPlaceholder')}
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="message" className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 ml-1">
                        {t('home.contact.form.message')}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full rounded-[1.5rem] border border-foreground/10 bg-foreground/[0.02] px-5 py-4 text-sm text-foreground outline-none transition-all placeholder-foreground/25 font-light resize-none focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                        placeholder={t('home.contact.form.messagePlaceholder')}
                    />
                </div>

                {status === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-green-50 text-green-800 text-sm p-4 rounded-2xl border border-green-100 flex items-center justify-center font-medium"
                    >
                        {t('home.contact.form.success')}
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 text-red-800 text-sm p-4 rounded-2xl border border-red-100 flex items-center justify-center font-medium"
                    >
                        {t('home.contact.form.error')}
                    </motion.div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="group w-full rounded-2xl bg-foreground text-background py-4 px-8 text-[11px] font-bold tracking-[0.28em] uppercase hover:bg-primary transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl mt-6"
                >
                    <span className="inline-flex items-center justify-center gap-3">
                        {loading ? t('home.contact.form.sending') : (data.buttonText || t('home.contact.form.send'))}
                        <span className="transition-transform duration-300 group-hover:translate-x-1">+</span>
                    </span>
                </button>
            </form>
            </div>
        </div>
    );

    if (variant === 'clean') {
        return (
            <div className="max-w-4xl mx-auto px-6 py-24">
                {renderFormElement()}
            </div>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className="max-w-5xl mx-auto px-6 py-24 space-y-20">
                <div className="max-w-3xl mx-auto">
                    {renderFormElement()}
                </div>
                <div className="w-full aspect-video md:aspect-[21/9]">
                    {renderMediaElement()}
                </div>
            </div>
        );
    }

    // Default 'side-by-side'
    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center`}>
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    {renderMediaElement()}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-4 md:p-8"
                >
                    {renderFormElement()}
                </motion.div>
            </div>
        </div>
    );
}
