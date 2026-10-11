"use client";

// État partagé de la session de démonstration : examens et consultations.
// La page Examens, le tableau de bord, la barre latérale et les dossiers patients lisent et modifient le même état.
// Rien n'est persisté : un rechargement de la page remet les données de démonstration.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { labExams, getPatientById } from "@/data/mock-data";
import type { LabExam, SessionConsultation, StaffPatient } from "@/types";

type SessionValue = {
  exams: LabExam[];
  validateExam: (id: string) => void;
  toValidate: number;
  criticalCount: number;
  validatedCount: number;
  consultations: SessionConsultation[];
  addConsultation: (input: Omit<SessionConsultation, "id" | "at">) => SessionConsultation;
  // Patients ayant une consultation dans la session, le plus récent en premier, puis les autres patients.
  recentPatients: (all: StaffPatient[]) => StaffPatient[];
  lastConsultationOf: (patientId: string) => SessionConsultation | undefined;
};

const SessionContext = createContext<SessionValue | null>(null);

// Heure courante "HH:MM" pour horodater les consultations de la session.
function nowStamp() {
  const now = new Date();
  return { offset: 0, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<LabExam[]>(labExams);
  const [consultations, setConsultations] = useState<SessionConsultation[]>([]);

  // Seul un résultat « À valider » peut être validé ; les autres statuts ne changent pas.
  const validateExam = useCallback((id: string) => {
    setExams(current => current.map(exam => exam.id === id && exam.status === "À valider" ? { ...exam, status: "Validé", tone: "green" as const } : exam));
  }, []);

  const addConsultation = useCallback((input: Omit<SessionConsultation, "id" | "at">) => {
    const created: SessionConsultation = { ...input, id: `cons-${Date.now()}`, at: nowStamp() };
    setConsultations(current => [created, ...current]);
    return created;
  }, []);

  const recentPatients = useCallback((all: StaffPatient[]) => {
    const sessionIds = [...new Set(consultations.map(item => item.patientId))];
    const fromSession = sessionIds.map(id => getPatientById(id)).filter((patient): patient is StaffPatient => Boolean(patient));
    return [...fromSession, ...all.filter(patient => !sessionIds.includes(patient.id))];
  }, [consultations]);

  const lastConsultationOf = useCallback((patientId: string) => consultations.find(item => item.patientId === patientId), [consultations]);

  const value = useMemo<SessionValue>(() => ({
    exams,
    validateExam,
    toValidate: exams.filter(exam => exam.status === "À valider").length,
    criticalCount: exams.filter(exam => exam.status === "Critique").length,
    validatedCount: exams.filter(exam => exam.status === "Validé").length,
    consultations,
    addConsultation,
    recentPatients,
    lastConsultationOf,
  }), [exams, validateExam, consultations, addConsultation, recentPatients, lastConsultationOf]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession doit être utilisé à l'intérieur de SessionProvider");
  return context;
}
