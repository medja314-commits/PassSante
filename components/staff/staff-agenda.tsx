"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Badge, Button, Icon } from "@/components/ui";
import { isWeekend, monthGrid, monthLabel, nowTime, planningDateLabel, planningDay, planningWeekdayName, todayWeekIndex, workWeek } from "@/data/dates";
import { useSession, type SessionAppointment } from "@/components/layout/session-context";
import { useRole } from "@/lib/role-context";
import { can } from "@/lib/rbac";
import { logAction } from "@/lib/audit";

const soon = "Bientôt disponible";
const rooms = ["Cabinet 2B", "Cabinet 3A"];

// Date locale au format AAAA-MM-JJ, pour comparer avec le champ date.
function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// Rendez-vous du jour : ils sont affichés dans la colonne d'aujourd'hui. Seuls les patients avec dossier sont cliquables.
const dayAppointments = [
  { time: "08:30", initials: "YK", name: "Yao Kouamé", reason: "Consultation urgente", room: "Cabinet 2B", tone: "red" as const, status: "Urgent" as const, patientId: "PS-2025-0148", short: "Yao Kouamé" },
  { time: "09:40", initials: "AM", name: "Aminata Mensah", reason: "Suivi hypertension", room: "Cabinet 2B", tone: "blue" as const, status: "Confirmé" as const, patientId: "PS-2024-0812", short: "Aminata Mensah" },
  { time: "11:00", initials: "FT", name: "Fatou Traoré", reason: "Suivi de grossesse", room: "Cabinet 3A", tone: "green" as const, status: "Confirmé" as const, patientId: "PS-2024-0934", short: "Fatou Traoré" },
  { time: "14:30", initials: "JB", name: "Jean-Baptiste Koffi", reason: "Contrôle diabète", room: "Cabinet 2B", tone: "purple" as const, status: "Confirmé" as const, patientId: "PS-2023-0621", short: "J.-B. Koffi" },
];

// Événements de la semaine (colonne = index 0 lundi à 4 vendredi). Les classes fixent la position verticale.
const todayClasses = ["event-mar-0830", "event-mar-0940", "event-mar-1100", "event-mar-1430"];
const weekEvents = [
  { col: 0, cls: "event-lun-0900", tone: "blue", time: "09:00", name: "Karim Bamba", sub: "Consultation" },
  { col: 0, cls: "event-lun-1400", tone: "green", time: "14:00", name: "Awa Diomandé", sub: "Suivi médical" },
  { col: 2, cls: "event-mer-1000", tone: "blue", time: "10:00", name: "Oumar Diabaté", sub: "Consultation • 2B", patientId: "PS-2024-0309" },
  { col: 2, cls: "event-mer-1530", tone: "amber", time: "15:30", name: "Réunion clinique", sub: "Salle de staff" },
  { col: 3, cls: "event-jeu-0830", tone: "green", time: "08:30", name: "Salimata N'Dri", sub: "Bilan annuel • 2B", patientId: "PS-2025-0207" },
  { col: 3, cls: "event-jeu-1330", tone: "blue", time: "13:30", name: "Marc Assi", sub: "Suivi traitement" },
  { col: 4, cls: "event-ven-0930", tone: "purple", time: "09:30", name: "Louise Yao", sub: "Contrôle • 2B" },
  { col: 4, cls: "event-ven-1500", tone: "blue", time: "15:00", name: "Adama Bamba", sub: "Consultation" },
];

