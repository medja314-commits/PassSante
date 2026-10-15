import type { Utilisateur } from "@/lib/assistant/access";
import type { ReponseIA } from "@/types/assistant";
import { modeleParDefaut, type ModeleIA } from "./model";
import { construirePrompt, MESSAGE_AUCUNE_INFORMATION, MESSAGE_REFUS_DIAGNOSTIC } from "./prompt";
import { rechercher } from "./rag/retrieve";
import { normaliser } from "./rag/index";

// Un passage doit partager au moins un mot utile avec la question pour être retenu.
const SCORE_MINIMUM = 1;

// Demandes de diagnostic (NF-14), testées sur le texte normalisé (sans accents, en minuscules).
// Liste volontairement large : un faux positif donne un refus inutile, un faux négatif laisse passer une demande.
const DEMANDE_DIAGNOSTIC = new RegExp([
  "diagnost",                      // diagnostic, diagnostiquer, diagnostique...
  "quelle? maladie",
  "de quoi (souffre|est atteint)",
  "suis[- ]je malade",
  "est[- ]ce (une|un) (maladie|cancer|infection|pathologie)",
  "qu'?a[- ]t[- ]?(il|elle)",       // qu'a-t-il, qu'a-t-elle, qu'a il
  "pathologie",
].join("|"));

// Sortie du modèle qui poserait un diagnostic malgré la consigne : on remplace la réponse par le refus.
const SORTIE_DIAGNOSTIC = new RegExp([
  "diagnostic (est|:)",
  "il s'?agit d'une? ",
  "vous souffrez d",
  "il souffre d",
  "elle souffre d",
].join("|"));

// Contrôles NF-14 réutilisés par le chemin de santé générale (web).
export function estDemandeDeDiagnostic(question: string): boolean {
  return DEMANDE_DIAGNOSTIC.test(normaliser(question));
}

export function estSortieDiagnostic(texte: string): boolean {
  return SORTIE_DIAGNOSTIC.test(normaliser(texte));
}

export async function repondre(
  question: string,
  utilisateur: Utilisateur,
  modele?: ModeleIA,
): Promise<ReponseIA> {
  // 1. Refus avant toute recherche ou appel au modèle.
  if (DEMANDE_DIAGNOSTIC.test(normaliser(question))) {
    return { texte: MESSAGE_REFUS_DIAGNOSTIC, sources: [], informationTrouvee: false, origine: "regle" };
  }

  // 2. Recherche sur les passages autorisés, puis seuil de pertinence (BF-044).
  const passages = rechercher(question, utilisateur).filter(passage => passage.score >= SCORE_MINIMUM);
  if (passages.length === 0) {
    return { texte: MESSAGE_AUCUNE_INFORMATION, sources: [], informationTrouvee: false, origine: "regle" };
  }

  // 3. Appel du modèle avec les passages numérotés (BF-043).
  const sources = passages.map((passage, index) => ({
    numero: index + 1,
    id: passage.id,
    source: passage.source,
    texte: passage.texte,
  }));
  const texte = await (modele ?? modeleParDefaut()).generer(construirePrompt(question, passages));

  // 4. Garde-fou sur la sortie : si le modèle pose quand même un diagnostic, on ne l'affiche pas.
  if (SORTIE_DIAGNOSTIC.test(normaliser(texte))) {
    return { texte: MESSAGE_REFUS_DIAGNOSTIC, sources: [], informationTrouvee: false, origine: "regle" };
  }

  return { texte, sources, informationTrouvee: true, origine: "modele" };
}
