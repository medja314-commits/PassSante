// Logique d'authentification sans dépendance Firebase : testable sans identifiants.
// Les accès réels à Firebase sont injectés (voir auth-firebase.ts).
// Seuls des imports de types sont autorisés ici, pour que les tests puissent exécuter ce fichier directement.

import type { Role } from "../rbac";

export const MESSAGE_ECHEC = "Matricule ou mot de passe incorrect.";
export const COOKIE_SESSION = "ps_session";
export const DUREE_SESSION_MS = 8 * 60 * 60 * 1000;

// Mêmes rôles que lib/rbac.ts (modèle à trois rôles, commit 8788f37).
const ROLES_CONNUS: readonly Role[] = ["hospital_staff", "patient", "admin"];
const ROLES_PERSONNEL: readonly Role[] = ["hospital_staff"];

// Page d'accueil après connexion, selon le rôle.
export const ACCUEIL_PAR_ROLE: Record<Role, string> = {
  hospital_staff: "/dashboard",
  patient: "/espace-patient",
  admin: "/admin/users",
};

// Routes protégées, par préfixe. Une route absente de cette liste est publique.
const REGLES_ACCES: { prefixe: string; roles: readonly Role[] }[] = [
  { prefixe: "/dashboard", roles: ROLES_PERSONNEL },
  { prefixe: "/patients", roles: ROLES_PERSONNEL },
  { prefixe: "/agenda", roles: ROLES_PERSONNEL },
  { prefixe: "/examens", roles: ROLES_PERSONNEL },
  { prefixe: "/assistant", roles: ROLES_PERSONNEL },
  { prefixe: "/api/assistant", roles: ROLES_PERSONNEL },
  { prefixe: "/espace-patient", roles: ["patient"] },
  { prefixe: "/admin", roles: ["admin"] },
];

export function routeAccesPourRole(chemin: string): readonly Role[] | null {
  const regle = REGLES_ACCES.find(item => chemin === item.prefixe || chemin.startsWith(item.prefixe + "/"));
  return regle ? regle.roles : null;
}

// Matricule : lettres, chiffres et tirets. La casse est normalisée par l'appelant.
export function matriculeValide(valeur: string): boolean {
  return /^[A-Za-z0-9-]{3,32}$/.test(valeur);
}

export function roleConnu(valeur: unknown): valeur is Role {
  return typeof valeur === "string" && (ROLES_CONNUS as readonly string[]).includes(valeur);
}

// Un compte est exploitable si son rôle est connu, et si un patient est relié à son dossier.
export function profilExploitable(role: unknown, patientId: unknown): role is Role {
  if (!roleConnu(role)) return false;
  if (role === "patient") return typeof patientId === "string" && patientId.length > 0;
  return true;
}

export type ProfilCompte = {
  uid: string;
  email: string;
  role?: unknown;
  patientId?: unknown;
  statut?: unknown;
};

// Statut du compte, posé par le serveur dans les custom claims.
// Un compte sans statut « valide » est en attente : il peut se connecter, mais ne voit que la page d'attente.
export type Statut = "valide" | "en_attente";
export const PAGE_ATTENTE = "/attente";

export function statutDuProfil(statut: unknown): Statut {
  return statut === "valide" ? "valide" : "en_attente";
}

// Accès selon la session : un compte en attente ne voit que la page d'attente.
export function accesPourSession(session: { statut: Statut; role?: Role }, chemin: string): boolean {
  if (session.statut !== "valide") return chemin === PAGE_ATTENTE;
  return accesAutorise(session.role, chemin);
}

// Accès aux services externes, injectés pour les tests.
export type DepsConnexion = {
  // Matricule → identifiant de compte, ou undefined si le matricule est inconnu.
  trouverUid(matricule: string): Promise<string | undefined>;
  // Profil (email privé, rôle, patientId) d'un compte.
  profilDeUid(uid: string): Promise<ProfilCompte | undefined>;
  // Vérifie le mot de passe auprès de Firebase. Renvoie un jeton d'identité, ou undefined.
  verifierMotDePasse(email: string, motDePasse: string): Promise<string | undefined>;
  // Transforme le jeton d'identité en cookie de session signé.
  creerCookie(jetonIdentite: string): Promise<string>;
};

export type ResultatConnexion =
  | { ok: true; cookie: string; redirect: string; uid: string; statut: Statut; role?: Role }
  | { ok: false; message: string; uid?: string; role?: Role; statut?: Statut };

// Ne renvoie jamais l'email : le résultat est destiné au navigateur.
// En échec, le message est toujours le même, quelle que soit la cause.
export async function connecter(deps: DepsConnexion, matricule: string, motDePasse: string): Promise<ResultatConnexion> {
  const uid = await deps.trouverUid(matricule);
  if (!uid) return { ok: false, message: MESSAGE_ECHEC };

  const profil = await deps.profilDeUid(uid);
  if (!profil) return { ok: false, message: MESSAGE_ECHEC, uid };

  const statut = statutDuProfil(profil.statut);
  // Un compte validé doit avoir un rôle exploitable. Un compte en attente n'en a pas encore.
  if (statut === "valide" && !profilExploitable(profil.role, profil.patientId)) {
    return { ok: false, message: MESSAGE_ECHEC, uid };
  }
  const role = statut === "valide" && roleConnu(profil.role) ? profil.role : undefined;

  const jeton = await deps.verifierMotDePasse(profil.email, motDePasse);
  if (!jeton) return { ok: false, message: MESSAGE_ECHEC, uid, role, statut };

  const cookie = await deps.creerCookie(jeton);
  if (statut === "en_attente") {
    return { ok: true, cookie, redirect: PAGE_ATTENTE, uid, statut };
  }
  return { ok: true, cookie, redirect: ACCUEIL_PAR_ROLE[role as Role], uid, statut, role: role as Role };
}

// Sécurité des routes : vérifie le rôle d'une session déjà validée par Firebase.
export function accesAutorise(role: unknown, chemin: string): boolean {
  const roles = routeAccesPourRole(chemin);
  if (roles === null) return true;
  return roleConnu(role) && roles.includes(role);
}
