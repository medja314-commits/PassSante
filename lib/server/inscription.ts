import { auth, db } from "./firebase-admin";
import { formatMatriculePatient, validerInscription, type DonneesInscription } from "./inscription-core";

// Inscription patient : SERVEUR UNIQUEMENT. Le compte est créé « en attente » : l'administration le rattache
// à son dossier après vérification d'identité. Aucun rattachement automatique.

export class InscriptionRefusee extends Error {
  constructor(
    public readonly code: "saisie" | "email_pris",
    public readonly erreurs: string[] = [],
  ) {
    super(code);
  }
}

export async function inscrirePatient(donnees: DonneesInscription): Promise<{ matricule: string }> {
  const erreurs = validerInscription(donnees);
  if (erreurs.length > 0) throw new InscriptionRefusee("saisie", erreurs);

  const email = donnees.email.trim().toLowerCase();
  const nom = donnees.nom.trim();
  const prenom = donnees.prenom.trim();
  const annee = new Date().getFullYear();

  // 1. Matricule séquentiel, attribué dans une transaction pour éviter les doublons.
  const compteur = db().collection("compteurs").doc(`patient-${annee}`);
  const numero = await db().runTransaction(async transaction => {
    const instantane = await transaction.get(compteur);
    const suivant = (instantane.data()?.dernier ?? 0) + 1;
    transaction.set(compteur, { dernier: suivant });
    return suivant;
  });
  const matricule = formatMatriculePatient(annee, numero);

  // 2. Compte Firebase : l'unicité de l'email est vérifiée par Firebase.
  let uid: string;
  try {
    uid = (await auth().createUser({ email, password: donnees.motDePasse, displayName: `${prenom} ${nom}` })).uid;
  } catch (erreur) {
    if ((erreur as { code?: string }).code === "auth/email-already-exists") {
      throw new InscriptionRefusee("email_pris");
    }
    throw erreur;
  }

  // 3. Statut, matricule et profil. En cas d'échec, le compte Firebase est supprimé.
  try {
    await auth().setCustomUserClaims(uid, { statut: "en_attente", typeDemande: "patient" });
    await db().collection("matricules").doc(matricule).set({ uid });
    await db().collection("comptes").doc(uid).set({
      nom,
      prenom,
      typeDemande: "patient",
      statut: "en_attente",
      matricule,
      creeLe: new Date().toISOString(),
    });
  } catch (erreur) {
    await auth().deleteUser(uid).catch(() => {});
    throw erreur;
  }

  return { matricule };
}
