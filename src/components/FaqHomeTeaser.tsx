import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Teaser FAQ in homepage: contenuto leggibile (non nascosto),
 * senza secondo schema FAQPage — quello della home resta in SeoManager.
 */
export default function FaqHomeTeaser() {
  const { t } = useTranslation();

  const items = [1, 2, 3, 4].map((n) => ({
    question: t(`seo.homeFaqQ${n}`),
    answer: t(`seo.homeFaqA${n}`),
  }));

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: "#E5DDD3" }}>
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-brand-accent/10 text-brand-accent mb-4">
            FAQ
          </div>
          <h2 className="heading-2 mb-4">{t("faq.title")}</h2>
          <p className="body-text">{t("faq.subtitle")}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-5 mb-10">
          {items.map((item) => (
            <div
              key={item.question}
              className="bg-white/80 border border-gray-100 px-5 py-4 md:px-6 md:py-5"
            >
              <h3 className="font-semibold text-brand-blue mb-2">{item.question}</h3>
              <p className="text-brand-gray leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 text-brand-blue font-medium hover:text-brand-accent transition-colors"
          >
            {t("faq.viewAll")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