function NewAppointmentModal({ close, onCreate }: { close: () => void; onCreate: (input: Omit<SessionAppointment, "id">) => void }) {
  const { patients } = useSession();
  const [form, setForm] = useState({ patientId: "", date: "", time: "", reason: "", room: rooms[0] });
  const [error, setError] = useState("");
  const update = (field: keyof typeof form, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const patient = patients.find(item => item.id === form.patientId);
    if (!patient) { setError("Sélectionnez le patient."); return; }
    if (!form.date) { setError("Indiquez la date du rendez-vous."); return; }
    if (form.date < localDateKey(new Date())) { setError("La date du rendez-vous est passée."); return; }
    if (!form.time) { setError("Indiquez l'heure du rendez-vous."); return; }
    if (!form.reason.trim()) { setError("Indiquez le motif du rendez-vous."); return; }
    setError("");
    onCreate({ patientId: patient.id, patientName: patient.name, date: form.date, time: form.time, reason: form.reason.trim(), room: form.room });
    close();
  };
  return <div className="modal-backdrop" onClick={close}><section className="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="new-appointment-title" onClick={event=>event.stopPropagation()}>
    <div className="modal-head"><div><h2 id="new-appointment-title">Nouveau rendez-vous</h2><p>Planifiez une consultation pour un patient.</p></div><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="x"/></button></div>
    <form onSubmit={submit} noValidate>
      <div className="modal-form">
        <label>Patient<select value={form.patientId} onChange={event=>update("patientId",event.target.value)} aria-required="true"><option value="">Sélectionner un patient</option>{patients.map(patient=><option key={patient.id} value={patient.id}>{patient.name} • {patient.id}</option>)}</select></label>
        <label>Date<input type="date" value={form.date} onChange={event=>update("date",event.target.value)} aria-required="true"/></label>
        <label>Heure<input type="time" value={form.time} onChange={event=>update("time",event.target.value)} aria-required="true"/></label>
        <label>Salle<select value={form.room} onChange={event=>update("room",event.target.value)}>{rooms.map(room=><option key={room}>{room}</option>)}</select></label>
        <label>Motif<textarea value={form.reason} onChange={event=>update("reason",event.target.value)} aria-required="true" placeholder="Motif de la consultation..."/></label>
        {error && <p className="form-error"><Icon name="alert" size={14}/>{error}</p>}
      </div>
      <div className="modal-actions"><Button variant="ghost" onClick={close}>Annuler</Button><Button type="submit">Enregistrer le rendez-vous</Button></div>
    </form>
  </section></div>;
}

