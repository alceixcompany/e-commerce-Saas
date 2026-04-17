'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

import { useCmsStore } from '@/lib/store/useCmsStore';
import { useContentStore } from '@/lib/store/useContentStore';
import { getCurrencySymbol } from '@/utils/currency';

import * as Sections from '@/types/sections';

export default function FAQSection({ instanceId, data: passedData }: { instanceId?: string, data?: Sections.FAQData }) {
  const { t } = useTranslation();
  const { instances } = useCmsStore();
  const { globalSettings } = useContentStore();
  const currencySymbol = getCurrencySymbol(globalSettings?.currency);
  const [openIndex, setOpenIndex] = useState<number | null>(4); // Start with last item open

  const instance = instanceId ? instances.find(i => i._id === instanceId) : null;
  const instanceData = passedData || (instance?.data as Sections.FAQData);
  const isVisible = instanceData?.isVisible !== false;

  if (!isVisible && instanceId) return null;

  const title = instanceData?.title || t('faq.title');
  const subtitle = instanceData?.subtitle || t('faq.subtitle');
  const faqItems: Sections.FAQItem[] = instanceData?.items || [
    {
      id: 1,
      question: t('faq.shipping.q'),
      answer: t('faq.shipping.a', { currencySymbol }),
    },
    {
      id: 2,
      question: t('faq.return.q'),
      answer: t('faq.return.a', { currencySymbol }),
    },
    {
      id: 3,
      question: t('faq.assembly.q'),
      answer: t('faq.assembly.a', { currencySymbol }),
    },
    {
      id: 4,
      question: t('faq.care.q'),
      answer: t('faq.care.a', { currencySymbol }),
    },
    {
      id: 5,
      question: t('faq.service.q'),
      answer: t('faq.service.a', { currencySymbol }),
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight tracking-tight font-heading">
            {title}
          </h2>
          <p className="text-foreground/60 text-base font-normal">
            {subtitle}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div key={item.id} className="border-b border-foreground/10 last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-6 flex items-center justify-between text-left group transition-all"
                >
                  <span className="text-foreground font-semibold text-lg pr-4 group-hover:text-primary transition-colors">
                    {item.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center transition-all duration-300 rounded-lg ${isOpen ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-foreground/5 text-foreground/40 group-hover:bg-foreground/10'}`}>
                    {isOpen ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M20 12H4"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="pb-6 pr-14 animate-in fade-in slide-in-from-top-2 duration-300">
                    <p className="text-foreground/70 text-base leading-relaxed font-normal">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

