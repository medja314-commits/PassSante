import { test } from "node:test";
import assert from "node:assert/strict";
import { repondreGenerale, MESSAGE_PASSER_EN_DOSSIER, MESSAGE_REFORMULER } from "@/lib/assistant/generale";
import { anonymiserRequete } from "@/lib/assistant/web/anonymiser";
import { MESSAGE_AUCUNE_INFORMATION, MESSAGE_REFUS_DIAGNOSTIC } from "@/lib/assistant/prompt";
import type { ModeleIA } from "@/lib/assistant/model";
import type { ExtraitWeb, RechercheWeb } from "@/lib/assistant/web/tavily";

// Carte BF-045 (santé générale). Ces tests vérifient la frontière de confidentialité :
// seule la question anonymisée doit atteindre le moteur de recherche et le modèle.

const EXTRAITS: ExtraitWeb[] = [
  { titre: "Hypertension artérielle — VIDAL", url: "https://www.vidal.fr/hta", extrait: "Les symptômes peuvent être des maux de tête." },
  { titre: "HTA : causes et prévention", url: "https://www.who.int/hta", extrait: "Une hygiène de vie adaptée aide à la prévention." },
];

// Espion : enregistre les requêtes reçues et renvoie des extraits fixes.
function rechercheEspion(extraits: ExtraitWeb[] = EXTRAITS) {
  const requetes: string[] = [];
  const recherche: RechercheWeb = async requete => {
    requetes.push(requete);
    return extraits;
  };
  return { requetes, recherche };
}

// Espion du modèle : enregistre le prompt reçu.
function modeleEspion(texte = "Les maux de tête sont un symptôme possible [1].") {
  const prompts: string[] = [];
  const modele: ModeleIA = {
    generer: async prompt => {
      prompts.push(prompt.utilisateur);
      return texte;
    },
  };
  return { prompts, modele };
}

test("anonymisation : les noms de patients et les numéros de dossier sont retirés", () => {
  const texte = anonymiserRequete("Quel est le résultat de la troponine de Yao Kouamé, dossier PS-2025-0148 ?");
  assert.ok(!/Yao|Kouam|PS-2025/i.test(texte), `identifiant restant dans « ${texte} »`);
  assert.ok(texte.includes("troponine"), "le sujet médical doit rester");
});

test("anonymisation : une question générale est conservée telle quelle", () => {
  assert.equal(anonymiserRequete("Quels sont les symptômes de l'hypertension ?"), "Quels sont les symptômes de l'hypertension ?");
});

test("anonymisation : téléphone, e-mail et date sont retirés", () => {
  const texte = anonymiserRequete("Mon numéro 07 48 22 19 05, mail a.mensah@email.ci, né le 18/08/1990 : diabète ?");
  assert.ok(!/07 48|@email|18\/08\/1990/.test(texte), `donnée restante dans « ${texte} »`);
  assert.ok(texte.includes("diabète"));
});

test("refus : une demande de diagnostic n'appelle ni la recherche ni le modèle", async () => {
  const recherche = rechercheEspion();
  const modele = modeleEspion();
  const reponse = await repondreGenerale("Ai-je un diagnostic d'hypertension ?", modele.modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
  assert.equal(recherche.requetes.length, 0);
  assert.equal(modele.prompts.length, 0);
});

test("confidentialité : une question avec un nom de patient est refusée, rien ne part sur le web", async () => {
  const recherche = rechercheEspion();
  const modele = modeleEspion();
  const reponse = await repondreGenerale("Que signifie une troponine élevée pour Yao Kouamé ?", modele.modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_PASSER_EN_DOSSIER);
  assert.equal(recherche.requetes.length, 0);
  assert.equal(modele.prompts.length, 0);
});

test("confidentialité : un numéro de dossier dans la question la fait basculer en mode dossier", async () => {
  const recherche = rechercheEspion();
  const reponse = await repondreGenerale("Traitement pour PS-2024-0812 ?", modeleEspion().modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_PASSER_EN_DOSSIER);
  assert.equal(recherche.requetes.length, 0);
});

test("confidentialité : une question sans donnée identifiante passe bien sur le web", async () => {
  const recherche = rechercheEspion();
  const modele = modeleEspion();
  await repondreGenerale("Quels sont les effets secondaires courants de l'amlodipine ?", modele.modele, recherche.recherche);
  assert.equal(recherche.requetes.length, 1);
});

test("réponse web : origine « modele », sources avec URL, requête affichée", async () => {
  const recherche = rechercheEspion();
  const modele = modeleEspion();
  const reponse = await repondreGenerale("Quels sont les symptômes de l'hypertension ?", modele.modele, recherche.recherche);
  assert.equal(reponse.origine, "modele");
  assert.equal(reponse.sources.length, 2);
  assert.equal(reponse.sources[0].url, "https://www.vidal.fr/hta");
  assert.equal(reponse.requeteWeb, "Quels sont les symptômes de l'hypertension ?");
});

test("aucun résultat web : message fixe, aucune source", async () => {
  const recherche = rechercheEspion([]);
  const reponse = await repondreGenerale("Question sans résultat ?", modeleEspion().modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_AUCUNE_INFORMATION);
  assert.deepEqual(reponse.sources, []);
});

test("question réduite à un identifiant : renvoi vers le mode dossier, aucune recherche", async () => {
  const recherche = rechercheEspion();
  const reponse = await repondreGenerale("PS-2025-0148 ?", modeleEspion().modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_PASSER_EN_DOSSIER);
  assert.equal(recherche.requetes.length, 0);
});

test("question vide après anonymisation : demande de reformulation (cas résiduel)", async () => {
  const recherche = rechercheEspion();
  const reponse = await repondreGenerale("?? !!", modeleEspion().modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_REFORMULER);
  assert.equal(recherche.requetes.length, 0);
});

test("garde-fou sortie : un diagnostic produit par le modèle est remplacé par le refus", async () => {
  const recherche = rechercheEspion();
  const modele = modeleEspion("Le diagnostic est une hypertension [1].");
  const reponse = await repondreGenerale("Quels sont les signes de l'hypertension ?", modele.modele, recherche.recherche);
  assert.equal(reponse.texte, MESSAGE_REFUS_DIAGNOSTIC);
  assert.deepEqual(reponse.sources, []);
});

test("erreur du moteur de recherche : l'erreur remonte à la route", async () => {
  const recherche: RechercheWeb = async () => {
    throw new Error("Tavily a répondu 500");
  };
  await assert.rejects(repondreGenerale("Symptômes de l'anémie ?", modeleEspion().modele, recherche));
});
