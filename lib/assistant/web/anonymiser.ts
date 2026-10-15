import { labExams, staffPatients } from "@/data/mock-data";
import { normaliser } from "@/lib/assistant/rag/index";

// Avant tout envoi sur le web, la question est nettoyée : elle ne doit contenir aucune donnée identifiante.
// Limite connue : la liste des noms vient des données de démonstration. En production, il faudra
// une détection plus large (annuaire des patients, reconnaissance d'entités).

const MOTIFS_IDENTIFIANTS = [
  /\bPS-\d{4}-\d{4}\b/gi,        // numéro de dossier
  /\b(LAB|IMG)-\d{4,6}\b/gi,     // numéro d'examen
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,   // e-mail
  /\+?\d[\d\s.-]{7,}\d/g,        // téléphone
  /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g, // date numérique
  /\b\d{1,2} (janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre) \d{4}\b/gi, // date écrite
];

// Tous les noms et prénoms connus du dossier de démonstration, en minuscules sans accents.
function mots(texte: string): string[] {
  return texte.split(/[\s']+/).map(mot => normaliser(mot).replace(/[^a-z-]/g, "")).filter(mot => mot.length > 2);
}

const NOMS_CONNUS = new Set([
  ...staffPatients.flatMap(patient => mots(patient.name)),
  ...labExams.flatMap(exam => mots(exam.patient)),
]);

// Vrai si la question contient une donnée identifiante (nom, numéro, téléphone, e-mail, date).
// Une telle question concerne un patient : elle ne doit pas partir sur le web.
export function contientDonneesIdentifiantes(question: string): boolean {
  return anonymiserRequete(question) !== question.replace(/\s+/g, " ").trim();
}

export function anonymiserRequete(question: string): string {
  let texte = MOTIFS_IDENTIFIANTS.reduce((courant, motif) => courant.replace(motif, "[retiré]"), question);

  // Retire chaque mot qui correspond à un nom connu. Les séparateurs (espaces, apostrophes) sont conservés.
  texte = texte
    .split(/([\s']+)/)
    .map(morceau => (NOMS_CONNUS.has(normaliser(morceau).replace(/[^a-z-]/g, "")) ? "[retiré]" : morceau))
    .join("");

  return texte.replace(/\s+/g, " ").trim();
}
