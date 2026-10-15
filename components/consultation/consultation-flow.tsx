"use client";

// Parcours « Démarrer une consultation » : choix du patient, formulaire, enregistrement dans la session.
import { useState, type FormEvent } from "react";
import { Button, Icon } from "@/components/ui";
import { VitalInput } from "@/components/patient/vital-input";
import { validateVital, type VitalKey } from "@/data/vital-limits";
import { staffPatients } from "@/data/mock-data";
import { useSession } from "@/components/layout/session-context";
import type { SessionConsultation, StaffPatient } from "@/types";

type Step = "patient" | "form" | "done";

const vitalFields: { key: VitalKey; placeholder: string; step: string }[] = [
  { key: "systolic", placeholder: "124", step: "1" },
  { key: "diastolic", placeholder: "78", step: "1" },
  { key: "heartRate", placeholder: "72", step: "1" },
  { key: "temperature", placeholder: "36,8", step: "0.1" },
  { key: "weight", placeholder: "68,4", step: "0.1" },
];

const emptyVitals: Record<VitalKey, string> = { systolic: "", diastolic: "", heartRate: "", temperature: "", weight: "" };

export function ConsultationFlow({ onClose, onOpenPatient }: { onClose: () => void; onOpenPatient: (patientId: string) => void }) {
  const { addConsultation } = useSession();
  const [step, setStep] = useState<Step>("patient");
  const [search, setSearch] = useState("");
  const [patient, setPatient] = useState<StaffPatient | null>(null);
  const [form, setForm] = useState({ reason: "", observations: "", conclusion: "" });
  const [vitals, setVitals] = useState<Record<VitalKey, string>>(emptyVitals);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const term = search.trim().toLowerCase();
  const matches = staffPatients.filter(item => `${item.name} ${item.id}`.toLowerCase().includes(term));

  const choose = (item: StaffPatient) => { setPatient(item); setErrors({}); setStep("form"); };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!patient) return;
    const found: Record<string, string> = {};
    if (form.reason.trim().length < 3) found.reason = "Renseignez le motif de la consultation.";
    if (form.conclusion.trim().length < 3) found.conclusion = "Renseignez la conclusion de la consultation.";
    (Object.keys(vitals) as VitalKey[]).forEach(key => {
      if (!vitals[key].trim()) return;
      const message = validateVital(key, vitals[key]);
      if (message) found[key] = message;
    });
    if (Object.keys(found).length) { setErrors(found); return; }
    const values: SessionConsultation["vitals"] = {};
    (Object.keys(vitals) as VitalKey[]).forEach(key => { if (vitals[key].trim()) values[key] = Number(vitals[key].replace(",", ".")); });
    addConsultation({ patientId: patient.id, reason: form.reason.trim(), observations: form.observations.trim(), conclusion: form.conclusion.trim(), vitals: values });
    setErrors({});
    setStep("done");
  };

  return <div className="modal-backdrop" onClick={onClose}><section className="modal-dialog modal-wide" role="dialog" aria-modal="true" aria-labelledby="consult-title" onClick={event=>event.stopPropagation()}>
    <div className="modal-head"><div><h2 id="consult-title">Nouvelle consultation</h2><p>{step === "patient" ? "Étape 1 sur 2 — choisir le patient" : step === "form" ? `Étape 2 sur 2 — ${patient?.name} • ${patient?.id}` : "Consultation enregistrée"}</p></div><button className="icon-button" onClick={onClose} aria-label="Fermer"><Icon name="x"/></button></div>

    {step === "patient" && <div className="modal-form">
      <label>Rechercher un patient<input value={search} onChange={event=>setSearch(event.target.value)} placeholder="Nom ou N° de dossier..." autoFocus/></label>
      {term ? <ul className="consult-list">{matches.length ? matches.map(item=><li key={item.id}><button type="button" onClick={()=>choose(item)}><span><strong>{item.name}</strong><small>{item.id} • {item.reason}</small></span><span className="consult-choose">Choisir</span></button></li>) : <li className="search-empty">Aucun patient trouvé</li>}</ul> : <p className="consult-hint">Tapez un nom ou un numéro de dossier pour afficher les patients.</p>}
    </div>}

    {step === "form" && patient && <form onSubmit={submit} noValidate>
      <div className="modal-form">
        <label htmlFor="consult-reason">Motif de la consultation<input id="consult-reason" value={form.reason} onChange={event=>setForm(current=>({...current,reason:event.target.value}))} aria-invalid={errors.reason ? true : undefined} aria-describedby={errors.reason ? "consult-reason-error" : undefined}/></label>
        {errors.reason && <p id="consult-reason-error" className="field-error"><Icon name="alert" size={12}/>{errors.reason}</p>}
        <label htmlFor="consult-observations">Observations (facultatives)<textarea id="consult-observations" value={form.observations} onChange={event=>setForm(current=>({...current,observations:event.target.value}))} placeholder="Examen clinique, éléments rapportés par le patient..."/></label>
        <p className="consult-section-title">Constantes (facultatives, bornes contrôlées)</p>
        <div className="consult-vitals">{vitalFields.map(field=><VitalInput key={field.key} id={`consult-${field.key}`} field={field.key} placeholder={field.placeholder} step={field.step} value={vitals[field.key]} error={errors[field.key]} onChange={value=>setVitals(current=>({...current,[field.key]:value}))}/>)}</div>
        <label htmlFor="consult-conclusion">Conclusion<textarea id="consult-conclusion" value={form.conclusion} onChange={event=>setForm(current=>({...current,conclusion:event.target.value}))} aria-invalid={errors.conclusion ? true : undefined} aria-describedby={errors.conclusion ? "consult-conclusion-error" : undefined}/></label>
        {errors.conclusion && <p id="consult-conclusion-error" className="field-error"><Icon name="alert" size={12}/>{errors.conclusion}</p>}
      </div>
      <div className="modal-actions"><Button variant="ghost" onClick={()=>setStep("patient")}>Changer de patient</Button><Button type="submit">Enregistrer la consultation</Button></div>
    </form>}

    {step === "done" && patient && <>
      <div className="modal-body"><p className="form-success"><Icon name="check" size={14}/>Consultation enregistrée pour cette session (données de démonstration).</p><p className="consult-hint">Elle apparaît dans le dossier de {patient.name} et dans « Patients récemment consultés ».</p></div>
      <div className="modal-actions"><Button variant="ghost" onClick={onClose}>Fermer</Button><Button onClick={()=>{ onClose(); onOpenPatient(patient.id); }}>Voir le dossier</Button></div>
    </>}
  </section></div>;
}
