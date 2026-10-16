import { auth, db } from "./firebase-admin";
import { choisirMatriculeLibre, validerInscription, validerInscriptionPersonnel, type DonneesInscription, type DonneesInscriptionPersonnel } from "./inscription-core";

// Inscription : SERVEUR UNIQUEMENT. Le compte est créé « en attente » : il ne donne accès qu'à la page d'attente
// tant que l'administration ne l'a pas validé.
// Patient : matricule généré et réservé à l'inscription, affiché au patient.
// Personnel : matricule d'hôpital saisi, réservé s'il est libre.

export class InscriptionRefusee extends Error {
  constructor(
    public readonly code: "saisie" | "email_pris" | "matricule_pris",
    public readonly erreurs: string[] = [],
  ) {
    super(code);
  }
}

export async function inscrirePatient(donnees: DonneesInscription): Promise<{ matricule: string; uid: string }> {
  const erreurs = validerInscription(donnees);
  if (erreurs.length > 0) throw new InscriptionRefusee("saisie", erreurs);

  const email = donnees.email.trim().toLowerCase();
  const nom = donnees.nom.trim();
  const prenom = donnees.prenom.trim();
  const annee = new Date().getFullYear();

  // 1. Compte Firebase : l'unicité de l'email est vérifiée par Firebase.
  let uid: string;
  try {
    uid = (await auth().createUser({ email, password: donnees.motDePasse, displayName: `${prenom} ${nom}` })).uid;
  } catch (erreur) {
    if ((erreur as { code?: string }).code === "auth/email-already-exists") {
      throw new InscriptionRefusee("email_pris");
    }
    throw erreur;
  }

  // 2. Matricule : choisi et réservé dans une transaction. Un matricule déjà attribué est sauté, jamais réécrit.
  const compteur = db().collection("compteurs").doc(`patient-${annee}`);
  let matricule: string;
  try {
    matricule = await db().runTransaction(async transaction => {
      const instantane = await transaction.get(compteur);
      const dernier = (instantane.data()?.dernier as number | undefined) ?? 0;
      const choisi = await choisirMatriculeLibre(annee, dernier, async mat => {
        const existant = await transaction.get(db().collection("matricules").doc(mat));
        return existant.exists;
      });
      transaction.set(compteur, { dernier: choisi.numero });
      transaction.set(db().collection("matricules").doc(choisi.matricule), { uid });
      return choisi.matricule;
    });
  } catch (erreur) {
    await auth().deleteUser(uid).catch(() => {});
    throw erreur;
  }

  // 3. Statut et profil. En cas d'échec, le compte Firebase et le matricule réservé sont supprimés.
  try {
    await auth().setCustomUserClaims(uid, { statut: "en_attente", typeDemande: "patient" });
    await db().collection("comptes").doc(uid).set({
      nom,
      prenom,
      typeDemande: "patient",
      statut: "en_attente",
      matricule,
      creeLe: new Date().toISOString(),
    });
  } catch (erreur) {
    await db().collection("matricules").doc(matricule).delete().catch(() => {});
    await auth().deleteUser(uid).catch(() => {});
    throw erreur;
  }

  return { matricule, uid };
}

// Personnel : matricule d'hôpital saisi, réservé s'il est libre. La fonction n'est qu'une demande.
export async function inscrirePersonnel(donnees: DonneesInscriptionPersonnel): Promise<{ matricule: string; uid: string }> {
  const erreurs = validerInscriptionPersonnel(donnees);
  if (erreurs.length > 0) throw new InscriptionRefusee("saisie", erreurs);

  const email = donnees.email.trim().toLowerCase();
  const nom = donnees.nom.trim();
  const prenom = donnees.prenom.trim();
  const matricule = donnees.matricule;

  let uid: string;
  try {
    uid = (await auth().createUser({ email, password: donnees.motDePasse, displayName: `${prenom} ${nom}` })).uid;
  } catch (erreur) {
    if ((erreur as { code?: string }).code === "auth/email-already-exists") {
      throw new InscriptionRefusee("email_pris");
    }
    throw erreur;
  }

  // Réservation du matricule : refusée s'il existe déjà. Jamais réécrite.
  try {
    await db().runTransaction(async transaction => {
      const existant = await transaction.get(db().collection("matricules").doc(matricule));
      if (existant.exists) throw new InscriptionRefusee("matricule_pris");
      transaction.set(db().collection("matricules").doc(matricule), { uid });
    });
  } catch (erreur) {
    await auth().deleteUser(uid).catch(() => {});
    throw erreur;
  }

  try {
    await auth().setCustomUserClaims(uid, { statut: "en_attente", typeDemande: "personnel" });
    await db().collection("comptes").doc(uid).set({
      nom,
      prenom,
      typeDemande: "personnel",
      fonctionDemandee: donnees.fonction,
      statut: "en_attente",
      matricule,
      creeLe: new Date().toISOString(),
    });
  } catch (erreur) {
    await db().collection("matricules").doc(matricule).delete().catch(() => {});
    await auth().deleteUser(uid).catch(() => {});
    throw erreur;
  }

  return { matricule, uid };
}
