import type { KeyboardEvent } from "react";
import { Badge, Button, Icon } from "@/components/ui";

const soon = "Bientôt disponible";

// Seuls les patients disposant d'un dossier (voir staffPatients) sont cliquables.
const dayAppointments = [
  { time: "08:30", initials: "YK", name: "Yao Kouamé", reason: "Consultation urgente", room: "Cabinet 2B", tone: "red" as const, patientId: "PS-2025-0148" },
  { time: "09:40", initials: "AM", name: "Aminata Mensah", reason: "Suivi hypertension", room: "Cabinet 2B", tone: "blue" as const, patientId: "PS-2024-0812" },
  { time: "11:00", initials: "FT", name: "Fatou Traoré", reason: "Suivi de grossesse", room: "Cabinet 3A", tone: "green" as const, patientId: "PS-2024-0934" },
  { time: "14:30", initials: "JB", name: "Jean-Baptiste Koffi", reason: "Contrôle diabète", room: "Cabinet 2B", tone: "purple" as const, patientId: "PS-2023-0621" },
];

const monthDays = [
  ["26","27","28","29","30","31","1"],
  ["2","3","4","5","6","7","8"],
  ["9","10","11","12","13","14","15"],
  ["16","17","18","19","20","21","22"],
  ["23","24","25","26","27","28","29"],
  ["30","1","2","3","4","5","6"],
];

