"use client";

import { useState, type FormEvent } from "react";
import { vitalMeasurements as initialMeasurements } from "@/data/mock-data";
import { validateVital, vitalLimits, type VitalKey } from "@/data/vital-limits";
import type { VitalMeasurement } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";
import { VitalChart } from "@/components/charts";
import { PatientPageHeader } from "./patient-page-header";
import { fullDateTime, offsetFromInput } from "@/data/dates";
import { VitalInput } from "./vital-input";

type VitalForm = { systolic: string; diastolic: string; heartRate: string; temperature: string; weight: string; measuredAt: string };
type VitalErrors = Partial<Record<keyof VitalForm, string>>;
const emptyForm: VitalForm = { systolic: "", diastolic: "", heartRate: "", temperature: "", weight: "", measuredAt: "" };

export function PatientVitals() {
  const [period, setPeriod] = useState("30 jours");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VitalForm>(emptyForm);
  const [errors, setErrors] = useState<VitalErrors>({});
  const [notice, setNotice] = useState("");
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const latest = measurements[0];
  const updateField = (field: keyof VitalForm, value: string) => {
    setForm(current=>({...current,[field]:value}));
    setErrors(current=>({...current,[field]:undefined}));
  };
  const saveMeasurement = (event: FormEvent) => {
    event.preventDefault();
    const found: VitalErrors = {};
    (Object.keys(vitalLimits) as VitalKey[]).forEach(key => {
      const message = validateVital(key, form[key]);
      if (message) found[key] = message;
    });
    if (!form.measuredAt) found.measuredAt = "Indiquez la date et l'heure de la mesure.";
    if (Object.keys(found).length) { setErrors(found); return; }
    const measurement: VitalMeasurement = { id:`vital-${Date.now()}`, measuredAt:{ offset: offsetFromInput(form.measuredAt.slice(0,10)), time: form.measuredAt.slice(11,16) }, systolic:Number(form.systolic), diastolic:Number(form.diastolic), heartRate:Number(form.heartRate), temperature:Number(form.temperature.replace(",",".")), weight:Number(form.weight.replace(",",".")), source:"patient" };
    setMeasurements(current=>[measurement,...current]); setForm(emptyForm); setErrors({}); setShowForm(false); setNotice("Mesure ajoutée à l'historique de cette session uniquement.");
  };
  const hasErrors = Object.keys(errors).length > 0;

  return <main className="patient-content patient-subpage">
    <PatientPageHeader title="Mes constantes" description="Suivez l'évolution de vos principales constantes de santé." action={<Button icon="plus" onClick={()=>setShowForm(true)}>Ajouter une mesure</Button>}/>
    {notice && <div className="toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")} aria-label="Fermer"><Icon name="x"/></button></div>}
    {showForm && <section className="card vital-entry-card"><div className="section-head"><div><h2>Ajouter une mesure</h2><p>Saisissez les valeurs relevées avec votre matériel personnel.</p></div><button className="icon-button" onClick={()=>setShowForm(false)} aria-label="Fermer"><Icon name="x"/></button></div><form className="vital-entry-form" onSubmit={saveMeasurement} noValidate>
      <VitalInput id="vital-systolic" field="systolic" placeholder="124" step="1" value={form.systolic} error={errors.systolic} onChange={value=>updateField("systolic",value)}/>
      <VitalInput id="vital-diastolic" field="diastolic" placeholder="78" step="1" value={form.diastolic} error={errors.diastolic} onChange={value=>updateField("diastolic",value)}/>
      <VitalInput id="vital-heart-rate" field="heartRate" placeholder="72" step="1" value={form.heartRate} error={errors.heartRate} onChange={value=>updateField("heartRate",value)}/>
      <VitalInput id="vital-temperature" field="temperature" placeholder="36,8" step="0.1" value={form.temperature} error={errors.temperature} onChange={value=>updateField("temperature",value)}/>
      <VitalInput id="vital-weight" field="weight" placeholder="68,4" step="0.1" value={form.weight} error={errors.weight} onChange={value=>updateField("weight",value)}/>
      <div className="vital-field">
        <label htmlFor="vital-measured-at">Date et heure</label>
        <input id="vital-measured-at" type="datetime-local" value={form.measuredAt} onChange={event=>updateField("measuredAt",event.target.value)} aria-invalid={errors.measuredAt ? true : undefined} aria-describedby={errors.measuredAt ? "vital-measured-at-error" : undefined}/>
        {errors.measuredAt && <p id="vital-measured-at-error" className="field-error"><Icon name="alert" size={12}/>{errors.measuredAt}</p>}
      </div>
      <div className="vital-form-submit">{hasErrors&&<p className="form-error"><Icon name="alert" size={14}/>Corrigez les champs signalés avant d'enregistrer.</p>}<Button type="submit">Enregistrer</Button></div>
    </form></section>}
    <div className="latest-vitals">
      <article><span className="vital-icon blue"><Icon name="activity"/></span><div><small>Pression artérielle</small><strong>{latest.systolic}<em>/{latest.diastolic}</em></strong><p>mmHg</p></div><Badge tone="green">Dans la norme</Badge></article>
      <article><span className="vital-icon red"><Icon name="heart"/></span><div><small>Fréquence cardiaque</small><strong>{latest.heartRate}</strong><p>bpm</p></div><Badge tone="green">Normal</Badge></article>
      <article><span className="vital-icon amber"><Icon name="activity"/></span><div><small>Température</small><strong>{latest.temperature.toFixed(1).replace(".",",")}</strong><p>°C</p></div><Badge tone="green">Normal</Badge></article>
      <article><span className="vital-icon purple"><Icon name="grid"/></span><div><small>Poids</small><strong>{latest.weight.toFixed(1).replace(".",",")}</strong><p>kg</p></div><span className="trend">− 0,8 kg</span></article>
    </div>
    <section className="card patient-vitals-chart"><div className="section-head"><div><h2>Évolution de vos constantes</h2><p>Dernière mesure : {fullDateTime(latest.measuredAt)}</p></div><select value={period} onChange={event=>setPeriod(event.target.value)} aria-label="Période"><option>7 jours</option><option>30 jours</option><option>3 mois</option></select></div>
      <div className="vital-chart-tabs"><button className="active">Pression artérielle</button><button>Fréquence cardiaque</button><button>Poids</button></div><VitalChart/>
    </section>
    <section className="card measurements-history"><div className="section-head"><div><h2>Historique des mesures</h2><p>Mesures saisies par vous et par vos professionnels de santé</p></div><Badge tone="neutral">{measurements.length} mesures</Badge></div>
      <div className="data-table stack-mobile"><table role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader">DATE</th><th role="columnheader">TENSION</th><th role="columnheader">FRÉQUENCE CARDIAQUE</th><th role="columnheader">TEMPÉRATURE</th><th role="columnheader">POIDS</th><th role="columnheader">SOURCE</th></tr></thead><tbody role="rowgroup">{measurements.map(measurement=><tr role="row" key={measurement.id}><td role="cell" className="stack-head"><strong>{fullDateTime(measurement.measuredAt)}</strong></td><td role="cell" data-label="Tension">{measurement.systolic}/{measurement.diastolic} mmHg</td><td role="cell" data-label="Fréquence cardiaque">{measurement.heartRate} bpm</td><td role="cell" data-label="Température">{measurement.temperature.toFixed(1).replace(".",",")} °C</td><td role="cell" data-label="Poids">{measurement.weight.toFixed(1).replace(".",",")} kg</td><td role="cell" data-label="Source"><Badge tone={measurement.source==="professional"?"green":"blue"}>{measurement.source==="professional"?"Professionnel":"Déclarée par vous"}</Badge></td></tr>)}</tbody></table></div>
    </section>
    <div className="patient-data-note"><Icon name="alert" size={18}/><p><strong>Information importante</strong>Les constantes saisies par vos soins sont des données déclaratives. Elles peuvent être vérifiées et complétées par un professionnel de santé.</p></div>
  </main>;
}
