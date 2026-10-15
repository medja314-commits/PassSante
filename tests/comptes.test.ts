import { test } from "node:test";
import assert from "node:assert/strict";
import { peutAdministrer, validerAttribution } from "../lib/server/comptes-core.ts";

// Validation par l'administration : seul un admin validé peut attribuer un rôle ; l'attribution est bornée.

test("patient : attribution valide avec un dossier au bon format", () => {
  const r = validerAttribution("patient", "PS-2024-0812");
  assert.deepEqual(r, { ok: true, role: "patient", patientId: "PS-2024-0812" });
});

test("patient sans dossier ou avec un format invalide : refusé", () => {
  assert.equal(validerAttribution("patient", undefined).ok, false);
  assert.equal(validerAttribution("patient", "PS-2024-812").ok, false);
  assert.equal(validerAttribution("patient", "PAT-2024-000812").ok, false);
});

test("personnel : attribution sans dossier", () => {
  assert.deepEqual(validerAttribution("hospital_staff", undefined), { ok: true, role: "hospital_staff" });
});

test("rôle admin ou inconnu : non attribuable depuis l'écran de validation", () => {
  assert.equal(validerAttribution("admin", undefined).ok, false);
  assert.equal(validerAttribution("medecin", undefined).ok, false);
  assert.equal(validerAttribution(undefined, undefined).ok, false);
});

test("administrateur validé : peut administrer", () => {
  assert.equal(peutAdministrer({ statut: "valide", role: "admin" }), true);
});

test("personnel validé, compte en attente ou sans session : ne peut pas administrer", () => {
  assert.equal(peutAdministrer({ statut: "valide", role: "hospital_staff" }), false);
  assert.equal(peutAdministrer({ statut: "en_attente", role: "admin" }), false);
  assert.equal(peutAdministrer({ statut: "en_attente" }), false);
  assert.equal(peutAdministrer(undefined), false);
});
