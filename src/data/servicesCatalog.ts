export type ServiceGroupId = "polymer" | "metal" | "digital";

export type ServiceFamilyId =
  | "design"
  | "print"
  | "scan"
  | "laser"
  | "technical"
  | "consulting";

export type ServiceContentKind = "materials" | "applications" | "process";

export interface ServiceCatalogItem {
  id: string;
  slug: string;
  aliases: string[];
  group: ServiceGroupId;
  family: ServiceFamilyId;
  badge: string;
  translationKey: string;
  image: string;
  gallery?: string[];
  contentKind: ServiceContentKind;
}

export interface ServiceFamily {
  id: ServiceFamilyId;
  href: string;
  translationKey: string;
  image: string;
  badge: string;
}

export const familyCatalogHref = (family: ServiceFamilyId) =>
  `/services?family=${family}#catalog`;

const IMG = "/images/brochure";

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  {
    id: "fdm",
    slug: "fdm",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "FDM",
    translationKey: "fdm",
    image: `${IMG}/fdm.jpg`,
    gallery: [`${IMG}/fdm-parts.jpg`],
    contentKind: "materials",
  },
  {
    id: "cff",
    slug: "cff",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "CFF",
    translationKey: "cff",
    image: `${IMG}/cff.jpg`,
    contentKind: "materials",
  },
  {
    id: "sla",
    slug: "sla",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "SLA",
    translationKey: "sla",
    image: `${IMG}/sla.jpg`,
    contentKind: "materials",
  },
  {
    id: "polyjet",
    slug: "polyjet",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "PolyJet",
    translationKey: "polyjet",
    image: `${IMG}/polyjet.jpg`,
    contentKind: "materials",
  },
  {
    id: "sls",
    slug: "sls",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "SLS",
    translationKey: "sls",
    image: `${IMG}/sls.jpg`,
    contentKind: "materials",
  },
  {
    id: "mjf",
    slug: "mjf",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "MJF",
    translationKey: "mjf",
    image: `${IMG}/mjf.jpg`,
    contentKind: "materials",
  },
  {
    id: "lsam",
    slug: "lsam",
    aliases: [],
    group: "polymer",
    family: "print",
    badge: "LSAM",
    translationKey: "lsam",
    image: `${IMG}/lsam.jpg`,
    contentKind: "materials",
  },
  {
    id: "slm",
    slug: "slm",
    aliases: [],
    group: "metal",
    family: "print",
    badge: "SLM",
    translationKey: "slm",
    image: `${IMG}/slm.jpg`,
    contentKind: "materials",
  },
  {
    id: "incisione-laser",
    slug: "laser",
    aliases: ["laser"],
    group: "metal",
    family: "laser",
    badge: "Laser",
    translationKey: "laser",
    image: `${IMG}/laser.jpg`,
    contentKind: "applications",
  },
  {
    id: "cnc",
    slug: "cnc",
    aliases: ["fresatura", "fresatura-cnc"],
    group: "metal",
    family: "laser",
    badge: "CNC",
    translationKey: "cnc",
    image: `${IMG}/workshop.jpg`,
    contentKind: "applications",
  },
  {
    id: "progettazione",
    slug: "progettazione",
    aliases: ["design", "dfam"],
    group: "digital",
    family: "design",
    badge: "DfAM",
    translationKey: "design",
    image: `${IMG}/workshop.jpg`,
    contentKind: "applications",
  },
  {
    id: "scansione",
    slug: "scansione",
    aliases: [],
    group: "digital",
    family: "scan",
    badge: "3D Scan",
    translationKey: "scanning",
    image: `${IMG}/scansione.jpg`,
    contentKind: "applications",
  },
  {
    id: "prototipazione",
    slug: "prototipazione",
    aliases: [],
    group: "digital",
    family: "print",
    badge: "R&D",
    translationKey: "prototyping",
    image: `${IMG}/prototipazione.jpg`,
    contentKind: "process",
  },
  {
    id: "riparazione-stampanti-3d",
    slug: "riparazione-stampanti",
    aliases: ["riparazione-stampanti"],
    group: "digital",
    family: "technical",
    badge: "Service",
    translationKey: "largePrint",
    image: `${IMG}/riparazione.jpg`,
    contentKind: "applications",
  },
  {
    id: "consulenza",
    slug: "consulenza",
    aliases: ["consulting"],
    group: "digital",
    family: "consulting",
    badge: "TT",
    translationKey: "consulting",
    image: `${IMG}/cover.jpg`,
    contentKind: "applications",
  },
];

export const SERVICE_FAMILIES: ServiceFamily[] = [
  {
    id: "design",
    href: familyCatalogHref("design"),
    translationKey: "families.design",
    image: `${IMG}/workshop.jpg`,
    badge: "01",
  },
  {
    id: "print",
    href: familyCatalogHref("print"),
    translationKey: "families.print",
    image: `${IMG}/fdm.jpg`,
    badge: "02",
  },
  {
    id: "scan",
    href: familyCatalogHref("scan"),
    translationKey: "families.scan",
    image: `${IMG}/scansione.jpg`,
    badge: "03",
  },
  {
    id: "laser",
    href: familyCatalogHref("laser"),
    translationKey: "families.laser",
    image: `${IMG}/laser.jpg`,
    badge: "04",
  },
  {
    id: "technical",
    href: familyCatalogHref("technical"),
    translationKey: "families.technical",
    image: `${IMG}/riparazione.jpg`,
    badge: "05",
  },
  {
    id: "consulting",
    href: familyCatalogHref("consulting"),
    translationKey: "families.consulting",
    image: `${IMG}/cover.jpg`,
    badge: "06",
  },
];

export const isServiceFamilyId = (value: string | null): value is ServiceFamilyId =>
  SERVICE_FAMILIES.some((family) => family.id === value);

export const resolveServiceSlug = (raw: string) => {
  const item = SERVICE_CATALOG.find(
    (service) => service.id === raw || service.slug === raw || service.aliases.includes(raw)
  );
  return item?.slug ?? raw;
};

export const getServiceByParam = (raw?: string) => {
  if (!raw) return undefined;
  return SERVICE_CATALOG.find(
    (service) => service.id === raw || service.slug === raw || service.aliases.includes(raw)
  );
};

export const getServiceTranslationKey = (raw?: string) => {
  const item = getServiceByParam(raw);
  if (item) return item.translationKey;
  if (raw === "laser" || raw === "incisione-laser") return "laser";
  if (raw === "riparazione-stampanti" || raw === "riparazione-stampanti-3d") return "largePrint";
  if (raw === "prototipazione") return "prototyping";
  if (raw === "scansione") return "scanning";
  if (raw === "progettazione" || raw === "design" || raw === "dfam") return "design";
  if (raw === "consulenza" || raw === "consulting") return "consulting";
  if (raw === "cnc" || raw === "fresatura" || raw === "fresatura-cnc") return "cnc";
  return raw ?? "";
};
