import type { Role } from "./rbac";

// Valeurs admises dans le journal : un rôle validé, ou, pour les événements sans rôle validé :
// « en_attente » (compte créé mais non validé) et « anonyme » (aucun compte identifié, ex. matricule inconnu).
export type RoleJournal = Role | "en_attente" | "anonyme";

export type AuditEntry = { date: string; role: RoleJournal; action: string; resource: string; targetId?: string; allowed: boolean };
const logs: AuditEntry[] = [];

export function logAction(role: RoleJournal, action: string, resource: string, targetId?: string, allowed = true) {
  logs.push({ date: new Date().toISOString(), role, action, resource, targetId, allowed });
}
export const getLogs = () => [...logs].reverse();
