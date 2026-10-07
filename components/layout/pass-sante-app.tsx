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
import { PatientAppointments } from "@/components/patient/patient-appointments";
import { PatientDocuments } from "@/components/patient/patient-documents";
import { PatientVitals } from "@/components/patient/patient-vitals";
import { AdminAuditLogs, AdminRoles } from "@/components/admin";
import { StaffAgenda } from "@/components/staff";

const proNav: { id: string; label: string; icon: IconName }[] = [
  { id: "dashboard", label: "Tableau de bord", icon: "grid" },
  { id: "patient", label: "Patients", icon: "users" },
  { id: "agenda", label: "Agenda & RDV", icon: "calendar" },
  { id: "examens", label: "Examens / Labo", icon: "flask" },
  { id: "assistant", label: "Assistant IA (RAG)", icon: "sparkles" },
];

function ProSidebar({ view, setView, onMode }: { view: string; setView: (v: string) => void; onMode: (v: "patient" | "admin") => void }) {
  return <aside className="pro-sidebar">
    <Logo dark />
    <div className="doctor-card">
      <div className="avatar avatar-doctor">KK<span className="online"/></div>
      <div><strong>Dr. K. Konan</strong><span>Médecin généraliste</span></div>
      <Icon name="chevron" size={15}/>
    </div>
    <nav className="side-nav" aria-label="Navigation principale">
      <span className="nav-caption">ESPACE DE TRAVAIL</span>
      {proNav.map(item => <button key={item.id} onClick={() => setView(item.id)} className={view === item.id || (item.id === "patient" && view === "patient-record") ? "active" : ""}><Icon name={item.icon}/><span>{item.label}</span>{item.id === "examens" && <i>8</i>}</button>)}
    </nav>
    <div className="sidebar-footer">
      <span className="nav-caption">CHANGER D'ESPACE</span>
      <button onClick={() => onMode("patient")}><Icon name="home"/><span>Espace patient</span></button>
      <button onClick={() => onMode("admin")}><Icon name="shield"/><span>Administration</span></button>
      <small>PassSanté v2.4 • Session sécurisée</small>
    </div>
  </aside>;
}

function Topbar({ onMobileMenu }: { onMobileMenu?: () => void }) {
  return <header className="topbar">
    <button className="mobile-menu" onClick={onMobileMenu} aria-label="Ouvrir le menu"><Icon name="menu"/></button>
    <div className="global-search"><Icon name="search"/><input aria-label="Recherche globale" placeholder="Rechercher un patient par nom ou N° de dossier..." /><kbd>⌘ K</kbd></div>
    <div className="top-actions">
      <Button variant="soft" icon="plus">Nouveau patient</Button>
      <Button icon="plus">Consultation</Button>
      <button className="icon-button" aria-label="Notifications"><Icon name="bell"/><span className="notification-dot"/></button>
      <div className="mini-avatar">KK</div>
    </div>
  </header>;
}

