// Règles d'inscription sans dépendance Firebase : testables sans identifiants.
// Imports de types uniquement, pour que les tests puissent exécuter ce fichier directement.

export const MOT_DE_PASSE_MIN = 12;
const LONGUEUR_MAX_NOM = 80;
const EXPRESSION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export type DonneesInscription = {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  confirmation: string;
};

// Renvoie la liste des erreurs de saisie (vide si la saisie est valide).
// Les messages ne révèlent rien sur les comptes existants : l'unicité de l'email est vérifiée à part, côté serveur.
export function validerInscription(donnees: DonneesInscription): string[] {
  const erreurs: string[] = [];
  const nom = donnees.nom.trim();
  const prenom = donnees.prenom.trim();

  if (nom.length === 0 || nom.length > LONGUEUR_MAX_NOM) erreurs.push("Renseignez votre nom.");
  if (prenom.length === 0 || prenom.length > LONGUEUR_MAX_NOM) erreurs.push("Renseignez votre prénom.");
  if (!EXPRESSION_EMAIL.test(donnees.email.trim())) erreurs.push("Adresse e-mail invalide.");
  if (donnees.motDePasse.length < MOT_DE_PASSE_MIN) {
    erreurs.push(`Le mot de passe doit contenir au moins ${MOT_DE_PASSE_MIN} caractères.`);
  }
  if (donnees.motDePasse !== donnees.confirmation) erreurs.push("Les deux mots de passe ne correspondent pas.");

  return erreurs;
}

// Matricule patient : PAT-AAAA-NNNNNN (année d'inscription, numéro séquentiel sur 6 chiffres).
export function formatMatriculePatient(annee: number, numero: number): string {
  if (!Number.isInteger(numero) || numero < 1 || numero > 999999) {
    throw new Error("Numéro de matricule hors limites");
  }
  return `PAT-${annee}-${String(numero).padStart(6, "0")}`;
}

// Choisit le prochain matricule libre après le dernier numéro attribué.
// estPris : vérifie si un matricule est déjà attribué (lecture seule). Un matricule pris est sauté, jamais réécrit.
export async function choisirMatriculeLibre(
  annee: number,
  dernier: number,
  estPris: (matricule: string) => Promise<boolean>,
): Promise<{ numero: number; matricule: string }> {
  const LIMITE_ESSAIS = 1000;
  for (let essai = 1; essai <= LIMITE_ESSAIS; essai++) {
    const numero = dernier + essai;
    const matricule = formatMatriculePatient(annee, numero);
    if (!(await estPris(matricule))) return { numero, matricule };
  }
  throw new Error("Aucun matricule libre trouvé");
}

// Ne garde que les cinq champs de la saisie. Tout autre champ (rôle, statut, identifiant) est ignoré.
export const CHAMPS_INSCRIPTION = ["nom", "prenom", "email", "motDePasse", "confirmation"] as const;

export function extraireChampsInscription(corps: Record<string, unknown>): DonneesInscription | undefined {
  if (!CHAMPS_INSCRIPTION.every(champ => typeof corps[champ] === "string")) return undefined;
  return {
    nom: corps.nom as string,
    prenom: corps.prenom as string,
    email: corps.email as string,
    motDePasse: corps.motDePasse as string,
    confirmation: corps.confirmation as string,
  };
}
