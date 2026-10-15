import { ROLES, type Role } from "@/lib/rbac";
import { auth } from "./firebase-admin";

// Le rôle est stocké dans les « custom claims » du compte Firebase.
// Seul le serveur (Firebase Admin) peut les modifier : l'utilisateur ne peut pas changer son propre rôle.
// Effet de bord : le nouveau rôle n'apparaît dans le jeton qu'à la prochaine connexion.

const ROLES_CONNUS: readonly string[] = ROLES.map(role => role.id);

export function estRoleConnu(valeur: unknown): valeur is Role {
  return typeof valeur === "string" && ROLES_CONNUS.includes(valeur);
}

// patientId n'est posé que pour le rôle « patient » : il relie le compte à son dossier.
export async function definirRole(uid: string, role: Role, patientId?: string): Promise<void> {
  if (!estRoleConnu(role)) {
    throw new Error(`Rôle inconnu : ${String(role)}`);
  }
  if (role === "patient") {
    if (!patientId) throw new Error("Un patient doit être relié à un identifiant de dossier");
    await auth().setCustomUserClaims(uid, { role, patientId });
    return;
  }
  await auth().setCustomUserClaims(uid, { role });
}
