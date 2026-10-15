"use client";
import { useRole } from "@/lib/role-context";
import { ROLES, type Role } from "@/lib/rbac";

export function RoleSwitcher() {
  const { role, setRole } = useRole();
  return <label className="role-switcher">
    <span>Rôle de démo</span>
    <select value={role} onChange={e => setRole(e.target.value as Role)} aria-label="Rôle de démonstration">
      {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
    </select>
  </label>;
}