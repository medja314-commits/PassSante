// Réinitialisation du mot de passe, sans dépendance Firebase : testable sans identifiants.
// Imports de types uniquement, pour que les tests puissent exécuter ce fichier directement.

import type { ProfilCompte } from "./auth-core";

// Message identique que le matricule existe ou non : aucune information sur les comptes n'est révélée.
export const MESSAGE_REINITIALISATION = "Si ce matricule existe, un e-mail de réinitialisation a été envoyé.";

export type DepsReinitialisation = {
  trouverUid(matricule: string): Promise<string | undefined>;
  profilDeUid(uid: string): Promise<ProfilCompte | undefined>;
  // Envoie l'e-mail de réinitialisation via Firebase (aucun service d'e-mail supplémentaire).
  envoyerEmailReinitialisation(email: string): Promise<void>;
};

// Ce qui sert au journal uniquement ; jamais renvoyé au navigateur.
export type ResultatReinitialisation = {
  message: string;
  uid?: string;
  role?: unknown;
  statut?: unknown;
};

export async function demanderReinitialisation(deps: DepsReinitialisation, matricule: string): Promise<ResultatReinitialisation> {
  const uid = await deps.trouverUid(matricule);
  if (!uid) return { message: MESSAGE_REINITIALISATION };

  const profil = await deps.profilDeUid(uid);
  if (profil?.email) {
    await deps.envoyerEmailReinitialisation(profil.email);
  }
  return { message: MESSAGE_REINITIALISATION, uid, role: profil?.role, statut: profil?.statut };
}
