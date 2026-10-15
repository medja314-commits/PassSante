"use client";

// État partagé de la démonstration : patients, antécédents, allergies et consultations sont conservés dans le navigateur.
// Les examens restent un état de session et retrouvent leurs valeurs de démonstration après rechargement.

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoConsultations, labExams, staffPatients } from "@/data/mock-data";
import type { LabExam, SessionConsultation, StaffPatient } from "@/types";

type SessionValue = {
  storageLoaded: boolean;
  exams: LabExam[];
  validateExam: (id: string) => void;
  toValidate: number;
  criticalCount: number;
  validatedCount: number;
  consultations: SessionConsultation[];
  addConsultation: (input: Omit<SessionConsultation, "id" | "at">) => SessionConsultation;
  patients: StaffPatient[];
  addPatient: (input: Omit<StaffPatient, "id" | "initials" | "age" | "lastVisit" | "next" | "status" | "tone" | "alert">) => StaffPatient;
  updatePatientHistory: (id: string, medicalHistory: string[], allergies: string[]) => void;
  // Patients ayant une consultation dans la session, le plus récent en premier, puis les autres patients.
  recentPatients: (all: StaffPatient[]) => StaffPatient[];
  lastConsultationOf: (patientId: string) => SessionConsultation | undefined;
};

const SessionContext = createContext<SessionValue | null>(null);
const STORAGE_KEY = "pass-sante-demo-v1";

type PersistedDemoData = { patients: StaffPatient[]; consultations: SessionConsultation[] };

function readDemoData(): PersistedDemoData {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) {
      const parsed = JSON.parse(value) as PersistedDemoData;
      if (Array.isArray(parsed.patients) && Array.isArray(parsed.consultations)) return parsed;
    }
  } catch {
    // En cas de stockage illisible, la démonstration redémarre avec ses données fictives.
  }
  return { patients: staffPatients, consultations: demoConsultations };
}

// Heure courante "HH:MM" pour horodater les consultations de la session.
function nowStamp() {
  const now = new Date();
  return { offset: 0, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` };
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<LabExam[]>(labExams);
  const [consultations, setConsultations] = useState<SessionConsultation[]>(demoConsultations);
  const [patients, setPatients] = useState<StaffPatient[]>(staffPatients);
  const [storageLoaded, setStorageLoaded] = useState(false);

  useEffect(() => {
    const saved = readDemoData();
    setPatients(saved.patients);
    setConsultations(saved.consultations);
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ patients, consultations } satisfies PersistedDemoData));
    } catch {
      // L'application reste utilisable même si le navigateur refuse le stockage local.
    }
  }, [patients, consultations, storageLoaded]);

  // Seul un résultat « À valider » peut être validé ; les autres statuts ne changent pas.
  const validateExam = useCallback((id: string) => {
    setExams(current => current.map(exam => exam.id === id && exam.status === "À valider" ? { ...exam, status: "Validé", tone: "green" as const } : exam));
  }, []);

  const addConsultation = useCallback((input: Omit<SessionConsultation, "id" | "at">) => {
    const created: SessionConsultation = { ...input, id: `cons-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, at: nowStamp() };
    setConsultations(current => [created, ...current]);
    return created;
  }, []);

  const recentPatients = useCallback((all: StaffPatient[]) => {
    const sessionIds = [...new Set(consultations.map(item => item.patientId))];
    const fromSession = sessionIds.map(id => patients.find(patient => patient.id === id)).filter((patient): patient is StaffPatient => Boolean(patient));
    const ordered = [...patients, ...all.filter(patient => !patients.some(saved => saved.id === patient.id))];
    return [...fromSession, ...ordered.filter(patient => !sessionIds.includes(patient.id))];
  }, [consultations, patients]);

  const lastConsultationOf = useCallback((patientId: string) => consultations.find(item => item.patientId === patientId), [consultations]);

  const addPatient = useCallback((input: Omit<StaffPatient, "id" | "initials" | "age" | "lastVisit" | "next" | "status" | "tone" | "alert">) => {
    const year = new Date().getFullYear();
    const sequence = patients.filter(patient => patient.id.startsWith(`PS-${year}-`)).length + 1;
    const id = `PS-${year}-${String(sequence).padStart(4, "0")}`;
    const initials = input.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toLocaleUpperCase("fr") ?? "").join("");
    const birthDate = input.birthDate ?? "";
    const parsedBirthDate = birthDate ? new Date(`${birthDate}T12:00:00`) : null;
    const ageNumber = parsedBirthDate && !Number.isNaN(parsedBirthDate.getTime()) ? Math.max(0, year - parsedBirthDate.getFullYear() - (new Date().getTime() < new Date(year, parsedBirthDate.getMonth(), parsedBirthDate.getDate()).getTime() ? 1 : 0)) : 0;
    const allergies = input.allergies ?? [];
    const created: StaffPatient = {
      ...input,
      id,
      initials,
      age: `${ageNumber} ans`,
      birthDate: parsedBirthDate && !Number.isNaN(parsedBirthDate.getTime()) ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(parsedBirthDate) : undefined,
      lastVisit: { offset: 0 },
      next: { offset: 30 },
      status: "Nouveau",
      tone: "purple",
      alert: allergies.join(", "),
      allergy: allergies.join(", ") || undefined,
    };
    setPatients(current => [created, ...current]);
    return created;
  }, [patients]);

  const updatePatientHistory = useCallback((id: string, medicalHistory: string[], allergies: string[]) => {
    setPatients(current => current.map(patient => patient.id === id ? {
      ...patient,
      medicalHistory,
      allergies,
      allergy: allergies.join(", ") || undefined,
      alert: allergies.length ? allergies.join(", ") : patient.alert === patient.allergy ? "" : patient.alert,
    } : patient));
  }, []);

  const value = useMemo<SessionValue>(() => ({
    storageLoaded,
    exams,
    validateExam,
    toValidate: exams.filter(exam => exam.status === "À valider").length,
    criticalCount: exams.filter(exam => exam.status === "Critique").length,
    validatedCount: exams.filter(exam => exam.status === "Validé").length,
    consultations,
    addConsultation,
    patients,
    addPatient,
    updatePatientHistory,
    recentPatients,
    lastConsultationOf,
  }), [exams, validateExam, consultations, addConsultation, patients, addPatient, updatePatientHistory, recentPatients, lastConsultationOf, storageLoaded]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession doit être utilisé à l'intérieur de SessionProvider");
  return context;
}
