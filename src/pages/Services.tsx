import { useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HowWeHelpSection from "@/components/HowWeHelpSection";
import { Button } from "@/components/ui/button";
import {
  SERVICE_CATALOG,
  SERVICE_FAMILIES,
  isServiceFamilyId,
  resolveServiceSlug,
  type ServiceGroupId,
} from "@/data/servicesCatalog";

const CATALOG_HASH = "catalog";

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const familyParam = searchParams.get("family");
  const groupParam = searchParams.get("group");
  const activeFamily = isServiceFamilyId(familyParam) ? familyParam : null;
  const activeGroup: ServiceGroupId | "all" | null = activeFamily
    ? null
    : groupParam === "polymer" || groupParam === "metal" || groupParam === "digital"
      ? groupParam
      : "all";

  const technologies = useMemo(
    () =>
      SERVICE_CATALOG.map((tech) => ({
        ...tech,
        title: t(`services.${tech.translationKey}.title`),
        description: t(`services.${tech.translationKey}.description`),
      })),
    [t]
  );

  const groups: { id: ServiceGroupId | "all"; label: string }[] = [
    { id: "all", label: t("services.groups.all") },
    { id: "polymer", label: t("services.groups.polymer") },
    { id: "metal", label: t("services.groups.metal") },
    { id: "digital", label: t("services.groups.digital") },
  ];

  const visibleTechnologies = activeFamily
    ? technologies.filter((tech) => tech.family === activeFamily)
    : activeGroup && activeGroup !== "all"
      ? technologies.filter((tech) => tech.group === activeGroup)
      : technologies;

  const scrollToCatalog = (behavior: ScrollBehavior = "smooth") => {
    document.getElementById(CATALOG_HASH)?.scrollIntoView({ behavior, block: "start" });
  };

  const capabilities = [
    {
      n: "01",
      title: t("services.capabilities.designTitle"),
      text: t("services.capabilities.designText"),
    },
    {
      n: "02",
      title: t("services.capabilities.makeTitle"),
      text: t("services.capabilities.makeText"),
    },
    {
      n: "03",
      title: t("services.capabilities.supportTitle"),
      text: t("services.capabilities.supportText"),
    },
  ];

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash || hash === CATALOG_HASH) return;
    if (location.pathname !== "/services") return;

    navigate(`/services/${resolveServiceSlug(hash)}`, { replace: true });
  }, [location.hash, location.pathname, navigate]);

  useEffect(() => {
    if (location.hash.replace("#", "") === CATALOG_HASH) return;
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (location.hash.replace("#", "") !== CATALOG_HASH) return;
    const frame = window.requestAnimationFrame(() => scrollToCatalog());
    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="relative overflow-hidden bg-brand-blue text-white py-16 md:py-24">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 12% 20%, #3D9DFF 0%, transparent 40%), radial-gradient(circle at 88% 78%, #94A3B8 0%, transparent 36%)",
            }}
          />
          <div className="container-custom relative">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-medium tracking-[0.18em] uppercase text-brand-accent mb-4">
                {t("services.heroEyebrow")}
              </p>
              <h1 className="heading-1 mb-6">{t("services.heroTitle")}</h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                {t("services.heroSubtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 bg-white border-b border-gray-100">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center mb-10">
              <h2 className="heading-2 mb-4">{t("services.introTitle")}</h2>
              <p className="body-text">{t("services.introText")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
              {capabilities.map((item) => (
                <div
                  key={item.n}
                  className="md:border-l md:border-gray-200 md:pl-8 first:md:border-l-0 first:md:pl-0"
                >
                  <p className="text-sm font-semibold tracking-[0.16em] text-brand-accent mb-3">
                    {item.n}
                  </p>
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">
                    {item.title}
                  </h3>
                  <p className="text-brand-gray leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-16 bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mb-10">
              <h2 className="heading-2 mb-3">{t("services.familiesTitle")}</h2>
              <p className="body-text">{t("services.familiesSubtitle")}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICE_FAMILIES.map((family) => (
                <Link
                  key={family.id}
                  to={family.href}
                  aria-current={activeFamily === family.id ? "page" : undefined}
                  className={`group overflow-hidden bg-brand-blue text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
                    activeFamily === family.id ? "ring-2 ring-brand-accent" : ""
                  }`}
                >
                  <div className="relative h-44">
                    <img
                      src={family.image}
                      alt={t(`services.${family.translationKey}.title`)}
                      className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-4 top-4 text-xs font-semibold tracking-[0.18em]">
                      {family.badge}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-brand-accent transition-colors">
                      {t(`services.${family.translationKey}.title`)}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t(`services.${family.translationKey}.tags`)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id={CATALOG_HASH} className="py-14 md:py-20 scroll-mt-24" style={{ backgroundColor: "#E5DDD3" }}>
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <h2 className="heading-2 mb-3">{t("services.catalogTitle")}</h2>
                <p className="body-text">{t("services.catalogSubtitle")}</p>
                {activeFamily && (
                  <p className="mt-3 text-sm font-semibold tracking-wide text-brand-blue">
                    {t(`services.families.${activeFamily}.title`)}
                  </p>
                )}
              </div>
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setSearchParams(group.id === "all" ? {} : { group: group.id });
                        scrollToCatalog();
                      }}
                      className={`shrink-0 px-4 py-2 text-sm font-medium transition-colors border ${
                        activeGroup === group.id
                          ? "bg-brand-blue text-white border-brand-blue"
                          : "bg-white/70 text-brand-blue border-gray-200 hover:border-brand-accent hover:text-brand-accent"
                      }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {visibleTechnologies.map((tech) => (
                <Link
                  key={tech.id}
                  to={`/services/${tech.slug}`}
                  className="group flex flex-col bg-white border border-gray-100 overflow-hidden transition-all duration-300 hover:border-brand-accent/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <div className="relative h-44 bg-brand-blue">
                    <img
                      src={tech.image}
                      alt={tech.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-4 top-4 inline-flex px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-brand-blue text-white">
                      {tech.badge}
                    </span>
                  </div>
                  <div className="flex flex-col flex-grow p-6">
                    <h3 className="text-xl font-semibold text-brand-blue mb-3 group-hover:text-brand-accent transition-colors">
                      {tech.title}
                    </h3>
                    <p className="text-brand-gray mb-5 line-clamp-3 leading-relaxed flex-grow">
                      {tech.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue group-hover:text-brand-accent transition-colors mt-auto">
                      {t("common.discoverMore")}
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-0.5"
                      >
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <p className="text-center text-brand-gray mt-10 max-w-3xl mx-auto leading-relaxed">
              {t("services.partnerNetwork")}
            </p>
          </div>
        </section>

        <HowWeHelpSection />

        <section className="py-16 md:py-20 bg-white">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div>
                <p className="text-sm font-medium tracking-[0.16em] uppercase text-brand-accent mb-3">
                  FAQ
                </p>
                <h2 className="heading-2 mb-4">{t("services.faqTeaserTitle")}</h2>
                <p className="body-text mb-8">{t("services.faqTeaserText")}</p>
                <Button asChild size="lg" variant="outline">
                  <Link to="/faq">{t("services.faqTeaserCta")}</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="border-l-2 border-brand-accent pl-5 py-1">
                    <p className="font-medium text-brand-blue mb-1">
                      {t(`seo.homeFaqQ${n}`)}
                    </p>
                    <p className="text-sm text-brand-gray leading-relaxed">
                      {t(`seo.homeFaqA${n}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-gradient-to-br from-brand-blue to-slate-900 text-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="heading-2 mb-6">{t("services.readyToRealize")}</h2>
              <p className="text-lg text-gray-300 mb-8">
                {t("services.contactToday")}
              </p>
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

export default Services;
