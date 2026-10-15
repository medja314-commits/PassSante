import { test } from "node:test";
import assert from "node:assert/strict";
import { can, filtrerPassages, type Utilisateur } from "@/lib/assistant/access";

const personnel: Utilisateur = { id: "t-staff", role: "hospital_staff" };
const aminata: Utilisateur = { id: "t-aminata", role: "patient", patientId: "PS-2024-0812" };
const patientSansIdentifiant: Utilisateur = { id: "t-anonyme", role: "patient" };

test("le personnel peut écrire des prescriptions", () => {
  assert.equal(can(personnel, "write", { type: "prescriptions" }), true);
});

test("un patient lit ses propres examens", () => {
  assert.equal(can(aminata, "read", { type: "exams", patientId: "PS-2024-0812" }), true);
});

test("un patient ne lit pas les examens d'un autre patient", () => {
  assert.equal(can(aminata, "read", { type: "exams", patientId: "PS-2025-0148" }), false);
});

test("un patient sans identifiant ne lit pas une ressource sans patientId", () => {
  assert.equal(can(patientSansIdentifiant, "read", { type: "exams" }), false);
});

test("un type de ressource inconnu est refusé par défaut", () => {
  assert.equal(can(personnel, "read", { type: "inconnu" }), false);
});

test("filtrerPassages ne garde que les passages autorisés", () => {
  const passages = [
    { id: "a", ressource: { type: "exams", patientId: "PS-2024-0812" } },
    { id: "b", ressource: { type: "exams", patientId: "PS-2025-0148" } },
  ];
  assert.deepEqual(filtrerPassages(aminata, passages).map(passage => passage.id), ["a"]);
});
