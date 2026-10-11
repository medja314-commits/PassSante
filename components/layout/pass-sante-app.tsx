// TODO(Sidickk):
// Ajouter l'authentification et la gestion des sessions.
// Implémenter la vérification du rôle de l'utilisateur.
// Ajouter la déconnexion sécurisée.
// Protéger l'accès selon le rôle (hospital_staff, admin, patient).

// TODO(Merval):
// Vérifier la conformité avec le Design System.
// Optimiser les composants pour la réactivité mobile.
// Ajouter les transitions et animations si nécessaire.
// Tester l'accessibilité (ARIA labels, contraste, etc).

"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Icon, Logo, type IconName } from "@/components/ui";
import { VitalChart } from "@/components/charts";
import { VitalInput } from "@/components/patient/vital-input";
import { validateVital } from "@/data/vital-limits";
import { PatientAppointments } from "@/components/patient/patient-appointments";
import { PatientDocuments } from "@/components/patient/patient-documents";
import { PatientVitals } from "@/components/patient/patient-vitals";
import { AdminAuditLogs, AdminRoles } from "@/components/admin";
import { StaffAgenda } from "@/components/staff";
import { getPatientById, staffPatients } from "@/data/mock-data";
import type { StaffPatient } from "@/types";

const soon = "Bientôt disponible";
// Seul ce dossier dispose du détail des consultations, constantes et examens (démonstration).
const DEMO_RECORD_ID = "PS-2024-0812";

const proNav: { id: string; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "grid" },
  { id: "patient", label: "Patients", icon: "users" },
  { id: "agenda", label: "Agenda & RDV", icon: "calendar" },
  { id: "examens", label: "Examens / Labo", icon: "flask" },
  { id: "assistant", label: "Assistant IA (RAG)", icon: "sparkles" },
];

function ProSidebar({ view, setView, onMode, toValidate }: { view: string; setView: (v: string) => void; onMode: (v: "patient" | "admin") => void; toValidate: number }) {
  return <aside className="pro-sidebar">
    <Logo dark />
    <div className="doctor-card">
      <div className="avatar avatar-doctor">KK<span className="online"/></div>
      <div><strong>Dr. K. Konan</strong><span>Médecin généraliste</span></div>
      <Icon name="chevron" size={15}/>
    </div>
    <nav className="side-nav" aria-label="Navigation principale">
      <span className="nav-caption">ESPACE DE TRAVAIL</span>
      {proNav.map(item => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id || (item.id === "patient" && view === "patient-record") ? "active" : ""}><Icon name={item.icon}/><span>{item.label}</span>{item.id === "examens" && <i>{toValidate}</i>}</button>)}
    </nav>
    <div className="sidebar-footer">
      <span className="nav-caption">CHANGER D'ESPACE</span>
      <button onClick={() => onMode("patient")}><Icon name="home"/><span>Espace patient</span></button>
      <button onClick={() => onMode("admin")}><Icon name="shield"/><span>Administration</span></button>
      <small>PassSanté v2.4 • Session sécurisée</small>
    </div>
  </aside>;
}

function Topbar({ onMobileMenu, onNewPatient }: { onMobileMenu?: () => void; onNewPatient: () => void }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMobileMenu} aria-label="Ouvrir le menu"><Icon name="menu"/></button>
    <div className="global-search"><Icon name="search"/><input aria-label="Recherche globale" placeholder="Rechercher un patient par nom ou N° de dossier..." /><kbd>⌘ K</kbd></div>
    <div className="top-actions">
      <Button variant="soft" icon="plus" onClick={onNewPatient}>Nouveau patient</Button>
      <Button icon="plus" unavailable title={soon}>Consultation</Button>
      <button className="icon-button" aria-label="Notifications" aria-disabled="true" title={soon}><Icon name="bell"/><span className="notification-dot"/></button>
      <div className="mini-avatar">KK</div>
    </div>
  </header>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="workspace-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function DashboardView({ openPatient }: { openPatient: (patientId: string) => void }) {
  const appointments = [
    { time: "08:30", initials: "YK", name: "Yao Kouamé", type: "Consultation urgente", detail: "Douleur thoracique • Cabinet 2B", tone: "red" as const, patientId: "PS-2025-0148" },
    { time: "09:40", initials: "AM", name: "Aminata Mensah", type: "Suivi médical", detail: "Hypertension • Cabinet 2B", tone: "blue" as const, patientId: "PS-2024-0812" },
    { time: "11:00", initials: "FT", name: "Fatou Traoré", type: "Consultation prénatale", detail: "Suivi grossesse • Cabinet 3A", tone: "green" as const, patientId: "PS-2024-0934" },
    { time: "14:30", initials: "JB", name: "Jean-Baptiste Koffi", type: "Contrôle diabète", detail: "Résultats biologiques • Cabinet 2B", tone: "purple" as const, patientId: "PS-2023-0621" },
  ];
  const upcomingCount = appointments.filter(appointment => appointment.time > "09:52").length; // heure affichée dans la démonstration
  const resultsToValidate = labExams.filter(exam => exam.status === "À valider").length;
  const criticalResults = labExams.filter(exam => exam.status === "Critique").length;
  return <main className="workspace-page">
    <PageTitle eyebrow="MARDI 17 JUIN 2025" title="Bonjour, Dr. Konan" description="Voici l'essentiel de votre activité clinique aujourd'hui." action={<Button icon="plus" unavailable title={soon}>Démarrer une consultation</Button>}/>
    <div className="stat-grid">
      <article className="stat-card"><span className="stat-icon blue"><Icon name="calendar"/></span><div><small>Rendez-vous aujourd'hui</small><strong>{appointments.length}</strong><p><em>{upcomingCount}</em> consultations restantes</p></div><span className="stat-spark blue-bars"><i/><i/><i/><i/><i/></span></article>
      <article className="stat-card"><span className="stat-icon green"><Icon name="users"/></span><div><small>Patients suivis</small><strong>{staffPatients.length}</strong><p>Patients de la démonstration</p></div><span className="stat-spark green-bars"><i/><i/><i/><i/><i/></span></article>
      <article className="stat-card"><span className="stat-icon amber"><Icon name="flask"/></span><div><small>Résultats à valider</small><strong>{resultsToValidate}</strong><p><b>{criticalResults} prioritaire{criticalResults > 1 ? "s" : ""}</b></p></div><Badge tone="amber">À traiter</Badge></article>
      <article className="stat-card"><span className="stat-icon purple"><Icon name="file"/></span><div><small>Comptes-rendus</small><strong>5</strong><p>À finaliser aujourd'hui</p></div><Badge tone="purple">Brouillons</Badge></article>
    </div>
    <div className="dashboard-grid">
      <section className="card day-schedule">
        <div className="section-head"><div><h2>Agenda du jour</h2><p>{appointments.length} rendez-vous • {upcomingCount} à venir</p></div><button className="text-link" aria-disabled="true" title={soon}>Voir l'agenda <Icon name="chevron" size={14}/></button></div>
        <div className="schedule-list">{appointments.map(appointment => <button className="schedule-row" key={appointment.time} onClick={()=>openPatient(appointment.patientId)}>
          <time>{appointment.time}</time><span className={`schedule-line ${appointment.tone}`}/><span className={`list-avatar ${appointment.tone}`}>{appointment.initials}</span>
          <span className="schedule-person"><strong>{appointment.name}</strong><small>{appointment.detail}</small></span>
          <Badge tone={appointment.tone}>{appointment.type}</Badge><Icon name="chevron" size={15}/>
        </button>)}</div>
      </section>
      <aside className="dashboard-side">
        <section className="card task-card"><div className="section-head"><div><h2>À traiter</h2><p>Vos priorités cliniques</p></div><Badge tone="red">6 actions</Badge></div>
          <div className="task-list">
            <button aria-disabled="true" title={soon}><span className="task-check urgent"><Icon name="alert" size={14}/></span><p><strong>{criticalResults} résultat{criticalResults > 1 ? "s" : ""} critique{criticalResults > 1 ? "s" : ""}</strong><small>Biologie • reçus il y a 18 min</small></p><Icon name="chevron" size={14}/></button>
            <button aria-disabled="true" title={soon}><span className="task-check"><Icon name="file" size={14}/></span><p><strong>5 comptes-rendus à signer</strong><small>Dernière modification hier</small></p><Icon name="chevron" size={14}/></button>
            <button aria-disabled="true" title={soon}><span className="task-check blue"><Icon name="message" size={14}/></span><p><strong>3 messages patients</strong><small>1 message non lu</small></p><Icon name="chevron" size={14}/></button>
          </div>
        </section>
        <section className="card occupancy-card"><div className="section-head"><div><h2>Activité de la semaine</h2><p>Consultations réalisées</p></div><strong>42</strong></div><div className="week-bars">{[["LUN","75"],["MAR","92"],["MER","58"],["JEU","82"],["VEN","45"]].map(([day,value])=><div key={day}><span><i className={`bar-${value}`}/></span><small>{day}</small></div>)}</div><div className="occupancy-foot"><span><i/>Objectif hebdomadaire</span><b>84%</b></div></section>
      </aside>
    </div>
    <section className="card recent-patients"><div className="section-head"><div><h2>Patients récemment consultés</h2><p>Accès rapide aux derniers dossiers</p></div><button className="text-link" aria-disabled="true" title={soon}>Tous les patients <Icon name="chevron" size={14}/></button></div><div className="recent-grid">{staffPatients.slice(0,4).map((patient,index)=><button key={patient.id} onClick={()=>openPatient(patient.id)}><span className={`list-avatar avatar-${index}`}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.reason}</small></span><Badge tone={patient.tone}>{patient.status}</Badge></button>)}</div></section>
  </main>;
}

