import { test } from "node:test";
import assert from "node:assert/strict";
import { MOT_DE_PASSE_MIN, choisirMatriculeLibre, extraireChampsInscription, formatMatriculePatient, validerInscription } from "../lib/server/inscription-core.ts";

const VALIDE = {
  nom: "Mensah",
  prenom: "Aminata",
  email: "aminata@exemple.test",
  motDePasse: "motdepasse-long-12",
  confirmation: "motdepasse-long-12",
};

test("saisie valide : aucune erreur", () => {
  assert.deepEqual(validerInscription(VALIDE), []);
});

test("nom et prénom obligatoires", () => {
  const erreurs = validerInscription({ ...VALIDE, nom: "  ", prenom: "" });
  assert.ok(erreurs.includes("Renseignez votre nom."));
  assert.ok(erreurs.includes("Renseignez votre prénom."));
});

test("e-mail au format invalide refusé", () => {
  assert.ok(validerInscription({ ...VALIDE, email: "pas-un-email" }).includes("Adresse e-mail invalide."));
});

test("mot de passe trop court refusé", () => {
  const court = "x".repeat(MOT_DE_PASSE_MIN - 1);
  const erreurs = validerInscription({ ...VALIDE, motDePasse: court, confirmation: court });
  assert.equal(erreurs.length, 1);
});

test("confirmation différente refusée", () => {
  assert.ok(validerInscription({ ...VALIDE, confirmation: "autre-mot-de-passe" }).includes("Les deux mots de passe ne correspondent pas."));
});

test("format du matricule patient : PAT-AAAA-NNNNNN", () => {
  assert.equal(formatMatriculePatient(2026, 123), "PAT-2026-000123");
  assert.equal(formatMatriculePatient(2026, 1), "PAT-2026-000001");
});

test("numéro de matricule hors limites refusé", () => {
  assert.throws(() => formatMatriculePatient(2026, 0));
  assert.throws(() => formatMatriculePatient(2026, 1000000));
  assert.throws(() => formatMatriculePatient(2026, 1.5));
});

// Matricule déjà pris : le matricule suivant libre est choisi, un matricule attribué n'est jamais réécrit.
test("matricule déjà pris : le numéro suivant libre est choisi", async () => {
  const pris = new Set(["PAT-2026-000001"]);
  const choisi = await choisirMatriculeLibre(2026, 0, async m => pris.has(m));
  assert.equal(choisi.matricule, "PAT-2026-000002");
});

test("plusieurs matricules pris à la suite : tous sont sautés", async () => {
  const pris = new Set(["PAT-2026-000005", "PAT-2026-000006", "PAT-2026-000007"]);
  const choisi = await choisirMatriculeLibre(2026, 4, async m => pris.has(m));
  assert.equal(choisi.matricule, "PAT-2026-000008");
});

test("aucun matricule libre : erreur explicite, pas de boucle infinie", async () => {
  await assert.rejects(choisirMatriculeLibre(2026, 0, async () => true), /Aucun matricule libre/);
});

// Rôle non modifiable à l'inscription : seuls les cinq champs de la saisie sont retenus.
test("rôle, statut et identifiant envoyés à l'inscription sont ignorés", () => {
  const donnees = extraireChampsInscription({ ...VALIDE, role: "admin", statut: "valide", uid: "x", patientId: "PS-2024-0812" });
  assert.ok(donnees);
  assert.deepEqual(Object.keys(donnees).sort(), ["confirmation", "email", "motDePasse", "nom", "prenom"]);
});

test("champ obligatoire absent : aucune donnée extraite", () => {
  assert.equal(extraireChampsInscription({ ...VALIDE, nom: undefined }), undefined);
});
