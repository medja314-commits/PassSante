// Bornes de saisie des constantes. Une valeur hors bornes est refusée avec un message sous le champ.
export type VitalKey = "systolic" | "diastolic" | "heartRate" | "temperature" | "weight";

export const vitalLimits: Record<VitalKey, { label: string; unit: string; min: number; max: number }> = {
  systolic: { label: "Pression systolique", unit: "mmHg", min: 70, max: 250 },
  diastolic: { label: "Pression diastolique", unit: "mmHg", min: 40, max: 150 },
  heartRate: { label: "Fréquence cardiaque", unit: "bpm", min: 30, max: 220 },
  temperature: { label: "Température", unit: "°C", min: 34, max: 43 },
  weight: { label: "Poids", unit: "kg", min: 2, max: 300 },
};

// Retourne le message d'erreur à afficher, ou null si la valeur est acceptable.
// Accepte la virgule décimale française (36,8).
export function validateVital(key: VitalKey, raw: string): string | null {
  const { label, unit, min, max } = vitalLimits[key];
  const text = raw.trim().replace(",", ".");
  if (!text) return `Renseignez ${label.toLowerCase()}.`;
  const value = Number(text);
  if (!Number.isFinite(value)) return "Saisissez un nombre.";
  if (value < min || value > max) return `Valeur attendue entre ${min} et ${max} ${unit}.`;
  return null;
}
