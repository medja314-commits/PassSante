import { test } from "node:test";
import assert from "node:assert/strict";
import { extraireChampsPersonnel, matriculePersonnelLibre, validerInscriptionPersonnel } from "../lib/server/inscription-core.ts";

const VALIDE = {
  nom: "Koné", prenom: "Awa", email: "awa@exemple.test",
  motDePasse: "motdepasse-long-12", confirmation: "motdepasse-long-12",
  matricule: "26PS00012", fonction: "infirmier",
};

test("saisie personnel valide : aucune erreur", () => {
  assert.deepEqual(validerInscriptionPersonnel(VALIDE), []);
});

test("format du matricule d'hôpital imposé : 26PS + 5 chiffres", () => {
  assert.ok(validerInscriptionPersonnel({ ...VALIDE, matricule: "26PS0001" }).length > 0);
  assert.ok(validerInscriptionPersonnel({ ...VALIDE, matricule: "25PS00012" }).length > 0);
  assert.ok(validerInscriptionPersonnel({ ...VALIDE, matricule: "26PS0001A" }).length > 0);
  assert.equal(validerInscriptionPersonnel({ ...VALIDE, matricule: "26PS99999" }).length, 0);
});

test("fonction hors liste refusée (un rôle n'est jamais accepté)", () => {
  assert.ok(validerInscriptionPersonnel({ ...VALIDE, fonction: "admin" }).length > 0);
  assert.ok(validerInscriptionPersonnel({ ...VALIDE, fonction: "" }).length > 0);
});

test("matricule déjà pris : refusé", async () => {
  const pris = new Set(["26PS00012"]);
  assert.equal(await matriculePersonnelLibre("26PS00012", async m => pris.has(m)), false);
  assert.equal(await matriculePersonnelLibre("26PS00013", async m => pris.has(m)), true);
});

test("extraction : rôle, statut et identifiant injectés ignorés", () => {
  const d = extraireChampsPersonnel({ ...VALIDE, role: "admin", statut: "valide", uid: "x" });
  assert.ok(d);
  assert.deepEqual(Object.keys(d).sort(), ["confirmation", "email", "fonction", "matricule", "motDePasse", "nom", "prenom"]);
});

test("extraction : matricule normalisé en majuscules", () => {
  assert.equal(extraireChampsPersonnel({ ...VALIDE, matricule: " 26ps00012 " })?.matricule, "26PS00012");
});
