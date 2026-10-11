"use client";

import { useState, type FormEvent } from "react";
import { officialDocuments, patientDocuments as initialPatientDocuments } from "@/data/mock-data";
import type { MedicalDocument, MedicalDocumentCategory, MedicalDocumentStatus } from "@/types";
import { Badge, Button, Icon, type IconName } from "@/components/ui";
import { PatientEmptyState, PatientPageHeader } from "./patient-page-header";

const categories: Array<"Tous" | MedicalDocumentCategory> = ["Tous", "Ordonnance", "Résultat d'analyse", "Compte rendu", "Imagerie", "Certificat médical", "Autre"];

function documentTone(status: MedicalDocumentStatus) {
  if (status === "Vérifié") return "green" as const;
  if (status === "Refusé") return "red" as const;
  return "amber" as const;
}

function documentIcon(category: MedicalDocumentCategory): IconName {
  if (category === "Résultat d'analyse") return "flask";
  if (category === "Imagerie") return "activity";
  if (category === "Ordonnance" || category === "Compte rendu") return "file";
  if (category === "Certificat médical") return "shield";
  return "download";
}

function DocumentRow({ document }: { document: MedicalDocument }) {
  return <article className="medical-document-row">
    <span className={`medical-doc-icon ${document.source}`}><Icon name={documentIcon(document.category)}/></span>
    <div className="medical-doc-name"><strong>{document.name}</strong><span>{document.category} • {document.size}</span>{document.rejectionReason && <p><Icon name="alert" size={12}/>{document.rejectionReason}</p>}</div>
    <div className="medical-doc-meta"><small>DATE</small><span>{document.date}</span></div>
    <div className="medical-doc-meta"><small>{document.source==="official"?"AUTEUR":"TRANSMISSION"}</small><span>{document.author ?? "Envoyé au personnel médical"}</span></div>
    <Badge tone={documentTone(document.status)}>{document.status}</Badge>
    <div className="medical-doc-actions"><button className="icon-button" aria-label={`Voir ${document.name}`} disabled title="Bientôt disponible"><Icon name="search"/></button>{document.source==="official" && <button className="icon-button" aria-label={`Télécharger ${document.name}`} disabled title="Bientôt disponible"><Icon name="download"/></button>}</div>
  </article>;
}

export function PatientDocuments() {
  const [category, setCategory] = useState<(typeof categories)[number]>("Tous");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle"|"uploading"|"success"|"error">("idle");
  const [fileName, setFileName] = useState("");
  const [documentType, setDocumentType] = useState<MedicalDocumentCategory>("Autre");
  const [documentDate, setDocumentDate] = useState("");
  const [description, setDescription] = useState("");
  const [sentDocuments, setSentDocuments] = useState(initialPatientDocuments);
  const filteredDocuments = category === "Tous" ? officialDocuments : officialDocuments.filter(document=>document.category===category);

  const uploadDocument = (event: FormEvent) => {
    event.preventDefault();
    if (!fileName || !documentDate) { setUploadStatus("error"); return; }
    setUploadStatus("uploading");
    window.setTimeout(() => {
      const uploaded: MedicalDocument = { id: `upload-${Date.now()}`, name: fileName, category: documentType, date: documentDate, status: "En attente", size: "Nouveau fichier", source: "patient" };
      setSentDocuments(current=>[uploaded,...current]);
      setUploadStatus("success");
      setFileName(""); setDocumentDate(""); setDescription("");
    }, 650);
  };

  return <main className="patient-content patient-subpage">
    <PatientPageHeader title="Mes documents" description="Consultez vos documents médicaux et envoyez de nouveaux documents à votre établissement de santé." action={<Button icon="plus" onClick={()=>{setShowUpload(true);setUploadStatus("idle")}}>Ajouter un document</Button>}/>
    {showUpload && <section className="card patient-upload-card"><div className="section-head"><div><h2>Ajouter un document</h2><p>Le fichier sera transmis au personnel médical pour vérification.</p></div><button className="icon-button" onClick={()=>setShowUpload(false)} aria-label="Fermer"><Icon name="x"/></button></div>
      <form onSubmit={uploadDocument} className="upload-form">
        <label className="file-drop"><input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={event=>setFileName(event.target.files?.[0]?.name ?? "")}/><span><Icon name="download" size={24}/></span><strong>{fileName || "Sélectionner un fichier"}</strong><small>PDF, JPG ou PNG • 10 Mo maximum</small></label>
        <label>Type de document<select value={documentType} onChange={event=>setDocumentType(event.target.value as MedicalDocumentCategory)}>{categories.slice(1).map(item=><option key={item}>{item}</option>)}</select></label>
        <label>Date du document<input type="date" value={documentDate} onChange={event=>setDocumentDate(event.target.value)}/></label>
        <label className="upload-description">Description facultative<textarea value={description} onChange={event=>setDescription(event.target.value)} placeholder="Ajoutez une information utile pour le personnel médical..."/></label>
        <div className="upload-submit">{uploadStatus==="error"&&<p className="form-error"><Icon name="alert" size={14}/>Sélectionnez un fichier et renseignez sa date.</p>}{uploadStatus==="success"&&<p className="form-success"><Icon name="check" size={14}/>Document ajouté à votre liste. Sa transmission à l'établissement n'est pas encore disponible.</p>}<Button type="submit" disabled={uploadStatus==="uploading"}>{uploadStatus==="uploading"?"Ajout en cours...":"Ajouter à la liste"}</Button></div>
      </form>
    </section>}
    <section className="card patient-documents-card"><div className="section-head"><div><h2>Documents médicaux</h2><p>Documents officiels de votre dossier • Lecture seule</p></div><Badge tone="blue"><Icon name="lock" size={12}/>Lecture seule</Badge></div>
      <div className="document-filters">{categories.map(item=><button key={item} className={category===item?"active":""} onClick={()=>setCategory(item)}>{item}</button>)}</div>
      {filteredDocuments.length ? filteredDocuments.map(document=><DocumentRow key={document.id} document={document}/>) : <PatientEmptyState icon={<Icon name="file" size={26}/>} title="Aucun document" description="Aucun document ne correspond à cette catégorie."/>}
    </section>
    <section className="card patient-documents-card sent-documents"><div className="section-head"><div><h2>Documents envoyés</h2><p>Fichiers transmis par vos soins à l'établissement</p></div><Badge tone="neutral">{sentDocuments.length} documents</Badge></div>
      {sentDocuments.length ? sentDocuments.map(document=><DocumentRow key={document.id} document={document}/>) : <PatientEmptyState icon={<Icon name="download" size={26}/>} title="Aucun document envoyé" description="Les fichiers que vous transmettez apparaîtront ici."/>}
    </section>
  </main>;
}