const staffPatients = [
  { id: "PS-2024-0812", initials: "AM", name: "Aminata Mensah", age: "34 ans", gender: "Femme", lastVisit: "Aujourd'hui, 09:40", reason: "Suivi hypertension", status: "Suivi actif", tone: "green" as const, alert: "Pénicilline", next: "24 juin, 09:30" },
  { id: "PS-2025-0148", initials: "YK", name: "Yao Kouamé", age: "58 ans", gender: "Homme", lastVisit: "Aujourd'hui, 08:15", reason: "Douleur thoracique", status: "À surveiller", tone: "red" as const, alert: "Risque cardio", next: "Aujourd'hui, 15:00" },
  { id: "PS-2024-0934", initials: "FT", name: "Fatou Traoré", age: "27 ans", gender: "Femme", lastVisit: "Hier, 16:20", reason: "Suivi de grossesse", status: "Suivi actif", tone: "green" as const, alert: "", next: "2 juillet, 10:15" },
  { id: "PS-2023-0621", initials: "JB", name: "Jean-Baptiste Koffi", age: "71 ans", gender: "Homme", lastVisit: "14 juin 2025", reason: "Diabète type 2", status: "Résultats reçus", tone: "blue" as const, alert: "", next: "28 juin, 11:00" },
  { id: "PS-2025-0207", initials: "SN", name: "Salimata N'Dri", age: "43 ans", gender: "Femme", lastVisit: "12 juin 2025", reason: "Bilan annuel", status: "Nouveau", tone: "purple" as const, alert: "Latex", next: "30 juin, 14:30" },
  { id: "PS-2024-0309", initials: "OD", name: "Oumar Diabaté", age: "39 ans", gender: "Homme", lastVisit: "9 juin 2025", reason: "Lombalgie chronique", status: "Suivi actif", tone: "green" as const, alert: "", next: "5 juillet, 09:00" },
];

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="workspace-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function DashboardView({ openPatient }: { openPatient: () => void }) {
  const appointments = [
    { time: "08:30", initials: "YK", name: "Yao Kouamé", type: "Consultation urgente", detail: "Douleur thoracique • Cabinet 2B", tone: "red" as const },
    { time: "09:40", initials: "AM", name: "Aminata Mensah", type: "Suivi médical", detail: "Hypertension • Cabinet 2B", tone: "blue" as const },
    { time: "11:00", initials: "FT", name: "Fatou Traoré", type: "Consultation prénatale", detail: "Suivi grossesse • Cabinet 3A", tone: "green" as const },
    { time: "14:30", initials: "JB", name: "Jean-Baptiste Koffi", type: "Contrôle diabète", detail: "Résultats biologiques • Cabinet 2B", tone: "purple" as const },
  ];
  return <main className="workspace-page">
    <PageTitle eyebrow="MARDI 17 JUIN 2025" title="Bonjour, Dr. Konan" description="Voici l'essentiel de votre activité clinique aujourd'hui." action={<Button icon="plus">Démarrer une consultation</Button>}/>
    <div className="stat-grid">
      <article className="stat-card"><span className="stat-icon blue"><Icon name="calendar"/></span><div><small>Rendez-vous aujourd'hui</small><strong>12</strong><p><em>4</em> consultations restantes</p></div><span className="stat-spark blue-bars"><i/><i/><i/><i/><i/></span></article>
      <article className="stat-card"><span className="stat-icon green"><Icon name="users"/></span><div><small>Patients suivis</small><strong>247</strong><p><em>+8</em> ce mois-ci</p></div><span className="stat-spark green-bars"><i/><i/><i/><i/><i/></span></article>
      <article className="stat-card"><span className="stat-icon amber"><Icon name="flask"/></span><div><small>Résultats à valider</small><strong>8</strong><p><b>2 prioritaires</b></p></div><Badge tone="amber">À traiter</Badge></article>
      <article className="stat-card"><span className="stat-icon purple"><Icon name="file"/></span><div><small>Comptes-rendus</small><strong>5</strong><p>À finaliser aujourd'hui</p></div><Badge tone="purple">Brouillons</Badge></article>
    </div>
    <div className="dashboard-grid">
      <section className="card day-schedule">
        <div className="section-head"><div><h2>Agenda du jour</h2><p>12 rendez-vous • 4 à venir</p></div><button className="text-link">Voir l'agenda <Icon name="chevron" size={14}/></button></div>
        <div className="schedule-list">{appointments.map((appointment, index) => <button className="schedule-row" key={appointment.time} onClick={index === 1 ? openPatient : undefined}>
          <time>{appointment.time}</time><span className={`schedule-line ${appointment.tone}`}/><span className={`list-avatar ${appointment.tone}`}>{appointment.initials}</span>
          <span className="schedule-person"><strong>{appointment.name}</strong><small>{appointment.detail}</small></span>
          <Badge tone={appointment.tone}>{appointment.type}</Badge><Icon name="chevron" size={15}/>
        </button>)}</div>
      </section>
      <aside className="dashboard-side">
        <section className="card task-card"><div className="section-head"><div><h2>À traiter</h2><p>Vos priorités cliniques</p></div><Badge tone="red">6 actions</Badge></div>
          <div className="task-list">
            <button><span className="task-check urgent"><Icon name="alert" size={14}/></span><p><strong>2 résultats critiques</strong><small>Biologie • reçus il y a 18 min</small></p><Icon name="chevron" size={14}/></button>
            <button><span className="task-check"><Icon name="file" size={14}/></span><p><strong>5 comptes-rendus à signer</strong><small>Dernière modification hier</small></p><Icon name="chevron" size={14}/></button>
            <button><span className="task-check blue"><Icon name="message" size={14}/></span><p><strong>3 messages patients</strong><small>1 message non lu</small></p><Icon name="chevron" size={14}/></button>
          </div>
        </section>
        <section className="card occupancy-card"><div className="section-head"><div><h2>Activité de la semaine</h2><p>Consultations réalisées</p></div><strong>42</strong></div><div className="week-bars">{[["LUN","75"],["MAR","92"],["MER","58"],["JEU","82"],["VEN","45"]].map(([day,value])=><div key={day}><span><i className={`bar-${value}`}/></span><small>{day}</small></div>)}</div><div className="occupancy-foot"><span><i/>Objectif hebdomadaire</span><b>84%</b></div></section>
      </aside>
    </div>
    <section className="card recent-patients"><div className="section-head"><div><h2>Patients récemment consultés</h2><p>Accès rapide aux derniers dossiers</p></div><button className="text-link">Tous les patients <Icon name="chevron" size={14}/></button></div><div className="recent-grid">{staffPatients.slice(0,4).map((patient,index)=><button key={patient.id} onClick={index===0?openPatient:undefined}><span className={`list-avatar avatar-${index}`}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.reason}</small></span><Badge tone={patient.tone}>{patient.status}</Badge></button>)}</div></section>
  </main>;
}

