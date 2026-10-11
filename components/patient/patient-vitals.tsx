"use client";

import { useState, type FormEvent } from "react";
import { vitalMeasurements as initialMeasurements } from "@/data/mock-data";
import type { VitalMeasurement } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";
import { VitalChart } from "@/components/charts";
import { PatientPageHeader } from "./patient-page-header";

type VitalForm = { systolic: string; diastolic: string; heartRate: string; temperature: string; weight: string; measuredAt: string };
const emptyForm: VitalForm = { systolic: "", diastolic: "", heartRate: "", temperature: "", weight: "", measuredAt: "" };

export function PatientVitals() {
  const [period, setPeriod] = useState("30 jours");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VitalForm>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const latest = measurements[0];
  const updateField = (field: keyof VitalForm, value: string) => setForm(current=>({...current,[field]:value}));
  const saveMeasurement = (event: FormEvent) => {
    event.preventDefault();
    const values = [form.systolic,form.diastolic,form.heartRate,form.temperature,form.weight];
    if (values.some(value=>!value) || !form.measuredAt) { setError("Renseignez toutes les valeurs et la date de la mesure."); return; }
    const systolic = Number(form.systolic), diastolic = Number(form.diastolic);
    if (systolic < 70 || systolic > 250 || diastolic < 40 || diastolic > 150) { setError("Vérifiez les valeurs de pression artérielle saisies."); return; }
    const measurement: VitalMeasurement = { id:`vital-${Date.now()}`, measuredAt:new Date(form.measuredAt).toLocaleString("fr-FR",{dateStyle:"medium",timeStyle:"short"}), systolic, diastolic, heartRate:Number(form.heartRate), temperature:Number(form.temperature), weight:Number(form.weight), source:"patient" };
    setMeasurements(current=>[measurement,...current]); setForm(emptyForm); setError(""); setShowForm(false); setNotice("Mesure ajoutée à l'historique de cette session uniquement.");
  };

  return <main className="patient-content patient-subpage">
    <PatientPageHeader title="Mes constantes" description="Suivez l'évolution de vos principales constantes de santé." action={<Button icon="plus" onClick={()=>setShowForm(true)}>Ajouter une mesure</Button>}/>
    {notice && <div className="toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")} aria-label="Fermer"><Icon name="x"/></button></div>}
    {showForm && <section className="card vital-entry-card"><div className="section-head"><div><h2>Ajouter une mesure</h2><p>Saisissez les valeurs relevées avec votre matériel personnel.</p></div><button className="icon-button" onClick={()=>setShowForm(false)} aria-label="Fermer"><Icon name="x"/></button></div><form className="vital-entry-form" onSubmit={saveMeasurement}>
      <label>Pression systolique<input type="number" value={form.systolic} onChange={event=>updateField("systolic",event.target.value)} placeholder="124"/><small>mmHg</small></label>
      <label>Pression diastolique<input type="number" value={form.diastolic} onChange={event=>updateField("diastolic",event.target.value)} placeholder="78"/><small>mmHg</small></label>
      <label>Fréquence cardiaque<input type="number" value={form.heartRate} onChange={event=>updateField("heartRate",event.target.value)} placeholder="72"/><small>bpm</small></label>
      <label>Température<input type="number" step="0.1" value={form.temperature} onChange={event=>updateField("temperature",event.target.value)} placeholder="36,8"/><small>°C</small></label>
      <label>Poids<input type="number" step="0.1" value={form.weight} onChange={event=>updateField("weight",event.target.value)} placeholder="68,4"/><small>kg</small></label>
      <label>Date et heure<input type="datetime-local" value={form.measuredAt} onChange={event=>updateField("measuredAt",event.target.value)}/></label>
      <div className="vital-form-submit">{error&&<p className="form-error"><Icon name="alert" size={14}/>{error}</p>}<Button type="submit">Enregistrer</Button></div>
    </form></section>}
    <div className="latest-vitals">
      <article><span className="vital-icon blue"><Icon name="activity"/></span><div><small>Pression artérielle</small><strong>{latest.systolic}<em>/{latest.diastolic}</em></strong><p>mmHg</p></div><Badge tone="green">Dans la norme</Badge></article>
      <article><span className="vital-icon red"><Icon name="heart"/></span><div><small>Fréquence cardiaque</small><strong>{latest.heartRate}</strong><p>bpm</p></div><Badge tone="green">Normal</Badge></article>
      <article><span className="vital-icon amber"><Icon name="activity"/></span><div><small>Température</small><strong>{latest.temperature.toFixed(1).replace(".",",")}</strong><p>°C</p></div><Badge tone="green">Normal</Badge></article>
      <article><span className="vital-icon purple"><Icon name="grid"/></span><div><small>Poids</small><strong>{latest.weight.toFixed(1).replace(".",",")}</strong><p>kg</p></div><span className="trend">− 0,8 kg</span></article>
    </div>
    <section className="card patient-vitals-chart"><div className="section-head"><div><h2>Évolution de vos constantes</h2><p>Dernière mesure : {latest.measuredAt}</p></div><select value={period} onChange={event=>setPeriod(event.target.value)} aria-label="Période"><option>7 jours</option><option>30 jours</option><option>3 mois</option></select></div>
      <div className="vital-chart-tabs"><button className="active">Pression artérielle</button><button>Fréquence cardiaque</button><button>Poids</button></div><VitalChart/>
    </section>
    <section className="card measurements-history"><div className="section-head"><div><h2>Historique des mesures</h2><p>Mesures saisies par vous et par vos professionnels de santé</p></div><Badge tone="neutral">{measurements.length} mesures</Badge></div>
      <div className="data-table"><table><thead><tr><th>DATE</th><th>TENSION</th><th>FRÉQUENCE CARDIAQUE</th><th>TEMPÉRATURE</th><th>POIDS</th><th>SOURCE</th></tr></thead><tbody>{measurements.map(measurement=><tr key={measurement.id}><td><strong>{measurement.measuredAt}</strong></td><td>{measurement.systolic}/{measurement.diastolic} mmHg</td><td>{measurement.heartRate} bpm</td><td>{measurement.temperature.toFixed(1).replace(".",",")} °C</td><td>{measurement.weight.toFixed(1).replace(".",",")} kg</td><td><Badge tone={measurement.source==="professional"?"green":"blue"}>{measurement.source==="professional"?"Professionnel":"Déclarée par vous"}</Badge></td></tr>)}</tbody></table></div>
    </section>
    <div className="patient-data-note"><Icon name="alert" size={18}/><p><strong>Information importante</strong>Les constantes saisies par vos soins sont des données déclaratives. Elles peuvent être vérifiées et complétées par un professionnel de santé.</p></div>
  </main>;
}
