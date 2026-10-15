import type { PassageClasse } from "@/types/assistant";

export const MESSAGE_AUCUNE_INFORMATION = "Aucune information trouvée dans le dossier autorisé.";

export const MESSAGE_REFUS_DIAGNOSTIC =
  "Je ne peux pas poser de diagnostic. Cet assistant ne remplace pas l'avis d'un médecin.";

// Consignes permanentes donnees au modèle à chaque question (NF-14 : pas de diagnostic).
export const CONSIGNES_SYSTEME = [
  "Tu es l'assistant de PassSanté, un outil d'aide à la consultation.",
  "Réponds uniquement à partir des passages fournis. N'invente aucune information.",
  "Cite chaque information par le numéro de son passage entre crochets, par exemple [1].",
  "Si les passages ne permettent pas de répondre, dis-le clairement.",
  "Ne pose jamais de diagnostic et ne propose pas de traitement.",
].join("\n");

export const CONSIGNES_SYSTEME_GENERALE = [
  "Tu réponds à une question de santé générale, sans lien avec un patient précis.",
  "Appuie-toi uniquement sur les extraits web fournis. Cite chaque information par son numéro, par exemple [1].",
  "Si les extraits ne répondent pas à la question, dis-le et invite à consulter un professionnel de santé.",
  "Ne pose jamais de diagnostic personnel et ne propose pas de traitement.",
  "Rappelle brièvement que ces informations ne remplacent pas l'avis d'un médecin.",
].join("\n");

// Prompt pour la santé générale : les extraits web sont numérotés comme les sources.
export function construirePromptGenerale(question: string, extraits: { titre: string; url: string; extrait: string }[]) {
  const liste = extraits.map((extrait, index) => `[${index + 1}] (${extrait.titre} — ${extrait.url}) ${extrait.extrait}`).join("\n");
  return {
    systeme: CONSIGNES_SYSTEME_GENERALE,
    utilisateur: `Extraits web :\n${liste}\n\nQuestion : ${question}`,
  };
}

// Assemble le prompt : les passages numérotés, puis la question.
// Le numéro N correspond à la source N renvoyée à l'utilisateur.
export function construirePrompt(question: string, passages: PassageClasse[]) {
  const liste = passages.map((passage, index) => `[${index + 1}] (${passage.source}) ${passage.texte}`).join("\n");
  return {
    systeme: CONSIGNES_SYSTEME,
    utilisateur: `Passages :\n${liste}\n\nQuestion : ${question}`,
  };
}
