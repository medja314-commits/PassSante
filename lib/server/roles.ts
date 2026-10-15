import { ROLES, type Role } from "@/lib/rbac";
import { auth } from "./firebase-admin";

// Le rôle est stocké dans les « custom claims » du compte Firebase.
// Seul le serveur (Firebase Admin) peut les modifier : l'utilisateur ne peut pas changer son propre rôle.
// Effet de bord : le nouveau rôle n'apparaît dans le jeton qu'à la prochaine connexion.

const ROLES_CONNUS: readonly string[] = ROLES.map(role => role.id);

export function estRoleConnu(valeur: unknown): valeur is Role {
  return typeof valeur === "string" && ROLES_CONNUS.includes(valeur);
}

export async function definirRole(uid: string, role: Role): Promise<void> {
  if (!estRoleConnu(role)) {
    throw new Error(`Rôle inconnu : ${String(role)}`);
  }
  await auth().setCustomUserClaims(uid, { role });
}
