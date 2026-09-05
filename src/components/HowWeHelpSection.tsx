import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

const HowWeHelpSection = () => {
  const { t } = useTranslation();

  const items = [1, 2, 3, 4].map((n) => ({
    n: String(n).padStart(2, "0"),
    title: t(`services.howWeHelp.item${n}Title`),
    text: t(`services.howWeHelp.item${n}Text`),
  }));

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
            {t("services.howWeHelp.eyebrow")}
          </p>
          <h2 className="heading-2 mb-4">{t("services.howWeHelp.title")}</h2>
          <p className="body-text">{t("services.howWeHelp.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {items.map((item) => (
            <div
              key={item.n}
              className="bg-white border border-gray-100 p-6 md:p-8"
            >
              <p className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-3">
                {item.n}
              </p>
              <h3 className="text-xl font-semibold text-brand-blue mb-3">
                {item.title}
              </h3>
              <p className="text-brand-gray leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-brand-blue text-white hover:bg-brand-blue/90">
            <Link to="/calculator">{t("nav.requestQuote")}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowWeHelpSection;
