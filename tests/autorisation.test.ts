import { test } from "node:test";
import assert from "node:assert/strict";
import { autoriserQuestion, passageAutorise, type Session } from "@/lib/assistant/autorisation";
import { traiterQuestion, type DepsTraitement } from "@/lib/assistant/traiter";
import { rechercher } from "@/lib/assistant/rag/retrieve";
import type { ModeleIA } from "@/lib/assistant/model";
import type { RoleJournal } from "@/lib/audit";

// Exigences de la PR assistant : rôle de session, 403 avant la recherche, modèle non appelé en cas de refus,
// journal pour chaque question (sans texte), admin et comptes en attente refusés.

const PERSONNEL: Session = { uid: "u-staff", statut: "valide", role: "hospital_staff" };
const AMINATA: Session = { uid: "u-aminata", statut: "valide", role: "patient", patientId: "PS-2024-0812" };
const ADMIN: Session = { uid: "u-admin", statut: "valide", role: "admin" };
const EN_ATTENTE: Session = { uid: "u-attente", statut: "en_attente" };

// Espions : compte les appels au modèle et enregistre les entrées du journal.
function depsEspion(session: Session | undefined) {
  const journal: { role: RoleJournal; action: string; resource: string; targetId?: string; allowed?: boolean }[] = [];
  let appelsModele = 0;
  const modele: ModeleIA = {
    generer: async () => {
      appelsModele++;
      return "Réponse de test [1].";
    },
  };
  const deps: DepsTraitement = {
    session,
    modele,
    journal: (role, action, resource, targetId, allowed) => journal.push({ role, action, resource, targetId, allowed }),
  };
  return { deps, journal, appels: () => appelsModele };
}

test("personnel validé : question autorisée, sources renvoyées, journal « autorisé »", async () => {
  const e = depsEspion(PERSONNEL);
  const r = await traiterQuestion("Quel est le résultat de la troponine ?", "dossier", undefined, e.deps);
  assert.equal(r.status, 200);
  assert.ok((r.corps as { sources: { id: string }[] }).sources.some(s => s.id === "LAB-25148"));
  assert.equal(e.appels(), 1);
  assert.equal(e.journal[0].allowed, true);
  assert.equal(e.journal[0].role, "hospital_staff");
});

test("patient sur le dossier d'un autre patient : 403, aucune recherche, modèle non appelé", async () => {
  const e = depsEspion(AMINATA);
  const r = await traiterQuestion("Quel est le résultat de la troponine ?", "dossier", "PS-2025-0148", e.deps);
  assert.equal(r.status, 403);
  assert.equal(e.appels(), 0, "le modèle ne doit jamais être appelé pour un accès refusé");
  assert.equal(e.journal[0].allowed, false);
  assert.equal(e.journal[0].targetId, "PS-2025-0148");
});

test("patient sur son propre dossier : autorisé", async () => {
  const e = depsEspion(AMINATA);
  const r = await traiterQuestion("Quel est le motif de suivi ?", "dossier", "PS-2024-0812", e.deps);
  assert.equal(r.status, 200);
});

test("patient sans dossier visé : sa recherche ne renvoie que son propre dossier", () => {
  const passages = rechercher("troponine résultat allergie motif", { role: "patient", patientId: "PS-2024-0812" });
  assert.ok(passages.every(p => p.ressource.patientId === "PS-2024-0812"), "aucun passage d'un autre patient");
  assert.ok(!passages.some(p => p.id === "LAB-25148"));
});

test("administrateur : refusé (pas de lecture du dossier par l'admin)", async () => {
  const e = depsEspion(ADMIN);
  const r = await traiterQuestion("Quel est le motif de suivi ?", "dossier", undefined, e.deps);
  assert.equal(r.status, 403);
  assert.equal(e.appels(), 0);
  assert.equal(e.journal[0].role, "admin");
  assert.equal(e.journal[0].allowed, false);
});

test("compte en attente : refusé, journalisé comme en_attente", async () => {
  const e = depsEspion(EN_ATTENTE);
  const r = await traiterQuestion("Quel est le motif de suivi ?", "dossier", undefined, e.deps);
  assert.equal(r.status, 403);
  assert.equal(e.appels(), 0);
  assert.equal(e.journal[0].role, "en_attente");
});

test("aucune session : 401, journalisé comme anonyme", async () => {
  const e = depsEspion(undefined);
  const r = await traiterQuestion("Quel est le motif de suivi ?", "dossier", undefined, e.deps);
  assert.equal(r.status, 401);
  assert.equal(e.journal[0].role, "anonyme");
});

test("le journal n'enregistre jamais le texte de la question ni de la réponse", async () => {
  const question = "Quel est le résultat de la troponine ?";
  const e = depsEspion(PERSONNEL);
  await traiterQuestion(question, "dossier", undefined, e.deps);
  const texteJournal = JSON.stringify(e.journal);
  assert.ok(!texteJournal.includes("troponine"), "le texte de la question ne doit pas être journalisé");
  assert.ok(!texteJournal.includes("Réponse de test"), "le texte de la réponse ne doit pas être journalisé");
});

test("refus de droits : passageAutorise coupe les passages d'un autre patient", () => {
  assert.equal(passageAutorise({ role: "patient", patientId: "PS-2024-0812" }, { patientId: "PS-2025-0148" }), false);
  assert.equal(passageAutorise({ role: "patient", patientId: "PS-2024-0812" }, { patientId: "PS-2024-0812" }), true);
  assert.equal(passageAutorise({ role: "hospital_staff" }, { patientId: "PS-2025-0148" }), true);
  assert.equal(passageAutorise({ role: "admin" }, { patientId: "PS-2025-0148" }), false);
});

test("autorisation : le rôle vient de la session, pas d'une valeur fournie par le client", () => {
  const decision = autoriserQuestion(ADMIN);
  assert.equal(decision.ok, false);
  assert.equal(autoriserQuestion(undefined).ok, false);
});
