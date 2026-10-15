// Crée le premier administrateur et les comptes de démonstration, avec leurs matricules.
// Usage (depuis la racine du projet, avec .env.local rempli) :
//   node --env-file=.env.local scripts/init-comptes.mjs
// Les mots de passe viennent de .env.local (PS_DEMO_MDP_*). Ils ne sont jamais affichés ni écrits dans le code.
// Relançable : un compte existant est mis à jour, pas recréé.

import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const requis = ["FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "PS_DEMO_MDP_ADMIN", "PS_DEMO_MDP_PERSONNEL", "PS_DEMO_MDP_PATIENT"];
const manquantes = requis.filter(nom => !process.env[nom]);
if (manquantes.length) {
  console.error("Variables manquantes dans .env.local :", manquantes.join(", "));
  process.exit(1);
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
});
const auth = getAuth(app);
const db = getFirestore(app);

// Comptes de démonstration. Les e-mails sont fictifs (domaine .test) : aucun e-mail réel n'est envoyé.
const COMPTES = [
  {
    libelle: "Premier administrateur",
    matricule: "ADM-0001",
    email: "admin.demo@exemple.test",
    mdp: process.env.PS_DEMO_MDP_ADMIN,
    claims: { role: "admin", statut: "valide" },
  },
  {
    libelle: "Personnel validé",
    matricule: "PER-0001",
    email: "personnel.demo@exemple.test",
    mdp: process.env.PS_DEMO_MDP_PERSONNEL,
    claims: { role: "hospital_staff", statut: "valide" },
  },
  {
    libelle: "Patiente rattachée à son dossier",
    matricule: "PAT-2024-000812",
    email: "patient.demo@exemple.test",
    mdp: process.env.PS_DEMO_MDP_PATIENT,
    claims: { role: "patient", patientId: "PS-2024-0812", statut: "valide" },
  },
];

for (const compte of COMPTES) {
  let uid;
  try {
    uid = (await auth.getUserByEmail(compte.email)).uid;
    await auth.updateUser(uid, { password: compte.mdp });
  } catch (erreur) {
    if (erreur.code !== "auth/user-not-found") throw erreur;
    uid = (await auth.createUser({ email: compte.email, password: compte.mdp, emailVerified: true })).uid;
  }
  await auth.setCustomUserClaims(uid, compte.claims);
  await db.collection("matricules").doc(compte.matricule).set({ uid });
  console.log(`✓ ${compte.libelle} : matricule ${compte.matricule}`);
}

console.log("Comptes prêts. Les mots de passe sont dans .env.local (PS_DEMO_MDP_*).");
