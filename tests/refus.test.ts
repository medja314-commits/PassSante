import { test } from "node:test";
import assert from "node:assert/strict";
import type { Utilisateur } from "@/lib/assistant/access";
import { repondre } from "@/lib/assistant/repondre";
import { MESSAGE_AUCUNE_INFORMATION, MESSAGE_REFUS_DIAGNOSTIC } from "@/lib/assistant/prompt";
import type { ModeleIA } from "@/lib/assistant/model";

// Carte 3 · NF-14 : refus explicite de diagnostiquer, et origine toujours indiquée.

const personnel: Utilisateur = { id: "t-staff", role: "hospital_staff" };

// Modèle espion : compte les appels et renvoie le texte donné.
function modeleQuiRepond(texte: string) {
  const modele = { appels: 0, modele: undefined as ModeleIA | undefined };
  modele.modele = {
    generer: async () => {
      modele.appels++;
      return texte;
    },
  };
  return modele;
}

const DEMANDES_DE_DIAGNOSTIC = [
  "Peut-on établir un diagnostic pour cette douleur thoracique ?",
  "Quel diagnostic pour ces résultats ?",
  "Peux-tu diagnostiquer ce patient ?",
  "Quelle maladie a-t-il ?",
  "De quoi souffre le patient ?",
  "Est-ce une infection ?",
  "Est-ce un cancer ?",
  "Suis-je malade d'après ce dossier ?",
  "Qu'a-t-il ?",
];

for (const question of DEMANDES_DE_DIAGNOSTIC) {
  test(`refus : « ${question} »`, async () => {
    const espion = modeleQuiRepond("ne doit pas être appelé");
    const reponse = await repondre(question, personnel, espion.modele);
    assert.equal(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
    assert.equal(reponse.origine, "regle");
    assert.equal(reponse.informationTrouvee, false);
    assert.equal(espion.appels, 0, "le modèle ne doit pas être appelé pour une demande de diagnostic");
  });
}

test("pas de faux positif : une demande sur le compte rendu n'est pas refusée", async () => {
  const modele = modeleQuiRepond("Le compte rendu date de la consultation [1].");
  const reponse = await repondre("Quel est le compte rendu de consultation ?", personnel, modele.modele);
  assert.notEqual(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
  assert.equal(reponse.informationTrouvee, true);
  assert.equal(reponse.origine, "modele");
});

test("garde-fou sortie : si le modèle pose un diagnostic, la réponse est remplacée par le refus", async () => {
  const modele = modeleQuiRepond("Il s'agit d'une angine virale [1].");
  const reponse = await repondre("Quel est le résultat de la troponine ?", personnel, modele.modele);
  assert.equal(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
  assert.equal(reponse.origine, "regle");
  assert.deepEqual(reponse.sources, []);
});

test("garde-fou sortie : « Le diagnostic est ... » est aussi bloqué", async () => {
  const modele = modeleQuiRepond("Le diagnostic est une hypertension [1].");
  const reponse = await repondre("Quel est le motif de suivi d'Aminata ?", personnel, modele.modele);
  assert.equal(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
});

test("réponse normale du modèle : origine « modele » et sources présentes", async () => {
  const modele = modeleQuiRepond("La troponine est à 68 ng/L [1].");
  const reponse = await repondre("Quel est le résultat de la troponine ?", personnel, modele.modele);
  assert.equal(reponse.origine, "modele");
  assert.ok(reponse.sources.length > 0);
});

test("message d'absence : origine « regle », jamais présenté comme généré", async () => {
  const reponse = await repondre("Quelle est la couleur des yeux ?", personnel, modeleQuiRepond("x").modele);
  assert.equal(reponse.texte, MESSAGE_AUCUNE_INFORMATION);
  assert.equal(reponse.origine, "regle");
});
