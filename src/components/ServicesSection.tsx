import ServiceCard from "./ServiceCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ServicesSection = () => {
  const { t } = useTranslation();

  const services = [
    {
      title: t("services.prototyping.title"),
      description: t("services.prototyping.description"),
      link: "/services/prototipazione",
    },
    {
      title: t("services.scanning.title"),
      description: t("services.scanning.description"),
      link: "/services/scansione",
    },
    {
      title: t("services.repair.title"),
      description: t("services.repair.description"),
      link: "/services/riparazione-stampanti",
    },
    {
      title: t("services.sla.title"),
      description: t("services.sla.description"),
      link: "/services/sla",
    },
    {
      title: t("services.fdmBasic.title"),
      description: t("services.fdmBasic.description"),
      link: "/services/fdm",
    },
    {
      title: t("services.laser.title"),
      description: t("services.laser.description"),
      link: "/services/laser",
    },
  ];

  return (
    <>
      <section className="bg-white py-2">
        <div className="container-custom">
          <div className="flex justify-center">
            <img
              src="/COSA OFFRIAMO.png"
              alt="Tecnologie 3DMAKES — stampa 3D FDM e SLA, scansione 3D, taglio laser e prototipazione — Lugano"
              className="w-full h-auto max-w-4xl"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/1000x400/ffffff/333333?text=Cosa+Offriamo";
              }}
            />
          </div>
        </div>
      </section>

      <section
        id="services"
        className="pt-8 pb-12 md:pb-24"
        style={{ backgroundColor: "#E5DDD3" }}
      >
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="heading-2 mb-6">{t("services.subtitle")}</h2>
            <p className="body-text">{t("services.description")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {services.map((service) => (
              <ServiceCard key={service.link} {...service} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <button className="bg-brand-blue text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl">
                {t("services.seeAll")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesSection;
