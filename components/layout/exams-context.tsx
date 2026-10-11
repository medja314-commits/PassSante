"use client";

// État partagé des examens : la page Examens, le tableau de bord et la pastille de la barre latérale
// lisent et modifient la même liste. Il n'est pas persisté : un rechargement de la page remet les données de démonstration.

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { labExams } from "@/data/mock-data";
import type { LabExam } from "@/types";

type ExamsContextValue = {
  exams: LabExam[];
  validateExam: (id: string) => void;
  toValidate: number;
  criticalCount: number;
  validatedCount: number;
};

const ExamsContext = createContext<ExamsContextValue | null>(null);

export function ExamsProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<LabExam[]>(labExams);

  // Seul un résultat « À valider » peut être validé ; les autres statuts ne changent pas.
  const validateExam = useCallback((id: string) => {
    setExams(current => current.map(exam => exam.id === id && exam.status === "À valider" ? { ...exam, status: "Validé", tone: "green" as const } : exam));
  }, []);

  const value = useMemo<ExamsContextValue>(() => ({
    exams,
    validateExam,
    toValidate: exams.filter(exam => exam.status === "À valider").length,
    criticalCount: exams.filter(exam => exam.status === "Critique").length,
    validatedCount: exams.filter(exam => exam.status === "Validé").length,
  }), [exams, validateExam]);

  return <ExamsContext.Provider value={value}>{children}</ExamsContext.Provider>;
}

export function useExams() {
  const context = useContext(ExamsContext);
  if (!context) throw new Error("useExams doit être utilisé à l'intérieur de ExamsProvider");
  return context;
}
