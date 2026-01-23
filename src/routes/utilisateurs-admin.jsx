import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, 
  UserPlus,
  Shield,
  Search,
  X,
  Check,
  AlertCircle,
  Edit2,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Key
} from 'lucide-react';

function GestionUtilisateursSuperAdmin() {
  const { t } = useTranslation();

  const [utilisateurs, setUtilisateurs] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupeFiltre, setGroupeFiltre] = useState("tous");
  
  // Modals
  const [showModalCreer, setShowModalCreer] = useState(false);
  const [showModalModifier, setShowModalModifier] = useState(false);
  const [utilisateurSelectionne, setUtilisateurSelectionne] = useState(null);
  
  // Form création
  const [username, setUsername] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [motDePasseGenere, setMotDePasseGenere] = useState("");
  const [showPassword, setShowPassword] =  useState(false);
  const [saving, setSaving] = useState(false);

  // Form modification groupes/rôles
  const [groupesRoles, setGroupesRoles] = useState([]);

  const ROLES_DISPONIBLES = [
    { value: 'consultation', label: 'Consultation', color: 'grey' },
    { value: 'numerisation', label: 'Numérisation', color: 'blue' },
    { value: 'validation', label: 'Validation', color: 'green' },
    { value: 'archivage', label: 'Archivage', color: 'orange' },
    { value: 'admin', label: 'Administrateur', color: 'purple' }
  ];

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);

      // Charger les groupes
      const groupesResponse = await api.get('groupes/');
      setGroupes(groupesResponse.data);

      // Charger les utilisateurs
      const utilisateursResponse = await api.get('utilisateurs/');
      setUtilisateurs(utilisateursResponse.data);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  const genererMotDePasse = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  const ouvrirModalCreer = () => {
    setUsername("");
    setTelephone("");
    setEmail("");
    setFirstName("");
    setLastName("");
    const mdp = genererMotDePasse();
    setMotDePasseGenere(mdp);
    setShowPassword(false);
    
    // Initialiser avec tous les groupes sans rôles
    setGroupesRoles(groupes.map(g => ({
      groupe_id: g.id,
      groupe_nom: g.nom,
      roles: []
    })));
    
    setShowModalCreer(true);
  };

  const copierMotDePasse = () => {
    navigator.clipboard.writeText(motDePasseGenere);
    toast.success(t("Mot de passe copié dans le presse-papier"));
  };

  const creerUtilisateur = async (e) => {
    e.preventDefault();

    if (!username.trim() || !telephone.trim()) {
      toast.error(t("Le nom d'utilisateur et le téléphone sont requis"));
      return;
    }

    if (telephone.length !== 8) {
      toast.error(t("Le téléphone doit contenir 8 chiffres"));
      return;
    }

    setSaving(true);

    try {
      // 1. Créer l'utilisateur
      const userData = {
        username: username.trim(),
        telephone: telephone.trim(),
        email: email.trim() || null,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        password: motDePasseGenere
      };

      const response = await api.post('utilisateurs/', userData);
      const nouvelUtilisateur = response.data;

      // 2. Assigner les groupes et rôles
      const groupesAvecRoles = groupesRoles.filter(gr => gr.roles.length > 0);
      
      for (const gr of groupesAvecRoles) {
        await api.post('utilisateurs-groupes/assigner/', {
          utilisateur_id: nouvelUtilisateur.id,
          groupe_id: gr.groupe_id,
          roles: gr.roles
        });
      }

      toast.success(t("Utilisateur créé avec succès"));
      chargerDonnees();
      setShowModalCreer(false);

    } catch (error) {
      console.error(error);
      if (error.response?.data?.telephone) {
        toast.error(t("Ce numéro de téléphone existe déjà"));
      } else if (error.response?.data?.username) {
        toast.error(t("Ce nom d'utilisateur existe déjà"));
      } else {
        toast.error(t("Erreur lors de la création de l'utilisateur"));
      }
    } finally {
      setSaving(false);
    }
  };

  const ouvrirModalModifier = (utilisateur) => {
    setUtilisateurSelectionne(utilisateur);
    
    // Préparer les groupes et rôles
    const groupesRolesInit = groupes.map(g => {
      const groupeUtilisateur = utilisateur.groupes_info?.find(gi => gi.id === g.id);
      return {
        groupe_id: g.id,
        groupe_nom: g.nom,
        roles: groupeUtilisateur ? groupeUtilisateur.roles : []
      };
    });
    
    setGroupesRoles(groupesRolesInit);
    setShowModalModifier(true);
  };

  const modifierGroupesRoles = async () => {
    setSaving(true);

    try {
      // Supprimer toutes les relations existantes
      const groupesActuels = utilisateurSelectionne.groupes_info || [];
      
      for (const groupe of groupesActuels) {
        await api.post('utilisateurs-groupes/retirer/', {
          utilisateur_id: utilisateurSelectionne.id,
          groupe_id: groupe.id
        });
      }

      // Ajouter les nouvelles relations
      const groupesAvecRoles = groupesRoles.filter(gr => gr.roles.length > 0);
      
      for (const gr of groupesAvecRoles) {
        await api.post('utilisateurs-groupes/assigner/', {
          utilisateur_id: utilisateurSelectionne.id,
          groupe_id: gr.groupe_id,
          roles: gr.roles
        });
      }

      toast.success(t("Groupes et rôles modifiés avec succès"));
      chargerDonnees();
      setShowModalModifier(false);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la modification"));
    } finally {
      setSaving(false);
    }
  };

  const supprimerUtilisateur = async (utilisateur) => {
    if (!confirm(t(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${utilisateur.username}" ?`))) {
      return;
    }

    try {
      await api.delete(`utilisateurs/${utilisateur.id}/`);
      toast.success(t("Utilisateur supprimé avec succès"));
      chargerDonnees();
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la suppression de l'utilisateur"));
    }
  };

  const toggleRoleGroupe = (groupeId, role) => {
    setGroupesRoles(prev => prev.map(gr => {
      if (gr.groupe_id === groupeId) {
        const hasRole = gr.roles.includes(role);
        return {
          ...gr,
          roles: hasRole 
            ? gr.roles.filter(r => r !== role)
            : [...gr.roles, role]
        };
      }
      return gr;
    }));
  };

  const utilisateursFiltres = utilisateurs.filter(u => {
    const searchLower = search.toLowerCase();
    const matchSearch = (
      u.username?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower) ||
      u.telephone?.toLowerCase().includes(searchLower) ||
      u.first_name?.toLowerCase().includes(searchLower) ||
      u.last_name?.toLowerCase().includes(searchLower)
    );

    if (groupeFiltre === "tous") {
      return matchSearch;
    } else if (groupeFiltre === "aucun") {
      return matchSearch && (!u.groupes_info || u.groupes_info.length === 0);
    } else {
      const dansGroupe = u.groupes_info?.some(g => g.id === parseInt(groupeFiltre));
      return matchSearch && dansGroupe;
    }
  });

  const getRoleColor = (role) => {
    const roleConfig = ROLES_DISPONIBLES.find(r => r.value === role);
    return roleConfig ? roleConfig.color : 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
          {t("Gérez tous les utilisateurs du système (Super Admin)")}
        </p>
      </div>

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

          {/* Filtre par groupe */}
          <select
            value={groupeFiltre}
            onChange={(e) => setGroupeFiltre(e.target.value)}
            className="px-4 py-3 bg-inputFieldColor rounded-lg outline-none min-w-[200px]"
          >
            <option value="tous">{t("Tous les groupes")}</option>
            <option value="aucun">{t("Sans groupe")}</option>
            {groupes.map(groupe => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </select>

          {/* Bouton Créer */}
          <button
            onClick={ouvrirModalCreer}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            {t("Créer un utilisateur")}
          </button>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {utilisateursFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Users className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">
            {t("Aucun utilisateur trouvé")}
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
                    {t("Groupes et rôles")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                    {t("Actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {utilisateursFiltres.map((utilisateur) => (
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
                          {(utilisateur.first_name || utilisateur.last_name) && (
                            <p className="text-sm text-gray-500">
                              {utilisateur.first_name} {utilisateur.last_name}
                            </p>
                          )}
                          {utilisateur.est_superadmin && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full mt-1">
                              <Shield className="w-3 h-3" />
                              Super Admin
                            </span>
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
                      {utilisateur.groupes_info && utilisateur.groupes_info.length > 0 ? (
                        <div className="space-y-2">
                          {utilisateur.groupes_info.map(groupe => (
                            <div key={groupe.id} className="flex flex-col gap-1">
                              <p className="text-sm font-medium text-gray-700">{groupe.nom}</p>
                              <div className="flex flex-wrap gap-1">
                                {groupe.roles?.map(role => (
                                  <span
                                    key={role}
                                    className={`px-2 py-0.5 text-xs rounded-full ${
                                      getRoleColor(role) === 'purple' ? 'bg-purple-100 text-purple-700' :
                                      getRoleColor(role) === 'green' ? 'bg-green-100 text-green-700' :
                                      getRoleColor(role) === 'orange' ? 'bg-orange-100 text-orange-700' :
                                      'bg-blue-100 text-buttonGradientSecondary'
                                    }`}
                                  >
                                    {ROLES_DISPONIBLES.find(r => r.value === role)?.label || role}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">{t("Aucun groupe")}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => ouvrirModalModifier(utilisateur)}
                          className="p-2 text-buttonGradientPrimary hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("Modifier groupes et rôles")}
                        >
                          <Shield className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => supprimerUtilisateur(utilisateur)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("Supprimer")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Créer utilisateur */}
      {showModalCreer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("Créer un nouvel utilisateur")}
              </h2>
              <button
                onClick={() => setShowModalCreer(false)}
                disabled={saving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={creerUtilisateur} className="p-6 space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t("Informations de base")}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Nom d'utilisateur")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Téléphone")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="telephone"
                      type="text"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="12345678"
                      maxLength={8}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Prénom")}
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Nom")}
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("Email")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Mot de passe généré */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-buttonGradientPrimary mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      {t("Mot de passe généré automatiquement")}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white border border-blue-200 rounded px-3 py-2 font-mono text-sm">
                        {showPassword ? motDePasseGenere : '••••••••••••'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-2 text-buttonGradientPrimary hover:bg-blue-100 rounded-lg transition-colors"
                        title={showPassword ? t("Masquer") : t("Afficher")}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button
                        type="button"
                        onClick={copierMotDePasse}
                        className="p-2 text-buttonGradientPrimary hover:bg-blue-100 rounded-lg transition-colors"
                        title={t("Copier")}
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-xs text-buttonGradientSecondary mt-2">
                      {t("Copiez ce mot de passe et transmettez-le à l'utilisateur de manière sécurisée")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Groupes et rôles */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">{t("Groupes et rôles")}</h3>
                
                {groupes.length === 0 ? (
                  <p className="text-sm text-amber-600">
                    {t("Aucun groupe disponible. L'utilisateur sera créé sans groupe.")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupesRoles.map(gr => (
                      <div key={gr.groupe_id} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-3">{gr.groupe_nom}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {ROLES_DISPONIBLES.map(role => (
                            <label
                              key={role.value}
                              className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={gr.roles.includes(role.value)}
                                onChange={() => toggleRoleGroupe(gr.groupe_id, role.value)}
                                className="w-4 h-4 text-buttonGradientPrimary rounded"
                              />
                              <span className="text-sm text-gray-700">{role.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModalCreer(false)}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("Annuler")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("Création...")}
                    </>
                  ) : (
                    t("Créer l'utilisateur")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Modifier groupes/rôles */}
      {showModalModifier && utilisateurSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {t("Modifier groupes et rôles")}
              </h2>
              <button
                onClick={() => setShowModalModifier(false)}
                disabled={saving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  {t("Utilisateur")} : <span className="font-medium text-gray-900">{utilisateurSelectionne.username}</span>
                </p>
              </div>

              <div className="space-y-3">
                {groupesRoles.map(gr => (
                  <div key={gr.groupe_id} className="border border-gray-200 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-3">{gr.groupe_nom}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES_DISPONIBLES.map(role => (
                        <label
                          key={role.value}
                          className="flex items-center gap-2 p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={gr.roles.includes(role.value)}
                            onChange={() => toggleRoleGroupe(gr.groupe_id, role.value)}
                            className="w-4 h-4 text-buttonGradientPrimary rounded"
                          />
                          <span className="text-sm text-gray-700">{role.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModalModifier(false)}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-    700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("Annuler")}
                </button>
                <button
                  onClick={modifierGroupesRoles}
                  disabled={saving}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("Sauvegarde...")}
                    </>
                  ) : (
                    t("Sauvegarder les modifications")
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionUtilisateursSuperAdmin;