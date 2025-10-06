import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FAQCategory {
  title: string;
  faqs: {
    question: string;
    answer: string;
  }[];
}

export default function FAQSection() {
  const { t } = useTranslation();

  const faqCategories: FAQCategory[] = [
    {
      title: t('services.fdm.title'),
      faqs: [
        {
          question: t('faq.fdmMaterials'),
          answer: t('faq.fdmMaterialsAnswer')
        },
        {
          question: t('faq.deliveryTimes'),
          answer: t('faq.deliveryTimesAnswer')
        },
        {
          question: t('faq.maxSize'),
          answer: t('faq.maxSizeAnswer')
        }
      ]
    },
    {
      title: t('services.scanning.title'),
      faqs: [
        {
          question: t('faq.scanningPrecision'),
          answer: t('faq.scanningPrecisionAnswer')
        },
        {
          question: t('faq.largeObjects'),
          answer: t('faq.largeObjectsAnswer')
        }
      ]
    },
    {
      title: t('faq.pricing'),
      faqs: [
        {
          question: t('faq.priceCalculation'),
          answer: t('faq.priceCalculationAnswer')
        },
        {
          question: t('faq.bulkDiscounts'),
          answer: t('faq.bulkDiscountsAnswer')
        }
      ]
    },
    {
      title: t('faq.quality'),
      faqs: [
        {
          question: t('faq.qualityControl'),
          answer: t('faq.qualityControlAnswer')
        },
        {
          question: t('faq.designAssistance'),
          answer: t('faq.designAssistanceAnswer')
        }
      ]
    }
  ];

  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenFAQ(null);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <section className="py-16" style={{backgroundColor: '#E5DDD3'}}>
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
            FAQ
          </div>
          <h2 className="heading-2 mb-6">
            {t('faq.title')}
          </h2>
          <p className="body-text">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqCategories.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-100"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleCategory(categoryIndex)}
              >
                <h3 className="text-lg font-semibold text-brand-blue">
                  {category.title}
                </h3>
                <svg
                  className={`w-5 h-5 text-brand-accent transform transition-transform ${
                    openCategory === categoryIndex ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {openCategory === categoryIndex && (
                <div className="px-6 pb-4">
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex} className="border-b border-gray-200 last:border-0">
                        <button
                          className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
                          onClick={() => toggleFAQ(faqIndex)}
                        >
                          <h4 className="text-gray-800 pr-8 font-medium">
                            {faq.question}
                          </h4>
                          <svg
                            className={`w-4 h-4 text-brand-accent transform transition-transform flex-shrink-0 ${
                              openFAQ === faqIndex ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        {openFAQ === faqIndex && (
                          <div className="pb-4 text-brand-gray">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 