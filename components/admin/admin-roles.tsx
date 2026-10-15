"use client";

import { useMemo, useState } from "react";
import { adminRoles } from "@/data/mock-data";
import { formatCount } from "@/data/dates";
import type { PermissionLevel, RoleDefinition, UserRole } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";

const resources = [
  { id: "patients", label: "Dossiers patients", description: "Identité, consultations et constantes" },
  { id: "appointments", label: "Rendez-vous", description: "Agenda et planification" },
  { id: "prescriptions", label: "Prescriptions", description: "Ordonnances et traitements" },
  { id: "exams", label: "Examens & laboratoire", description: "Demandes et résultats" },
  { id: "users", label: "Utilisateurs", description: "Comptes et attribution des rôles" },
  { id: "audit", label: "Journaux d'audit", description: "Traçabilité et sécurité" },
];

const permissionLabels: Record<PermissionLevel, string> = {
  none: "Aucun accès",
  read: "Lecture",
  write: "Lecture & écriture",
  manage: "Gestion complète",
};

export function AdminRoles() {
  const [roles, setRoles] = useState<RoleDefinition[]>(adminRoles);
  const [selectedId, setSelectedId] = useState<UserRole>("hospital_staff");
  const [notice, setNotice] = useState("");
  // Compteurs calculés depuis les rôles affichés.
  const totalUsers = roles.reduce((sum, role) => sum + role.usersCount, 0);
  const activePermissions = roles.reduce((sum, role) => sum + Object.values(role.permissions).filter(level => level !== "none").length, 0);
  const selectedRole = useMemo(() => roles.find(role=>role.id===selectedId) ?? roles[0], [roles,selectedId]);

  const updatePermission = (resource: string, permission: PermissionLevel) => {
    setRoles(current=>current.map(role=>role.id===selectedId ? {...role,permissions:{...role.permissions,[resource]:permission}} : role));
    setNotice("");
  };

  return <main className="admin-content">
    <div className="page-heading"><div><span className="eyebrow">ACCÈS & SÉCURITÉ</span><h1>Rôles & permissions</h1><p>Configurez les niveaux d'accès et les autorisations appliqués aux utilisateurs.</p></div><Button icon="plus" onClick={()=>setNotice("La création de rôles personnalisés sera disponible prochainement.")}>Créer un rôle</Button></div>
    {notice && <div className="toast admin-toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")} aria-label="Fermer"><Icon name="x"/></button></div>}
    <div className="role-stats">
      <article><span className="metric-icon blue"><Icon name="key"/></span><div><small>Rôles configurés</small><strong>{roles.length}</strong><p>Rôles système protégés</p></div></article>
      <article><span className="metric-icon green"><Icon name="users"/></span><div><small>Utilisateurs assignés</small><strong>{formatCount(totalUsers)}</strong><p>Comptes rattachés à un rôle</p></div></article>
      <article><span className="metric-icon purple"><Icon name="shield"/></span><div><small>Permissions actives</small><strong>{activePermissions}</strong><p>Permissions accordées (hors « Aucun accès »)</p></div></article>
    </div>
    <div className="roles-layout">
      <aside className="card roles-list"><div className="section-head"><div><h2>Rôles de la plateforme</h2><p>Sélectionnez un rôle à configurer</p></div></div>
        {roles.map(role=><button key={role.id} className={selectedId===role.id?"active":""} onClick={()=>{setSelectedId(role.id);setNotice("")}}><span className={`role-icon ${role.color}`}><Icon name={role.id==="admin"?"shield":role.id==="patient"?"heart":"stethoscope"}/></span><span><strong>{role.name}</strong><small>{role.description}</small><em>{role.usersCount} utilisateurs</em></span><Icon name="chevron" size={15}/></button>)}
        <div className="roles-info"><Icon name="lock" size={16}/><p>Les rôles système ne peuvent pas être supprimés, mais leurs permissions peuvent être ajustées.</p></div>
      </aside>
      <section className="card permissions-panel">
        <div className="role-detail-head"><div><span className={`role-icon ${selectedRole.color}`}><Icon name={selectedRole.id==="admin"?"shield":selectedRole.id==="patient"?"heart":"stethoscope"}/></span><div><h2>{selectedRole.name}</h2><p>{selectedRole.description}</p></div></div><Badge tone={selectedRole.color}>{selectedRole.usersCount} utilisateurs</Badge></div>
        <div className="permissions-title"><div><strong>Matrice des permissions</strong><p>Les modifications sont appliquées à tous les membres de ce rôle.</p></div><Badge tone="amber">Modifications locales</Badge></div>
        <div className="permission-rows">{resources.map(resource=><div key={resource.id}><span className="permission-resource"><strong>{resource.label}</strong><small>{resource.description}</small></span><select value={selectedRole.permissions[resource.id]} onChange={event=>updatePermission(resource.id,event.target.value as PermissionLevel)} aria-label={`Permission pour ${resource.label}`}>{Object.entries(permissionLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><span className={`permission-state ${selectedRole.permissions[resource.id]}`}><Icon name={selectedRole.permissions[resource.id]==="none"?"x":"check"} size={13}/>{permissionLabels[selectedRole.permissions[resource.id]]}</span></div>)}</div>
        <div className="permissions-actions"><Button variant="ghost" onClick={()=>{setRoles(adminRoles);setNotice("Les modifications locales ont été annulées.")}}>Réinitialiser</Button><Button onClick={()=>setNotice(`Permissions du rôle « ${selectedRole.name} » modifiées pour cette session uniquement.`)}>Enregistrer les permissions</Button></div>
      </section>
    </div>
  </main>;
}
