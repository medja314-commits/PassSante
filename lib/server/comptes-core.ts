// Règles de validation des comptes par l'administration, sans dépendance Firebase.
// Imports de types uniquement, pour que les tests puissent exécuter ce fichier directement.

// Seuls ces rôles peuvent être attribués par l'administration : l'admin ne se donne pas le rôle admin depuis cet écran.
export const ROLES_ATTRIBUABLES = ["hospital_staff", "patient"] as const;
export type RoleAttribuable = (typeof ROLES_ATTRIBUABLES)[number];

const FORMAT_PATIENT = /^PS-\d{4}-\d{4}$/;

export type Attribution =
  | { ok: true; role: RoleAttribuable; patientId?: string }
  | { ok: false; erreur: string };

// Un patient doit être rattaché à un dossier existant (identifiant PS-AAAA-NNNN), vérifié par l'admin.
// Le personnel n'a pas de dossier rattaché.
export function validerAttribution(role: unknown, patientId: unknown): Attribution {
  if (role !== "hospital_staff" && role !== "patient") {
    return { ok: false, erreur: "Rôle non attribuable depuis cet écran." };
  }
  if (role === "patient") {
    if (typeof patientId !== "string" || !FORMAT_PATIENT.test(patientId)) {
      return { ok: false, erreur: "Identifiant de dossier invalide (format PS-AAAA-NNNN)." };
    }
    return { ok: true, role, patientId };
  }
  return { ok: true, role };
}

// Seul un administrateur validé peut gérer les comptes.
export function peutAdministrer(session: { statut?: unknown; role?: unknown } | undefined): boolean {
  return Boolean(session) && session?.statut === "valide" && session?.role === "admin";
}
