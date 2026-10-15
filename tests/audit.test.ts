import { test } from "node:test";
import assert from "node:assert/strict";
import { getLogs, logAction } from "../lib/audit.ts";

test("un rôle validé est journalisé comme avant (valeurs par défaut inchangées)", () => {
  logAction("admin", "lecture", "logs", "x");
  const entree = getLogs()[0];
  assert.equal(entree.role, "admin");
  assert.equal(entree.allowed, true);
  assert.equal(entree.targetId, "x");
});

test("un compte en attente peut être journalisé sans rôle validé", () => {
  logAction("en_attente", "inscription", "compte", "uid-1", true);
  const entree = getLogs()[0];
  assert.equal(entree.role, "en_attente");
  assert.equal(entree.action, "inscription");
});

test("un matricule inconnu est journalisé comme anonyme, refusé", () => {
  logAction("anonyme", "connexion", "session", undefined, false);
  const entree = getLogs()[0];
  assert.equal(entree.role, "anonyme");
  assert.equal(entree.allowed, false);
  assert.equal(entree.targetId, undefined);
});

test("le journal est renvoyé du plus récent au plus ancien", () => {
  logAction("admin", "premier", "x");
  logAction("admin", "second", "x");
  const actions = getLogs().slice(0, 2).map(e => e.action);
  assert.deepEqual(actions, ["second", "premier"]);
});
