import { vitalLimits, type VitalKey } from "@/data/vital-limits";
import { Icon } from "@/components/ui";

// Champ de constante : label visible au-dessus, unité à côté de la valeur, erreur sous le champ.
export function VitalInput({ id, field, label, placeholder, step, value, error, onChange }: { id: string; field: VitalKey; label?: string; placeholder: string; step: string; value: string; error?: string; onChange: (value: string) => void }) {
  const errorId = `${id}-error`;
  return <div className="vital-field">
    <label htmlFor={id}>{label ?? vitalLimits[field].label}</label>
    <div className="vital-input"><input id={id} type="number" inputMode="decimal" step={step} value={value} onChange={event=>onChange(event.target.value)} placeholder={placeholder} aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined}/><small>{vitalLimits[field].unit}</small></div>
    {error && <p id={errorId} className="field-error"><Icon name="alert" size={12}/>{error}</p>}
  </div>;
}
