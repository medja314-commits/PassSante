import { depsConnexion } from "./auth-firebase";
import { demanderReinitialisation, type DepsReinitialisation } from "./reinitialisation-core";

// Envoi de l'e-mail de réinitialisation par Firebase (sendOobCode). SERVEUR UNIQUEMENT.
// Un échec côté Firebase (ex. e-mail inconnu) est ignoré : la réponse reste identique pour l'utilisateur.
async function envoyerEmailReinitialisation(email: string): Promise<void> {
  const cle = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!cle) throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY manquante");

  const reponse = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${cle}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestType: "PASSWORD_RESET", email }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!reponse.ok) {
    console.error("Réinitialisation : Firebase a refusé l'envoi (détail non journalisé).");
  }
}

const depsReinitialisation: DepsReinitialisation = {
  trouverUid: depsConnexion.trouverUid,
  profilDeUid: depsConnexion.profilDeUid,
  envoyerEmailReinitialisation,
};

export function demanderReinitialisationFirebase(matricule: string) {
  return demanderReinitialisation(depsReinitialisation, matricule);
}
