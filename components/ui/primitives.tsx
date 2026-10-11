import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";

// `unavailable` : action non disponible. Le bouton reste focusable (aria-disabled) et son clic ne fait rien.
// Le nom accessible reprend le texte du bouton : il reste lisible même quand le texte est masqué sur mobile.
export function Button({ children, variant = "primary", icon, onClick, type = "button", disabled = false, unavailable = false, title, "aria-label": ariaLabel }: { children: ReactNode; variant?: "primary" | "soft" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; unavailable?: boolean; title?: string; "aria-label"?: string }) {
  return <button type={type} disabled={disabled} aria-disabled={unavailable || undefined} aria-label={ariaLabel ?? (typeof children === "string" ? children : undefined)} title={title} className={`button button-${variant}`} onClick={unavailable ? undefined : onClick}>{icon && <Icon name={icon} size={16}/>}<span>{children}</span></button>;
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "red" | "amber" | "neutral" | "purple" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return <div className={`logo ${dark ? "logo-dark" : ""}`}><span className="logo-mark"><Icon name="heart" size={22}/></span><span><b>Pass</b>Santé<small>par DocPoche AI</small></span></div>;
}
