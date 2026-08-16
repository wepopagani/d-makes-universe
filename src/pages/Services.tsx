import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";

type TechnologyGroupId = "polymer" | "metal" | "digital";

interface Technology {
  id: string;
  slug: string;
  group: TechnologyGroupId;
  badge: string;
  title: string;
  description: string;
}

const resolveSlug = (id: string) => {
  if (id === "incisione-laser") return "laser";
  if (id === "riparazione-stampanti-3d") return "riparazione-stampanti";
  return id;
};

const Services = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeGroup, setActiveGroup] = useState<TechnologyGroupId | "all">("all");

  const technologies: Technology[] = useMemo(
    () => [
      {
        id: "fdm",
        slug: "fdm",
        group: "polymer",
        badge: "FDM",
        title: t("services.fdm.title"),
        description: t("services.fdm.description"),
      },
      {
        id: "cff",
        slug: "cff",
        group: "polymer",
        badge: "CFF",
        title: t("services.cff.title"),
        description: t("services.cff.description"),
      },
      {
        id: "sla",
        slug: "sla",
        group: "polymer",
        badge: "SLA",
        title: t("services.sla.title"),
        description: t("services.sla.description"),
      },
      {
        id: "polyjet",
        slug: "polyjet",
        group: "polymer",
        badge: "PolyJet",
        title: t("services.polyjet.title"),
        description: t("services.polyjet.description"),
      },
      {
        id: "sls",
        slug: "sls",
        group: "polymer",
        badge: "SLS",
        title: t("services.sls.title"),
        description: t("services.sls.description"),
      },
      {
        id: "mjf",
        slug: "mjf",
        group: "polymer",
        badge: "MJF",
        title: t("services.mjf.title"),
        description: t("services.mjf.description"),
      },
      {
        id: "lsam",
        slug: "lsam",
        group: "polymer",
        badge: "LSAM",
        title: t("services.lsam.title"),
        description: t("services.lsam.description"),
      },
      {
        id: "slm",
        slug: "slm",
        group: "metal",
        badge: "SLM",
        title: t("services.slm.title"),
        description: t("services.slm.description"),
      },
      {
        id: "scansione",
        slug: "scansione",
        group: "digital",
        badge: "3D Scan",
        title: t("services.scanning.title"),
        description: t("services.scanning.description"),
      },
      {
        id: "prototipazione",
        slug: "prototipazione",
        group: "digital",
        badge: "R&D",
        title: t("services.prototyping.title"),
        description: t("services.prototyping.description"),
      },
      {
        id: "incisione-laser",
        slug: "laser",
        group: "digital",
        badge: "Laser",
        title: t("services.laser.title"),
        description: t("services.laser.description"),
      },
      {
        id: "riparazione-stampanti-3d",
        slug: "riparazione-stampanti",
        group: "digital",
        badge: "Service",
        title: t("services.largePrint.title"),
        description: t("services.largePrint.description"),
      },
    ],
    [t]
  );

  const groups: { id: TechnologyGroupId | "all"; label: string }[] = [
    { id: "all", label: t("services.groups.all") },
    { id: "polymer", label: t("services.groups.polymer") },
    { id: "metal", label: t("services.groups.metal") },
    { id: "digital", label: t("services.groups.digital") },
  ];

  const visibleTechnologies =
    activeGroup === "all"
      ? technologies
      : technologies.filter((tech) => tech.group === activeGroup);

  const pillars = [
    {
      title: t("services.pillars.rangeTitle"),
      text: t("services.pillars.rangeText"),
    },
    {
      title: t("services.pillars.qualityTitle"),
      text: t("services.pillars.qualityText"),
    },
    {
      title: t("services.pillars.supportTitle"),
      text: t("services.pillars.supportText"),
    },
  ];

  // Compatibility: vecchi link tipo "/services#fdm" => redirect alla nuova pagina servizio.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const rawServiceId = hash.substring(1);
    if (!rawServiceId) return;

    const canonicalServiceId = resolveSlug(rawServiceId);
    if (window.location.pathname !== "/services") return;

    navigate(`/services/${canonicalServiceId}`, { replace: true });
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              {pillars.map((pillar) => (
                <div key={pillar.title} className="md:border-l md:border-gray-200 md:pl-8 first:md:border-l-0 first:md:pl-0">
                  <h3 className="text-lg font-semibold text-brand-blue mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-brand-gray leading-relaxed">{pillar.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20" style={{ backgroundColor: "#E5DDD3" }}>
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
              <div className="max-w-2xl">
                <h2 className="heading-2 mb-3">{t("services.catalogTitle")}</h2>
                <p className="body-text">{t("services.catalogSubtitle")}</p>
              </div>
              <div className="overflow-x-auto -mx-1 px-1">
                <div className="flex gap-2 w-max md:w-auto md:flex-wrap">
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setActiveGroup(group.id)}
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
                  className="group flex flex-col bg-white border border-gray-100 p-6 transition-all duration-300 hover:border-brand-accent/40 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                >
                  <span className="mb-4 inline-flex self-start px-2.5 py-1 text-xs font-semibold tracking-wide uppercase bg-brand-blue text-white">
                    {tech.badge}
                  </span>
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
                </Link>
              ))}
            </div>
          </div>
        </section>

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
                  <div
                    key={n}
                    className="border-l-2 border-brand-accent pl-5 py-1"
                  >
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
                <Button
                  asChild
                  size="lg"
                  className="bg-brand-accent hover:bg-brand-accent/90"
                >
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
