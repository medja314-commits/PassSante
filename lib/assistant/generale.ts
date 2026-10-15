import type { ReponseIA } from "@/types/assistant";
import { anonymiserRequete, contientDonneesIdentifiantes } from "./web/anonymiser";
import { rechercherSurTavily, type RechercheWeb } from "./web/tavily";
import { modeleParDefaut, type ModeleIA } from "./model";
import { construirePromptGenerale, MESSAGE_AUCUNE_INFORMATION, MESSAGE_REFUS_DIAGNOSTIC } from "./prompt";
import { estDemandeDeDiagnostic, estSortieDiagnostic } from "./repondre";

export const MESSAGE_REFORMULER =
  "Reformulez la question sans nom, numéro de dossier ni autre information personnelle.";

export const MESSAGE_PASSER_EN_DOSSIER =
  "Cette question concerne un patient précis. Passez en mode « Question sur le dossier » : la recherche web ne reçoit aucune donnée identifiante.";

// Santé générale (BF-045) : aucune donnée du dossier n'est utilisée. Seule la question anonymisée part sur le web.
export async function repondreGenerale(
  question: string,
  modele?: ModeleIA,
  recherche?: RechercheWeb,
): Promise<ReponseIA> {
  // 1. Refus de diagnostic avant tout envoi (NF-14).
  if (estDemandeDeDiagnostic(question)) {
    return { texte: MESSAGE_REFUS_DIAGNOSTIC, sources: [], informationTrouvee: false, origine: "regle" };
  }

  // 2. Une donnée identifiante signale une question sur un patient : on ne cherche pas sur le web.
  if (contientDonneesIdentifiantes(question)) {
    return { texte: MESSAGE_PASSER_EN_DOSSIER, sources: [], informationTrouvee: false, origine: "regle" };
  }

  // Filet de sécurité : ce qui part sur le web et vers le modèle est la requête anonymisée.
  const requete = anonymiserRequete(question);
  // Au moins 3 lettres utiles, sinon la question n'a pas de sens pour une recherche.
  const lettres = requete.replace(/\[retiré\]/g, "").match(/[a-zA-Zà-öø-ÿÀ-ÖØ-ß]/g) ?? [];
  if (lettres.length < 3) {
    return { texte: MESSAGE_REFORMULER, sources: [], informationTrouvee: false, origine: "regle", requeteWeb: requete };
  }

  // 3. Recherche web. Une erreur remonte à la route, qui répond par un message générique.
  const extraits = await (recherche ?? rechercherSurTavily)(requete);
  if (extraits.length === 0) {
    return { texte: MESSAGE_AUCUNE_INFORMATION, sources: [], informationTrouvee: false, origine: "regle", requeteWeb: requete };
  }

  // 4. Génération à partir des extraits, puis garde-fou NF-14 sur la sortie.
  const sources = extraits.map((extrait, index) => ({
    numero: index + 1,
    id: `web-${index + 1}`,
    source: extrait.titre,
    texte: extrait.extrait,
    url: extrait.url,
  }));
  const texte = await (modele ?? modeleParDefaut()).generer(construirePromptGenerale(requete, extraits));
  if (estSortieDiagnostic(texte)) {
    return { texte: MESSAGE_REFUS_DIAGNOSTIC, sources: [], informationTrouvee: false, origine: "regle", requeteWeb: requete };
  }

  return { texte, sources, informationTrouvee: true, origine: "modele", requeteWeb: requete };
}