export function StaffAgenda({ onOpenPatient }: { onOpenPatient: (patientId: string) => void }) {
  const { appointments, addAppointment } = useSession();
  const { role } = useRole();
  const [showNew, setShowNew] = useState(false);
  const now = new Date();
  // Week-end : l'agenda montre la semaine du lundi suivant (jour de référence, voir planningDay).
  const weekend = isWeekend(now);
  const planned = planningDay(now);
  const today = todayWeekIndex(planned);
  const week = workWeek(planned);
  const weekTitle = `${week[0].getDate()} – ${week[4].getDate()} ${week[4].toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
  const grid = monthGrid(now);
  const confirmed = dayAppointments.filter(appointment => appointment.status === "Confirmé").length;
  const upcoming = weekend ? dayAppointments.length : dayAppointments.filter(appointment => appointment.time > nowTime(now)).length;
  const confirmedShare = dayAppointments.length ? Math.round((confirmed / dayAppointments.length) * 100) : 0;
  const todayEvents = today >= 0 ? dayAppointments.map((appointment, index) => ({ col: today, cls: todayClasses[index], tone: appointment.tone, time: appointment.time, name: appointment.short, sub: `${appointment.status === "Urgent" ? "Urgence" : "Suivi"} • ${appointment.room.replace("Cabinet ", "")}`, patientId: appointment.patientId })) : [];
  const events = [...weekEvents, ...todayEvents];

  // Ouvre le dossier au clic et au clavier, seulement si le patient a un dossier.
  const openable = (patientId?: string) => patientId ? {
    role: "button",
    tabIndex: 0,
    onClick: () => onOpenPatient(patientId),
    onKeyDown: (event: KeyboardEvent) => { if (event.key === "Enter") onOpenPatient(patientId); },
  } : {};

  return <main className="workspace-page staff-agenda-page">
    <div className="workspace-heading"><div><span className="eyebrow">AGENDA CLINIQUE</span><h1>Agenda & rendez-vous</h1><p>Visualisez votre planning et les rendez-vous programmés.</p></div>{can(role, "create", "rdv") && <Button icon="plus" onClick={()=>setShowNew(true)}>Nouveau rendez-vous</Button>}</div>
    <div className="agenda-summary">
      <article><span className="stat-icon blue"><Icon name="calendar"/></span><div><small>{weekend ? `Rendez-vous ${planningWeekdayName(now)}` : "Rendez-vous aujourd'hui"}</small><strong>{dayAppointments.length}</strong><p>{upcoming} consultation{upcoming > 1 ? "s" : ""} restante{upcoming > 1 ? "s" : ""}</p></div></article>
      <article><span className="stat-icon green"><Icon name="check"/></span><div><small>Confirmés</small><strong>{confirmed}</strong><p>{confirmedShare}% du planning</p></div></article>
      <article><span className="stat-icon amber"><Icon name="clock"/></span><div><small>En attente</small><strong>0</strong><p>Confirmation requise</p></div></article>
      <article><span className="stat-icon purple"><Icon name="activity"/></span><div><small>Créneaux disponibles</small><strong>3</strong><p>Cette semaine</p></div></article>
    </div>
    <div className="agenda-layout">
      <section className="card agenda-calendar">
        <div className="agenda-toolbar">
          <div className="agenda-date-nav"><button className="icon-button" aria-label="Semaine précédente" aria-disabled="true" title={soon}><Icon name="chevron"/></button><button className="today-button" aria-disabled="true" title={soon}>Aujourd'hui</button><button className="icon-button next" aria-label="Semaine suivante" aria-disabled="true" title={soon}><Icon name="chevron"/></button><h2>{weekTitle}</h2></div>
          <div className="agenda-view-switch"><button aria-disabled="true" title={soon}>Jour</button><button className="active" aria-disabled="true" title={soon}>Semaine</button><button aria-disabled="true" title={soon}>Mois</button></div>
        </div>
        <div className="agenda-week-scroll">
          <div className="agenda-week">
            <div className="agenda-corner">GMT</div>
            {week.map((day,index)=><div className={`agenda-day-head ${index===today?"active":""}`} key={day.toISOString()}><span>{day.toLocaleDateString("fr-FR",{weekday:"short"}).replace(".","").toUpperCase()}.</span><strong>{day.getDate()}</strong></div>)}
            <div className="agenda-hours">{["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"].map(time=><span key={time}>{time}</span>)}</div>
            {week.map((day,index)=><div className={`agenda-day-column${index===today?" today":""}`} key={`col-${index}`}>
              {index===today && !weekend && <span className="current-time"><i/>{nowTime(now)}</span>}
              {events.filter(event=>event.col===index).map(event=><article key={`${event.cls}-${event.name}`} className={`calendar-event ${event.cls} ${event.tone}${"patientId" in event && event.patientId ? " clickable-event" : ""}`} {...openable("patientId" in event ? event.patientId : undefined)}><strong>{event.time}</strong><span>{event.name}</span><small>{event.sub}</small></article>)}
            </div>)}
          </div>
        </div>
      </section>
      <aside className="agenda-side">
        <section className="card mini-calendar"><div className="mini-calendar-head"><button aria-disabled="true" title={soon} aria-label="Mois précédent"><Icon name="chevron" size={14}/></button><strong>{monthLabel(now).replace(/^./, c=>c.toUpperCase())}</strong><button className="next" aria-disabled="true" title={soon} aria-label="Mois suivant"><Icon name="chevron" size={14}/></button></div><div className="mini-calendar-grid">{["L","M","M","J","V","S","D"].map((day,index)=><b key={`${day}-${index}`}>{day}</b>)}{grid.map((cell,index)=><span key={index} className={`${cell.outside?"outside":""} ${cell.today?"selected":""}`}>{cell.date}</span>)}</div></section>
        <section className="card today-list"><div className="section-head"><div><h2>{weekend ? `Prochains rendez-vous — ${planningWeekdayName(now)}` : "Aujourd'hui"}</h2><p>{dayAppointments.length} rendez-vous • {upcoming} à venir</p></div><Badge tone="blue">{planningDateLabel(now)}</Badge></div>{dayAppointments.map(appointment=><article key={appointment.time} {...openable(appointment.patientId)}><time>{appointment.time}</time><span className={`list-avatar ${appointment.tone}`}>{appointment.initials}</span><div><strong>{appointment.name}</strong><p>{appointment.reason}</p><small><Icon name="map" size={11}/>{appointment.room}</small></div><Badge tone={appointment.tone}>{appointment.status === "Urgent" ? "Urgent" : "Confirmé"}</Badge></article>)}<button className="agenda-all-link" aria-disabled="true" title={soon}>Voir tous les rendez-vous <Icon name="chevron" size={14}/></button></section>
        {appointments.length > 0 && <section className="card today-list"><div className="section-head"><div><h2>Créés pendant cette session</h2><p>Non conservés après rechargement</p></div><Badge tone="blue">{appointments.length}</Badge></div>{appointments.map(item=><article key={item.id} {...openable(item.patientId)}><time>{item.time}</time><span className="list-avatar blue">{item.patientName.split(/\s+/).slice(0,2).map(part=>part[0]).join("").toUpperCase()}</span><div><strong>{item.patientName}</strong><p>{item.reason}</p><small><Icon name="map" size={11}/>{item.room} • {new Date(`${item.date}T12:00:00`).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}</small></div></article>)}</section>}
        <section className="card agenda-legend"><strong>Légende</strong><div><span><i className="blue"/>Consultation</span><span><i className="green"/>Suivi</span><span><i className="red"/>Urgence</span><span><i className="purple"/>Contrôle</span></div></section>
      </aside>
    </div>
    {showNew && <NewAppointmentModal close={()=>setShowNew(false)} onCreate={input=>{ const created = addAppointment(input); logAction(role, "create", "rdv", created.id); }}/>}
  </main>;
}
