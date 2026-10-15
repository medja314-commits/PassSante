"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import type { Role } from "./rbac";

const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: "medecin",
  setRole: () => {},
});

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("medecin");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export const useRole = () => useContext(RoleContext);