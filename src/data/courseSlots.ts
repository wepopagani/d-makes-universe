export type CourseSlot = {
  value: string;
  start: string;
  end: string;
};

/** Gio-Ven 17:30-21:30, da settimana prossima (10-11 set 2026) fino a fine anno. */
export const COURSE_SLOTS: CourseSlot[] = [
  { value: "10-11-settembre", start: "2026-09-10", end: "2026-09-11" },
  { value: "17-18-settembre", start: "2026-09-17", end: "2026-09-18" },
  { value: "24-25-settembre", start: "2026-09-24", end: "2026-09-25" },
  { value: "1-2-ottobre", start: "2026-10-01", end: "2026-10-02" },
  { value: "8-9-ottobre", start: "2026-10-08", end: "2026-10-09" },
  { value: "15-16-ottobre", start: "2026-10-15", end: "2026-10-16" },
  { value: "22-23-ottobre", start: "2026-10-22", end: "2026-10-23" },
  { value: "29-30-ottobre", start: "2026-10-29", end: "2026-10-30" },
  { value: "5-6-novembre", start: "2026-11-05", end: "2026-11-06" },
  { value: "12-13-novembre", start: "2026-11-12", end: "2026-11-13" },
  { value: "19-20-novembre", start: "2026-11-19", end: "2026-11-20" },
  { value: "26-27-novembre", start: "2026-11-26", end: "2026-11-27" },
  { value: "3-4-dicembre", start: "2026-12-03", end: "2026-12-04" },
  { value: "10-11-dicembre", start: "2026-12-10", end: "2026-12-11" },
  { value: "17-18-dicembre", start: "2026-12-17", end: "2026-12-18" },
  { value: "24-25-dicembre", start: "2026-12-24", end: "2026-12-25" },
];

const COURSE_TIME = "17:30 - 21:30";

function localeTag(language: string) {
  if (language.startsWith("de")) return "de-CH";
  if (language.startsWith("fr")) return "fr-CH";
  if (language.startsWith("en")) return "en-GB";
  return "it-CH";
}

function cap(value: string) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

export function formatCourseSlotLabel(slot: CourseSlot, language = "it") {
  const loc = localeTag(language);
  const start = new Date(`${slot.start}T12:00:00`);
  const end = new Date(`${slot.end}T12:00:00`);
  const monthStart = cap(new Intl.DateTimeFormat(loc, { month: "long" }).format(start));
  const monthEnd = cap(new Intl.DateTimeFormat(loc, { month: "long" }).format(end));
  const weekStart = cap(new Intl.DateTimeFormat(loc, { weekday: "long" }).format(start));
  const weekEnd = cap(new Intl.DateTimeFormat(loc, { weekday: "long" }).format(end));
  const y1 = start.getFullYear();
  const y2 = end.getFullYear();
  const datePart =
    monthStart === monthEnd && y1 === y2
      ? `${start.getDate()}-${end.getDate()} ${monthStart} ${y1}`
      : y1 === y2
        ? `${start.getDate()} ${monthStart}-${end.getDate()} ${monthEnd} ${y1}`
        : `${start.getDate()} ${monthStart} ${y1}-${end.getDate()} ${monthEnd} ${y2}`;
  return `${datePart} (${weekStart}-${weekEnd}) - ${COURSE_TIME}`;
}

export function isCourseSlotOpen(slot: CourseSlot, now = new Date()) {
  return new Date(`${slot.end}T23:59:59`) >= now;
}

export function openCourseSlots(language = "it", now = new Date()) {
  return COURSE_SLOTS.filter((slot) => isCourseSlotOpen(slot, now)).map((slot) => ({
    value: slot.value,
    label: formatCourseSlotLabel(slot, language),
  }));
}
