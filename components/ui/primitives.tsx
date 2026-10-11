import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";

export function Button({ children, variant = "primary", icon, onClick, type = "button", disabled = false, title }: { children: ReactNode; variant?: "primary" | "soft" | "ghost" | "danger"; icon?: IconName; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; title?: string }) {
  return <button type={type} disabled={disabled} title={title} className={`button button-${variant}`} onClick={onClick}>{icon && <Icon name={icon} size={16}/>}<span>{children}</span></button>;
}

export function Badge({ children, tone = "blue" }: { children: ReactNode; tone?: "blue" | "green" | "red" | "amber" | "neutral" | "purple" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Logo({ dark = false }: { dark?: boolean }) {
  return <div className={`logo ${dark ? "logo-dark" : ""}`}><span className="logo-mark"><Icon name="heart" size={22}/></span><span><b>Pass</b>Santé<small>par DocPoche AI</small></span></div>;
}
