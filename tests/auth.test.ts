import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ACCUEIL_PAR_ROLE,
  PAGE_ATTENTE,
  accesPourSession,
  MESSAGE_ECHEC,
  accesAutorise,
  connecter,
  matriculeValide,
  profilExploitable,
  routeAccesPourRole,
  type DepsConnexion,
  type ProfilCompte,
} from "../lib/server/auth-core.ts";
import { ROLES } from "../lib/rbac.ts";

// Comptes factices. Aucun appel à Firebase : tout passe par ces accès simulés.
const COMPTES: Record<string, ProfilCompte & { motDePasse: string }> = {
  "MED-001": { uid: "uid-medecin", email: "medecin@exemple.test", role: "hospital_staff", statut: "valide", motDePasse: "secret-medecin", patientId: undefined },
  "PAT-2024-000001": { uid: "uid-patient", email: "patient@exemple.test", role: "patient", patientId: "PS-2024-0812", statut: "valide", motDePasse: "secret-patient" },
  "SANS-ROLE": { uid: "uid-sans-role", email: "sans@exemple.test", statut: "valide", motDePasse: "secret" },
};

function faussesDeps(): DepsConnexion & { appelsEmail: string[] } {
  const appelsEmail: string[] = [];
  return {
    appelsEmail,
    async trouverUid(matricule) {
      return Object.entries(COMPTES).find(([m]) => m === matricule)?.[1].uid;
    },
    async profilDeUid(uid) {
      const entree = Object.values(COMPTES).find(c => c.uid === uid);
      if (!entree) return undefined;
      const { motDePasse: _ignore, ...profil } = entree;
      return profil;
    },
    async verifierMotDePasse(email, motDePasse) {
      appelsEmail.push(email);
      const compte = Object.values(COMPTES).find(c => c.email === email);
      return compte && compte.motDePasse === motDePasse ? `jeton-${compte.uid}` : undefined;
    },
    async creerCookie(jeton) {
      return `cookie-de-${jeton}`;
    },
  };
}

test("connexion réussie : cookie, redirection selon le rôle, sans email dans le résultat", async () => {
  const deps = faussesDeps();
  const resultat = await connecter(deps, "MED-001", "secret-medecin");
  assert.equal(resultat.ok, true);
  if (!resultat.ok) return;
  assert.equal(resultat.role, "hospital_staff");
  assert.equal(resultat.redirect, ACCUEIL_PAR_ROLE.hospital_staff);
  assert.equal(resultat.cookie, "cookie-de-jeton-uid-medecin");
  assert.ok(!JSON.stringify(resultat).includes("@exemple.test"), "l'email ne doit jamais être renvoyé au navigateur");
});

test("mauvais mot de passe : message générique", async () => {
  const resultat = await connecter(faussesDeps(), "MED-001", "mauvais");
  assert.deepEqual({ ok: resultat.ok, message: resultat.message }, { ok: false, message: MESSAGE_ECHEC });
});

test("matricule inconnu : même message que le mauvais mot de passe", async () => {
  const inconnu = await connecter(faussesDeps(), "INCONNU-999", "nimporte");
  const mauvais = await connecter(faussesDeps(), "MED-001", "mauvais");
  assert.equal(inconnu.ok, false);
  assert.equal(mauvais.ok, false);
  assert.equal(inconnu.message, mauvais.message);
});

test("compte sans rôle : refusé avec le message générique", async () => {
  const resultat = await connecter(faussesDeps(), "SANS-ROLE", "secret");
  assert.equal(resultat.ok, false);
  assert.equal(resultat.message, MESSAGE_ECHEC);
});

test("patient sans patientId : refusé (rôle incomplet)", () => {
  assert.equal(profilExploitable("patient", undefined), false);
  assert.equal(profilExploitable("patient", "PS-2024-0812"), true);
});

test("échec avec compte connu : uid et rôle restent disponibles pour le journal", async () => {
  const resultat = await connecter(faussesDeps(), "MED-001", "mauvais");
  assert.equal(resultat.ok, false);
  if (resultat.ok) return;
  assert.equal(resultat.uid, "uid-medecin");
  assert.equal(resultat.role, "hospital_staff");
});

