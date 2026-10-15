import type { Role } from "./rbac";

export type AuditEntry = { date: string; role: Role; action: string; resource: string; targetId?: string; allowed: boolean };
const logs: AuditEntry[] = [];

export function logAction(role: Role, action: string, resource: string, targetId?: string, allowed = true) {
  logs.push({ date: new Date().toISOString(), role, action, resource, targetId, allowed });
}
export const getLogs = () => [...logs].reverse();