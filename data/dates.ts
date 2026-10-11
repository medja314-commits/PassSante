// Utilitaire unique des dates de démonstration.
// Les données stockent un décalage en jours par rapport à aujourd'hui (0 = aujourd'hui, -1 = hier, +7 = dans une semaine),
// et une heure optionnelle "HH:MM" (ou "HH:MM:SS"). Rien n'est figé : tout est calculé au moment de l'affichage.

export type DateSpec = { offset: number; time?: string };

const pad = (value: number) => String(value).padStart(2, "0");

// Jour calendaire (minuit) décalé de `offset` jours.
export function dayOf(offset: number, now: Date = new Date()): Date {
  const day = new Date(now);
  day.setHours(0, 0, 0, 0);
  day.setDate(day.getDate() + offset);
  return day;
}

export function dateOf(spec: DateSpec, now: Date = new Date()): Date {
  const date = dayOf(spec.offset, now);
  if (spec.time) {
    const [hours, minutes] = spec.time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date;
}

// "17 juin 2026"
export function longDate(spec: DateSpec, now?: Date): string {
  return dayOf(spec.offset, now).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

// "17 juin"
export function shortDate(spec: DateSpec, now?: Date): string {
  return dayOf(spec.offset, now).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

// "Aujourd'hui", "Hier", puis la date courte.
export function dayLabel(spec: DateSpec, now?: Date): string {
  if (spec.offset === 0) return "Aujourd'hui";
  if (spec.offset === -1) return "Hier";
  return shortDate(spec, now);
}

// "Aujourd'hui, 09:40" ou "17 juin, 09:30"
export function whenLabel(spec: DateSpec, now?: Date): string {
  return spec.time ? `${dayLabel(spec, now)}, ${spec.time}` : dayLabel(spec, now);
}

// "17 juin 2026, 09:32"
export function fullDateTime(spec: DateSpec, now?: Date): string {
  return spec.time ? `${longDate(spec, now)}, ${spec.time}` : longDate(spec, now);
}

// En-tête du tableau de bord : "MARDI 11 OCTOBRE 2026"
export function headingDate(now: Date = new Date()): string {
  return now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

// Jour, mois abrégé et année, pour les blocs de date : { day: "24", month: "JUIN", year: "2026" }
export function dateParts(spec: DateSpec, now?: Date) {
  const day = dayOf(spec.offset, now);
  return {
    day: pad(day.getDate()),
    month: day.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "").toUpperCase(),
    year: String(day.getFullYear()),
  };
}

// Horodatage ISO local : "2026-10-11T09:42:18"
export function isoStamp(spec: DateSpec, now?: Date): string {
  const day = dayOf(spec.offset, now);
  const time = spec.time ? (spec.time.length === 5 ? `${spec.time}:00` : spec.time) : "00:00:00";
  return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}T${time}`;
}

export function nowTime(now: Date = new Date()): string {
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

// Nombre de jours entre aujourd'hui et une date saisie (yyyy-mm-dd).
export function offsetFromInput(value: string, now: Date = new Date()): number {
  const [year, month, day] = value.split("-").map(Number);
  const target = new Date(year, month - 1, day);
  const today = dayOf(0, now);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

// Lundi-vendredi de la semaine en cours.
export function workWeek(now: Date = new Date()): Date[] {
  const monday = dayOf(0, now);
  const shift = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - shift);
  return Array.from({ length: 5 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

// Index (0 = lundi) du jour courant dans la semaine ouvrée, ou -1 le week-end.
export function todayWeekIndex(now: Date = new Date()): number {
  const index = (now.getDay() + 6) % 7;
  return index < 5 ? index : -1;
}

// Libellé du mois : "octobre 2026"
export function monthLabel(now: Date = new Date()): string {
  return now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

// Grille du mois (6 semaines, lundi en premier) : jours avec indicateur "hors mois" et "aujourd'hui".
export function monthGrid(now: Date = new Date()) {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return {
      date: day.getDate(),
      outside: day.getMonth() !== now.getMonth(),
      today: day.toDateString() === now.toDateString(),
    };
  });
}

// Nombre formaté en français : 1 248
export function formatCount(value: number): string {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
}

export function isWeekend(now: Date = new Date()): boolean {
  return now.getDay() === 0 || now.getDay() === 6;
}

// Jour de référence de l'agenda : aujourd'hui en semaine, sinon le lundi suivant.
export function planningDay(now: Date = new Date()): Date {
  const day = dayOf(0, now);
  if (day.getDay() === 6) day.setDate(day.getDate() + 2);
  if (day.getDay() === 0) day.setDate(day.getDate() + 1);
  return day;
}

// "lundi" pour le jour de référence de l'agenda.
export function planningWeekdayName(now: Date = new Date()): string {
  return planningDay(now).toLocaleDateString("fr-FR", { weekday: "long" });
}

// "12 octobre" pour le jour de référence de l'agenda.
export function planningDateLabel(now: Date = new Date()): string {
  return planningDay(now).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}
