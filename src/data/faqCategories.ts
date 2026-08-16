import type { TFunction } from "i18next";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  faqs: FaqItem[];
}

/**
 * Categorie FAQ condivise tra FAQSection (service detail) e la pagina /faq.
 * Le stringhe passano da i18n così restano allineate in IT/EN/FR/DE.
 */
export function buildFaqCategories(t: TFunction): FaqCategory[] {
  return [
    {
      id: "general",
      title: t("faq.categories.general"),
      faqs: [
        { question: t("seo.homeFaqQ1"), answer: t("seo.homeFaqA1") },
        { question: t("seo.homeFaqQ2"), answer: t("seo.homeFaqA2") },
        { question: t("seo.homeFaqQ3"), answer: t("seo.homeFaqA3") },
        { question: t("seo.homeFaqQ4"), answer: t("seo.homeFaqA4") },
      ],
    },
    {
      id: "printing",
      title: t("faq.categories.printing"),
      faqs: [
        { question: t("faq.fdmMaterials"), answer: t("faq.fdmMaterialsAnswer") },
        { question: t("faq.deliveryTimes"), answer: t("faq.deliveryTimesAnswer") },
        { question: t("faq.maxSize"), answer: t("faq.maxSizeAnswer") },
        { question: t("faq.fileFormats"), answer: t("faq.fileFormatsAnswer") },
        { question: t("faq.modelModification"), answer: t("faq.modelModificationAnswer") },
        { question: t("faq.whichTechnology"), answer: t("faq.whichTechnologyAnswer") },
      ],
    },
    {
      id: "scanning",
      title: t("faq.categories.scanning"),
      faqs: [
        { question: t("faq.scanningPrecision"), answer: t("faq.scanningPrecisionAnswer") },
        { question: t("faq.largeObjects"), answer: t("faq.largeObjectsAnswer") },
        { question: t("faq.scanOutput"), answer: t("faq.scanOutputAnswer") },
      ],
    },
    {
      id: "pricing",
      title: t("faq.categories.pricing"),
      faqs: [
        { question: t("faq.priceCalculation"), answer: t("faq.priceCalculationAnswer") },
        { question: t("faq.bulkDiscounts"), answer: t("faq.bulkDiscountsAnswer") },
        { question: t("faq.howItWorks"), answer: t("faq.howItWorksAnswer") },
        { question: t("faq.accuracy"), answer: t("faq.accuracyAnswer") },
      ],
    },
    {
      id: "quality",
      title: t("faq.categories.quality"),
      faqs: [
        { question: t("faq.qualityControl"), answer: t("faq.qualityControlAnswer") },
        { question: t("faq.designAssistance"), answer: t("faq.designAssistanceAnswer") },
        { question: t("faq.postProcessing"), answer: t("faq.postProcessingAnswer") },
      ],
    },
    {
      id: "orders",
      title: t("faq.categories.orders"),
      faqs: [
        { question: t("faq.pickupShipping"), answer: t("faq.pickupShippingAnswer") },
        { question: t("faq.urgentOrders"), answer: t("faq.urgentOrdersAnswer") },
        { question: t("faq.confidentiality"), answer: t("faq.confidentialityAnswer") },
      ],
    },
  ];
}

/** Sottoinsieme usato nelle sezioni FAQ “compatte” (service detail / teaser). */
export function buildCompactFaqCategories(t: TFunction): FaqCategory[] {
  const all = buildFaqCategories(t);
  const byId = (id: string) => all.find((c) => c.id === id)!;

  return [
    {
      id: "printing",
      title: t("services.fdm.title"),
      faqs: byId("printing").faqs.slice(0, 3),
    },
    {
      id: "scanning",
      title: t("services.scanning.title"),
      faqs: byId("scanning").faqs.slice(0, 2),
    },
    {
      id: "pricing",
      title: t("faq.pricing"),
      faqs: byId("pricing").faqs.slice(0, 2),
    },
    {
      id: "quality",
      title: t("faq.quality"),
      faqs: byId("quality").faqs.slice(0, 2),
    },
  ];
}
