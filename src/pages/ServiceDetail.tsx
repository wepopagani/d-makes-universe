import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import ProcessTimeline from "@/components/ProcessTimeline";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import NotFound from "./NotFound";
import FAQSection from "@/components/FAQSection";
import { getExtendedServiceContent } from "@/data/serviceExtendedContent";
import { getServiceByParam } from "@/data/servicesCatalog";

interface Material {
  name: string;
  features: string;
  applications: string;
}

interface MaterialGroup {
  name: string;
  items: string[];
}

interface Application {
  name: string;
  description: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

const asArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

const ServiceDetail = () => {
  const { t } = useTranslation();
  const { serviceId } = useParams();
  const catalogItem = getServiceByParam(serviceId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!catalogItem) {
    return <NotFound />;
  }

  const key = catalogItem.translationKey;
  const title = t(`services.${key}.title`);
  const description = t(`services.${key}.description`);
  const features = asArray<string>(t(`services.${key}.features`, { returnObjects: true }));
  const materials = asArray<Material>(t(`services.${key}.materials`, { returnObjects: true }));
  const materialGroups = asArray<MaterialGroup>(
    t(`services.${key}.materialGroups`, { returnObjects: true })
  );
  const materialsNote = t(`services.${key}.materialsNote`, { defaultValue: "" });
  const materialsSummary = t(`services.${key}.materialsSummary`, { defaultValue: "" });
  const applications = asArray<Application>(
    t(`services.${key}.applications`, { returnObjects: true })
  );
  const process = asArray<ProcessStep>(t(`services.${key}.process`, { returnObjects: true }));
  const quoteNeeds = asArray<string>(t(`services.${key}.quoteNeeds`, { returnObjects: true }));
  const featuresTitle = t(`services.${key}.featuresTitle`, {
    defaultValue: t("services.characteristics"),
  });
  const applicationsTitle = t(`services.${key}.applicationsTitle`, {
    defaultValue: t("services.applications"),
  });
  const quoteNeedsTitle = t(`services.${key}.quoteNeedsTitle`, {
    defaultValue: t("services.quoteNeedsTitle"),
  });
  const quoteNeedsIntro = t(`services.${key}.quoteNeedsIntro`, { defaultValue: "" });
  const noCadTitle = t(`services.${key}.noCadTitle`, { defaultValue: "" });
  const noCadText = t(`services.${key}.noCadText`, { defaultValue: "" });
  const isCalculatorRequest = catalogItem.id === "fdm" || catalogItem.id === "sla";
  const extendedContent = getExtendedServiceContent(catalogItem.id);
  const gallery = catalogItem.gallery ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-brand-blue text-white py-16 md:py-24">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
                {catalogItem.badge}
              </p>
              <h1 className="heading-1 mb-6">{title}</h1>
              <p className="text-xl text-gray-300">{description}</p>
              {materialsSummary && (
                <div className="mt-6 space-y-2">
                  <p className="text-base text-gray-400 leading-relaxed">
                    {materialsSummary}
                  </p>
                  {materialsNote && (
                    <p className="text-sm text-gray-500">{materialsNote}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="order-1">
                <img
                  src={catalogItem.image}
                  alt={title}
                  className="w-full h-auto rounded-lg shadow-lg object-cover"
                />
              </div>

              <div className="order-1 lg:order-2">
                <h2 className="heading-2 mb-6">{title}</h2>
                <p className="body-text mb-8">{description}</p>

                {features.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4">
                      {featuresTitle}
                    </h3>
                    <ul className="space-y-3">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-brand-accent mr-2 mt-0.5 shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-brand-gray">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button asChild>
                  {isCalculatorRequest ? (
                    <Link to="/calculator">{t("services.requestQuote")}</Link>
                  ) : (
                    <Link to="/#contact">{t("services.requestQuote")}</Link>
                  )}
                </Button>
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {gallery.map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt={title}
                    className="w-full h-auto rounded-lg shadow-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="mt-16">
              {materialGroups.length > 0 && (
                <>
                  <h3 className="text-2xl font-semibold mb-8 text-center">
                    {t("services.availableMaterials")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {materialGroups.map((group) => (
                      <div
                        key={group.name}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                      >
                        <h4 className="text-xl font-semibold mb-4">{group.name}</h4>
                        <ul className="space-y-2">
                          {group.items.map((item) => (
                            <li key={item} className="text-brand-gray">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {materialsNote && (
                    <p className="text-sm text-brand-gray mt-6 text-center max-w-3xl mx-auto leading-relaxed">
                      {materialsNote}
                    </p>
                  )}
                </>
              )}

              {materialGroups.length === 0 && materials.length > 0 && (
                <>
                  <h3 className="text-2xl font-semibold mb-8 text-center">
                    {t("services.availableMaterials")}
                  </h3>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl">
                      {materials.map((material) => (
                        <div
                          key={material.name}
                          className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                        >
                          <h4 className="text-xl font-semibold mb-2">{material.name}</h4>
                          <p className="text-brand-gray mb-3">
                            <span className="font-medium">{t("services.characteristics")}:</span>{" "}
                            {material.features}
                          </p>
                          <p className="text-brand-gray">
                            <span className="font-medium">{t("services.applications")}:</span>{" "}
                            {material.applications}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {applications.length > 0 && (
                <>
                  <h3 className="text-2xl font-semibold mb-8 text-center">
                    {applicationsTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {applications.map((app) => (
                      <div
                        key={app.name}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
                      >
                        <h4 className="text-xl font-semibold mb-2">{app.name}</h4>
                        <p className="text-brand-gray">{app.description}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {(quoteNeeds.length > 0 || noCadText) && (
              <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {quoteNeeds.length > 0 && (
                  <div className="bg-gray-50 p-6 md:p-8 border border-gray-100">
                    <h3 className="text-xl font-semibold mb-3">{quoteNeedsTitle}</h3>
                    {quoteNeedsIntro && (
                      <p className="text-brand-gray mb-5 leading-relaxed">{quoteNeedsIntro}</p>
                    )}
                    <ul className="space-y-3">
                      {quoteNeeds.map((item) => (
                        <li key={item} className="flex items-start">
                          <svg
                            className="h-5 w-5 text-brand-accent mr-2 mt-0.5 shrink-0"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-brand-gray">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {noCadText && (
                  <div className="bg-brand-blue text-white p-6 md:p-8">
                    {noCadTitle && <h3 className="text-xl font-semibold mb-3">{noCadTitle}</h3>}
                    <p className="text-gray-300 mb-6 leading-relaxed">{noCadText}</p>
                    <Button asChild variant="secondary">
                      <Link to="/services/progettazione">{t("common.discoverMore")}</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(() => {
              const ancillaryItems = asArray<Application>(
                t("services.ancillaryServices.items", { returnObjects: true })
              );
              if (ancillaryItems.length === 0) return null;
              return (
                <div className="mt-16 pt-16 border-t border-gray-100">
                  <h3 className="text-2xl font-semibold mb-3 text-center">
                    {t("services.ancillaryServices.title")}
                  </h3>
                  <p className="text-brand-gray text-center max-w-2xl mx-auto mb-8">
                    {t("services.ancillaryServices.description")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ancillaryItems.map((item) => (
                      <div
                        key={item.name}
                        className="bg-gray-50 p-6 rounded-lg border border-gray-100"
                      >
                        <h4 className="text-lg font-semibold mb-2">{item.name}</h4>
                        <p className="text-brand-gray">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {process.length > 0 && (
          <section className="py-16 md:py-20" style={{ backgroundColor: "#E4DDD4" }}>
            <div className="container-custom">
              <h3 className="text-2xl font-semibold mb-8 text-center">
                {t("services.ourProcess")}
              </h3>
              <ProcessTimeline steps={process} />
            </div>
          </section>
        )}

        {extendedContent && (
          <section className="py-16 md:py-20 bg-white border-t border-gray-100">
            <div className="container-custom">
              <div className="max-w-4xl mx-auto">
                <h2 className="heading-2 mb-6">
                  {title}: panoramica, applicazioni e settori serviti in Ticino e Lombardia
                </h2>
                <p className="body-text mb-10 text-lg leading-relaxed">
                  {extendedContent.overview}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-brand-blue">
                      Applicazioni concrete
                    </h3>
                    <ul className="space-y-4">
                      {extendedContent.applications.map((app) => (
                        <li key={app.title} className="border-l-4 border-brand-accent pl-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{app.title}</h4>
                          <p className="text-brand-gray leading-relaxed">{app.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-semibold mb-4 text-brand-blue">
                      Settori che serviamo
                    </h3>
                    <ul className="space-y-4">
                      {extendedContent.sectors.map((sector) => (
                        <li key={sector.name} className="border-l-4 border-brand-blue pl-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{sector.name}</h4>
                          <p className="text-brand-gray leading-relaxed">{sector.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-brand-blue">
                      Quando scegliere {title.toLowerCase()}
                    </h3>
                    <p className="text-brand-gray leading-relaxed">
                      {extendedContent.whenToChoose}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 text-brand-blue">
                      Perché 3DMAKES
                    </h3>
                    <p className="text-brand-gray leading-relaxed">{extendedContent.whyUs}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold mb-6 text-brand-blue">
                    Domande frequenti su {title.toLowerCase()}
                  </h3>
                  <div className="space-y-6">
                    {extendedContent.faqs.map((faq) => (
                      <div key={faq.question}>
                        <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                        <p className="text-brand-gray leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <FAQSection
          extraFaqs={extendedContent?.faqs}
          extraCategoryTitle={title}
          hideExtraInUi
        />

        <section className="py-16 md:py-20 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">{t("services.readyToRealize")}</h2>
              <p className="text-lg text-gray-300 mb-8">{t("services.contactToday")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-brand-accent hover:bg-brand-accent/90">
                  <Link to="/calculator">{t("services.calculateQuote")}</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white text-white bg-white/10 hover:bg-white/20"
                >
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

export default ServiceDetail;
