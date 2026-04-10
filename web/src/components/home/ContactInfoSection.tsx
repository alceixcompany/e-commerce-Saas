'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';
import { useAppSelector } from '@/lib/hooks';
import { useTranslation } from '@/hooks/useTranslation';

interface ContactInfoSectionProps {
    instanceId?: string;
    data?: {
        title: string;
        faqs: { question: string; answer: string }[];
        supportText: string;
        supportEmail: string;
        supportPhone: string;
        supportAddress?: string;
        socialLinks?: { platform: string; url: string }[];
        variant?: 'split' | 'grid' | 'stacked';
    };
}

export default function ContactInfoSection({ instanceId, data: directData }: ContactInfoSectionProps) {
    const { t } = useTranslation();
    const { instances } = useAppSelector((state) => state.component);
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    
    const data = directData || instance?.data || {
        title: t('home.contact.info.faq'),
        faqs: [],
        supportText: t('home.contact.info.stillQuestions'),
        supportEmail: 'support@example.com',
        supportPhone: '+1 234 567 890',
        supportAddress: '',
        socialLinks: [],
        variant: 'split'
    };

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const variant = data.variant || 'split';

    const getSocialIcon = (platform: string) => {
        switch (platform.toLowerCase()) {
            case 'instagram': return <FiInstagram size={18} />;
            case 'facebook': return <FiFacebook size={18} />;
            case 'twitter': return <FiTwitter size={18} />;
            case 'youtube': return <FiYoutube size={18} />;
            case 'linkedin': return <FiLinkedin size={18} />;
            case 'github': return <FiGithub size={18} />;
            default: return <FiGlobe size={18} />;
        }
    };

    const FaqArea = ({ boxed = false }: { boxed?: boolean }) => (
        <div className={`space-y-10 ${boxed ? 'max-w-3xl mx-auto' : ''}`}>
            {!boxed && <h2 className="text-3xl font-light text-foreground mb-8 serif tracking-wide">{data.title || t('home.contact.info.faq')}</h2>}
            <div className="grid grid-cols-1 gap-4">
                {(data.faqs || []).map((faq: any, index: number) => (
                    <div 
                        key={index} 
                        className={`transition-all duration-500 ${
                            boxed 
                            ? `bg-background border border-foreground/5 rounded-3xl overflow-hidden ${openIndex === index ? 'shadow-xl ring-1 ring-primary/10 -translate-y-1' : 'hover:border-primary/20 hover:bg-foreground/[0.01]'}` 
                            : 'border-b border-foreground/5 pb-4'
                        }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className={`w-full flex items-center justify-between text-left transition-all ${boxed ? 'p-6 md:p-8' : 'py-2 hover:text-primary group'}`}
                        >
                            <span className={`${boxed ? 'text-lg md:text-xl' : 'text-lg'} text-foreground/80 font-light tracking-tight transition-colors ${openIndex === index && !boxed ? 'text-primary' : ''}`}>
                                {faq.question}
                            </span>
                            <div className={`shrink-0 p-1.5 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-primary text-background' : 'bg-foreground/5 text-foreground/40'}`}>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <FiChevronDown size={14} />
                                </motion.div>
                            </div>
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className={`${boxed ? 'px-6 md:px-8 pb-8 pt-0' : 'pt-4'}`}>
                                        <p className="text-foreground/50 leading-relaxed font-light text-sm italic border-l-2 border-primary/20 pl-4">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );

    const SupportGrid = () => (
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <h3 className="text-3xl font-light text-foreground serif italic">{data.supportText || t('home.contact.info.stillQuestions')}</h3>
                <div className="w-12 h-[1px] bg-primary/30 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.supportEmail && (
                    <a href={`mailto:${data.supportEmail}`} className="group bg-foreground/[0.02] p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
                        <div className="w-14 h-14 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-2xl text-foreground/40 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <FiMail size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-2">{t('home.contact.info.emailUs')}</p>
                            <p className="font-light text-foreground group-hover:text-primary transition-colors italic">{data.supportEmail}</p>
                        </div>
                    </a>
                )}
                {data.supportPhone && (
                    <a href={`tel:${data.supportPhone}`} className="group bg-foreground/[0.02] p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
                        <div className="w-14 h-14 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-2xl text-foreground/40 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                            <FiPhone size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-2">{t('home.contact.info.callUs')}</p>
                            <p className="font-light text-foreground group-hover:text-primary transition-colors italic">{data.supportPhone}</p>
                        </div>
                    </a>
                )}
                {data.supportAddress && (
                    <div className="bg-foreground/[0.02] p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
                        <div className="w-14 h-14 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-2xl text-foreground/40 transition-all duration-500">
                            <FiMapPin size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-2">{t('home.contact.info.location')}</p>
                            <p className="font-light text-foreground text-sm leading-relaxed italic">{data.supportAddress}</p>
                        </div>
                    </div>
                )}
            </div>

            {data.socialLinks && data.socialLinks.length > 0 && (
                <div className="flex flex-col items-center gap-6 pt-8">
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/20">{t('home.contact.info.connect')}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {data.socialLinks.map((social: any, idx: number) => (
                            <a
                                key={idx}
                                href={social.url.startsWith('http') ? social.url : `https://${social.platform}.com/${social.url.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 bg-background border border-foreground/5 flex items-center justify-center rounded-2xl text-foreground/40 hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 shadow-sm hover:-translate-y-1 hover:shadow-lg group"
                                title={social.platform}
                            >
                                {getSocialIcon(social.platform)}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const SupportCard = () => {
        return (
            <div className="bg-foreground/[0.02] p-8 md:p-10 rounded-3xl border border-foreground/5 relative overflow-hidden backdrop-blur-sm h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
                <div className="relative z-10 flex-1">
                    <h3 className="text-2xl font-light text-foreground mb-8 serif tracking-wide italic">{data.supportText || t('home.contact.info.directSupport')}</h3>
                    <div className="space-y-6">
                        {data.supportEmail && (
                            <a href={`mailto:${data.supportEmail}`} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-xl text-foreground/40 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                                    <FiMail size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-0.5">{t('home.contact.info.emailUs')}</p>
                                    <p className="font-light text-foreground text-sm group-hover:text-primary transition-colors truncate">{data.supportEmail}</p>
                                </div>
                            </a>
                        )}
                        {data.supportPhone && (
                            <a href={`tel:${data.supportPhone}`} className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-xl text-foreground/40 group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                                    <FiPhone size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-0.5">{t('home.contact.info.callUs')}</p>
                                    <p className="font-light text-foreground text-sm group-hover:text-primary transition-colors">{data.supportPhone}</p>
                                </div>
                            </a>
                        )}
                        {data.supportAddress && (
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 bg-background shadow-sm border border-foreground/5 flex items-center justify-center rounded-xl text-foreground/40 transition-all duration-500">
                                    <FiMapPin size={16} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-0.5">{t('home.contact.info.ourLocation')}</p>
                                    <p className="font-light text-foreground leading-snug text-xs">{data.supportAddress}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {data.socialLinks && data.socialLinks.length > 0 && (
                    <div className="relative z-10 pt-8 mt-8 border-t border-foreground/5">
                        <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-foreground/30 mb-4 ml-1">{t('home.contact.info.connect')}</p>
                        <div className="flex flex-wrap gap-2">
                            {data.socialLinks.map((social: any, idx: number) => (
                                <a
                                    key={idx}
                                    href={social.url.startsWith('http') ? social.url : `https://${social.platform}.com/${social.url.replace('@', '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-background border border-foreground/5 flex items-center justify-center rounded-xl text-foreground/40 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm hover:-translate-y-1"
                                    title={social.platform}
                                >
                                    {getSocialIcon(social.platform)}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (variant === 'grid') {
        return (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 border-t border-foreground/5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-foreground/[0.01] p-10 rounded-3xl border border-foreground/5">
                        <FaqArea />
                    </div>
                    <SupportCard />
                </div>
            </div>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-32 space-y-32">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">{data.title || t('home.contact.info.faqShort')}</span>
                    <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight italic">{data.title || t('home.contact.info.faq')}</h2>
                    <p className="text-foreground/40 font-light text-lg italic max-w-xl mx-auto">{t('home.contact.info.helpNote')}</p>
                </div>

                <FaqArea boxed={true} />
                
                <div className="pt-16 border-t border-foreground/5">
                    <SupportGrid />
                </div>
            </div>
        );
    }

    // Default 'split'
    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 bg-foreground/[0.01] border-y border-foreground/5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
                <div className="lg:col-span-2">
                    <FaqArea />
                </div>
                <div className="h-full flex flex-col justify-center">
                    <SupportCard />
                </div>
            </div>
        </div>
    );
}
