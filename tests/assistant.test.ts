import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import type { Utilisateur } from "@/lib/assistant/access";
import { repondre } from "@/lib/assistant/repondre";
import { MESSAGE_AUCUNE_INFORMATION, MESSAGE_REFUS_DIAGNOSTIC } from "@/lib/assistant/prompt";
import type { ModeleIA } from "@/lib/assistant/model";
import type { ReponseIA } from "@/types/assistant";

// Exécute le jeu de cas de test (tests/cas-de-test.json). Chaque cas compare la réponse obtenue au résultat attendu.
// Le modèle est factice : on teste la recherche, le filtrage, le seuil, le refus et les sources, pas la qualité du modèle réel.

type CasDeTest = {
  id: string;
  categorie: string;
  question: string;
  utilisateur?: string;
  attendu: {
    informationTrouvee?: boolean;
    origine?: ReponseIA["origine"];
    message?: "absence" | "refus";
    sourcesVides?: boolean;
    sourcesContiennent?: string[];
    sourcesAbsentes?: string[];
  };
};

const jeu = JSON.parse(readFileSync(new URL("./cas-de-test.json", import.meta.url), "utf8")) as { cas: CasDeTest[] };

const modeleFactice: ModeleIA = {
  generer: async () => "Réponse de test [1].",
};

// Traduit le champ « utilisateur » du JSON en utilisateur applicatif.
function utilisateurDe(valeur: string | undefined): Utilisateur {
  if (valeur?.startsWith("patient:")) {
    return { id: `test-${valeur}`, role: "patient", patientId: valeur.slice("patient:".length) };
  }
  return { id: "test-personnel", role: "hospital_staff" };
}

// Liste les écarts entre le résultat attendu et le résultat obtenu. Une liste vide = cas réussi.
function ecarts(cas: CasDeTest, reponse: ReponseIA): string[] {
  const attendu = cas.attendu;
  const erreurs: string[] = [];
  const ids = reponse.sources.map(source => source.id);

  if (attendu.informationTrouvee !== undefined && reponse.informationTrouvee !== attendu.informationTrouvee) {
    erreurs.push(`informationTrouvee : attendu ${attendu.informationTrouvee}, obtenu ${reponse.informationTrouvee}`);
  }
  if (attendu.origine !== undefined && reponse.origine !== attendu.origine) {
    erreurs.push(`origine : attendu ${attendu.origine}, obtenu ${reponse.origine}`);
  }
  if (attendu.message) {
    const texteAttendu = attendu.message === "absence" ? MESSAGE_AUCUNE_INFORMATION : MESSAGE_REFUS_DIAGNOSTIC;
    if (reponse.texte !== texteAttendu) erreurs.push(`message : attendu « ${texteAttendu} », obtenu « ${reponse.texte} »`);
  }
  if (attendu.sourcesVides && reponse.sources.length > 0) {
    erreurs.push(`sources : attendu aucune, obtenu ${ids.join(", ")}`);
  }
  for (const id of attendu.sourcesContiennent ?? []) {
    if (!ids.includes(id)) erreurs.push(`sources : « ${id} » attendu, obtenu ${ids.join(", ") || "aucune"}`);
  }
  for (const id of attendu.sourcesAbsentes ?? []) {
    if (ids.includes(id)) erreurs.push(`sources : « ${id} » ne doit pas être cité pour cet utilisateur`);
  }
  return erreurs;
}

for (const cas of jeu.cas) {
  test(`${cas.id} · ${cas.categorie} · « ${cas.question} »`, async () => {
    const reponse = await repondre(cas.question, utilisateurDe(cas.utilisateur), modeleFactice);
    const erreurs = ecarts(cas, reponse);
    assert.deepEqual(erreurs, [], `écarts sur ${cas.id} :\n- ${erreurs.join("\n- ")}`);
  });
}