test("les rôles de auth-core correspondent exactement à lib/rbac", () => {
  const roles = ROLES.map(role => role.id).sort();
  for (const role of roles) {
    assert.ok(ACCUEIL_PAR_ROLE[role], `pas d'accueil pour ${role}`);
  }
  assert.equal(Object.keys(ACCUEIL_PAR_ROLE).length, roles.length);
});

test("routes protégées : le personnel accède au tableau de bord, pas au patient", () => {
  assert.equal(accesAutorise("hospital_staff", "/dashboard"), true);
  assert.equal(accesAutorise("patient", "/dashboard"), false);
  assert.equal(accesAutorise("patient", "/espace-patient/rdv"), true);
  assert.equal(accesAutorise("hospital_staff", "/espace-patient"), false);
});

test("route d'administration : seul l'admin y accède", () => {
  assert.equal(accesAutorise("admin", "/admin/users"), true);
  assert.equal(accesAutorise("hospital_staff", "/admin/logs"), false);
  assert.equal(accesAutorise(undefined, "/admin/users"), false);
});

test("route publique : accessible sans rôle", () => {
  assert.equal(routeAccesPourRole("/login"), null);
  assert.equal(accesAutorise(undefined, "/login"), true);
});

test("préfixe partiel : /patientsXYZ n'est pas /patients", () => {
  assert.equal(routeAccesPourRole("/patientsXYZ"), null);
});

test("validation du matricule", () => {
  assert.equal(matriculeValide("PAT-2026-000123"), true);
  assert.equal(matriculeValide(""), false);
  assert.equal(matriculeValide("a b"), false);
  assert.equal(matriculeValide("x".repeat(40)), false);
});

// Statut « en attente » : le compte peut se connecter, mais ne voit que la page d'attente.
const ATTENTE: DepsConnexion = {
  async trouverUid(matricule) {
    return matricule === "PER-ATTENTE" ? "uid-attente" : undefined;
  },
  async profilDeUid(uid) {
    return uid === "uid-attente" ? { uid, email: "attente@exemple.test", statut: "en_attente" } : undefined;
  },
  async verifierMotDePasse(_email, motDePasse) {
    return motDePasse === "bon" ? "jeton-attente" : undefined;
  },
  async creerCookie(jeton) {
    return `cookie-de-${jeton}`;
  },
};

test("compte en attente : connexion permise, redirection vers la page d'attente, sans rôle", async () => {
  const resultat = await connecter(ATTENTE, "PER-ATTENTE", "bon");
  assert.equal(resultat.ok, true);
  if (!resultat.ok) return;
  assert.equal(resultat.redirect, PAGE_ATTENTE);
  assert.equal(resultat.statut, "en_attente");
  assert.equal(resultat.role, undefined);
});

test("compte en attente : mauvais mot de passe refusé avec le message générique", async () => {
  const resultat = await connecter(ATTENTE, "PER-ATTENTE", "mauvais");
  assert.equal(resultat.ok, false);
  assert.equal(resultat.message, MESSAGE_ECHEC);
});

test("compte en attente : seule la page d'attente est accessible", () => {
  const session = { statut: "en_attente" as const };
  assert.equal(accesPourSession(session, PAGE_ATTENTE), true);
  assert.equal(accesPourSession(session, "/dashboard"), false);
  assert.equal(accesPourSession(session, "/espace-patient"), false);
  assert.equal(accesPourSession(session, "/api/assistant"), false);
});

test("compte validé : accès selon le rôle, pas à la page d'attente uniquement", () => {
  const staff = { statut: "valide" as const, role: "hospital_staff" as const };
  assert.equal(accesPourSession(staff, "/dashboard"), true);
  assert.equal(accesPourSession(staff, "/admin/users"), false);
});

test("échec d'un compte en attente : le statut est renvoyé pour le journal", async () => {
  const resultat = await connecter(ATTENTE, "PER-ATTENTE", "mauvais");
  assert.equal(resultat.ok, false);
  if (resultat.ok) return;
  assert.equal(resultat.statut, "en_attente");
  assert.equal(resultat.role, undefined);
});
