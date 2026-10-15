import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Firebase Admin : SERVEUR UNIQUEMENT. Ne jamais importer ce fichier depuis un composant client.
// L'initialisation est paresseuse : le build ne lit pas les identifiants, seules les routes serveur les utilisent.

let application: App | undefined;

function appAdmin(): App {
  if (application) return application;
  if (getApps().length) {
    application = getApps()[0];
    return application;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Les retours à la ligne de la clé privée sont stockés en « \n » dans .env.local.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Identifiants Firebase Admin manquants : renseigner FIREBASE_* dans .env.local");
  }

  application = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return application;
}

export function auth() {
  return getAuth(appAdmin());
}

export function db() {
  return getFirestore(appAdmin());
}
