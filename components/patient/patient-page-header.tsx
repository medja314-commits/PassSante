import type { ReactNode } from "react";

export function PatientPageHeader({ title, description, action }: { title: string; description: string; action: ReactNode }) {
  return <div className="patient-page-heading"><div><span className="eyebrow">ESPACE PATIENT</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

export function PatientEmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return <div className="patient-empty-state"><span>{icon}</span><strong>{title}</strong><p>{description}</p></div>;
}

export function PatientLoadingState() {
  return <div className="patient-loading" aria-label="Chargement"><span/><span/><span/></div>;
}
