'use client';

import { useState } from 'react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    id: 1,
    question: 'Do you offer free shipping?',
    answer: 'Yes, we offer free shipping on orders over $500. For orders below $500, standard shipping rates apply. Express shipping options are available at checkout for an additional fee.',
  },
  {
    id: 2,
    question: 'Can I return an item if I change my mind?',
    answer: 'Absolutely! We offer a 30-day return policy for unused items in their original packaging. Simply contact our customer service team to initiate a return. Return shipping costs may apply.',
  },
  {
    id: 3,
    question: 'Do your products require assembly?',
    answer: 'Most of our furniture items require some assembly, but we provide detailed instructions and all necessary tools. Assembly difficulty varies by product, and we clearly indicate this on each product page.',
  },
  {
    id: 4,
    question: 'How do I care for my furniture?',
    answer: 'Care instructions vary by material. We provide specific care guides with each product. Generally, we recommend using appropriate cleaners for wood, fabric, and leather surfaces, and avoiding direct sunlight and excessive moisture.',
  },
  {
    id: 5,
    question: 'Do you offer assembly services for large furniture items?',
    answer: 'Yes, for select regions and products, we offer optional assembly services at checkout. Availability and pricing may vary depending on your location and the item ordered. Check the product page or contact our support team for more details.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(4); // Start with last item open

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16" style={{ backgroundColor: '#F7F6F0' }}>
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 mb-4 leading-tight tracking-tight">
            Get the Details Before You Decide
          </h2>
          <p className="text-zinc-600 text-base font-normal">
            Find helpful answers about shipping, returns, care, and everything in between
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

