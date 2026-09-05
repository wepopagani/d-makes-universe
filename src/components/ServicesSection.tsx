import ServiceCard from "./ServiceCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SERVICE_FAMILIES } from "@/data/servicesCatalog";

const ServicesSection = () => {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className="pt-12 pb-12 md:pt-16 md:pb-24"
      style={{ backgroundColor: "#E5DDD3" }}
    >
      <div className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
            {t("services.offerEyebrow")}
          </p>
          <h2 className="heading-2 mb-6">{t("services.subtitle")}</h2>
          <p className="body-text">{t("services.description")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {SERVICE_FAMILIES.map((family) => (
            <ServiceCard
              key={family.id}
              title={t(`services.${family.translationKey}.title`)}
              description={t(`services.${family.translationKey}.description`)}
              link={family.href}
              image={family.image}
              badge={family.badge}
            />
          ))}
        </div>

        <p className="text-center text-brand-gray mt-10 max-w-3xl mx-auto leading-relaxed">
          {t("services.partnerNetwork")}
        </p>

        <div className="text-center mt-8">
          <Link to="/services">
            <button className="bg-brand-blue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl">
              {t("services.seeAll")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
