'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMail, FiPhone, FiMapPin, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLinkedin, FiGithub, FiGlobe } from 'react-icons/fi';
import { useCmsStore } from '@/lib/store/useCmsStore';
import { useTranslation } from '@/hooks/useTranslation';

import { ContactInfoData } from '@/types/sections';

interface ContactInfoSectionProps {
    instanceId?: string;
    data?: ContactInfoData;
}

type ContactFaq = ContactInfoData['faqs'][number];
type ContactSocialLink = NonNullable<ContactInfoData['socialLinks']>[number];

export default function ContactInfoSection({ instanceId, data: directData }: ContactInfoSectionProps) {
    const { t } = useTranslation();
    const { instances } = useCmsStore();
    const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
    
    const data: ContactInfoData = (directData || instance?.data || {
        title: t('home.contact.info.faq'),
        faqs: [],
        supportText: t('home.contact.info.stillQuestions'),
        supportEmail: 'support@example.com',
        supportPhone: '+1 234 567 890',
        supportAddress: '',
        socialLinks: [],
        variant: 'split'
    }) as ContactInfoData;

    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const variant = data.variant || 'split';
    const faqTitle = data.title || t('home.contact.info.faq');
    const supportHeading = data.supportText || t('home.contact.info.directSupport');

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

    const renderFaqArea = (boxed = false) => (
        <div className={`space-y-10 ${boxed ? 'max-w-3xl mx-auto' : ''}`}>
            {!boxed && (
                <div className="space-y-4 mb-8">
                    <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {t('home.contact.info.faqShort')}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-foreground serif tracking-wide leading-tight">{faqTitle}</h2>
                </div>
            )}
            <div className="grid grid-cols-1 gap-4">
                {(data.faqs || []).map((faq: ContactFaq, index: number) => (
                    <div 
                        key={index} 
                        className={`transition-all duration-500 ${
                            boxed 
                            ? `bg-background border border-foreground/5 rounded-[1.75rem] overflow-hidden ${openIndex === index ? 'shadow-xl ring-1 ring-primary/10 -translate-y-1' : 'hover:border-primary/20 hover:bg-foreground/[0.01]'}` 
                            : `rounded-[1.5rem] border border-foreground/5 bg-background/70 backdrop-blur-sm ${openIndex === index ? 'shadow-xl ring-1 ring-primary/10' : 'hover:border-primary/20 hover:shadow-md'}`
                        }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className={`w-full flex items-center justify-between text-left transition-all group ${boxed ? 'p-6 md:p-8' : 'p-5 md:p-6 hover:text-primary'}`}
                        >
                            <span className={`${boxed ? 'text-lg md:text-xl' : 'text-base md:text-lg'} text-foreground/80 font-light tracking-tight transition-colors ${openIndex === index && !boxed ? 'text-primary' : ''}`}>
                                {faq.question}
                            </span>
                            <div className={`shrink-0 p-2 rounded-full transition-all duration-300 ${openIndex === index ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'bg-foreground/5 text-foreground/40 group-hover:bg-foreground/10'}`}>
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
                                    <div className={`${boxed ? 'px-6 md:px-8 pb-8 pt-0' : 'px-5 md:px-6 pb-6 pt-0'}`}>
                                        <p className="text-foreground/50 leading-relaxed font-light text-sm md:text-[15px] border-l-2 border-primary/20 pl-4">
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

    const renderSupportGrid = () => (
        <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('home.contact.info.connect')}
                </div>
                <h3 className="text-3xl md:text-4xl font-light text-foreground serif">{data.supportText || t('home.contact.info.stillQuestions')}</h3>
                <div className="w-12 h-[1px] bg-primary/30 mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.supportEmail && (
                    <a href={`mailto:${data.supportEmail}`} className="group bg-background p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
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
                    <a href={`tel:${data.supportPhone}`} className="group bg-background p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
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
                    <div className="bg-background p-8 rounded-[2rem] border border-foreground/5 hover:border-primary/20 hover:bg-background hover:shadow-xl transition-all duration-500 text-center flex flex-col items-center gap-6">
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
                        {data.socialLinks.map((social: ContactSocialLink, idx: number) => (
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

    const renderSupportCard = () => (
        <div className="bg-background p-8 md:p-10 rounded-[2rem] border border-foreground/5 relative overflow-hidden backdrop-blur-sm h-full flex flex-col shadow-[0_24px_80px_rgba(0,0,0,0.05)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/6 rounded-bl-full -z-0 blur-2xl"></div>
            <div className="relative z-10 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-foreground/45 mb-5">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {t('home.contact.info.connect')}
                </div>
                <h3 className="text-2xl md:text-3xl font-light text-foreground mb-8 serif tracking-wide leading-tight">{supportHeading}</h3>
                <div className="space-y-6">
                    {data.supportEmail && (
                        <a href={`mailto:${data.supportEmail}`} className="flex items-center gap-4 group rounded-2xl border border-transparent bg-foreground/[0.02] p-4 hover:border-primary/15 hover:bg-primary/[0.03] transition-all">
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
                        <a href={`tel:${data.supportPhone}`} className="flex items-center gap-4 group rounded-2xl border border-transparent bg-foreground/[0.02] p-4 hover:border-primary/15 hover:bg-primary/[0.03] transition-all">
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
                        <div className="flex items-center gap-4 group rounded-2xl border border-transparent bg-foreground/[0.02] p-4">
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
                        {data.socialLinks.map((social: ContactSocialLink, idx: number) => (
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

    if (variant === 'grid') {
        return (
            <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 border-t border-foreground/5 bg-foreground/[0.015]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-foreground/[0.01] p-8 md:p-10 rounded-[2rem] border border-foreground/5 shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
                        {renderFaqArea()}
                    </div>
                    {renderSupportCard()}
                </div>
            </div>
        );
    }

    if (variant === 'stacked') {
        return (
            <div className="max-w-[1440px] mx-auto px-6 py-32 space-y-32">
                <div className="max-w-3xl mx-auto text-center space-y-4">
                    <span className="text-[10px] font-bold tracking-[0.4em] text-primary uppercase">{t('home.contact.info.faqShort')}</span>
                    <h2 className="text-4xl md:text-6xl font-light text-foreground serif leading-tight">{faqTitle}</h2>
                    <p className="text-foreground/40 font-light text-lg max-w-xl mx-auto">{t('home.contact.info.helpNote')}</p>
                </div>

                {renderFaqArea(true)}
                
                <div className="pt-16 border-t border-foreground/5">
                    {renderSupportGrid()}
                </div>
            </div>
        );
    }

    // Default 'split'
    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 bg-foreground/[0.01] border-y border-foreground/5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
                <div className="lg:col-span-2">
                    {renderFaqArea()}
                </div>
                <div className="h-full flex flex-col justify-center">
                    {renderSupportCard()}
                </div>
            </div>
        </div>
    );
}
