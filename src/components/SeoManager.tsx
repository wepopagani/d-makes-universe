import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getBlogPosts } from "@/data/blogContent";

const CANONICAL_BASE_URL = "https://3dmakes.ch";

const HREFLANG_CODES = ["it", "en", "fr", "de"] as const;

/**
 * SPA SEO helper:
 * aggiorna canonical/og:url quando ci troviamo sulle pagine del blog.
 *
 * Nota: in un'app SPA l'HTML iniziale è sempre quello di `index.html`;
 * quindi questa correzione viene fatta via JS al cambio route.
 */
export default function SeoManager() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const pathname = location.pathname;
    // Netlify risponde 200 su URL con slash finale; canonical deve evitare 301.
    const pathNorm = pathname.replace(/\/$/, "") || "/";
    const canonicalPathForNetlify = (p: string) => {
      if (p === "/" || p === "") return "/";
      return p.endsWith("/") ? p : `${p}/`;
    };
    const canonicalUrl = `${CANONICAL_BASE_URL}${canonicalPathForNetlify(pathname)}`;

    const canonicalLinks = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]'));

    // Se per qualche motivo ne esistono più di una, aggiorniamo tutte e ne lasciamo solo una.
    canonicalLinks.forEach((link) => {
      link.href = canonicalUrl;
    });
    if (canonicalLinks.length > 1) {
      canonicalLinks.slice(1).forEach((link) => link.remove());
    }

    const ogUrlMeta = document.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]'
    );
    if (ogUrlMeta) ogUrlMeta.content = canonicalUrl;

    // Hreflang completo per route (autoreferenziale + alternate): richiesto da Google / audit SEO.
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    const localizedUrl = (lang: string) => {
      if (pathNorm === "/") return `${CANONICAL_BASE_URL}/?lang=${lang}`;
      return `${CANONICAL_BASE_URL}${pathNorm}/?lang=${lang}`;
    };
    const xDefaultHref = canonicalUrl;
    HREFLANG_CODES.forEach((code) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = code;
      link.href = localizedUrl(code);
      document.head.appendChild(link);
    });
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = xDefaultHref;
    document.head.appendChild(xDefault);

    const ensureMetaTag = (selector: string, create: () => HTMLElement) => {
      const existing = document.querySelector(selector);
      if (existing) return existing as HTMLElement;
      const el = create();
      document.head.appendChild(el);
      return el;
    };

    const setMetaContent = (selector: string, content: string, create?: () => HTMLElement) => {
      const el = create ? ensureMetaTag(selector, create) : (document.querySelector(selector) as HTMLElement | null);
      if (!el) return;
      if (el instanceof HTMLMetaElement) el.content = content;
    };

    const setDescription = (content: string) => {
      setMetaContent('meta[name="description"]', content, () => {
        const m = document.createElement("meta");
        m.name = "description";
        return m;
      });
    };

    const setOgTitle = (content: string) => {
      setMetaContent('meta[property="og:title"]', content, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:title");
        return m;
      });
    };

    const setOgDescription = (content: string) => {
      setMetaContent('meta[property="og:description"]', content, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:description");
        return m;
      });
    };

    const setTwitterTitle = (content: string) => {
      setMetaContent('meta[name="twitter:title"]', content, () => {
        const m = document.createElement("meta");
        m.name = "twitter:title";
        return m;
      });
    };

    const setTwitterDescription = (content: string) => {
      setMetaContent('meta[name="twitter:description"]', content, () => {
        const m = document.createElement("meta");
        m.name = "twitter:description";
        return m;
      });
    };

    const setOgImage = (content: string) => {
      setMetaContent('meta[property="og:image"]', content, () => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:image");
        return m;
      });
      setMetaContent('meta[name="twitter:image"]', content, () => {
        const m = document.createElement("meta");
        m.name = "twitter:image";
        return m;
      });
    };

    const DEFAULT_OG_IMAGE = `${CANONICAL_BASE_URL}/logo.png`;
    const FAQ_OG_IMAGE = `${CANONICAL_BASE_URL}/logo.png`;
    const SERVICES_OG_IMAGE = `${CANONICAL_BASE_URL}/logo.png`;

    const setAll = (title: string, description: string, ogImage?: string) => {
      document.title = title;
      setDescription(description);
      setOgTitle(title);
      setOgDescription(description);
      setTwitterTitle(title);
      setTwitterDescription(description);
      setOgImage(ogImage ?? DEFAULT_OG_IMAGE);
    };

    const upsertJsonLd = (scriptId: string, json: unknown) => {
      const jsonStr = JSON.stringify(json);
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        existing.textContent = jsonStr;
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.textContent = jsonStr;
      document.head.appendChild(script);
    };

    const removeJsonLd = (scriptId: string) => {
      const existing = document.getElementById(scriptId);
      existing?.remove();
    };

    const upsertBreadcrumbs = (
      crumbs: Array<{ name: string; path: string }>
    ) => {
      upsertJsonLd("breadcrumb-jsonld", {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((crumb, index) => {
          const path =
            crumb.path === "/"
              ? "/"
              : crumb.path.endsWith("/")
                ? crumb.path
                : `${crumb.path}/`;
          return {
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: `${CANONICAL_BASE_URL}${path === "/" ? "/" : path}`,
          };
        }),
      });
    };

    const isServicesRoute = pathNorm === "/services" || pathNorm.startsWith("/services/");

    if (isServicesRoute) {
      const serviceDefs: Array<{
        translationKey: string;
        slug: string;
        serviceType: string;
      }> = [
        { translationKey: "fdm", slug: "fdm", serviceType: "3D Printing" },
        { translationKey: "cff", slug: "cff", serviceType: "3D Printing" },
        { translationKey: "sla", slug: "sla", serviceType: "3D Printing" },
        { translationKey: "polyjet", slug: "polyjet", serviceType: "3D Printing" },
        { translationKey: "laser", slug: "laser", serviceType: "Laser Engraving & Cutting" },
        { translationKey: "largePrint", slug: "riparazione-stampanti", serviceType: "3D Printing Repair" },
        { translationKey: "scanning", slug: "scansione", serviceType: "3D Scanning" },
        { translationKey: "prototyping", slug: "prototipazione", serviceType: "Rapid Prototyping" },
        { translationKey: "lsam", slug: "lsam", serviceType: "3D Printing" },
        { translationKey: "mjf", slug: "mjf", serviceType: "3D Printing" },
        { translationKey: "slm", slug: "slm", serviceType: "3D Printing" },
        { translationKey: "sls", slug: "sls", serviceType: "3D Printing" },
      ];

      const serviceGraph = serviceDefs
        .map((def) => {
          const title = t(`services.${def.translationKey}.title`);
          const description = t(`services.${def.translationKey}.description`);

          if (!title || !description || title === `services.${def.translationKey}.title`) return null;

          const serviceUrl = `${CANONICAL_BASE_URL}/services/${def.slug}/`;

          return {
            "@type": "Service",
            "@id": `${serviceUrl}#service`,
            name: title,
            description,
            serviceType: def.serviceType,
            provider: {
              "@type": "Organization",
              name: "3DMAKES",
            },
            areaServed: ["Lugano", "Ticino"],
          };
        })
        .filter(Boolean);

      upsertJsonLd("service-schema-jsonld", {
        "@context": "https://schema.org",
        "@graph": serviceGraph,
      });
    } else {
      removeJsonLd("service-schema-jsonld");
    }

    // FAQ homepage (audit GEO: FAQPage leggibile dai crawler anche senza scroll)
    if (pathNorm === "/") {
      const homeFaqPairs = [
        { q: t("seo.homeFaqQ1"), a: t("seo.homeFaqA1") },
        { q: t("seo.homeFaqQ2"), a: t("seo.homeFaqA2") },
        { q: t("seo.homeFaqQ3"), a: t("seo.homeFaqA3") },
        { q: t("seo.homeFaqQ4"), a: t("seo.homeFaqA4") },
      ];
      upsertJsonLd("home-faq-jsonld", {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: homeFaqPairs.map((pair) => ({
          "@type": "Question",
          name: pair.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: pair.a,
          },
        })),
      });
    } else {
      removeJsonLd("home-faq-jsonld");
    }

    // Elenco articoli blog (ItemList)
    if (pathNorm === "/blog") {
      const posts = getBlogPosts();
      upsertJsonLd("blog-index-itemlist-jsonld", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: t("seo.blogIndexTitle"),
        numberOfItems: posts.length,
        itemListElement: posts.map((p, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: p.title,
          url: `${CANONICAL_BASE_URL}/blog/${p.id}/`,
        })),
      });
    } else {
      removeJsonLd("blog-index-itemlist-jsonld");
    }

    // --- BreadcrumbList (hub + detail) ---
    if (pathNorm === "/faq") {
      upsertBreadcrumbs([
        { name: "3DMAKES", path: "/" },
        { name: t("nav.faq"), path: "/faq" },
      ]);
    } else if (pathNorm === "/services") {
      upsertBreadcrumbs([
        { name: "3DMAKES", path: "/" },
        { name: t("nav.services"), path: "/services" },
      ]);
    } else if (pathNorm.startsWith("/services/")) {
      const serviceId = pathNorm.split("/")[2] ?? "";
      const resolveServiceKey = () => {
        if (serviceId === "laser" || serviceId === "incisione-laser") return "laser";
        if (serviceId === "riparazione-stampanti" || serviceId === "riparazione-stampanti-3d")
          return "largePrint";
        if (serviceId === "prototipazione") return "prototyping";
        if (serviceId === "scansione") return "scanning";
        return serviceId;
      };
      const serviceTitle = t(`services.${resolveServiceKey()}.title`);
      upsertBreadcrumbs([
        { name: "3DMAKES", path: "/" },
        { name: t("nav.services"), path: "/services" },
        { name: serviceTitle, path: `/services/${serviceId}` },
      ]);
    } else if (pathNorm === "/calculator") {
      upsertBreadcrumbs([
        { name: "3DMAKES", path: "/" },
        { name: t("footer.calculateQuote"), path: "/calculator" },
      ]);
    } else {
      removeJsonLd("breadcrumb-jsonld");
    }

    // --- Route-based Title/Description ---
    if (pathNorm.startsWith("/services/")) {
      const serviceId = pathNorm.split("/")[2] ?? "";

      const resolveServiceKey = () => {
        // Alias per supportare gli URL “puliti” usati nelle nuove pagine:
        // /services/laser => services.laser.*
        // /services/riparazione-stampanti => services.largePrint.*
        if (serviceId === "laser") return "laser";
        if (serviceId === "incisione-laser") return "laser";
        if (serviceId === "riparazione-stampanti") return "largePrint";
        if (serviceId === "riparazione-stampanti-3d") return "largePrint";
        if (serviceId === "prototipazione") return "prototyping";
        if (serviceId === "scansione") return "scanning";
        return serviceId;
      };

      const key = resolveServiceKey();

      const title = t(`services.${key}.title`);
      const description = t(`services.${key}.description`);

      if (title && description) {
        setAll(`${title} ${t("seo.titleSuffix")}`, description, SERVICES_OG_IMAGE);
        return;
      }
    }

    if (pathNorm === "/services") {
      setAll(
        t("seo.servicesIndexTitle"),
        t("seo.servicesIndexDescription"),
        SERVICES_OG_IMAGE
      );
      return;
    }

    if (pathNorm === "/faq") {
      setAll(t("seo.faqTitle"), t("seo.faqDescription"), FAQ_OG_IMAGE);
      return;
    }

    if (pathNorm === "/mission") {
      setAll(t("seo.missionTitle"), t("seo.missionDescription"));
      return;
    }

    if (pathNorm === "/about") {
      setAll(t("seo.aboutTitle"), t("seo.aboutDescription"));
      return;
    }

    if (pathNorm === "/blog") {
      setAll(t("seo.blogIndexTitle"), `${t("blog.subtitle")}`);
      return;
    }

    if (pathNorm.startsWith("/blog/")) {
      const id = pathNorm.split("/")[2] ?? "";
      const posts = getBlogPosts();
      const post = posts.find((p) => p.id === id);
      if (post) {
        setAll(`${post.title} ${t("seo.titleSuffix")}`, post.excerpt);
      } else {
        setAll(t("seo.blogIndexTitle"), `${t("blog.subtitle")}`);
      }
      return;
    }

    if (pathNorm === "/calculator") {
      setAll(t("seo.calculatorTitle"), t("seo.calculatorDescription"));
      return;
    }

    if (pathNorm === "/contact-success") {
      setAll(t("seo.contactSuccessTitle"), t("seo.contactSuccessDescription"));
      return;
    }

    if (pathNorm === "/iscrizione-corsi") {
      setAll(t("seo.coursesTitle"), t("seo.coursesDescription"));
      return;
    }

    if (pathNorm === "/login") {
      setAll(t("seo.loginTitle"), t("seo.loginDescription"));
      return;
    }

    if (pathNorm === "/register") {
      setAll(t("seo.registerTitle"), t("seo.registerDescription"));
      return;
    }

    if (pathNorm === "/forgot-password") {
      setAll(t("seo.forgotPasswordTitle"), t("seo.forgotPasswordDescription"));
      return;
    }

    if (pathNorm === "/") {
      setAll(t("seo.homeTitle"), t("seo.homeDescription"));
      return;
    }

    setAll(t("seo.notFoundTitle"), t("seo.notFoundDescription"));
  }, [location.pathname, i18n.language, t]);

  return null;
}

