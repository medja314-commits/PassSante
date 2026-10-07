// Hook pour gérer l'interactivité des éléments
import { useState, useCallback } from 'react';
import type { NotificationType } from './interactive-actions';

export function useInteractive() {
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType = 'info', duration = 3000) => {
    setNotification({ message, type });
    if (duration > 0) {
      setTimeout(() => setNotification(null), duration);
    }
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const openModal = useCallback((modalId: string) => {
    setActiveModal(modalId);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const executeAction = useCallback(async (callback: () => Promise<void> | void, onSuccess?: string) => {
    try {
      setIsLoading(true);
      await Promise.resolve(callback());
      if (onSuccess) {
        showNotification(onSuccess, 'success');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur s\'est produite.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  return {
    notification,
    isLoading,
    activeModal,
    showNotification,
    closeNotification,
    openModal,
    closeModal,
    executeAction
  };
}

// Hook pour gérer la navigation avec confirmation
export function useNavigation() {
  const navigate = useCallback((path: string, replace = false) => {
    // À intégrer avec Next.js router
    if (replace) {
      window.location.replace(path);
    } else {
      window.location.href = path;
    }
  }, []);

  return { navigate };
}

// Hook pour gérer les états des boutons
export function useButtonState() {
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());

  const toggleButton = useCallback((buttonId: string) => {
    setActiveButtons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buttonId)) {
        newSet.delete(buttonId);
      } else {
        newSet.add(buttonId);
      }
      return newSet;
    });
  }, []);

  const isActive = useCallback((buttonId: string) => {
    return activeButtons.has(buttonId);
  }, [activeButtons]);

  return { toggleButton, isActive, activeButtons };
}