function PatientsView({ openPatient, onNewPatient }: { openPatient: (patientId: string) => void; onNewPatient: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");
  const filteredPatients = staffPatients.filter(patient => {
    const matchesQuery = `${patient.name} ${patient.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Tous" || patient.status === filter;
    return matchesQuery && matchesFilter;
  });
  return <main className="workspace-page">
    <PageTitle eyebrow="DOSSIERS MÉDICAUX" title="Patients" description="Consultez et gérez les dossiers de vos patients." action={<Button icon="plus" onClick={onNewPatient}>Nouveau patient</Button>}/>
    <div className="patient-summary-strip">
      <div><span className="summary-icon blue"><Icon name="users"/></span><p><strong>{staffPatients.length}</strong><small>Patients suivis</small></p></div>
      <div><span className="summary-icon green"><Icon name="check"/></span><p><strong>18</strong><small>Consultés ce mois</small></p></div>
      <div><span className="summary-icon amber"><Icon name="clock"/></span><p><strong>7</strong><small>Suivis à planifier</small></p></div>
      <div><span className="summary-icon red"><Icon name="alert"/></span><p><strong>{staffPatients.filter(patient => patient.alert).length}</strong><small>Points de vigilance</small></p></div>
    </div>
    <section className="card directory-card">
      <div className="directory-tools">
        <div className="inner-search patient-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rechercher par nom ou N° de dossier..." aria-label="Rechercher un patient"/></div>
        <div className="filter-pills">{["Tous","Suivi actif","À surveiller","Nouveau"].map(item=><button className={filter===item?"active":""} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div>
        <Button variant="soft" icon="filter" unavailable title={soon}>Plus de filtres</Button>
      </div>
      <div className="data-table patient-directory stack-mobile"><table><thead><tr><th>PATIENT</th><th>N° DE DOSSIER</th><th>DERNIÈRE CONSULTATION</th><th>MOTIF / SUIVI</th><th>PROCHAIN RDV</th><th>STATUT</th><th></th></tr></thead><tbody>{filteredPatients.map((patient,index)=><tr key={patient.id} onClick={()=>openPatient(patient.id)} className="clickable-row">
        <td className="stack-head"><div className="directory-patient"><span className={`list-avatar avatar-${index}`}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.age} • {patient.gender}{patient.alert&&<em><Icon name="alert" size={10}/>{patient.alert}</em>}</small></span></div></td>
        <td data-label="N° de dossier"><code>{patient.id}</code></td><td data-label="Dernière consultation">{patient.lastVisit}</td><td data-label="Motif / suivi"><strong>{patient.reason}</strong></td><td data-label="Prochain RDV">{patient.next}</td><td data-label="Statut"><Badge tone={patient.tone}>{patient.status}</Badge></td><td className="stack-action"><button className="icon-button" aria-label={`Actions pour ${patient.name}`} aria-disabled="true" title={soon} onClick={event=>event.stopPropagation()}><Icon name="more"/></button></td>
      </tr>)}</tbody></table></div>
      {filteredPatients.length === 0 && <div className="empty-state"><Icon name="search" size={26}/><strong>Aucun patient trouvé</strong><p>Modifiez votre recherche ou vos filtres.</p></div>}
      <div className="pagination"><span>Affichage de {filteredPatients.length} patients sur {staffPatients.length}</span><div><button aria-disabled="true" title={soon}>Précédent</button><button className="active" aria-disabled="true" title={soon}>1</button><button aria-disabled="true" title={soon}>2</button><button aria-disabled="true" title={soon}>3</button><button aria-disabled="true" title={soon}>Suivant</button></div></div>
    </section>
  </main>;
}

const labExams = [
  { id: "LAB-25148", patient: "Yao Kouamé", initials: "YK", exam: "Troponine ultrasensible", category: "Biochimie", requested: "Aujourd'hui, 08:42", received: "Il y a 18 min", status: "Critique", tone: "red" as const, result: "68 ng/L ↑" },
  { id: "LAB-25147", patient: "Aminata Mensah", initials: "AM", exam: "Bilan lipidique complet", category: "Biochimie", requested: "Hier, 14:20", received: "Aujourd'hui, 09:05", status: "À valider", tone: "amber" as const, result: "Disponible" },
  { id: "IMG-08421", patient: "Fatou Traoré", initials: "FT", exam: "Échographie obstétricale", category: "Imagerie", requested: "16 juin, 11:00", received: "—", status: "En cours", tone: "blue" as const, result: "—" },
  { id: "LAB-25139", patient: "Jean-Baptiste Koffi", initials: "JB", exam: "HbA1c + glycémie", category: "Hématologie", requested: "15 juin, 09:30", received: "16 juin, 16:10", status: "Validé", tone: "green" as const, result: "HbA1c 6,8%" },
  { id: "LAB-25132", patient: "Salimata N'Dri", initials: "SN", exam: "NFS complète", category: "Hématologie", requested: "14 juin, 15:15", received: "15 juin, 10:30", status: "Validé", tone: "green" as const, result: "Dans la norme" },
  { id: "IMG-08412", patient: "Oumar Diabaté", initials: "OD", exam: "Radiographie lombaire", category: "Imagerie", requested: "12 juin, 10:00", received: "13 juin, 12:45", status: "À valider", tone: "amber" as const, result: "Compte-rendu reçu" },
];

type LabExam = (typeof labExams)[number];

function ExamsOverview({ exams, setExams }: { exams: LabExam[]; setExams: (update: (current: LabExam[]) => LabExam[]) => void }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous");
  const [notice, setNotice] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const toValidate = exams.filter(exam => exam.status === "À valider").length;
  const criticalExams = exams.filter(exam => exam.status === "Critique");
  const pendingExam = exams.find(exam => exam.id === pendingId);
  const validateExam = (id: string) => {
    const validated = exams.find(exam => exam.id === id);
    setExams(current => current.map(exam => exam.id === id ? { ...exam, status: "Validé", tone: "green" as const } : exam));
    setPendingId(null);
    if (validated) setNotice(`Résultat validé : ${validated.exam} (${validated.patient}).`);
  };
  const filteredExams = exams.filter(exam => (`${exam.patient} ${exam.exam} ${exam.id}`.toLowerCase().includes(query.toLowerCase())) && (status === "Tous" || exam.status === status));
  return <main className="workspace-page">
    <PageTitle eyebrow="EXAMENS & LABORATOIRE" title="Résultats et demandes" description="Suivez les examens prescrits et validez les résultats reçus." action={<Button icon="plus" unavailable title={soon}>Nouvelle demande</Button>}/>
    {notice && <div className="toast workspace-toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")}><Icon name="x"/></button></div>}
    <div className="lab-stat-grid">
      <article><span className="stat-icon amber"><Icon name="clock"/></span><p><small>En attente</small><strong>{exams.filter(exam => exam.status === "En cours").length}</strong><em>Examens en cours</em></p></article>
      <article><span className="stat-icon blue"><Icon name="flask"/></span><p><small>À valider</small><strong>{toValidate}</strong><em>Action requise</em></p></article>
      <article className="critical"><span className="stat-icon red"><Icon name="alert"/></span><p><small>Résultats critiques</small><strong>{criticalExams.length}</strong><em>Action médicale requise</em></p><Badge tone="red">Prioritaire</Badge></article>
      <article><span className="stat-icon green"><Icon name="check"/></span><p><small>Validés</small><strong>{exams.filter(exam => exam.status === "Validé").length}</strong><em>Dans cette liste</em></p></article>
    </div>
    <div className="lab-layout">
      <section className="card lab-main">
        <div className="directory-tools lab-tools"><div className="inner-search patient-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Patient, examen ou référence..." aria-label="Rechercher un examen"/></div><select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Filtrer par statut"><option>Tous</option><option>Critique</option><option>À valider</option><option>En cours</option><option>Validé</option></select><Button variant="soft" icon="filter" unavailable title={soon}>Filtres</Button></div>
        <div className="data-table lab-table stack-mobile"><table><thead><tr><th>PATIENT</th><th>EXAMEN</th><th>DEMANDÉ LE</th><th>RÉSULTAT</th><th>STATUT</th><th></th></tr></thead><tbody>{filteredExams.map((exam,index)=><tr key={exam.id} className={exam.status==="Critique"?"critical-row":""}><td className="stack-head"><div className="directory-patient"><span className={`list-avatar avatar-${index}`}>{exam.initials}</span><span><strong>{exam.patient}</strong><small>{exam.id}</small></span></div></td><td data-label="Examen"><strong>{exam.exam}</strong><small className="table-subline">{exam.category}</small></td><td data-label="Demandé le">{exam.requested}<small className="table-subline">{exam.received!=="—"?`Reçu ${exam.received}`:"Résultat en attente"}</small></td><td data-label="Résultat" className={exam.status==="Critique"?"critical-value":""}>{exam.result}</td><td data-label="Statut"><Badge tone={exam.tone}>{exam.status}</Badge></td><td className="stack-action">{exam.status==="À valider" ? <button className="icon-button" onClick={()=>setPendingId(exam.id)} aria-label={`Valider ${exam.exam}`}><Icon name="check"/></button> : exam.status!=="Validé" && <button className="icon-button" aria-disabled="true" title={soon} aria-label={`Ouvrir ${exam.exam}`}><Icon name="chevron"/></button>}</td></tr>)}</tbody></table></div>
        <div className="pagination"><span>{filteredExams.length} examens affichés sur {exams.length}</span><div><button aria-disabled="true" title={soon}>Précédent</button><button className="active" aria-disabled="true" title={soon}>1</button><button aria-disabled="true" title={soon}>2</button><button aria-disabled="true" title={soon}>3</button><button aria-disabled="true" title={soon}>Suivant</button></div></div>
      </section>
      <aside className="lab-side">
        <section className="card critical-panel"><div className="section-head"><div><h2>Alertes critiques</h2><p>À prendre en charge rapidement</p></div><Badge tone="red">{criticalExams.length}</Badge></div>{criticalExams.map(exam=><article key={exam.id}><span className="alert-pulse"/><div><strong>{exam.exam}</strong><p>{exam.patient} • {exam.result}</p><small>{exam.received}</small></div><button aria-disabled="true" title={soon}><Icon name="chevron"/></button></article>)}</section>
        <section className="card lab-activity"><div className="section-head"><div><h2>Flux laboratoire</h2><p>Aujourd'hui</p></div><Icon name="activity"/></div><div><p><span className="flow-dot green"/><strong>09:05</strong><small>Bilan lipidique reçu</small></p><p><span className="flow-dot blue"/><strong>08:42</strong><small>Troponine transmise au labo</small></p><p><span className="flow-dot purple"/><strong>08:16</strong><small>NFS validée par BioLab</small></p><p><span className="flow-dot neutral"/><strong>07:54</strong><small>3 prélèvements enregistrés</small></p></div></section>
        <button className="import-result" aria-disabled="true" title={soon}><span><Icon name="download"/></span><strong>Importer un résultat externe</strong><small>PDF, JPG ou PNG • 10 Mo max.</small></button>
      </aside>
    </div>
    {pendingExam && <div className="modal-backdrop" onClick={()=>setPendingId(null)}><section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="validate-exam-title" onClick={e=>e.stopPropagation()}>
      <div className="modal-head"><div><h2 id="validate-exam-title">Valider ce résultat ?</h2><p>{pendingExam.patient} • {pendingExam.id}</p></div><button className="icon-button" onClick={()=>setPendingId(null)} aria-label="Fermer"><Icon name="x"/></button></div>
      <div className="modal-body"><p><strong>{pendingExam.exam}</strong> — {pendingExam.result}</p><p className="form-error"><Icon name="alert" size={14}/>Cette action marque le résultat comme validé. Elle ne peut pas être annulée depuis cet écran.</p></div>
      <div className="modal-actions"><Button variant="ghost" onClick={()=>setPendingId(null)}>Annuler</Button><Button onClick={()=>validateExam(pendingExam.id)}>Confirmer la validation</Button></div>
    </section></div>}
  </main>;
}

const examTypes = ["Bilan sanguin complet", "NFS complète", "Troponine ultrasensible", "Bilan lipidique", "HbA1c + glycémie", "Échographie abdominale", "Radiographie lombaire", "Électrocardiogramme"];

function ExamRequestModal({ patient, close }: { patient: StaffPatient; close: () => void }) {
  const [form, setForm] = useState({ exam: "", priority: "Routine", note: "" });
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm(current=>({...current,[field]:value}));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.exam) { setError("Sélectionnez l'examen à demander."); setBlocked(false); return; }
    setError(""); setBlocked(true);
  };
  return <div className="modal-backdrop" onClick={close}><section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="exam-request-title" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><h2 id="exam-request-title">Demander un examen</h2><p>{patient.name} • {patient.id}</p></div><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="x"/></button></div>
    <form onSubmit={submit} noValidate>
      <div className="modal-form">
        <label>Examen<select value={form.exam} onChange={e=>update("exam",e.target.value)} aria-required="true"><option value="">Sélectionner un examen</option>{examTypes.map(item=><option key={item}>{item}</option>)}</select></label>
        <label>Priorité<select value={form.priority} onChange={e=>update("priority",e.target.value)}><option>Routine</option><option>Urgent</option></select></label>
        <label>Note pour le laboratoire (facultative)<textarea value={form.note} onChange={e=>update("note",e.target.value)} placeholder="Renseignements utiles pour la réalisation de l'examen..."/></label>
        {error && <p className="form-error"><Icon name="alert" size={14}/>{error}</p>}
        {blocked && <p className="form-error"><Icon name="alert" size={14}/>Demande non envoyée, contactez la clinique.</p>}
      </div>
      <div className="modal-actions"><Button variant="ghost" onClick={close}>Annuler</Button><Button type="submit">Envoyer la demande</Button></div>
    </form>
  </section></div>;
}

function PatientRecord({ patient }: { patient: StaffPatient }) {
  const [tab, setTab] = useState("Consultations & CR");
  const [examOpen, setExamOpen] = useState(false);
  const tabs = ["Consultations & CR", "Constantes", "Prescriptions", "Examens & Labo"];
  const hasRecordDetails = patient.id === DEMO_RECORD_ID;
  return <main className="content">
    <div className="breadcrumb"><span>Patients</span><Icon name="chevron" size={13}/><b>Dossier #{patient.id}</b></div>
    <section className="patient-hero">
      <div className="avatar avatar-patient">{patient.initials}</div>
      <div className="patient-identity">
        <div className="identity-line"><h1>{patient.name}</h1><Badge tone="green">Dossier actif</Badge></div>
        <p>{patient.age} • {patient.gender}{patient.birthDate && ` • Née le ${patient.birthDate}`}</p>
        <div className="patient-meta"><span><b>N° dossier</b> {patient.id}</span><span><b>Téléphone</b> {patient.phone ?? "Non renseigné"}</span></div>
      </div>
      <div className="hero-badges">
        <div className="blood"><span>Groupe sanguin</span><strong>{patient.bloodGroup ?? "—"}</strong></div>
        {patient.allergy ? <Badge tone="red"><Icon name="alert" size={15}/>Allergie : {patient.allergy}</Badge> : patient.alert && <Badge tone="amber"><Icon name="alert" size={15}/>{patient.alert}</Badge>}
        <Button variant="soft" icon="more" unavailable title={soon}>Actions</Button>
      </div>
    </section>
    <div className="tab-bar">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t}{t === "Examens & Labo" && <i>{patientLabItems.length}</i>}</button>)}</div>
    {!hasRecordDetails ? <section className="card empty-state"><Icon name="file" size={26}/><strong>Détails non disponibles</strong><p>Le détail des consultations, constantes et examens de ce dossier n'est pas disponible dans cette démonstration.</p></section> : <>
      {tab === "Consultations & CR" && <Consultations/>}
      {tab === "Constantes" && <ConstantsView/>}
      {tab === "Prescriptions" && <Prescriptions/>}
      {tab === "Examens & Labo" && <LabView onRequestExam={()=>setExamOpen(true)}/>}
    </>}
    {examOpen && <ExamRequestModal patient={patient} close={()=>setExamOpen(false)}/>}
  </main>;
}

function Consultations() {
  return <div className="record-grid">
    <section className="card timeline-card">
      <div className="section-head"><div><h2>Historique médical</h2><p>Consultations et comptes-rendus</p></div><Button icon="plus" unavailable title={soon}>Nouveau compte-rendu</Button></div>
      <div className="timeline">
        <article>
          <div className="timeline-marker"><Icon name="stethoscope" size={16}/></div>
          <div className="timeline-date">AUJOURD'HUI, 09:40</div>
          <div className="consult-card">
            <div className="consult-head"><div><Badge tone="blue">Consultation</Badge><h3>Suivi hypertension artérielle</h3></div><button className="icon-button" aria-disabled="true" title={soon} aria-label="Plus d'options"><Icon name="more"/></button></div>
            <p>La patiente rapporte une amélioration globale. Tension stabilisée sous traitement. Pas de céphalées ni de vertiges depuis la dernière consultation.</p>
            <div className="diagnosis"><span>DIAGNOSTIC</span><strong>Hypertension essentielle — contrôlée</strong></div>
            <div className="doctor-sign"><span className="mini-avatar">KK</span><span><b>Dr. K. Konan</b><small>Médecine générale</small></span><Badge tone="green"><Icon name="check" size={12}/>Signé</Badge></div>
          </div>
        </article>
        <article>
          <div className="timeline-marker muted"><Icon name="flask" size={16}/></div>
          <div className="timeline-date">28 MAI 2025, 14:15</div>
          <div className="consult-card compact">
            <div className="consult-head"><div><Badge tone="purple">Résultat labo</Badge><h3>Bilan sanguin complet</h3></div><Badge tone="green">Valeurs normales</Badge></div>
            <p>Hémogramme, glycémie à jeun, bilan lipidique. Aucun marqueur anormal détecté.</p>
          </div>
        </article>
        <article>
          <div className="timeline-marker muted"><Icon name="file" size={16}/></div>
          <div className="timeline-date">12 AVRIL 2025, 10:30</div>
          <div className="consult-card compact"><div className="consult-head"><div><Badge tone="neutral">Ordonnance</Badge><h3>Renouvellement de traitement</h3></div></div><p>Amlodipine 5 mg — 1 comprimé par jour pendant 3 mois.</p></div>
        </article>
      </div>
    </section>
    <aside className="right-column">
      <section className="card"><div className="section-head"><div><h2>Dernières constantes</h2><p>Aujourd'hui à 09:32</p></div><button className="icon-button" aria-disabled="true" title={soon} aria-label="Modifier les constantes"><Icon name="edit"/></button></div>
        <div className="vitals-list">
          <div><span className="vital-icon blue"><Icon name="activity"/></span><p><small>Tension artérielle</small><strong>124/78 <em>mmHg</em></strong></p><Badge tone="green">Normal</Badge></div>
          <div><span className="vital-icon red"><Icon name="heart"/></span><p><small>Fréquence cardiaque</small><strong>72 <em>bpm</em></strong></p><Badge tone="green">Normal</Badge></div>
          <div><span className="vital-icon amber"><Icon name="activity"/></span><p><small>Température</small><strong>36,8 <em>°C</em></strong></p></div>
          <div><span className="vital-icon purple"><Icon name="grid"/></span><p><small>Poids</small><strong>68,4 <em>kg</em></strong></p><span className="trend">− 0,8 kg</span></div>
        </div>
        <button className="text-link" aria-disabled="true" title={soon}>Voir l'évolution des constantes <Icon name="chevron" size={14}/></button>
      </section>
      <section className="card next-card"><div className="section-head"><div><h2>Prochain rendez-vous</h2></div><Badge tone="blue">Confirmé</Badge></div><div className="appointment-date"><strong>24</strong><span>JUIN<small>2025</small></span></div><div className="appointment-info"><p><Icon name="clock"/>09:30 • Suivi médical</p><p><Icon name="map"/>Cabinet 2B — Clinique Centrale</p></div></section>
    </aside>
  </div>;
}

type QuickKey = "systolic" | "diastolic" | "temperature" | "weight";

// Saisie rapide (pro) : chaque valeur est contrôlée à la frappe. L'enregistrement reste indisponible.
function QuickVitalEntry() {
  const [values, setValues] = useState<Record<QuickKey, string>>({ systolic: "", diastolic: "", temperature: "", weight: "" });
  const [errors, setErrors] = useState<Partial<Record<QuickKey, string>>>({});
  const update = (field: QuickKey, value: string) => {
    setValues(current=>({...current,[field]:value}));
    setErrors(current=>({...current,[field]:validateVital(field, value) ?? undefined}));
  };
  return <aside className="card quick-entry"><form noValidate onSubmit={event=>event.preventDefault()}>
    <h2>Saisie rapide</h2><p>Ajouter les constantes du jour</p>
    <div className="vital-pair">
      <VitalInput id="quick-systolic" field="systolic" label="Tension systolique" placeholder="120" step="1" value={values.systolic} error={errors.systolic} onChange={value=>update("systolic",value)}/>
      <span className="vital-pair-sep" aria-hidden="true">/</span>
      <VitalInput id="quick-diastolic" field="diastolic" label="Tension diastolique" placeholder="80" step="1" value={values.diastolic} error={errors.diastolic} onChange={value=>update("diastolic",value)}/>
    </div>
    <VitalInput id="quick-temperature" field="temperature" placeholder="36,8" step="0.1" value={values.temperature} error={errors.temperature} onChange={value=>update("temperature",value)}/>
    <VitalInput id="quick-weight" field="weight" placeholder="68,4" step="0.1" value={values.weight} error={errors.weight} onChange={value=>update("weight",value)}/>
    <Button type="button" icon="plus" unavailable title={soon}>Enregistrer les mesures</Button>
  </form></aside>;
}

function ConstantsView() {
  return <div className="record-grid"><section className="card chart-card"><div className="section-head"><div><h2>Évolution de la tension</h2><p>Mesures des 30 derniers jours</p></div><div><Badge tone="blue">Systolique</Badge> <Badge tone="neutral">Diastolique</Badge></div></div><VitalChart/></section><QuickVitalEntry/></div>;
}

function Prescriptions() {
  const rows = [["Amlodipine","5 mg","1 cp / jour","3 mois","Actif"],["Paracétamol","500 mg","Si douleur, max. 3/j","7 jours","Terminé"],["Vitamine D3","1000 UI","1 dose / jour","6 mois","Actif"]];
  return <section className="card table-card"><div className="section-head"><div><h2>Prescriptions & traitements</h2><p>Ordonnances actives et historique</p></div><Button icon="plus" unavailable title={soon}>Nouvelle ordonnance</Button></div><div className="data-table"><table><thead><tr><th>Médicament</th><th>Dosage</th><th>Posologie</th><th>Durée</th><th>Statut</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.slice(0,4).map((c,j)=><td key={j}>{j===0?<strong>{c}</strong>:c}</td>)}<td><Badge tone={r[4]==="Actif"?"green":"neutral"}>{r[4]}</Badge></td><td><Icon name="more"/></td></tr>)}</tbody></table></div></section>;
}

const patientLabItems = ["Bilan sanguin complet", "Échographie abdominale", "Bilan thyroïdien"];

function LabView({ onRequestExam }: { onRequestExam: () => void }) {
  return <div className="record-grid"><section className="card table-card"><div className="section-head"><div><h2>Examens & laboratoire</h2><p>Résultats, demandes et documents</p></div><Button icon="plus" onClick={onRequestExam}>Demander un examen</Button></div>{patientLabItems.map((x,i)=><div className="document-row" key={x}><span className="document-icon"><Icon name={i===1?"activity":"flask"}/></span><div><strong>{x}</strong><small>{i===0?"28 mai 2025 • Laboratoire Central":i===1?"Demandé le 10 juin 2025":"12 avril 2025 • BioLab"}</small></div><Badge tone={i===1?"amber":"green"}>{i===1?"En attente":"Validé"}</Badge><button className="icon-button" aria-disabled="true" title={soon} aria-label={`Action pour ${x}`}><Icon name={i===1?"more":"download"}/></button></div>)}</section><aside className="card upload-zone"><span><Icon name="download" size={28}/></span><h2>Importer un résultat</h2><p>Déposez un fichier PDF, JPG ou PNG ici</p><Button variant="soft" unavailable title={soon}>Parcourir les fichiers</Button></aside></div>;
}

function AssistantView() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setMessages(current => [...current, content]);
    setDraft("");
  };
  return <main className="assistant-page">
    <div className="assistant-title"><div><span className="ai-symbol"><Icon name="sparkles"/></span><div><h1>Assistant clinique IA</h1><p>Dossier d'Aminata Mensah • Données fictives</p></div></div><Badge tone="green"><span className="pulse"/>Démonstration</Badge></div>
    <div className="warning-banner"><Icon name="alert"/><p><strong>Mode démonstration :</strong> réponses préenregistrées, ne pas utiliser pour une décision clinique.</p></div>
    <div className="split-chat">
      <section className="chat-panel">
        <div className="chat-scroll">
          <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><p>Bonjour Dr. Konan. Cette démonstration affiche des réponses préenregistrées sur le dossier d'Aminata Mensah.</p></div></div>
          <div className="user-message"><p>Peux-tu me résumer l'évolution de sa tension et les traitements actuels ?</p></div>
          <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Réponse préenregistrée</b><div className="ai-answer"><p>La tension d'Aminata s'est <strong>progressivement stabilisée</strong> au cours des 8 dernières semaines, passant d'une moyenne de 142/91 mmHg à <strong>124/78 mmHg</strong> lors de la dernière mesure.<sup>1</sup></p><p>Son traitement actuel comprend :</p><ul><li><strong>Amlodipine 5 mg</strong> — 1 comprimé par jour<sup>2</sup></li><li><strong>Vitamine D3 1000 UI</strong> — 1 dose par jour<sup>3</sup></li></ul><div className="ai-note"><Icon name="check"/>Interactions médicamenteuses : non évaluées dans cette démonstration.</div></div></div></div>
          {messages.map((message,index) => <div className="chat-exchange" key={`${message}-${index}`}>
            <div className="user-message"><p>{message}</p></div>
            <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><div className="ai-answer"><p>Réponse préenregistrée : elle n'a pas été générée à partir de votre question.</p><p>Exemple affiché à titre illustratif : la tension de référence est <strong>124/78 mmHg</strong> et le traitement actif est inchangé.<sup>1</sup></p><div className="ai-note"><Icon name="file" size={14}/>Démonstration : aucune donnée réelle n'est consultée.</div></div></div></div>
          </div>)}
        </div>
        <div className="suggestions"><button type="button" onClick={()=>setDraft("Prépare une synthèse pour la prochaine consultation.")}>Préparer la prochaine consultation</button><button type="button" onClick={()=>setDraft("Signale-moi les dernières valeurs anormales du dossier.")}>Signaler les valeurs anormales</button></div>
        <form className="chat-input" onSubmit={sendMessage}><textarea value={draft} onChange={event=>setDraft(event.target.value)} aria-label="Message" placeholder="Interroger le dossier médical..."/><button type="submit" aria-label="Envoyer" disabled={!draft.trim()}><Icon name="send"/></button><small><Icon name="lock" size={12}/>Mode démonstration : réponses préenregistrées</small></form>
      </section>
      <aside className="sources-panel"><div className="sources-head"><div><h2>Références & sources</h2><p>3 exemples de sources (démonstration)</p></div><Icon name="file"/></div>
        <div className="source-card selected"><span className="source-number">1</span><div className="source-type"><Icon name="activity" size={14}/>CONSTANTES</div><strong>Évolution tension artérielle</strong><p>« TA 124/78 mmHg, pouls 72 bpm. Amélioration par rapport à la mesure précédente... »</p><small>10 juin 2025, 09:32</small></div>
        <div className="source-card"><span className="source-number">2</span><div className="source-type"><Icon name="file" size={14}/>ORDONNANCE</div><strong>Prescription du 12 avril</strong><p>« Amlodipine 5 mg, 1 comprimé par voie orale le matin, pendant 3 mois. »</p><small>Dr. K. Konan • Signée</small></div>
        <div className="source-card"><span className="source-number">3</span><div className="source-type"><Icon name="file" size={14}/>ORDONNANCE</div><strong>Supplémentation vitamine D</strong><p>« Vitamine D3 1000 UI, 1 dose par jour pendant 6 mois. »</p><small>Dr. K. Konan • Signée</small></div>
        <div className="privacy-note"><Icon name="shield"/><p><strong>Données fictives</strong><br/>Aucun accès réel n'est journalisé en démonstration.</p></div>
      </aside>
    </div>
  </main>;
}

const newPatientSexes = ["Femme", "Homme"];

function NewPatientModal({ close }: { close: () => void }) {
  const [form, setForm] = useState({ name: "", birthDate: "", gender: "", phone: "", reason: "" });
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm(current=>({...current,[field]:value}));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 2) { setError("Renseignez le nom complet du patient."); setBlocked(false); return; }
    if (!form.birthDate || new Date(form.birthDate) > new Date()) { setError("Indiquez une date de naissance valide."); setBlocked(false); return; }
    if (!form.gender) { setError("Sélectionnez le sexe du patient."); setBlocked(false); return; }
    if (form.phone && !/^\+?[\d\s]{8,}$/.test(form.phone.trim())) { setError("Vérifiez le numéro de téléphone."); setBlocked(false); return; }
    setError(""); setBlocked(true);
  };
  return <div className="modal-backdrop" onClick={close}><section className="role-modal" role="dialog" aria-modal="true" aria-labelledby="new-patient-title" onClick={e=>e.stopPropagation()}>
    <div className="modal-head"><div><h2 id="new-patient-title">Nouveau patient</h2><p>Renseignez l'identité du patient.</p></div><button className="icon-button" onClick={close} aria-label="Fermer"><Icon name="x"/></button></div>
    <form onSubmit={submit} noValidate>
      <div className="modal-form">
        <label>Nom complet<input value={form.name} onChange={e=>update("name",e.target.value)} aria-required="true" placeholder="Prénom Nom"/></label>
        <label>Date de naissance<input type="date" value={form.birthDate} onChange={e=>update("birthDate",e.target.value)} aria-required="true"/></label>
        <label>Sexe<select value={form.gender} onChange={e=>update("gender",e.target.value)} aria-required="true"><option value="">Sélectionner</option>{newPatientSexes.map(item=><option key={item}>{item}</option>)}</select></label>
        <label>Téléphone (facultatif)<input type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)} placeholder="+225 07 00 00 00 00"/></label>
        <label>Motif de consultation (facultatif)<textarea value={form.reason} onChange={e=>update("reason",e.target.value)} placeholder="Motif de la première consultation..."/></label>
        {error && <p className="form-error"><Icon name="alert" size={14}/>{error}</p>}
        {blocked && <p className="form-error"><Icon name="alert" size={14}/>Dossier non créé : l'enregistrement n'est pas encore connecté. Contactez la clinique.</p>}
      </div>
      <div className="modal-actions"><Button variant="ghost" onClick={close}>Annuler</Button><Button type="submit">Créer le dossier</Button></div>
    </form>
  </section></div>;
}

function ProApp({ onMode, initialView = "patient", onView, onOpenPatient, patientId }: { onMode: (v: "patient" | "admin") => void; initialView?: string; onView: (view: string) => void; onOpenPatient: (patientId: string) => void; patientId?: string }) {
  const [view, setView] = useState(initialView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [exams, setExams] = useState(labExams);
  const toValidate = exams.filter(exam => exam.status === "À valider").length;
  const patient = patientId ? getPatientById(patientId) : undefined;
  const renderView = () => {
    if (view === "dashboard") return <DashboardView openPatient={onOpenPatient}/>;
    if (view === "patient") return <PatientsView openPatient={onOpenPatient} onNewPatient={()=>setShowNewPatient(true)}/>;
    if (view === "patient-record") return patient ? <PatientRecord key={patient.id} patient={patient}/> : <main className="content"><section className="card empty-state"><Icon name="search" size={26}/><strong>Dossier introuvable</strong><p>Aucun dossier ne correspond à cet identifiant.</p></section></main>;
    if (view === "agenda") return <StaffAgenda onOpenPatient={onOpenPatient}/>;
    if (view === "examens") return <ExamsOverview exams={exams} setExams={setExams}/>;
    return <AssistantView/>;
  };
  return <div className="pro-app">
    <div className={mobileOpen ? "sidebar-wrap open" : "sidebar-wrap"}><ProSidebar view={view} setView={(v)=>{setView(v);setMobileOpen(false);onView(v)}} onMode={onMode} toValidate={toValidate}/><button className="sidebar-overlay" onClick={()=>setMobileOpen(false)} aria-label="Fermer le menu"/></div>
    <div className="pro-main"><Topbar onMobileMenu={()=>setMobileOpen(true)} onNewPatient={()=>setShowNewPatient(true)}/>{renderView()}</div>
    {showNewPatient && <NewPatientModal close={()=>setShowNewPatient(false)}/>}
  </div>;
}

function PatientApp({ onMode, page = "home", onNavigate }: { onMode: (v: "pro" | "admin") => void; page?: string; onNavigate: (page: string) => void }) {
  const [notice, setNotice] = useState("");
  if (page === "assistant") return <PatientAssistant onBack={()=>onNavigate("home")}/>;
  const renderPatientPage = () => {
    if (page === "rdv") return <PatientAppointments/>;
    if (page === "documents") return <PatientDocuments/>;
    if (page === "constantes") return <PatientVitals/>;
    return <main className="patient-content">
      <div className="welcome"><div><p>Bonjour Aminata,</p><h1>Comment allez-vous aujourd'hui ?</h1></div><span className="sun-art"><Icon name="heart" size={34}/></span></div>
      {notice && <div className="toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")}><Icon name="x"/></button></div>}
      <section className="next-appointment">
        <div className="appointment-top"><div><span className="eyebrow">PROCHAIN RENDEZ-VOUS</span><h2>Consultation de suivi</h2></div><Badge tone="green">Confirmé</Badge></div>
        <div className="appointment-main"><div className="date-block"><strong>24</strong><span>JUIN<small>Mardi • 09:30</small></span></div><div className="physician"><span className="avatar avatar-doctor">KK</span><div><strong>Dr. Koffi Konan</strong><span>Médecin généraliste</span><small><Icon name="map" size={13}/>Clinique Centrale • Cabinet 2B</small></div></div></div>
        <div className="appointment-actions"><Button variant="soft" icon="edit" unavailable title={soon}>Bientôt disponible</Button><Button variant="ghost" icon="message" onClick={()=>setNotice("Clinique Centrale : +225 27 20 00 00 00")}>Contacter</Button><button className="text-link" aria-disabled="true" title={soon}>Voir le trajet <Icon name="chevron" size={14}/></button></div>
      </section>
      <div className="patient-grid">
        <section className="patient-card results-card"><div className="card-title"><span className="round-icon purple"><Icon name="flask"/></span><div><h2>Derniers résultats</h2><p>Vos examens récents</p></div><button className="text-link" onClick={()=>onNavigate("documents")}>Tout voir <Icon name="chevron" size={13}/></button></div><div className="result-item"><span className="doc-thumb"><Icon name="file"/></span><div><strong>Bilan sanguin complet</strong><small>28 mai 2025 • PDF, 1,2 Mo</small></div><Badge tone="green">Disponible</Badge><button className="icon-button" aria-disabled="true" title={soon} aria-label="Télécharger"><Icon name="download"/></button></div><div className="result-item"><span className="doc-thumb blue"><Icon name="activity"/></span><div><strong>Électrocardiogramme</strong><small>12 avril 2025 • PDF, 860 Ko</small></div><Badge tone="green">Disponible</Badge><button className="icon-button" aria-disabled="true" title={soon} aria-label="Télécharger"><Icon name="download"/></button></div></section>
        <section className="patient-card personal-vitals"><div className="card-title"><span className="round-icon blue"><Icon name="activity"/></span><div><h2>Mes constantes</h2><p>Tension artérielle • 30 jours</p></div><select aria-label="Période"><option>30 jours</option><option>7 jours</option></select></div><div className="current-value"><strong>124<small>/78</small></strong><span>mmHg<Badge tone="green">Dans la norme</Badge></span></div><VitalChart patient/><Button icon="plus" onClick={()=>onNavigate("constantes")}>Saisir ma tension / température</Button></section>
      </div>
      <section className="health-tip"><span><Icon name="heart" size={26}/></span><div><strong>Le conseil santé du jour</strong><p>Une marche de 30 minutes aide à maintenir une bonne santé cardiovasculaire.</p></div><button aria-disabled="true" title={soon} aria-label="Fermer le conseil"><Icon name="x"/></button></section>
    </main>;
  };
  return <div className="patient-app">
    <header className="patient-top"><Logo/><div><button className="icon-button" aria-disabled="true" title={soon} aria-label="Notifications"><Icon name="bell"/><span className="notification-dot"/></button><button className="patient-avatar" onClick={()=>onMode("pro")}>AM</button></div></header>
    {renderPatientPage()}
    <nav className="bottom-nav">{[
      ["home","Accueil","home"],["rdv","Mes RDV","calendar"],["documents","Documents","file"],["constantes","Constantes","activity"],["assistant","Assistant IA","message"]
    ].map(([id,label,icon])=><button key={id} onClick={()=>onNavigate(id)} className={page===id?"active":""}><Icon name={icon as IconName}/><span>{label}</span></button>)}</nav>
  </div>;
}

function PatientAssistant({ onBack }: { onBack: () => void }) {
  return <div className="patient-assistant"><header><button className="icon-button back" onClick={onBack} aria-label="Retour à l'accueil"><Icon name="chevron"/></button><Logo/><span className="patient-avatar">AM</span></header><div className="warning-banner"><Icon name="alert"/><p><strong>Information importante</strong>L'assistant ne remplace pas un diagnostic médical. En cas d'urgence, contactez les secours.</p></div><main><div className="assistant-welcome"><span className="ai-symbol large"><Icon name="sparkles" size={30}/></span><h1>Comment puis-je vous aider ?</h1><p>Posez une question générale sur votre santé ou la préparation de votre prochain rendez-vous.</p></div><div className="question-chips"><button aria-disabled="true" title={soon}>Comment préparer ma consultation ?</button><button aria-disabled="true" title={soon}>Comprendre ma tension artérielle</button><button aria-disabled="true" title={soon}>Conseils pour mieux dormir</button></div></main><div className="patient-chatbox"><textarea placeholder="Écrivez votre question ici..." aria-label="Votre question"/><button aria-disabled="true" title={soon} aria-label="Envoyer"><Icon name="send"/></button><small>Ne partagez pas d'information sensible dans vos messages.</small></div></div>;
}

const users = [
  ["Dr. Koffi Konan","k.konan@passsante.ci","Personnel hospitalier","Actif","KK"],
  ["Aminata Mensah","a.mensah@email.ci","Patient","Actif","AM"],
  ["Sophie Kouassi","s.kouassi@passsante.ci","Administrateur","Actif","SK"],
  ["Dr. Yao N'Guessan","y.nguessan@passsante.ci","Personnel hospitalier","Suspendu","YN"],
  ["Mariam Traoré","m.traore@email.ci","Patient","Actif","MT"],
];

function AdminApp({ onMode, initialPage = "users", onPage }: { onMode: (v: "pro" | "patient") => void; initialPage?: string; onPage: (page: string) => void }) {
  const [page, setPage] = useState(initialPage);
  const [modal, setModal] = useState(false);
  const changePage = (nextPage: string) => { setPage(nextPage); onPage(nextPage); };
  return <div className="admin-app"><aside className="admin-sidebar"><Logo dark/><nav><span className="nav-caption">ADMINISTRATION</span><button className={page==="users"?"active":""} onClick={()=>changePage("users")}><Icon name="users"/>Utilisateurs</button><button className={page==="roles"?"active":""} onClick={()=>changePage("roles")}><Icon name="key"/>Rôles & permissions</button><button className={page==="logs"?"active":""} onClick={()=>changePage("logs")}><Icon name="shield"/>Journaux d'audit</button></nav><div className="admin-profile"><div className="mini-avatar">SK</div><div><strong>Sophie Kouassi</strong><span>Super administratrice</span></div><button onClick={()=>onMode("pro")} aria-label="Passer à l'espace professionnel"><Icon name="chevron"/></button></div></aside><div className="admin-main"><header className="admin-topbar"><div className="global-search"><Icon name="search"/><input placeholder="Rechercher dans l'administration..."/></div><button className="icon-button" aria-disabled="true" title={soon} aria-label="Notifications"><Icon name="bell"/></button></header><nav className="admin-mobile-nav"><button className={page==="users"?"active":""} onClick={()=>changePage("users")}><Icon name="users"/>Utilisateurs</button><button className={page==="roles"?"active":""} onClick={()=>changePage("roles")}><Icon name="key"/>Rôles</button><button className={page==="logs"?"active":""} onClick={()=>changePage("logs")}><Icon name="shield"/>Audit</button></nav>{page==="logs"?<AdminAuditLogs/>:page==="roles"?<AdminRoles/>:<UsersPage openModal={()=>setModal(true)}/>}</div>{modal&&<RoleModal close={()=>setModal(false)}/>}</div>;
}

function UsersPage({openModal}:{openModal:()=>void}) {
  return <main className="admin-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Gestion des utilisateurs</h1><p>Gérez les comptes, les rôles et les autorisations d'accès.</p></div><Button icon="plus" unavailable title={soon}>Inviter un utilisateur</Button></div><div className="metrics-row"><div><span className="metric-icon blue"><Icon name="users"/></span><p><small>Utilisateurs actifs</small><strong>1 248</strong><em>+12 ce mois</em></p></div><div><span className="metric-icon green"><Icon name="stethoscope"/></span><p><small>Personnel hospitalier</small><strong>86</strong><em>7 rôles distincts</em></p></div><div><span className="metric-icon purple"><Icon name="shield"/></span><p><small>Administrateurs</small><strong>8</strong><em>2 super admins</em></p></div></div><section className="card admin-table"><div className="table-tools"><div className="inner-search"><Icon name="search"/><input placeholder="Nom, email ou identifiant..."/></div><Button variant="soft" icon="filter" unavailable title={soon}>Filtrer</Button><span>1 248 utilisateurs</span></div><div className="data-table"><table><thead><tr><th>UTILISATEUR</th><th>RÔLE</th><th>STATUT</th><th>DERNIÈRE CONNEXION</th><th></th></tr></thead><tbody>{users.map((u,i)=><tr key={u[1]}><td><div className="user-cell"><span className={`user-avatar avatar-${i}`}>{u[4]}</span><div><strong>{u[0]}</strong><small>{u[1]}</small></div></div></td><td><Badge tone={u[2]==="Patient"?"blue":u[2]==="Administrateur"?"purple":"neutral"}>{u[2]}</Badge></td><td><span className={`status ${u[3]==="Actif"?"active":"suspended"}`}><i/>{u[3]}</span></td><td>{i===1?"Aujourd'hui, 09:42":i===2?"Aujourd'hui, 08:15":i===0?"Hier, 17:36":"12 juin 2025"}</td><td><button className="icon-button" onClick={openModal} aria-label={`Modifier les rôles de ${u[0]}`}><Icon name="more"/></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Affichage de 1 à 5 sur 1 248</span><div><button aria-disabled="true" title={soon}>Précédent</button><button className="active" aria-disabled="true" title={soon}>1</button><button aria-disabled="true" title={soon}>2</button><button aria-disabled="true" title={soon}>3</button><button aria-disabled="true" title={soon}>Suivant</button></div></div></section></main>;
}

function RoleModal({close}:{close:()=>void}) {
  return <div className="modal-backdrop" onClick={close}><section className="role-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Modifier les rôles</h2><p>Dr. Koffi Konan • k.konan@passsante.ci</p></div><button className="icon-button" onClick={close}><Icon name="x"/></button></div><div className="modal-body"><label className="role-option selected"><input type="checkbox" defaultChecked/><span><strong>Personnel hospitalier</strong><small>Accès aux dossiers patients et outils cliniques</small></span><Icon name="check"/></label><label className="role-option"><input type="checkbox"/><span><strong>Administrateur</strong><small>Gestion des utilisateurs et configuration</small></span></label></div><div className="modal-actions"><Button variant="ghost" onClick={close}>Annuler</Button><Button unavailable title={soon}>Enregistrer les modifications</Button></div></section></div>;
}

export type PassSanteArea = "pro" | "patient" | "patient-assistant" | "admin";

export default function PassSanteApp({ area = "pro", view = "patient", patientId }: { area?: PassSanteArea; view?: string; patientId?: string }) {
  const router = useRouter();
  const goToArea = (nextArea: "pro" | "patient" | "admin") => router.push(nextArea === "patient" ? "/espace-patient" : nextArea === "admin" ? "/admin/users" : "/patients/PS-2024-0812");
  const openPatient = (id: string) => router.push(`/patients/${id}`);
  const professionalRoutes: Record<string,string> = { patient:"/patients", dashboard:"/dashboard", agenda:"/agenda", examens:"/examens", assistant:"/assistant" };
  const patientRoutes: Record<string,string> = { home:"/espace-patient", rdv:"/espace-patient/rdv", documents:"/espace-patient/documents", constantes:"/espace-patient/constantes", assistant:"/espace-patient/assistant" };
  if (area === "patient" || area === "patient-assistant") return <PatientApp page={area==="patient-assistant"?"assistant":view} onMode={goToArea} onNavigate={page=>router.push(patientRoutes[page] ?? patientRoutes.home)}/>;
  if (area === "admin") return <AdminApp initialPage={view} onMode={goToArea} onPage={page=>router.push(`/admin/${page}`)}/>;
  return <ProApp initialView={view} patientId={patientId} onMode={goToArea} onOpenPatient={openPatient} onView={nextView=>router.push(professionalRoutes[nextView] ?? professionalRoutes.patient)}/>;
}
