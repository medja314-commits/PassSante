"use client";

import { useMemo, useState } from "react";
import { auditLogs } from "@/data/mock-data";
import type { AuditLog } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";

export function AdminAuditLogs() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState("Tous");
  const [status, setStatus] = useState("Tous");
  const [period, setPeriod] = useState("7 derniers jours");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [notice, setNotice] = useState("");
  const users = useMemo(()=>["Tous",...Array.from(new Set(auditLogs.map(log=>log.userName)))],[]);
  const filteredLogs = auditLogs.filter(log => {
    const text = `${log.action} ${log.resource} ${log.userEmail}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (user==="Tous" || log.userName===user) && (status==="Tous" || log.status===status);
  });

  return <main className="admin-content">
    <div className="page-heading"><div><span className="eyebrow">SÉCURITÉ & CONFORMITÉ</span><h1>Journaux d'audit</h1><p>Consultez la trace complète des accès et actions sensibles sur la plateforme.</p></div><Button variant="soft" icon="download" onClick={()=>setNotice("L'export CSV des journaux filtrés a été préparé.")}>Exporter en CSV</Button></div>
    {notice && <div className="toast admin-toast"><Icon name="check"/>{notice}<button onClick={()=>setNotice("")} aria-label="Fermer"><Icon name="x"/></button></div>}
    <div className="audit-stats">
      <article><span className="metric-icon blue"><Icon name="activity"/></span><p><small>Événements aujourd'hui</small><strong>2 841</strong><em>+6% sur 24 h</em></p></article>
      <article><span className="metric-icon green"><Icon name="check"/></span><p><small>Actions autorisées</small><strong>99,2%</strong><em>2 818 événements</em></p></article>
      <article className="attention"><span className="metric-icon red"><Icon name="alert"/></span><p><small>Accès refusés</small><strong>23</strong><em>5 à vérifier</em></p><Badge tone="red">Surveillance</Badge></article>
    </div>
    <section className="card audit-table-card">
      <div className="audit-filters"><label>Période<select value={period} onChange={event=>setPeriod(event.target.value)}><option>24 dernières heures</option><option>7 derniers jours</option><option>30 derniers jours</option></select></label><label>Utilisateur<select value={user} onChange={event=>setUser(event.target.value)}>{users.map(name=><option key={name}>{name}</option>)}</select></label><label>Statut<select value={status} onChange={event=>setStatus(event.target.value)}><option>Tous</option><option>Succès</option><option>Refusé</option></select></label><div className="inner-search audit-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Action, ressource ou email..."/></div><Button variant="soft" icon="filter">Filtres avancés</Button></div>
      <div className="audit-result-bar"><span><i className="live-dot"/>Journalisation active</span><p>{filteredLogs.length} événements affichés • Période : {period.toLowerCase()}</p></div>
      <div className="data-table audit-table"><table><thead><tr><th>HORODATAGE (ISO)</th><th>UTILISATEUR</th><th>ACTION (logAction)</th><th>RESSOURCE CIBLÉE</th><th>ADRESSE IP</th><th>STATUT</th><th></th></tr></thead><tbody>{filteredLogs.map(log=><tr key={log.id} className={log.risk==="À vérifier"?"risk-row":""} onClick={()=>setSelectedLog(log)}><td><code>{log.timestamp}</code></td><td><div className="audit-user"><span>{log.userName.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><strong>{log.userName}</strong><small>{log.userEmail}</small></div></div></td><td><code className="action-code">{log.action}</code></td><td>{log.resource}</td><td><code>{log.ipAddress}</code></td><td><Badge tone={log.status==="Succès"?"green":"red"}>{log.status}</Badge></td><td><button className="icon-button" aria-label="Voir le détail"><Icon name="chevron"/></button></td></tr>)}</tbody></table></div>
      {filteredLogs.length===0&&<div className="audit-empty"><Icon name="search" size={26}/><strong>Aucun événement trouvé</strong><p>Modifiez les filtres ou la recherche.</p></div>}
      <div className="pagination"><span>Affichage de {filteredLogs.length} événements sur 2 841</span><div><button>Précédent</button><button className="active">1</button><button>2</button><button>3</button><button>Suivant</button></div></div>
    </section>
    {selectedLog&&<div className="audit-detail-backdrop" onClick={()=>setSelectedLog(null)}><aside className="audit-detail" onClick={event=>event.stopPropagation()}><div className="audit-detail-head"><div><span className={`audit-detail-icon ${selectedLog.status==="Refusé"?"denied":""}`}><Icon name={selectedLog.status==="Refusé"?"alert":"shield"}/></span><div><h2>Détail de l'événement</h2><p>{selectedLog.id}</p></div></div><button className="icon-button" onClick={()=>setSelectedLog(null)}><Icon name="x"/></button></div><div className="audit-detail-body"><Badge tone={selectedLog.status==="Succès"?"green":"red"}>{selectedLog.status}</Badge>{selectedLog.risk==="À vérifier"&&<Badge tone="amber">À vérifier</Badge>}<dl><div><dt>Horodatage</dt><dd><code>{selectedLog.timestamp}</code></dd></div><div><dt>Utilisateur</dt><dd>{selectedLog.userName}<small>{selectedLog.userEmail}</small></dd></div><div><dt>Action</dt><dd><code className="action-code">{selectedLog.action}</code></dd></div><div><dt>Ressource ciblée</dt><dd>{selectedLog.resource}</dd></div><div><dt>Adresse IP</dt><dd><code>{selectedLog.ipAddress}</code></dd></div></dl><div className="audit-integrity"><Icon name="lock"/><p><strong>Intégrité vérifiée</strong>Cette entrée est immuable et conservée à des fins de conformité.</p></div></div></aside></div>}
  </main>;
}
