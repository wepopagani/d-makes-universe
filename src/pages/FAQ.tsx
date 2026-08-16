import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildFaqCategories } from "@/data/faqCategories";

const FAQ = () => {
  const { t, i18n } = useTranslation();
  const categories = useMemo(() => buildFaqCategories(t), [t, i18n.language]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const visibleCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((c) => c.id === activeCategory);

  const faqPageSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: categories.flatMap((category) =>
        category.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        }))
      ),
    }),
    [categories]
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
        />

        <section className="relative overflow-hidden bg-brand-blue text-white py-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 18% 22%, #3D9DFF 0%, transparent 42%), radial-gradient(circle at 82% 70%, #64748B 0%, transparent 38%)",
            }}
          />
          <div className="container-custom relative">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
                FAQ
              </p>
              <h1 className="heading-1 mb-6">{t("faq.pageTitle")}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t("faq.pageSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 md:py-14 bg-white border-b border-gray-100">
          <div className="container-custom">
            <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto">
              <div className="flex md:flex-wrap md:justify-center gap-2 md:gap-3 w-max md:w-auto mx-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border ${
                    activeCategory === "all"
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "bg-white text-brand-blue border-gray-200 hover:border-brand-accent hover:text-brand-accent"
                  }`}
                >
                  {t("faq.filterAll")}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border ${
                      activeCategory === category.id
                        ? "bg-brand-blue text-white border-brand-blue"
                        : "bg-white text-brand-blue border-gray-200 hover:border-brand-accent hover:text-brand-accent"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ backgroundColor: "#E5DDD3" }}>
          <div className="container-custom">
            <div className="max-w-3xl mx-auto space-y-10">
              {visibleCategories.map((category) => (
                <div key={category.id}>
                  <div className="mb-4">
                    <h2 className="text-2xl font-semibold text-brand-blue">
                      {category.title}
                    </h2>
                    <div className="mt-2 h-px w-16 bg-brand-accent" />
                  </div>
                  <Accordion type="single" collapsible className="bg-white border border-gray-100 shadow-sm px-5 md:px-6">
                    {category.faqs.map((faq, index) => (
                      <AccordionItem
                        key={`${category.id}-${index}`}
                        value={`${category.id}-${index}`}
                        className="border-gray-200"
                      >
                        <AccordionTrigger className="text-left text-brand-blue hover:no-underline hover:text-brand-accent">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-brand-gray leading-relaxed">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-4">{t("faq.stillHaveQuestions")}</h2>
              <p className="body-text mb-8">{t("faq.stillHaveQuestionsText")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/calculator">{t("faq.ctaQuote")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/services">{t("faq.ctaTechnologies")}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/#contact">{t("nav.contact")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
