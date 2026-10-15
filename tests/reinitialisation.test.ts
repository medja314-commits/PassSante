import { test } from "node:test";
import assert from "node:assert/strict";
import { MESSAGE_REINITIALISATION, demanderReinitialisation, type DepsReinitialisation } from "../lib/server/reinitialisation-core.ts";

// Espion : enregistre les e-mails envoyés.
function deps(envoyes: string[], profilEmail: string | undefined = "patient@exemple.test") {
  const d: DepsReinitialisation = {
    async trouverUid(matricule) {
      return matricule === "PAT-2024-000812" ? "uid-patient" : undefined;
    },
    async profilDeUid(uid) {
      return uid === "uid-patient" ? { uid, email: profilEmail ?? "", role: "patient", patientId: "PS-2024-0812", statut: "valide" } : undefined;
    },
    async envoyerEmailReinitialisation(email) {
      envoyes.push(email);
    },
  };
  return d;
}

test("matricule existant : un e-mail est envoyé au compte", async () => {
  const envoyes: string[] = [];
  const r = await demanderReinitialisation(deps(envoyes), "PAT-2024-000812");
  assert.deepEqual(envoyes, ["patient@exemple.test"]);
  assert.equal(r.message, MESSAGE_REINITIALISATION);
});

test("matricule inconnu : aucun e-mail, même message", async () => {
  const envoyes: string[] = [];
  const r = await demanderReinitialisation(deps(envoyes), "INCONNU-999");
  assert.equal(envoyes.length, 0);
  assert.equal(r.message, MESSAGE_REINITIALISATION);
  assert.equal(r.uid, undefined);
});

test("compte sans e-mail valide : aucun envoi, même message (réinitialisation par l'admin)", async () => {
  const envoyes: string[] = [];
  const r = await demanderReinitialisation(deps(envoyes, ""), "PAT-2024-000812");
  assert.equal(envoyes.length, 0);
  assert.equal(r.message, MESSAGE_REINITIALISATION);
});

test("la réponse ne contient ni l'e-mail ni le rôle sous une forme exposable", async () => {
  const envoyes: string[] = [];
  const r = await demanderReinitialisation(deps(envoyes), "PAT-2024-000812");
  assert.ok(!JSON.stringify({ message: r.message }).includes("@exemple"));
});
