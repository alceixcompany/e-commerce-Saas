'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMail, FiPhone } from 'react-icons/fi';

interface ContactFaqProps {
    data: {
        isVisible: boolean;
        title: string;
        faqs: { question: string; answer: string }[];
        supportText: string;
        supportEmail: string;
        supportPhone: string;
    }
}

export default function ContactFaq({ data }: ContactFaqProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!data.isVisible) return null;

    return (
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 bg-foreground/5 mt-12 mb-12 rounded-3xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-24">
                
                {/* FAQ Interactive Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2"
                >
                    <h2 className="text-3xl font-light text-foreground mb-8 serif">{data.title || 'Frequently Asked Questions'}</h2>
                    
                    <div className="space-y-4">
                        {data.faqs.map((faq, index) => (
                            <div key={index} className="border-b border-foreground/10 pb-4">
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left py-2 hover:text-primary transition-colors group"
                                >
                                    <span className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">{faq.question}</span>
                                    <motion.div
                                        animate={{ rotate: openIndex === index ? 180 : 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="text-foreground/40 group-hover:text-primary"
                                    >
                                        <FiChevronDown size={20} />
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pt-4 text-foreground/50 font-light leading-relaxed italic">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Direct Support Area */}
                <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-background p-8 md:p-10 rounded-2xl shadow-xl h-fit border border-foreground/5 relative overflow-hidden"
                >
                    {/* Decorative accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-0"></div>
                    
                    <div className="relative z-10">
                        <h3 className="text-2xl font-light text-foreground mb-6 serif">{data.supportText || 'Still have questions?'}</h3>
                        
                        <div className="space-y-6">
                            {data.supportEmail && (
                                <a href={`mailto:${data.supportEmail}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center rounded-full text-foreground/40 group-hover:bg-primary group-hover:text-background transition-all">
                                        <FiMail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 mb-1">Email Us</p>
                                        <p className="font-medium text-foreground">{data.supportEmail}</p>
                                    </div>
                                </a>
                            )}
                            
                            {data.supportPhone && (
                                <a href={`tel:${data.supportPhone}`} className="flex items-center gap-4 group">
                                    <div className="w-12 h-12 bg-foreground/5 flex items-center justify-center rounded-full text-foreground/40 group-hover:bg-primary group-hover:text-background transition-all">
                                        <FiPhone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-foreground/40 mb-1">Call Us</p>
                                        <p className="font-medium text-foreground">{data.supportPhone}</p>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
