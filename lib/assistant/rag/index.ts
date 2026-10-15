import type { Passage } from "@/types/assistant";

// Mots très fréquents, sans valeur pour le classement : sans cette liste, « de » ou « le » feraient correspondre tous les passages.
const MOTS_VIDES = new Set([
  "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "en", "au", "aux", "a", "il", "elle",
  "est", "sont", "quel", "quelle", "quels", "quelles", "que", "qui", "pour", "par", "sur", "dans", "avec",
  "ce", "cette", "son", "sa", "ses", "d", "l", "qu",
]);

// Met en minuscules et retire les accents : « Tension » et « TENSION » deviennent « tension ».
export function normaliser(texte: string): string {
  return texte.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Découpe un texte en mots utiles : on garde les lettres et chiffres, puis on retire les mots vides.
export function motsDe(texte: string): string[] {
  return normaliser(texte)
    .split(/[^a-z0-9œæ]+/)
    .filter(mot => mot.length > 1 && !MOTS_VIDES.has(mot));
}

// Index inversé : pour chaque mot, l'ensemble des identifiants de passages qui le contiennent.
export type Index = Map<string, Set<string>>;

export function construireIndex(passages: Passage[]): Index {
  const index: Index = new Map();
  for (const passage of passages) {
    for (const mot of motsDe(`${passage.source} ${passage.texte}`)) {
      const ids = index.get(mot) ?? new Set<string>();
      ids.add(passage.id);
      index.set(mot, ids);
    }
  }
  return index;
}
