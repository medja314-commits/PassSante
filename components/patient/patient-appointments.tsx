"use client";

import { useState } from "react";
import { appointmentHistory, upcomingAppointments } from "@/data/mock-data";
import type { AppointmentStatus, PatientAppointment } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";
import { PatientEmptyState, PatientLoadingState, PatientPageHeader } from "./patient-page-header";

function appointmentTone(status: AppointmentStatus) {
  if (status === "Confirmé" || status === "Terminé") return "green" as const;
  if (status === "En attente") return "amber" as const;
  if (status === "Modifié") return "blue" as const;
  if (status === "Non honoré") return "red" as const;
  return "neutral" as const;
}

function AppointmentRow({ appointment, history = false, onReport }: { appointment: PatientAppointment; history?: boolean; onReport?: () => void }) {
  return <article className="patient-appointment-row">
    <div className="appointment-mini-date"><strong>{appointment.day}</strong><span>{appointment.month}<small>{appointment.year}</small></span></div>
    <div className="appointment-row-main"><div><strong>{appointment.doctor}</strong><span>{appointment.specialty}</span></div><p>{appointment.reason}</p><small><Icon name="clock" size={13}/>{appointment.time}<Icon name="map" size={13}/>{appointment.facility} • {appointment.room}</small></div>
    <div className="appointment-row-actions"><Badge tone={appointmentTone(appointment.status)}>{appointment.status}</Badge>{history && appointment.reportAvailable && <button className="text-link" onClick={onReport}>Voir le compte rendu <Icon name="chevron" size={13}/></button>}</div>
  </article>;
}

export function PatientAppointments() {
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const [notice, setNotice] = useState("");
  const [loading] = useState(false);
  const nextAppointment = upcomingAppointments[0];
  const otherAppointments = upcomingAppointments.slice(1);

  return <main className="patient-content patient-subpage">
    <PatientPageHeader title="Mes rendez-vous" description="Consultez et gérez vos rendez-vous avec vos professionnels de santé." action={<Button icon="plus" onClick={()=>setNotice("Votre demande de rendez-vous a été transmise à l'établissement.")}>Prendre un rendez-vous</Button>}/>
    {notice && <div className="toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")} aria-label="Fermer"><Icon name="x"/></button></div>}
    {loading ? <PatientLoadingState/> : <>
      {nextAppointment ? <section className="patient-next-rdv">
        <div className="patient-next-rdv-top"><div><span className="eyebrow">PROCHAIN RENDEZ-VOUS</span><h2>{nextAppointment.reason}</h2></div><Badge tone="green"><Icon name="check" size={12}/>{nextAppointment.status}</Badge></div>
        <div className="patient-next-rdv-body"><div className="rdv-large-date"><strong>{nextAppointment.day}</strong><span>{nextAppointment.month}<small>{nextAppointment.year} • {nextAppointment.time}</small></span></div><div className="rdv-doctor"><span className="avatar avatar-doctor">KK</span><div><strong>{nextAppointment.doctor}</strong><span>{nextAppointment.specialty}</span><p><Icon name="map" size={14}/>{nextAppointment.facility} • {nextAppointment.room}</p></div></div><div className="rdv-reason"><small>MOTIF</small><strong>{nextAppointment.reason}</strong></div></div>
        <div className="patient-next-rdv-actions"><Button variant="soft" icon="edit" onClick={()=>setNotice("Votre demande de modification a été enregistrée.")}>Modifier le rendez-vous</Button><Button variant="ghost" icon="message" onClick={()=>setNotice("Clinique Centrale : +225 27 20 00 00 00")}>Contacter l'établissement</Button><p><Icon name="alert" size={13}/>Pour annuler, contactez directement l'établissement ou le personnel médical.</p></div>
      </section> : <PatientEmptyState icon={<Icon name="calendar" size={28}/>} title="Aucun rendez-vous à venir" description="Vos prochains rendez-vous apparaîtront ici."/>}
      <div className="patient-section-tabs"><button className={tab==="upcoming"?"active":""} onClick={()=>setTab("upcoming")}>À venir <span>{otherAppointments.length}</span></button><button className={tab==="history"?"active":""} onClick={()=>setTab("history")}>Historique <span>{appointmentHistory.length}</span></button></div>
      <section className="card patient-rdv-list"><div className="section-head"><div><h2>{tab==="upcoming"?"Rendez-vous à venir":"Rendez-vous passés"}</h2><p>{tab==="upcoming"?"Vos rendez-vous planifiés après le prochain rendez-vous":"Historique de vos consultations et rendez-vous"}</p></div></div>
        {tab === "upcoming" ? (otherAppointments.length ? otherAppointments.map(appointment=><AppointmentRow key={appointment.id} appointment={appointment}/>) : <PatientEmptyState icon={<Icon name="calendar"/>} title="Aucun autre rendez-vous" description="Vous n'avez pas d'autre rendez-vous planifié."/>) : (appointmentHistory.length ? appointmentHistory.map(appointment=><AppointmentRow key={appointment.id} appointment={appointment} history onReport={()=>setNotice(`Ouverture du compte rendu du ${appointment.date}.`)}/>) : <PatientEmptyState icon={<Icon name="clock"/>} title="Historique vide" description="Vos rendez-vous passés apparaîtront ici."/>)}
      </section>
    </>}
  </main>;
}
