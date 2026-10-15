import type { Acces } from "@/lib/assistant/autorisation";

// Ressource d'un passage : patient concerné et type (pour l'audit et les droits).
export type Ressource = {
  type: string;
  patientId?: string;
};

// Un passage est un morceau de dossier qui peut être trouvé par la recherche.
// Il garde de quoi contrôler l'accès (ressource) et de quoi citer sa source (id, source).
export type Passage = {
  id: string;
  ressource: Ressource;
  source: string;
  texte: string;
};

// Un passage classé : score = nombre de mots de la question trouvés dans le passage.
export type PassageClasse = Passage & {
  score: number;
};

export type RequeteRecherche = {
  question: string;
  acces: Acces;
};

export type ResultatRecherche = {
  passages: PassageClasse[];
};

// Une source citée dans la réponse. Le numéro correspond au [n] du texte.
// Une source du dossier (sans url) ou une source web (avec url, santé générale uniquement).
export type SourceCitee = {
  numero: number;
  id: string;
  source: string;
  texte: string;
  url?: string;
};

// "modele" : texte généré par le modèle à partir des passages.
// "regle" : message fixe de l'application (refus, absence d'information). Jamais présenté comme généré.
export type OrigineReponse = "modele" | "regle";

export type ReponseIA = {
  texte: string;
  sources: SourceCitee[];
  informationTrouvee: boolean;
  origine: OrigineReponse;
  // Requête réellement envoyée au moteur de recherche (après anonymisation), affichée pour transparence.
  requeteWeb?: string;
};
