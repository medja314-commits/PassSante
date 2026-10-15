"use client";

import { useMemo, useState } from "react";
import { auditLogs } from "@/data/mock-data";
import { isoStamp } from "@/data/dates";
import type { AuditLog } from "@/types";
import { Badge, Button, Icon } from "@/components/ui";
import { getLogs } from "@/lib/audit";
import { ROLES } from "@/lib/rbac";

export function AdminAuditLogs() {
  const [query, setQuery] = useState("");
  const [user, setUser] = useState("Tous");
  const [status, setStatus] = useState("Tous");
  const [period, setPeriod] = useState("7 derniers jours");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const liveLogs: AuditLog[] = getLogs().map((l, i) => ({
      id: `live-${i}`,
      timestamp: { offset: 0, time: new Date(l.date).toTimeString().slice(0, 5) },
      userEmail: `${l.role}@demo.local`,
      userName: ROLES.find(r => r.id === l.role)?.label ?? l.role,
      action: l.action,
      resource: l.targetId ? `${l.resource} ${l.targetId}` : l.resource,
      ipAddress: "127.0.0.1",
      status: l.allowed ? "Succès" : "Refusé",
      risk: l.allowed ? "Normal" : "À vérifier",
  }));
  const allLogs = [...liveLogs, ...auditLogs];
  const users = ["Tous", ...Array.from(new Set(allLogs.map(log => log.userName)))]; 
  const filteredLogs = allLogs.filter((log => {
    const text = `${log.action} ${log.resource} ${log.userEmail}`.toLowerCase();
    return text.includes(query.toLowerCase()) && (user==="Tous" || log.userName===user) && (status==="Tous" || log.status===status);
  }));

  // Compteurs calculés depuis le journal affiché (échantillon de démonstration).
  const total = auditLogs.length;
  const todayCount = auditLogs.filter(log => log.timestamp.offset === 0).length;
  const allowed = auditLogs.filter(log => log.status === "Succès").length;
  const refused = auditLogs.filter(log => log.status === "Refusé").length;
  const toVerify = auditLogs.filter(log => log.risk === "À vérifier").length;
  const allowedPct = total ? (allowed / total * 100).toFixed(1).replace(".", ",") : "0";

  return <main className="admin-content">
    <div className="page-heading"><div><span className="eyebrow">SÉCURITÉ & CONFORMITÉ</span><h1>Journaux d'audit</h1><p>Consultez la trace complète des accès et actions sensibles sur la plateforme.</p></div><Button variant="soft" icon="download" unavailable title="Bientôt disponible">Exporter en CSV</Button></div>
    <div className="audit-stats">
      <article><span className="metric-icon blue"><Icon name="activity"/></span><p><small>Événements aujourd'hui</small><strong>{todayCount}</strong><em>Dans l'échantillon affiché</em></p></article>
      <article><span className="metric-icon green"><Icon name="check"/></span><p><small>Actions autorisées</small><strong>{allowedPct}%</strong><em>{allowed} événements</em></p></article>
      <article className="attention"><span className="metric-icon red"><Icon name="alert"/></span><p><small>Accès refusés</small><strong>{refused}</strong><em>{toVerify} à vérifier</em></p><Badge tone="red">Surveillance</Badge></article>
    </div>
    <section className="card audit-table-card">
      <div className="audit-filters"><label>Période<select value={period} onChange={event=>setPeriod(event.target.value)}><option>24 dernières heures</option><option>7 derniers jours</option><option>30 derniers jours</option></select></label><label>Utilisateur<select value={user} onChange={event=>setUser(event.target.value)}>{users.map(name=><option key={name}>{name}</option>)}</select></label><label>Statut<select value={status} onChange={event=>setStatus(event.target.value)}><option>Tous</option><option>Succès</option><option>Refusé</option></select></label><div className="inner-search audit-search"><Icon name="search"/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Action, ressource ou email..."/></div><Button variant="soft" icon="filter" unavailable title="Bientôt disponible">Filtres avancés</Button></div>
      <div className="audit-result-bar"><span><i className="live-dot"/>Journalisation active</span><p>{filteredLogs.length} événements affichés • Période : {period.toLowerCase()}</p></div>
      <div className="data-table audit-table"><table role="table"><thead role="rowgroup"><tr role="row"><th role="columnheader">HORODATAGE (ISO)</th><th role="columnheader">UTILISATEUR</th><th role="columnheader">ACTION (logAction)</th><th role="columnheader">RESSOURCE CIBLÉE</th><th role="columnheader">ADRESSE IP</th><th role="columnheader">STATUT</th><th role="columnheader"></th></tr></thead><tbody role="rowgroup">{filteredLogs.map(log=><tr role="row" key={log.id} className={log.risk==="À vérifier"?"risk-row":""} onClick={()=>setSelectedLog(log)}><td role="cell"><code>{isoStamp(log.timestamp)}</code></td><td role="cell"><div className="audit-user"><span>{log.userName.split(" ").map(part=>part[0]).slice(0,2).join("")}</span><div><strong>{log.userName}</strong><small>{log.userEmail}</small></div></div></td><td role="cell"><code className="action-code">{log.action}</code></td><td role="cell">{log.resource}</td><td role="cell"><code>{log.ipAddress}</code></td><td role="cell"><Badge tone={log.status==="Succès"?"green":"red"}>{log.status}</Badge></td><td role="cell"><button className="icon-button" aria-label="Voir le détail" aria-disabled="true" title="Bientôt disponible"><Icon name="chevron"/></button></td></tr>)}</tbody></table></div>
      {filteredLogs.length===0&&<div className="audit-empty"><Icon name="search" size={26}/><strong>Aucun événement trouvé</strong><p>Modifiez les filtres ou la recherche.</p></div>}
      <div className="pagination"><span>Affichage de {filteredLogs.length} événements sur {total}</span><div><button aria-disabled="true" title="Bientôt disponible">Précédent</button><button className="active" aria-disabled="true" title="Bientôt disponible">1</button><button aria-disabled="true" title="Bientôt disponible">2</button><button aria-disabled="true" title="Bientôt disponible">3</button><button aria-disabled="true" title="Bientôt disponible">Suivant</button></div></div>
    </section>
    {selectedLog&&<div className="audit-detail-backdrop" onClick={()=>setSelectedLog(null)}><aside className="audit-detail" onClick={event=>event.stopPropagation()}><div className="audit-detail-head"><div><span className={`audit-detail-icon ${selectedLog.status==="Refusé"?"denied":""}`}><Icon name={selectedLog.status==="Refusé"?"alert":"shield"}/></span><div><h2>Détail de l'événement</h2><p>{selectedLog.id}</p></div></div><button className="icon-button" onClick={()=>setSelectedLog(null)}><Icon name="x"/></button></div><div className="audit-detail-body"><Badge tone={selectedLog.status==="Succès"?"green":"red"}>{selectedLog.status}</Badge>{selectedLog.risk==="À vérifier"&&<Badge tone="amber">À vérifier</Badge>}<dl><div><dt>Horodatage</dt><dd><code>{isoStamp(selectedLog.timestamp)}</code></dd></div><div><dt>Utilisateur</dt><dd>{selectedLog.userName}<small>{selectedLog.userEmail}</small></dd></div><div><dt>Action</dt><dd><code className="action-code">{selectedLog.action}</code></dd></div><div><dt>Ressource ciblée</dt><dd>{selectedLog.resource}</dd></div><div><dt>Adresse IP</dt><dd><code>{selectedLog.ipAddress}</code></dd></div></dl><div className="audit-integrity"><Icon name="lock"/><p><strong>Entrée du journal d'audit</strong>Affichage en lecture seule.</p></div></div></aside></div>}
  </main>;
}
