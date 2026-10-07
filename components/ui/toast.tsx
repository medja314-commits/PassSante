"use client";

import { useEffect } from "react";
import { Icon } from "./icon";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  autoClose?: number;
}

const toastConfig = {
  success: { icon: "check", color: "green" },
  error: { icon: "alert", color: "red" },
  info: { icon: "info", color: "blue" },
  warning: { icon: "alert", color: "amber" }
};

export function Toast({ message, type, onClose, autoClose = 3000 }: ToastProps) {
  useEffect(() => {
    if (autoClose && autoClose > 0) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  const config = toastConfig[type];

  return (
    <div className={`toast toast-${type}`} role="alert">
      <Icon name={config.icon as any} size={18} />
      <span>{message}</span>
      <button onClick={onClose} aria-label="Fermer la notification">
        <Icon name="x" size={16} />
      </button>
    </div>
  );
}

// Conteneur pour les toasts
export function ToastContainer({ toasts, onClose }: { toasts: Array<{ id: string; message: string; type: ToastType }>; onClose: (id: string) => void }) {
  if (!toasts.length) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}
