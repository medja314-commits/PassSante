import { auth, db } from "./firebase-admin";
import type { Attribution, RoleAttribuable } from "./comptes-core";

// Gestion des comptes par l'administration : SERVEUR UNIQUEMENT.
// Les rôles et le statut sont posés en custom claims ; l'utilisateur ne peut pas les modifier.

export type CompteEnAttente = {
  uid: string;
  nom: string;
  prenom: string;
  typeDemande: string;
  fonctionDemandee: string;
  matricule: string;
  creeLe: string;
};

export async function listerComptesEnAttente(): Promise<CompteEnAttente[]> {
  const instantane = await db().collection("comptes").where("statut", "==", "en_attente").get();
  return instantane.docs.map(doc => {
    const d = doc.data();
    return {
      uid: doc.id,
      nom: String(d.nom ?? ""),
      prenom: String(d.prenom ?? ""),
      typeDemande: String(d.typeDemande ?? ""),
      fonctionDemandee: String(d.fonctionDemandee ?? ""),
      matricule: String(d.matricule ?? ""),
      creeLe: String(d.creeLe ?? ""),
    };
  });
}

// Valide un compte en attente avec le rôle et, pour un patient, le dossier vérifié par l'administration.
// Le matricule a déjà été attribué à l'inscription : la validation ne fait que débloquer le compte.
export async function validerCompte(uid: string, attribution: Extract<Attribution, { ok: true }>): Promise<void> {
  const compte = db().collection("comptes").doc(uid);
  // Contrôle avant toute écriture : un compte déjà traité ne reçoit pas de rôle.
  const profil = await compte.get();
  if (!profil.exists || profil.data()?.statut !== "en_attente") {
    throw new CompteIntrouvable();
  }

  const claims: { role: RoleAttribuable; statut: "valide"; patientId?: string; fonction?: string } = {
    role: attribution.role,
    statut: "valide",
  };
  if (attribution.role === "patient") claims.patientId = attribution.patientId;
  if (attribution.fonction) claims.fonction = attribution.fonction;

  await auth().setCustomUserClaims(uid, claims);
  await compte.update({ statut: "valide", roleAttribue: attribution.role });
}

// Refuse un compte : il est désactivé côté Firebase, et ne peut plus se connecter.
export async function refuserCompte(uid: string): Promise<void> {
  const profil = await db().collection("comptes").doc(uid).get();
  if (!profil.exists || profil.data()?.statut !== "en_attente") {
    throw new CompteIntrouvable();
  }
  await auth().updateUser(uid, { disabled: true });
  await db().collection("comptes").doc(uid).update({ statut: "refuse" });
}

export class CompteIntrouvable extends Error {
  constructor() {
    super("compte introuvable ou déjà traité");
  }
}
