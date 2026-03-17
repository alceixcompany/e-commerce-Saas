'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(4); // Start with last item open

  const faqItems: FAQItem[] = [
    {
      id: 1,
      question: t('faq.shipping.q'),
      answer: t('faq.shipping.a'),
    },
    {
      id: 2,
      question: t('faq.return.q'),
      answer: t('faq.return.a'),
    },
    {
      id: 3,
      question: t('faq.assembly.q'),
      answer: t('faq.assembly.a'),
    },
    {
      id: 4,
      question: t('faq.care.q'),
      answer: t('faq.care.a'),
    },
    {
      id: 5,
      question: t('faq.service.q'),
      answer: t('faq.service.a'),
    },
  ];

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16" style={{ backgroundColor: '#F7F6F0' }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight tracking-tight">
            {t('faq.title')}
          </h2>
          <p className="text-zinc-600 text-base font-normal">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-0">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div key={item.id} className="border-b border-zinc-300 last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full py-6 flex items-center justify-between text-left group"
                >
                  <span className="text-zinc-900 font-semibold text-lg pr-4">
                    {item.question}
                  </span>
                  <div className="flex-shrink-0 w-10 h-10 bg-zinc-900 text-white flex items-center justify-center transition-colors duration-300 group-hover:bg-zinc-800">
                    {isOpen ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 12H4"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    )}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="pb-6 pr-14">
                    <p className="text-zinc-600 text-base leading-relaxed font-normal">
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

