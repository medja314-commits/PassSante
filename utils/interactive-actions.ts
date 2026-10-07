// Utilitaires pour rendre les boutons vraiment interactifs
// À intégrer avec les actions réelles du backend

export const interactiveActions = {
  // Actions Patients
  openPatient: (id: string) => ({
    action: "open-patient",
    target: `/patients/${id}`,
    data: { patientId: id }
  }),

  createPatient: () => ({
    action: "create-patient",
    modal: true,
    title: "Nouveau patient"
  }),

  editPatient: (id: string) => ({
    action: "edit-patient",
    target: `/patients/${id}/edit`,
    modal: true
  }),

  // Actions Rendez-vous
  modifyAppointment: (appointmentId: string) => ({
    action: "modify-appointment",
    appointmentId,
    modal: true,
    title: "Modifier le rendez-vous"
  }),

  createAppointment: () => ({
    action: "create-appointment",
    modal: true,
    title: "Nouveau rendez-vous"
  }),

  viewAppointmentDetails: (appointmentId: string) => ({
    action: "view-appointment",
    appointmentId
  }),

  // Actions Documents
  downloadDocument: (documentId: string, name: string) => ({
    action: "download-document",
    documentId,
    filename: name
  }),

  uploadDocument: () => ({
    action: "upload-document",
    modal: true,
    title: "Télécharger un document"
  }),

  // Actions Constantes
  viewVitalsHistory: () => ({
    action: "view-vitals-history",
    target: "/espace-patient/constantes"
  }),

  recordVitals: () => ({
    action: "record-vitals",
    modal: true,
    title: "Enregistrer les constantes"
  }),

  // Actions Examens
  validateExamResult: (examId: string) => ({
    action: "validate-exam",
    examId,
    confirmation: true
  }),

  requestExam: () => ({
    action: "request-exam",
    modal: true,
    title: "Demander un examen"
  }),

  // Actions Admin
  inviteUser: () => ({
    action: "invite-user",
    modal: true,
    title: "Inviter un utilisateur"
  }),

  editUserRole: (userId: string, userName: string) => ({
    action: "edit-role",
    userId,
    userName,
    modal: true
  }),

  // Actions Assistant IA
  askAssistant: (question: string) => ({
    action: "ask-assistant",
    question,
    timestamp: new Date().toISOString()
  }),

  // Actions de navigation
  navigate: (path: string) => ({
    action: "navigate",
    target: path
  }),

  // Actions de notification
  showNotification: (message: string, type: "success" | "error" | "info") => ({
    action: "notify",
    message,
    type,
    duration: 3000
  })
};

export const actionHandlers = {
  // Gestionnaire d'actions avec feedback
  handleAction: async (action: ReturnType<typeof interactiveActions[keyof typeof interactiveActions]>, callback?: (result: any) => void) => {
    try {
      // Simuler une action avec feedback
      if (action.action === "navigate") {
        window.location.href = action.target;
      } else if (action.modal) {
        // Ouvrir modal
        console.log("Ouverture modal:", action.title);
      } else if (action.action === "download-document") {
        // Simuler téléchargement
        console.log("Téléchargement:", action.filename);
      } else {
        console.log("Action:", action);
      }

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error("Erreur action:", error);
      if (callback) {
        callback({ success: false, error });
      }
    }
  }
};

// Notifications toast
export type NotificationType = "success" | "error" | "info" | "warning";

export const notificationMessages = {
  patientCreated: (name: string) => `Patient ${name} créé avec succès.`,
  patientUpdated: (name: string) => `Dossier de ${name} mis à jour.`,
  appointmentModified: () => "Rendez-vous modifié.",
  appointmentCancelled: () => "Rendez-vous annulé.",
  documentUploaded: (name: string) => `${name} téléchargé avec succès.`,
  documentDeleted: () => "Document supprimé.",
  vitalsRecorded: () => "Constantes enregistrées.",
  examRequested: () => "Demande d'examen envoyée.",
  examValidated: () => "Résultat validé.",
  userInvited: (email: string) => `Invitation envoyée à ${email}.`,
  roleUpdated: () => "Rôles et permissions mis à jour.",
  error: (message?: string) => message || "Une erreur s'est produite."
};
