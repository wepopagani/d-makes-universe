import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { buildCompactFaqCategories } from "@/data/faqCategories";

interface FAQSectionProps {
  /**
   * FAQ aggiuntive specifiche della pagina (es. FAQ per singola tecnologia
   * di stampa). Vengono incluse sia nel JSON-LD FAQPage unificato, sia
   * come categoria extra nell'UI. Evita il problema di avere più schemi
   * FAQPage sulla stessa URL.
   */
  extraCategoryTitle?: string;
  extraFaqs?: { question: string; answer: string }[];
  /**
   * Se true, NON renderizza l'UI della FAQ (le FAQ vengono già mostrate
   * altrove nella pagina) ma include comunque i dati nello schema JSON-LD.
   * Utile quando ServiceDetail ha già la sua sezione di FAQ specifiche.
   */
  hideExtraInUi?: boolean;
  /** Nasconde il link “Vedi tutte le FAQ” (es. sulla pagina /faq stessa). */
  hideViewAllLink?: boolean;
}

export default function FAQSection({
  extraCategoryTitle,
  extraFaqs,
  hideExtraInUi = false,
  hideViewAllLink = false,
}: FAQSectionProps = {}) {
  const { t, i18n } = useTranslation();

  const faqCategories = useMemo(
    () => buildCompactFaqCategories(t),
    [t, i18n.language]
  );

  const visibleCategories =
    extraFaqs && extraFaqs.length > 0 && !hideExtraInUi
      ? [
          ...faqCategories,
          {
            id: "extra",
            title: extraCategoryTitle ?? t("faq.titleSpecific"),
            faqs: extraFaqs,
          },
        ]
      : faqCategories;

  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleCategory = (index: number) => {
    setOpenCategory(openCategory === index ? null : index);
    setOpenFAQ(null);
  };

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const faqPageSchema = useMemo(() => {
    const genericQuestions = faqCategories.flatMap((category) =>
      category.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      }))
    );
    const extraQuestions = (extraFaqs ?? []).map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [...extraQuestions, ...genericQuestions].map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
    };
  }, [faqCategories, extraFaqs]);

  return (
    <section className="py-16" style={{ backgroundColor: "#E5DDD3" }}>
      <div className="container-custom">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
            FAQ
          </div>
          <h2 className="heading-2 mb-6">{t("faq.title")}</h2>
          <p className="body-text">{t("faq.subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {visibleCategories.map((category, categoryIndex) => (
            <div
              key={category.id}
              className="bg-gray-50 rounded-lg overflow-hidden shadow-sm border border-gray-100"
            >
              <button
                type="button"
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleCategory(categoryIndex)}
              >
                <h3 className="text-lg font-semibold text-brand-blue">
                  {category.title}
                </h3>
                <svg
                  className={`w-5 h-5 text-brand-accent transform transition-transform ${
                    openCategory === categoryIndex ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                      <div
                        key={faqIndex}
                        className="border-b border-gray-200 last:border-0"
                      >
                        <button
                          type="button"
                          className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
                          onClick={() => toggleFAQ(faqIndex)}
                        >
                          <h4 className="text-gray-800 pr-8 font-medium">
                            {faq.question}
                          </h4>
                          <svg
                            className={`w-4 h-4 text-brand-accent transform transition-transform flex-shrink-0 ${
                              openFAQ === faqIndex ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
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
                          <div className="pb-4 text-brand-gray">{faq.answer}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!hideViewAllLink && (
          <div className="text-center mt-10">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-brand-blue font-medium hover:text-brand-accent transition-colors"
            >
              {t("faq.viewAll")}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
