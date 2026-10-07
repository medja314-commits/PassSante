import PassSanteApp from "@/components/layout/pass-sante-app";

// TODO(Sidickk):
// Connecter cette page à l'API de gestion des utilisateurs.
// Implémenter la création d'un nouvel utilisateur.
// Ajouter la modification et suppression d'utilisateurs.
// Gérer l'attribution des rôles (hospital_staff, patient, admin).
// Implémenter la recherche et les filtres.
// Afficher le journal d'audit pour chaque utilisateur.
// Gérer l'activation/désactivation des comptes.
export default function AdminUsersPage() {
  return <PassSanteApp area="admin" view="users"/>;
}
