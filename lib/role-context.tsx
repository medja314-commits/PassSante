"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ROLES, type Role } from "./rbac";

const KEY = "passsante-demo-role";
const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "hospital_staff",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hospital_staff");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(KEY);
      if (saved && ROLES.some(r => r.id === saved)) setRoleState(saved as Role);
    } catch {}
  }, []);

  const setRole = (r: Role) => {
    setRoleState(r);
    try { sessionStorage.setItem(KEY, r); } catch {}
  };

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);