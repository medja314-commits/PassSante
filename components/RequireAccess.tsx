"use client";
import { ReactNode } from "react";
import { useRole } from "@/lib/role-context";
import { can, type Action, type Resource } from "@/lib/rbac";

export default function RequireAccess({
  resource, action = "read", children,
}: { resource: Resource; action?: Action; children: ReactNode }) {
  const { role } = useRole();
  if (!can(role, action, resource)) {
    return <p>Accès refusé : votre rôle ne permet pas d'accéder à cette page.</p>;
  }
  return <>{children}</>;
}