export function StaffAgenda({ onOpenPatient }: { onOpenPatient: (patientId: string) => void }) {
  // Rend un élément ouvrable au clic (et au clavier) seulement s'il a un dossier.
  const openable = (patientId?: string) => patientId ? {
    role: "button",
    tabIndex: 0,
    className: "clickable-event",
    onClick: () => onOpenPatient(patientId),
    onKeyDown: (event: KeyboardEvent) => { if (event.key === "Enter") onOpenPatient(patientId); },
  } : {};

  return <main className="workspace-page staff-agenda-page">
    <div className="workspace-heading"><div><span className="eyebrow">AGENDA CLINIQUE</span><h1>Agenda & rendez-vous</h1><p>Visualisez votre planning et les rendez-vous programmés.</p></div><Button icon="plus" disabled title={soon}>Nouveau rendez-vous</Button></div>
    <div className="agenda-summary">
      <article><span className="stat-icon blue"><Icon name="calendar"/></span><div><small>Rendez-vous aujourd'hui</small><strong>12</strong><p>4 consultations restantes</p></div></article>
      <article><span className="stat-icon green"><Icon name="check"/></span><div><small>Confirmés</small><strong>10</strong><p>83% du planning</p></div></article>
      <article><span className="stat-icon amber"><Icon name="clock"/></span><div><small>En attente</small><strong>2</strong><p>Confirmation requise</p></div></article>
      <article><span className="stat-icon purple"><Icon name="activity"/></span><div><small>Créneaux disponibles</small><strong>3</strong><p>Cette semaine</p></div></article>
    </div>
    <div className="agenda-layout">
      <section className="card agenda-calendar">
        <div className="agenda-toolbar">
          <div className="agenda-date-nav"><button className="icon-button" aria-label="Semaine précédente" disabled title={soon}><Icon name="chevron"/></button><button className="today-button" disabled title={soon}>Aujourd'hui</button><button className="icon-button next" aria-label="Semaine suivante" disabled title={soon}><Icon name="chevron"/></button><h2>16 – 20 juin 2025</h2></div>
          <div className="agenda-view-switch"><button disabled title={soon}>Jour</button><button className="active" disabled title={soon}>Semaine</button><button disabled title={soon}>Mois</button></div>
        </div>
        <div className="agenda-week-scroll">
          <div className="agenda-week">
            <div className="agenda-corner">GMT</div>
            {[["LUN.","16"],["MAR.","17"],["MER.","18"],["JEU.","19"],["VEN.","20"]].map(([day,date])=><div className={`agenda-day-head ${date==="17"?"active":""}`} key={date}><span>{day}</span><strong>{date}</strong></div>)}
            <div className="agenda-hours">{["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(time=><span key={time}>{time}</span>)}</div>
            <div className="agenda-day-column"><article className="calendar-event event-lun-0900 blue"><strong>09:00</strong><span>Karim Bamba</span><small>Consultation</small></article><article className="calendar-event event-lun-1400 green"><strong>14:00</strong><span>Awa Diomandé</span><small>Suivi médical</small></article></div>
            <div className="agenda-day-column today"><span className="current-time"><i/>09:52</span><article className="calendar-event event-mar-0830 red" {...openable("PS-2025-0148")}><strong>08:30</strong><span>Yao Kouamé</span><small>Urgence • 2B</small></article><article className="calendar-event event-mar-0940 blue" {...openable("PS-2024-0812")}><strong>09:40</strong><span>Aminata Mensah</span><small>Suivi • 2B</small></article><article className="calendar-event event-mar-1100 green" {...openable("PS-2024-0934")}><strong>11:00</strong><span>Fatou Traoré</span><small>Suivi grossesse • 3A</small></article><article className="calendar-event event-mar-1430 purple" {...openable("PS-2023-0621")}><strong>14:30</strong><span>J.-B. Koffi</span><small>Contrôle • 2B</small></article></div>
            <div className="agenda-day-column"><article className="calendar-event event-mer-1000 blue" {...openable("PS-2024-0309")}><strong>10:00</strong><span>Oumar Diabaté</span><small>Consultation • 2B</small></article><article className="calendar-event event-mer-1530 amber"><strong>15:30</strong><span>Réunion clinique</span><small>Salle de staff</small></article></div>
            <div className="agenda-day-column"><article className="calendar-event event-jeu-0830 green" {...openable("PS-2025-0207")}><strong>08:30</strong><span>Salimata N'Dri</span><small>Bilan annuel • 2B</small></article><article className="calendar-event event-jeu-1330 blue"><strong>13:30</strong><span>Marc Assi</span><small>Suivi traitement</small></article></div>
            <div className="agenda-day-column"><article className="calendar-event event-ven-0930 purple"><strong>09:30</strong><span>Louise Yao</span><small>Contrôle • 2B</small></article><article className="calendar-event event-ven-1500 blue"><strong>15:00</strong><span>Adama Bamba</span><small>Consultation</small></article></div>
          </div>
        </div>
      </section>
      <aside className="agenda-side">
        <section className="card mini-calendar"><div className="mini-calendar-head"><button disabled title={soon} aria-label="Mois précédent"><Icon name="chevron" size={14}/></button><strong>Juin 2025</strong><button className="next" disabled title={soon} aria-label="Mois suivant"><Icon name="chevron" size={14}/></button></div><div className="mini-calendar-grid">{["L","M","M","J","V","S","D"].map((day,index)=><b key={`${day}-${index}`}>{day}</b>)}{monthDays.flat().map((date,index)=><span key={`${date}-${index}`} className={`${index<6||index>34?"outside":""} ${date==="17"&&index===22?"selected":""}`}>{date}</span>)}</div></section>
        <section className="card today-list"><div className="section-head"><div><h2>Aujourd'hui</h2><p>12 rendez-vous • 4 à venir</p></div><Badge tone="blue">17 juin</Badge></div>{dayAppointments.map(appointment=><article key={appointment.time} {...openable(appointment.patientId)}><time>{appointment.time}</time><span className={`list-avatar ${appointment.tone}`}>{appointment.initials}</span><div><strong>{appointment.name}</strong><p>{appointment.reason}</p><small><Icon name="map" size={11}/>{appointment.room}</small></div><Badge tone={appointment.tone}>{appointment.time==="08:30"?"Urgent":"Confirmé"}</Badge></article>)}<button className="agenda-all-link" disabled title={soon}>Voir tous les rendez-vous <Icon name="chevron" size={14}/></button></section>
        <section className="card agenda-legend"><strong>Légende</strong><div><span><i className="blue"/>Consultation</span><span><i className="green"/>Suivi</span><span><i className="red"/>Urgence</span><span><i className="purple"/>Contrôle</span></div></section>
      </aside>
    </div>
  </main>;
}
