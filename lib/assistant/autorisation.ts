import { can, canAccessPatient, type Role } from "@/lib/rbac";

// Autorisations de l'assistant, fondées sur lib/rbac.ts (source unique des droits).
// Le rôle vient de la session serveur (cookie vérifié par Firebase), jamais du corps de la requête.

// Session telle que renvoyée par verifierSession() (lib/server/auth-firebase.ts).
export type Session = {
  uid: string;
  statut: "valide" | "en_attente";
  role?: Role;
  patientId?: string;
};

// Ce qui est nécessaire pour filtrer les passages du dossier.
export type Acces = {
  role: Role;
  patientId?: string;
};

// Un passage du dossier est lisible si le rôle peut lire le dossier, et si :
// - pour un patient : le passage concerne SON dossier (identifiant de session) et canAccessPatient le permet ;
// - pour le personnel : canAccessPatient le permet (lecture des patients).
export function passageAutorise(acces: Acces, ressource: { patientId?: string }): boolean {
  if (!ressource.patientId) return false;
  if (!can(acces.role, "read", "dossier")) return false;
  if (acces.role === "patient") {
    return acces.patientId === ressource.patientId && canAccessPatient("patient", ressource.patientId);
  }
  return canAccessPatient(acces.role, ressource.patientId);
}

export type Decision =
  | { ok: true; acces: Acces }
  | { ok: false; statut: 401 | 403; journal: "anonyme" | "en_attente" | Role };

// Décide si la question peut être traitée. Appelé AVANT toute recherche et tout appel au modèle.
// patientVise : patient dont le dossier est ouvert (facultatif). S'il est fourni, l'accès est vérifié pour ce dossier.
export function autoriserQuestion(session: Session | undefined, patientVise?: string): Decision {
  if (!session) return { ok: false, statut: 401, journal: "anonyme" };
  if (session.statut !== "valide" || !session.role) return { ok: false, statut: 403, journal: "en_attente" };

  const role = session.role;
  if (!can(role, "read", "assistant")) return { ok: false, statut: 403, journal: role };

  if (patientVise !== undefined) {
    const autorise = role === "patient"
      ? patientVise === session.patientId && canAccessPatient(role, patientVise)
      : canAccessPatient(role, patientVise);
    if (!autorise) return { ok: false, statut: 403, journal: role };
  }

  return { ok: true, acces: { role, patientId: session.patientId } };
}
