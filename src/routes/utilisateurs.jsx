import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  Search,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

function GestionUtilisateurs() {
  const { t } = useTranslation();

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [utilisateursGroupe, setUtilisateursGroupe] = useState([]);
  const [groupesAdmin, setGroupesAdmin] = useState([]);
  const [groupeSelectionne, setGroupeSelectionne] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [showAjouterModal, setShowAjouterModal] = useState(false);
  const [showRolesModal, setShowRolesModal] = useState(false);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  const [rolesSelectionnes, setRolesSelectionnes] = useState([]);

  const ROLES_DISPONIBLES = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'numerisation', label: 'Numérisation' },
    { value: 'validation', label: 'Validation' },
    { value: 'archivage', label: 'Archivage' },
    { value: 'admin', label: 'Administrateur' }
  ];

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    if (groupeSelectionne) {
      chargerUtilisateursGroupe(groupeSelectionne.id);
    }
  }, [groupeSelectionne]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);

      // Récupérer le profil de l'utilisateur connecté
      const profilResponse = await api.get('profil/');
      const profil = profilResponse.data;

      // Trouver les groupes où l'utilisateur est admin
      const groupesAvecAdmin = profil.groupes_info?.filter(g => 
        g.roles.includes('admin')
      ) || [];

      if (groupesAvecAdmin.length === 0) {
        toast.error(t("Vous n'avez pas les permissions d'administration"));
        return;
      }

      setGroupesAdmin(groupesAvecAdmin);
      
      // Sélectionner le premier groupe par défaut
      if (groupesAvecAdmin.length > 0) {
        setGroupeSelectionne(groupesAvecAdmin[0]);
      }

      // Récupérer tous les utilisateurs
      const utilisateursResponse = await api.get('utilisateurs/');
      setUtilisateurs(utilisateursResponse.data);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  const chargerUtilisateursGroupe = async (groupeId) => {
    try {
      const response = await api.get(`groupes/${groupeId}/utilisateurs/`);
      setUtilisateursGroupe(response.data);
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du chargement des utilisateurs du groupe"));
    }
  };

  const ajouterUtilisateurAuGroupe = async (utilisateurId) => {
    try {
      await api.post('utilisateurs-groupes/assigner/', {
        utilisateur_id: utilisateurId,
        groupe_id: groupeSelectionne.id,
        roles: ['numerisation'] // Rôle par défaut
      });

      toast.success(t("Utilisateur ajouté au groupe"));
      chargerUtilisateursGroupe(groupeSelectionne.id);
      setShowAjouterModal(false);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de l'ajout de l'utilisateur"));
    }
  };

  const retirerUtilisateurDuGroupe = async (utilisateurId) => {
    if (!confirm(t("Êtes-vous sûr de vouloir retirer cet utilisateur du groupe ?"))) {
      return;
    }

    try {
      await api.post('utilisateurs-groupes/retirer/', {
        utilisateur_id: utilisateurId,
        groupe_id: groupeSelectionne.id
      });

      toast.success(t("Utilisateur retiré du groupe"));
      chargerUtilisateursGroupe(groupeSelectionne.id);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du retrait de l'utilisateur"));
    }
  };

  const ouvrirModalRoles = (utilisateur) => {
    setUtilisateurSelectionne(utilisateur);
    
    // Trouver les rôles actuels de l'utilisateur dans le groupe
    const rolesActuels = utilisateur.groupes_info?.find(
      g => g.id === groupeSelectionne.id
    )?.roles || [];
    
    setRolesSelectionnes(rolesActuels);
    setShowRolesModal(true);
  };

  const modifierRoles = async () => {
    try {
      await api.post('utilisateurs-groupes/assigner/', {
        utilisateur_id: utilisateurSelectionne.id,
        groupe_id: groupeSelectionne.id,
        roles: rolesSelectionnes
      });

      toast.success(t("Rôles modifiés avec succès"));
      chargerUtilisateursGroupe(groupeSelectionne.id);
      setShowRolesModal(false);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la modification des rôles"));
    }
  };

  const toggleRole = (role) => {
    if (rolesSelectionnes.includes(role)) {
      setRolesSelectionnes(rolesSelectionnes.filter(r => r !== role));
    } else {
      setRolesSelectionnes([...rolesSelectionnes, role]);
    }
  };

  // Filtrer les utilisateurs déjà dans le groupe
  const utilisateursDisponibles = utilisateurs.filter(u => 
    !utilisateursGroupe.some(ug => ug.id === u.id)
  );

  const utilisateursFiltres = utilisateursGroupe.filter(u => {
    const searchLower = search.toLowerCase();
    return (
      u.username?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.telephone?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (groupesAdmin.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-16 h-16 text-red-400" />
        <p className="text-lg text-gray-600">{t("Vous n'avez pas les permissions d'administration")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 px-10 max-sm:px-4">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-blackColor">
          {t("Gestion des utilisateurs")}
        </h1>
        <p className="text-textGreyColor font-medium">
          {t("Gérez les utilisateurs de vos groupes")}
        </p>
      </div>

      {/* Sélection du groupe */}
      {groupesAdmin.length > 1 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("Groupe")}
          </label>
          <select
            value={groupeSelectionne?.id || ''}
            onChange={(e) => {
              const groupe = groupesAdmin.find(g => g.id === parseInt(e.target.value));
              setGroupeSelectionne(groupe);
            }}
            className="px-4 py-3 bg-inputFieldColor rounded-lg outline-none w-full max-w-md"
          >
            {groupesAdmin.map(groupe => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Actions et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("Rechercher un utilisateur...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={() => setShowAjouterModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {t("Ajouter un utilisateur")}
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {utilisateursFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Users className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">
            {t("Aucun utilisateur dans ce groupe")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t("Utilisateur")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t("Contact")}
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    {t("Rôles")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {utilisateursFiltres.map((utilisateur) => {
                  const rolesGroupe = utilisateur.groupes_info?.find(
                    g => g.id === groupeSelectionne.id
                  )?.roles || [];

                  return (
                    <tr key={utilisateur.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-buttonGradientPrimary font-semibold">
                              {utilisateur.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {utilisateur.username}
                            </p>
                            {utilisateur.first_name && (
                              <p className="text-sm text-gray-500">
                                {utilisateur.first_name} {utilisateur.last_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{utilisateur.telephone}</p>
                          {utilisateur.email && (
                            <p className="text-gray-500">{utilisateur.email}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {rolesGroupe.map(role => (
                            <span
                              key={role}
                              className={`px-2 py-1 text-xs rounded-full ${
                                role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : role === 'validation'
                                  ? 'bg-green-100 text-green-700'
                                  : role === 'archivage'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-buttonGradientSecondary'
                              }`}
                            >
                              {ROLES_DISPONIBLES.find(r => r.value === role)?.label || role}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => ouvrirModalRoles(utilisateur)}
                            className="p-2 text-buttonGradientPrimary hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("Modifier les rôles")}
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => retirerUtilisateurDuGroupe(utilisateur.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("Retirer du groupe")}
                          >
                            <UserMinus className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ajouter utilisateur */}
      {showAjouterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("Ajouter un utilisateur au groupe")}
              </h2>
              <button
                onClick={() => setShowAjouterModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {utilisateursDisponibles.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {t("Tous les utilisateurs sont déjà dans ce groupe")}
                </p>
              ) : (
                <div className="space-y-2">
                  {utilisateursDisponibles.map(utilisateur => (
                    <div
                      key={utilisateur.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {utilisateur.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{utilisateur.username}</p>
                          <p className="text-sm text-gray-500">{utilisateur.telephone}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => ajouterUtilisateurAuGroupe(utilisateur.id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors"
                      >
                        {t("Ajouter")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Modifier rôles */}
      {showRolesModal && utilisateurSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("Modifier les rôles")}
              </h2>
              <button
                onClick={() => setShowRolesModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {t("Utilisateur")} : <span className="font-medium text-gray-900">{utilisateurSelectionne.username}</span>
                </p>
                <p className="text-sm text-gray-600">
                  {t("Groupe")} : <span className="font-medium text-gray-900">{groupeSelectionne.nom}</span>
                </p>
              </div>

              <div className="space-y-3">
                {ROLES_DISPONIBLES.map(role => (
                  <label
                    key={role.value}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={rolesSelectionnes.includes(role.value)}
                      onChange={() => toggleRole(role.value)}
                      className="w-5 h-5 text-buttonGradientPrimary rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{role.label}</p>
                    </div>
                    {rolesSelectionnes.includes(role.value) && (
                      <Check className="w-5 h-5 text-buttonGradientPrimary" />
                    )}
                  </label>
                ))}
              </div>

              {rolesSelectionnes.length === 0 && (
                <p className="mt-4 text-sm text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {t("Au moins un rôle doit être sélectionné")}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
              <button
                onClick={() => setShowRolesModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("Annuler")}
              </button>
              <button
                onClick={modifierRoles}
                disabled={rolesSelectionnes.length === 0}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t("Enregistrer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUtilisateurs;