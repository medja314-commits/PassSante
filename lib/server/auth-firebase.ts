import { auth, db } from "./firebase-admin";
import { DUREE_SESSION_MS, profilExploitable, type DepsConnexion, type ProfilCompte } from "./auth-core";
import type { Role } from "../rbac";

// Implémentation Firebase des accès décrits dans auth-core.ts. SERVEUR UNIQUEMENT.

// Vérification du mot de passe par l'API REST Identity Toolkit (la clé API est publique, mais l'appel reste serveur).
// L'email ne quitte jamais le serveur.
async function verifierMotDePasse(email: string, motDePasse: string): Promise<string | undefined> {
  const cle = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!cle) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY manquante");

  const reponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${cle}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: motDePasse, returnSecureToken: true }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!reponse.ok) return undefined;

  const donnees = (await reponse.json()) as { idToken?: string };
  return donnees.idToken;
}

export const depsConnexion: DepsConnexion = {
  async trouverUid(matricule) {
    const instantane = await db().collection("matricules").doc(matricule).get();
    return instantane.exists ? (instantane.data()?.uid as string | undefined) : undefined;
  },

  async profilDeUid(uid): Promise<ProfilCompte | undefined> {
    const compte = await auth().getUser(uid);
    if (!compte.email) return undefined;
    const claims = compte.customClaims ?? {};
    return { uid, email: compte.email, role: claims.role, patientId: claims.patientId };
  },

  verifierMotDePasse,

  async creerCookie(jetonIdentite) {
    return auth().createSessionCookie(jetonIdentite, { expiresIn: DUREE_SESSION_MS });
  },
};

export type SessionVerifiee = { uid: string; role: Role; patientId?: string };

// Vérifie le cookie de session auprès de Firebase (révocation comprise).
// Renvoie undefined si le cookie est absent, expiré, révoqué ou sans rôle exploitable.
export async function verifierSession(cookie: string | undefined): Promise<SessionVerifiee | undefined> {
  if (!cookie) return undefined;
  try {
    const jeton = await auth().verifySessionCookie(cookie, true);
    const claims = jeton as typeof jeton & { role?: unknown; patientId?: unknown };
    if (!profilExploitable(claims.role, claims.patientId)) return undefined;
    return {
      uid: jeton.uid,
      role: claims.role,
      patientId: typeof claims.patientId === "string" ? claims.patientId : undefined,
    };
  } catch {
    return undefined;
  }
}