function PatientsView({ openPatient }: { openPatient: () => void }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");
  const filteredPatients = staffPatients.filter(patient => {
    const matchesQuery = `${patient.name} ${patient.id}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = filter === "Tous" || patient.status === filter;
    return matchesQuery && matchesFilter;
  });
  return <main className="workspace-page">
    <PageTitle eyebrow="DOSSIERS MÉDICAUX" title="Patients" description="Consultez et gérez les dossiers de vos patients." action={<Button icon="plus">Nouveau patient</Button>}/>
    <div className="patient-summary-strip">
      <div><span className="summary-icon blue"><Icon name="users"/></span><p><strong>247</strong><small>Patients suivis</small></p></div>
      <div><span className="summary-icon green"><Icon name="check"/></span><p><strong>18</strong><small>Consultés ce mois</small></p></div>
      <div><span className="summary-icon amber"><Icon name="clock"/></span><p><strong>7</strong><small>Suivis à planifier</small></p></div>
      <div><span className="summary-icon red"><Icon name="alert"/></span><p><strong>3</strong><small>Points de vigilance</small></p></div>
    </div>
    <section className="card directory-card">
      <div className="directory-tools">
        <div className="inner-search patient-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Rechercher par nom ou N° de dossier..." aria-label="Rechercher un patient"/></div>
        <div className="filter-pills">{["Tous","Suivi actif","À surveiller","Nouveau"].map(item=><button className={filter===item?"active":""} onClick={()=>setFilter(item)} key={item}>{item}</button>)}</div>
        <Button variant="soft" icon="filter">Plus de filtres</Button>
      </div>
      <div className="data-table patient-directory"><table><thead><tr><th>PATIENT</th><th>N° DE DOSSIER</th><th>DERNIÈRE CONSULTATION</th><th>MOTIF / SUIVI</th><th>PROCHAIN RDV</th><th>STATUT</th><th></th></tr></thead><tbody>{filteredPatients.map((patient,index)=><tr key={patient.id} onClick={patient.id==="PS-2024-0812"?openPatient:undefined} className={patient.id==="PS-2024-0812"?"clickable-row":""}>
        <td><div className="directory-patient"><span className={`list-avatar avatar-${index}`}>{patient.initials}</span><span><strong>{patient.name}</strong><small>{patient.age} • {patient.gender}{patient.alert&&<em><Icon name="alert" size={10}/>{patient.alert}</em>}</small></span></div></td>
        <td><code>{patient.id}</code></td><td>{patient.lastVisit}</td><td><strong>{patient.reason}</strong></td><td>{patient.next}</td><td><Badge tone={patient.tone}>{patient.status}</Badge></td><td><button className="icon-button" aria-label={`Actions pour ${patient.name}`}><Icon name="more"/></button></td>
      </tr>)}</tbody></table></div>
      {filteredPatients.length === 0 && <div className="empty-state"><Icon name="search" size={26}/><strong>Aucun patient trouvé</strong><p>Modifiez votre recherche ou vos filtres.</p></div>}
      <div className="pagination"><span>Affichage de {filteredPatients.length} patients sur 247</span><div><button>Précédent</button><button className="active">1</button><button>2</button><button>3</button><button>Suivant</button></div></div>
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

function ExamsOverview() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous");
  const [notice, setNotice] = useState("");
  const filteredExams = labExams.filter(exam => (`${exam.patient} ${exam.exam} ${exam.id}`.toLowerCase().includes(query.toLowerCase())) && (status === "Tous" || exam.status === status));
  return <main className="workspace-page">
    <PageTitle eyebrow="EXAMENS & LABORATOIRE" title="Résultats et demandes" description="Suivez les examens prescrits et validez les résultats reçus." action={<Button icon="plus">Nouvelle demande</Button>}/>
    {notice && <div className="toast workspace-toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")}><Icon name="x"/></button></div>}
    <div className="lab-stat-grid">
      <article><span className="stat-icon amber"><Icon name="clock"/></span><p><small>En attente</small><strong>14</strong><em>6 résultats attendus aujourd'hui</em></p></article>
      <article><span className="stat-icon blue"><Icon name="flask"/></span><p><small>À valider</small><strong>8</strong><em>Depuis votre dernière connexion</em></p></article>
      <article className="critical"><span className="stat-icon red"><Icon name="alert"/></span><p><small>Résultats critiques</small><strong>2</strong><em>Action médicale requise</em></p><Badge tone="red">Prioritaire</Badge></article>
      <article><span className="stat-icon green"><Icon name="check"/></span><p><small>Validés ce mois</small><strong>126</strong><em>+18% par rapport à mai</em></p></article>
    </div>
    <div className="lab-layout">
      <section className="card lab-main">
        <div className="directory-tools lab-tools"><div className="inner-search patient-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Patient, examen ou référence..." aria-label="Rechercher un examen"/></div><select value={status} onChange={event=>setStatus(event.target.value)} aria-label="Filtrer par statut"><option>Tous</option><option>Critique</option><option>À valider</option><option>En cours</option><option>Validé</option></select><Button variant="soft" icon="filter">Filtres</Button></div>
        <div className="data-table lab-table"><table><thead><tr><th>PATIENT</th><th>EXAMEN</th><th>DEMANDÉ LE</th><th>RÉSULTAT</th><th>STATUT</th><th></th></tr></thead><tbody>{filteredExams.map((exam,index)=><tr key={exam.id} className={exam.status==="Critique"?"critical-row":""}><td><div className="directory-patient"><span className={`list-avatar avatar-${index}`}>{exam.initials}</span><span><strong>{exam.patient}</strong><small>{exam.id}</small></span></div></td><td><strong>{exam.exam}</strong><small className="table-subline">{exam.category}</small></td><td>{exam.requested}<small className="table-subline">{exam.received!=="—"?`Reçu ${exam.received}`:"Résultat en attente"}</small></td><td className={exam.status==="Critique"?"critical-value":""}>{exam.result}</td><td><Badge tone={exam.tone}>{exam.status}</Badge></td><td><button className="icon-button" onClick={()=>setNotice(exam.status==="À valider"?"Résultat marqué comme validé.":"Document médical ouvert.")} aria-label={`Ouvrir ${exam.exam}`}><Icon name="chevron"/></button></td></tr>)}</tbody></table></div>
        <div className="pagination"><span>{filteredExams.length} examens affichés sur 148</span><div><button>Précédent</button><button className="active">1</button><button>2</button><button>3</button><button>Suivant</button></div></div>
      </section>
      <aside className="lab-side">
        <section className="card critical-panel"><div className="section-head"><div><h2>Alertes critiques</h2><p>À prendre en charge rapidement</p></div><Badge tone="red">2</Badge></div><article><span className="alert-pulse"/><div><strong>Troponine élevée</strong><p>Yao Kouamé • 68 ng/L</p><small>Reçu il y a 18 minutes</small></div><button><Icon name="chevron"/></button></article><article><span className="alert-pulse"/><div><strong>Potassium critique</strong><p>Adama Bamba • 6,2 mmol/L</p><small>Reçu il y a 42 minutes</small></div><button><Icon name="chevron"/></button></article></section>
        <section className="card lab-activity"><div className="section-head"><div><h2>Flux laboratoire</h2><p>Aujourd'hui</p></div><Icon name="activity"/></div><div><p><span className="flow-dot green"/><strong>09:05</strong><small>Bilan lipidique reçu</small></p><p><span className="flow-dot blue"/><strong>08:42</strong><small>Troponine transmise au labo</small></p><p><span className="flow-dot purple"/><strong>08:16</strong><small>NFS validée par BioLab</small></p><p><span className="flow-dot neutral"/><strong>07:54</strong><small>3 prélèvements enregistrés</small></p></div></section>
        <button className="import-result"><span><Icon name="download"/></span><strong>Importer un résultat externe</strong><small>PDF, JPG ou PNG • 10 Mo max.</small></button>
      </aside>
    </div>
  </main>;
}

function PatientRecord() {
  const [tab, setTab] = useState("Consultations & CR");
  const tabs = ["Consultations & CR", "Constantes", "Prescriptions", "Examens & Labo"];
  return <main className="content">
    <div className="breadcrumb"><span>Patients</span><Icon name="chevron" size={13}/><b>Dossier #PS-2024-0812</b></div>
    <section className="patient-hero">
      <div className="avatar avatar-patient">AM</div>
      <div className="patient-identity">
        <div className="identity-line"><h1>Aminata Mensah</h1><Badge tone="green">Dossier actif</Badge></div>
        <p>34 ans • Femme • Née le 18 août 1990</p>
        <div className="patient-meta"><span><b>N° dossier</b> PS-2024-0812</span><span><b>Téléphone</b> +225 07 48 22 19 05</span></div>
      </div>
      <div className="hero-badges">
        <div className="blood"><span>Groupe sanguin</span><strong>O+</strong></div>
        <Badge tone="red"><Icon name="alert" size={15}/>Allergie : Pénicilline</Badge>
        <Button variant="soft" icon="more">Actions</Button>
      </div>
    </section>
    <div className="tab-bar">{tabs.map(t => <button key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t}{t === "Examens & Labo" && <i>3</i>}</button>)}</div>
    {tab === "Consultations & CR" && <Consultations/>}
    {tab === "Constantes" && <ConstantsView/>}
    {tab === "Prescriptions" && <Prescriptions/>}
    {tab === "Examens & Labo" && <LabView/>}
  </main>;
}

function Consultations() {
  return <div className="record-grid">
    <section className="card timeline-card">
      <div className="section-head"><div><h2>Historique médical</h2><p>Consultations et comptes-rendus</p></div><Button icon="plus">Nouveau compte-rendu</Button></div>
      <div className="timeline">
        <article>
          <div className="timeline-marker"><Icon name="stethoscope" size={16}/></div>
          <div className="timeline-date">AUJOURD'HUI, 09:40</div>
          <div className="consult-card">
            <div className="consult-head"><div><Badge tone="blue">Consultation</Badge><h3>Suivi hypertension artérielle</h3></div><button className="icon-button"><Icon name="more"/></button></div>
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
      <section className="card"><div className="section-head"><div><h2>Dernières constantes</h2><p>Aujourd'hui à 09:32</p></div><button className="icon-button"><Icon name="edit"/></button></div>
        <div className="vitals-list">
          <div><span className="vital-icon blue"><Icon name="activity"/></span><p><small>Tension artérielle</small><strong>124/78 <em>mmHg</em></strong></p><Badge tone="green">Normal</Badge></div>
          <div><span className="vital-icon red"><Icon name="heart"/></span><p><small>Fréquence cardiaque</small><strong>72 <em>bpm</em></strong></p><Badge tone="green">Normal</Badge></div>
          <div><span className="vital-icon amber"><Icon name="activity"/></span><p><small>Température</small><strong>36,8 <em>°C</em></strong></p></div>
          <div><span className="vital-icon purple"><Icon name="grid"/></span><p><small>Poids</small><strong>68,4 <em>kg</em></strong></p><span className="trend">− 0,8 kg</span></div>
        </div>
        <button className="text-link">Voir l'évolution des constantes <Icon name="chevron" size={14}/></button>
      </section>
      <section className="card next-card"><div className="section-head"><div><h2>Prochain rendez-vous</h2></div><Badge tone="blue">Confirmé</Badge></div><div className="appointment-date"><strong>24</strong><span>JUIN<small>2025</small></span></div><div className="appointment-info"><p><Icon name="clock"/>09:30 • Suivi médical</p><p><Icon name="map"/>Cabinet 2B — Clinique Centrale</p></div></section>
    </aside>
  </div>;
}

function ConstantsView() {
  return <div className="record-grid"><section className="card chart-card"><div className="section-head"><div><h2>Évolution de la tension</h2><p>Mesures des 30 derniers jours</p></div><div><Badge tone="blue">Systolique</Badge> <Badge tone="neutral">Diastolique</Badge></div></div><VitalChart/></section><aside className="card quick-entry"><h2>Saisie rapide</h2><p>Ajouter les constantes du jour</p><label>Tension artérielle<div><input placeholder="120"/><span>/</span><input placeholder="80"/></div></label><label>Température<input placeholder="36,8 °C"/></label><label>Poids<input placeholder="68,4 kg"/></label><Button icon="plus">Enregistrer les mesures</Button></aside></div>;
}

function Prescriptions() {
  const rows = [["Amlodipine","5 mg","1 cp / jour","3 mois","Actif"],["Paracétamol","500 mg","Si douleur, max. 3/j","7 jours","Terminé"],["Vitamine D3","1000 UI","1 dose / jour","6 mois","Actif"]];
  return <section className="card table-card"><div className="section-head"><div><h2>Prescriptions & traitements</h2><p>Ordonnances actives et historique</p></div><Button icon="plus">Nouvelle ordonnance</Button></div><div className="data-table"><table><thead><tr><th>Médicament</th><th>Dosage</th><th>Posologie</th><th>Durée</th><th>Statut</th><th></th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.slice(0,4).map((c,j)=><td key={j}>{j===0?<strong>{c}</strong>:c}</td>)}<td><Badge tone={r[4]==="Actif"?"green":"neutral"}>{r[4]}</Badge></td><td><Icon name="more"/></td></tr>)}</tbody></table></div></section>;
}

function LabView() {
  return <div className="record-grid"><section className="card table-card"><div className="section-head"><div><h2>Examens & laboratoire</h2><p>Résultats, demandes et documents</p></div><Button icon="plus">Demander un examen</Button></div>{["Bilan sanguin complet","Échographie abdominale","Bilan thyroïdien"].map((x,i)=><div className="document-row" key={x}><span className="document-icon"><Icon name={i===1?"activity":"flask"}/></span><div><strong>{x}</strong><small>{i===0?"28 mai 2025 • Laboratoire Central":i===1?"Demandé le 10 juin 2025":"12 avril 2025 • BioLab"}</small></div><Badge tone={i===1?"amber":"green"}>{i===1?"En attente":"Validé"}</Badge><button className="icon-button"><Icon name={i===1?"more":"download"}/></button></div>)}</section><aside className="card upload-zone"><span><Icon name="download" size={28}/></span><h2>Importer un résultat</h2><p>Déposez un fichier PDF, JPG ou PNG ici</p><Button variant="soft">Parcourir les fichiers</Button></aside></div>;
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
    <div className="assistant-title"><div><span className="ai-symbol"><Icon name="sparkles"/></span><div><h1>Assistant clinique IA</h1><p>Dossier d'Aminata Mensah • Sources médicales vérifiées</p></div></div><Badge tone="green"><span className="pulse"/>Dossier synchronisé</Badge></div>
    <div className="split-chat">
      <section className="chat-panel">
        <div className="chat-scroll">
          <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><p>Bonjour Dr. Konan. Je peux analyser le dossier d'Aminata Mensah. Que souhaitez-vous savoir ?</p></div></div>
          <div className="user-message"><p>Peux-tu me résumer l'évolution de sa tension et les traitements actuels ?</p></div>
          <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Synthèse générée</b><div className="ai-answer"><p>La tension d'Aminata s'est <strong>progressivement stabilisée</strong> au cours des 8 dernières semaines, passant d'une moyenne de 142/91 mmHg à <strong>124/78 mmHg</strong> lors de la dernière mesure.<sup>1</sup></p><p>Son traitement actuel comprend :</p><ul><li><strong>Amlodipine 5 mg</strong> — 1 comprimé par jour<sup>2</sup></li><li><strong>Vitamine D3 1000 UI</strong> — 1 dose par jour<sup>3</sup></li></ul><div className="ai-note"><Icon name="check"/>Aucune interaction médicamenteuse identifiée dans le dossier.</div></div></div></div>
          {messages.map((message,index) => <div className="chat-exchange" key={`${message}-${index}`}>
            <div className="user-message"><p>{message}</p></div>
            <div className="ai-message"><span className="ai-avatar"><Icon name="sparkles"/></span><div><b>Assistant PassSanté</b><div className="ai-answer"><p>J'ai analysé votre demande à partir des éléments autorisés du dossier d'Aminata Mensah.</p><p>Les dernières données disponibles ne montrent pas de nouvelle alerte clinique. La tension est stabilisée à <strong>124/78 mmHg</strong> et le traitement actif reste inchangé.<sup>1</sup></p><div className="ai-note"><Icon name="file" size={14}/>Réponse fondée sur les constantes et prescriptions du dossier.</div></div></div></div>
          </div>)}
        </div>
        <div className="suggestions"><button type="button" onClick={()=>setDraft("Prépare une synthèse pour la prochaine consultation.")}>Préparer la prochaine consultation</button><button type="button" onClick={()=>setDraft("Signale-moi les dernières valeurs anormales du dossier.")}>Signaler les valeurs anormales</button></div>
        <form className="chat-input" onSubmit={sendMessage}><textarea value={draft} onChange={event=>setDraft(event.target.value)} aria-label="Message" placeholder="Interroger le dossier médical..."/><button type="submit" aria-label="Envoyer" disabled={!draft.trim()}><Icon name="send"/></button><small><Icon name="lock" size={12}/>Les réponses sont basées uniquement sur le dossier patient</small></form>
      </section>
      <aside className="sources-panel"><div className="sources-head"><div><h2>Références & sources</h2><p>3 éléments cités dans la réponse</p></div><Icon name="file"/></div>
        <div className="source-card selected"><span className="source-number">1</span><div className="source-type"><Icon name="activity" size={14}/>CONSTANTES</div><strong>Évolution tension artérielle</strong><p>« TA 124/78 mmHg, pouls 72 bpm. Amélioration par rapport à la mesure précédente... »</p><small>10 juin 2025, 09:32</small></div>
        <div className="source-card"><span className="source-number">2</span><div className="source-type"><Icon name="file" size={14}/>ORDONNANCE</div><strong>Prescription du 12 avril</strong><p>« Amlodipine 5 mg, 1 comprimé par voie orale le matin, pendant 3 mois. »</p><small>Dr. K. Konan • Signée</small></div>
        <div className="source-card"><span className="source-number">3</span><div className="source-type"><Icon name="file" size={14}/>ORDONNANCE</div><strong>Supplémentation vitamine D</strong><p>« Vitamine D3 1000 UI, 1 dose par jour pendant 6 mois. »</p><small>Dr. K. Konan • Signée</small></div>
        <div className="privacy-note"><Icon name="shield"/><p><strong>Données confidentielles</strong><br/>Accès journalisé conformément à la politique de sécurité.</p></div>
      </aside>
    </div>
  </main>;
}

function ProApp({ onMode, initialView = "patient", onView }: { onMode: (v: "patient" | "admin") => void; initialView?: string; onView: (view: string) => void }) {
  const [view, setView] = useState(initialView);
  const [mobileOpen, setMobileOpen] = useState(false);
  const renderView = () => {
    if (view === "dashboard") return <DashboardView openPatient={()=>setView("patient-record")}/>;
    if (view === "patient") return <PatientsView openPatient={()=>setView("patient-record")}/>;
    if (view === "patient-record") return <PatientRecord/>;
    if (view === "agenda") return <StaffAgenda/>;
    if (view === "examens") return <ExamsOverview/>;
    return <AssistantView/>;
  };
  return <div className="pro-app">
    <div className={mobileOpen ? "sidebar-wrap open" : "sidebar-wrap"}><ProSidebar view={view} setView={(v)=>{setView(v);setMobileOpen(false);onView(v)}} onMode={onMode}/><button className="sidebar-overlay" onClick={()=>setMobileOpen(false)}/></div>
    <div className="pro-main"><Topbar onMobileMenu={()=>setMobileOpen(true)}/>{renderView()}</div>
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
        <div className="appointment-actions"><Button variant="soft" icon="edit" onClick={()=>setNotice("Votre demande de modification a été enregistrée.")}>Modifier</Button><Button variant="ghost" icon="message" onClick={()=>setNotice("Clinique Centrale : +225 27 20 00 00 00")}>Contacter</Button><button className="text-link">Voir le trajet <Icon name="chevron" size={14}/></button></div>
      </section>
      <div className="patient-grid">
        <section className="patient-card results-card"><div className="card-title"><span className="round-icon purple"><Icon name="flask"/></span><div><h2>Derniers résultats</h2><p>Vos examens récents</p></div><button className="text-link" onClick={()=>onNavigate("documents")}>Tout voir <Icon name="chevron" size={13}/></button></div><div className="result-item"><span className="doc-thumb"><Icon name="file"/></span><div><strong>Bilan sanguin complet</strong><small>28 mai 2025 • PDF, 1,2 Mo</small></div><Badge tone="green">Disponible</Badge><button className="icon-button"><Icon name="download"/></button></div><div className="result-item"><span className="doc-thumb blue"><Icon name="activity"/></span><div><strong>Électrocardiogramme</strong><small>12 avril 2025 • PDF, 860 Ko</small></div><Badge tone="green">Disponible</Badge><button className="icon-button"><Icon name="download"/></button></div></section>
        <section className="patient-card personal-vitals"><div className="card-title"><span className="round-icon blue"><Icon name="activity"/></span><div><h2>Mes constantes</h2><p>Tension artérielle • 30 jours</p></div><select aria-label="Période"><option>30 jours</option><option>7 jours</option></select></div><div className="current-value"><strong>124<small>/78</small></strong><span>mmHg<Badge tone="green">Dans la norme</Badge></span></div><VitalChart patient/><Button icon="plus" onClick={()=>onNavigate("constantes")}>Saisir ma tension / température</Button></section>
      </div>
      <section className="health-tip"><span><Icon name="heart" size={26}/></span><div><strong>Le conseil santé du jour</strong><p>Une marche de 30 minutes aide à maintenir une bonne santé cardiovasculaire.</p></div><button><Icon name="x"/></button></section>
    </main>;
  };
  return <div className="patient-app">
    <header className="patient-top"><Logo/><div><button className="icon-button"><Icon name="bell"/><span className="notification-dot"/></button><button className="patient-avatar" onClick={()=>onMode("pro")}>AM</button></div></header>
    {renderPatientPage()}
    <nav className="bottom-nav">{[
      ["home","Accueil","home"],["rdv","Mes RDV","calendar"],["documents","Documents","file"],["constantes","Constantes","activity"],["assistant","Assistant IA","message"]
    ].map(([id,label,icon])=><button key={id} onClick={()=>onNavigate(id)} className={page===id?"active":""}><Icon name={icon as IconName}/><span>{label}</span></button>)}</nav>
  </div>;
}

function PatientAssistant({ onBack }: { onBack: () => void }) {
  return <div className="patient-assistant"><header><button className="icon-button back" onClick={onBack}><Icon name="chevron"/></button><Logo/><span className="patient-avatar">AM</span></header><div className="warning-banner"><Icon name="alert"/><p><strong>Information importante</strong>L'assistant ne remplace pas un diagnostic médical. En cas d'urgence, contactez les secours.</p></div><main><div className="assistant-welcome"><span className="ai-symbol large"><Icon name="sparkles" size={30}/></span><h1>Comment puis-je vous aider ?</h1><p>Posez une question générale sur votre santé ou la préparation de votre prochain rendez-vous.</p></div><div className="question-chips"><button>Comment préparer ma consultation ?</button><button>Comprendre ma tension artérielle</button><button>Conseils pour mieux dormir</button></div></main><div className="patient-chatbox"><textarea placeholder="Écrivez votre question ici..." aria-label="Votre question"/><button><Icon name="send"/></button><small>Ne partagez pas d'information sensible dans vos messages.</small></div></div>;
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
  return <div className="admin-app"><aside className="admin-sidebar"><Logo dark/><nav><span className="nav-caption">ADMINISTRATION</span><button className={page==="users"?"active":""} onClick={()=>changePage("users")}><Icon name="users"/>Utilisateurs</button><button className={page==="roles"?"active":""} onClick={()=>changePage("roles")}><Icon name="key"/>Rôles & permissions</button><button className={page==="logs"?"active":""} onClick={()=>changePage("logs")}><Icon name="shield"/>Journaux d'audit</button></nav><div className="admin-profile"><div className="mini-avatar">SK</div><div><strong>Sophie Kouassi</strong><span>Super administratrice</span></div><button onClick={()=>onMode("pro")}><Icon name="chevron"/></button></div></aside><div className="admin-main"><header className="admin-topbar"><div className="global-search"><Icon name="search"/><input placeholder="Rechercher dans l'administration..."/></div><button className="icon-button"><Icon name="bell"/></button></header><nav className="admin-mobile-nav"><button className={page==="users"?"active":""} onClick={()=>changePage("users")}><Icon name="users"/>Utilisateurs</button><button className={page==="roles"?"active":""} onClick={()=>changePage("roles")}><Icon name="key"/>Rôles</button><button className={page==="logs"?"active":""} onClick={()=>changePage("logs")}><Icon name="shield"/>Audit</button></nav>{page==="logs"?<AdminAuditLogs/>:page==="roles"?<AdminRoles/>:<UsersPage openModal={()=>setModal(true)}/>}</div>{modal&&<RoleModal close={()=>setModal(false)}/>}</div>;
}

function UsersPage({openModal}:{openModal:()=>void}) {
  return <main className="admin-content"><div className="page-heading"><div><span className="eyebrow">ADMINISTRATION</span><h1>Gestion des utilisateurs</h1><p>Gérez les comptes, les rôles et les autorisations d'accès.</p></div><Button icon="plus">Inviter un utilisateur</Button></div><div className="metrics-row"><div><span className="metric-icon blue"><Icon name="users"/></span><p><small>Utilisateurs actifs</small><strong>1 248</strong><em>+12 ce mois</em></p></div><div><span className="metric-icon green"><Icon name="stethoscope"/></span><p><small>Personnel hospitalier</small><strong>86</strong><em>7 rôles distincts</em></p></div><div><span className="metric-icon purple"><Icon name="shield"/></span><p><small>Administrateurs</small><strong>8</strong><em>2 super admins</em></p></div></div><section className="card admin-table"><div className="table-tools"><div className="inner-search"><Icon name="search"/><input placeholder="Nom, email ou identifiant..."/></div><Button variant="soft" icon="filter">Filtrer</Button><span>1 248 utilisateurs</span></div><div className="data-table"><table><thead><tr><th>UTILISATEUR</th><th>RÔLE</th><th>STATUT</th><th>DERNIÈRE CONNEXION</th><th></th></tr></thead><tbody>{users.map((u,i)=><tr key={u[1]}><td><div className="user-cell"><span className={`user-avatar avatar-${i}`}>{u[4]}</span><div><strong>{u[0]}</strong><small>{u[1]}</small></div></div></td><td><Badge tone={u[2]==="Patient"?"blue":u[2]==="Administrateur"?"purple":"neutral"}>{u[2]}</Badge></td><td><span className={`status ${u[3]==="Actif"?"active":"suspended"}`}><i/>{u[3]}</span></td><td>{i===1?"Aujourd'hui, 09:42":i===2?"Aujourd'hui, 08:15":i===0?"Hier, 17:36":"12 juin 2025"}</td><td><button className="icon-button" onClick={openModal}><Icon name="more"/></button></td></tr>)}</tbody></table></div><div className="pagination"><span>Affichage de 1 à 5 sur 1 248</span><div><button>Précédent</button><button className="active">1</button><button>2</button><button>3</button><button>Suivant</button></div></div></section></main>;
}

function RoleModal({close}:{close:()=>void}) {
  return <div className="modal-backdrop" onClick={close}><section className="role-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><h2>Modifier les rôles</h2><p>Dr. Koffi Konan • k.konan@passsante.ci</p></div><button className="icon-button" onClick={close}><Icon name="x"/></button></div><div className="modal-body"><label className="role-option selected"><input type="checkbox" defaultChecked/><span><strong>Personnel hospitalier</strong><small>Accès aux dossiers patients et outils cliniques</small></span><Icon name="check"/></label><label className="role-option"><input type="checkbox"/><span><strong>Administrateur</strong><small>Gestion des utilisateurs et configuration</small></span></label><div className="claims"><div><strong>Custom Claims Firebase</strong><Badge tone="amber">Avancé</Badge></div><textarea defaultValue={'{\n  "role": "medical_staff",\n  "facilityId": "clinique_centrale",\n  "canPrescribe": true\n}'}/><small><Icon name="alert" size={13}/>Les modifications prennent effet à la prochaine connexion.</small></div></div><div className="modal-actions"><Button variant="ghost" onClick={close}>Annuler</Button><Button onClick={close}>Enregistrer les modifications</Button></div></section></div>;
}

export type PassSanteArea = "pro" | "patient" | "patient-assistant" | "admin";

export default function PassSanteApp({ area = "pro", view = "patient" }: { area?: PassSanteArea; view?: string }) {
  const router = useRouter();
  const goToArea = (nextArea: "pro" | "patient" | "admin") => router.push(nextArea === "patient" ? "/espace-patient" : nextArea === "admin" ? "/admin/users" : "/patients/PS-2024-0812");
  const professionalRoutes: Record<string,string> = { patient:"/patients", "patient-record":"/patients/PS-2024-0812", dashboard:"/dashboard", agenda:"/agenda", examens:"/examens", assistant:"/assistant" };
  const patientRoutes: Record<string,string> = { home:"/espace-patient", rdv:"/espace-patient/rdv", documents:"/espace-patient/documents", constantes:"/espace-patient/constantes", assistant:"/espace-patient/assistant" };
  if (area === "patient" || area === "patient-assistant") return <PatientApp page={area==="patient-assistant"?"assistant":view} onMode={goToArea} onNavigate={page=>router.push(patientRoutes[page] ?? patientRoutes.home)}/>;
  if (area === "admin") return <AdminApp initialPage={view} onMode={goToArea} onPage={page=>router.push(`/admin/${page}`)}/>;
  return <ProApp initialView={view} onMode={goToArea} onView={nextView=>router.push(professionalRoutes[nextView] ?? professionalRoutes.patient)}/>;
}
