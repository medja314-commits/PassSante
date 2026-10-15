import { filtrerPassages, type Utilisateur } from "@/lib/assistant/access";
import type { PassageClasse } from "@/types/assistant";
import { decouperDossier } from "./chunk";
import { construireIndex, motsDe, type Index } from "./index";

// Le dossier est découpé et indexé une seule fois, au chargement du module.
const PASSAGES = decouperDossier();
const INDEX: Index = construireIndex(PASSAGES);

const NOMBRE_DE_RESULTATS = 3;

// Renvoie les passages autorisés les plus pertinents, du plus au moins pertinent.
// Le score est le nombre de mots distincts de la question trouvés dans le passage.
export function rechercher(question: string, utilisateur: Utilisateur): PassageClasse[] {
  // 1. Filtre par droits AVANT le calcul des scores : un passage interdit ne doit jamais apparaître.
  const autorises = filtrerPassages(utilisateur, PASSAGES);
  const idsAutorises = new Set(autorises.map(passage => passage.id));

  // 2. Score : pour chaque mot de la question, on ajoute 1 aux passages qui le contiennent.
  const scores = new Map<string, number>();
  for (const mot of new Set(motsDe(question))) {
    for (const id of INDEX.get(mot) ?? []) {
      if (idsAutorises.has(id)) scores.set(id, (scores.get(id) ?? 0) + 1);
    }
  }

  // 3. Classement et limitation au nombre de résultats demandé.
  return autorises
    .filter(passage => scores.has(passage.id))
    .map(passage => ({ ...passage, score: scores.get(passage.id) ?? 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, NOMBRE_DE_RESULTATS);
}
