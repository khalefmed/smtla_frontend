import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  FolderOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  FileText,
  Tag
} from 'lucide-react';

function GestionTypes() {
  const { t } = useTranslation();

  const [types, setTypes] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [groupeFiltre, setGroupeFiltre] = useState("tous");
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [typeSelectionne, setTypeSelectionne] = useState(null);
  
  // Form
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [groupeId, setGroupeId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Charger les groupes
      const groupesResponse = await api.get('groupes/');
      setGroupes(groupesResponse.data);

      // Charger les types
      const typesResponse = await api.get('types-dossiers/');
      setTypes(typesResponse.data);

    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du chargement des données"));
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModalAjout = () => {
    setModeEdition(false);
    setTypeSelectionne(null);
    setNom("");
    setDescription("");
    setGroupeId(groupes.length > 0 ? groupes[0].id : "");
    setShowModal(true);
  };

  const ouvrirModalModification = (type) => {
    setModeEdition(true);
    setTypeSelectionne(type);
    setNom(type.nom);
    setDescription(type.description || "");
    setGroupeId(type.groupe);
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setNom("");
    setDescription("");
    setGroupeId("");
    setTypeSelectionne(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom.trim()) {
      toast.error(t("Le nom du type est requis"));
      return;
    }

    if (!groupeId) {
      toast.error(t("Veuillez sélectionner un groupe"));
      return;
    }

    setSaving(true);

    try {
      const data = {
        nom: nom.trim(),
        description: description.trim(),
        groupe: groupeId
      };

      if (modeEdition) {
        // Modification
        await api.put(`types-dossiers/${typeSelectionne.id}/`, data);
        toast.success(t("Type modifié avec succès"));
      } else {
        // Création
        await api.post('types-dossiers/', data);
        toast.success(t("Type créé avec succès"));
      }

      chargerDonnees();
      fermerModal();

    } catch (error) {
      console.error(error);
      if (error.response?.data?.non_field_errors) {
        toast.error(t("Ce type existe déjà dans ce groupe"));
      } else {
        toast.error(t("Erreur lors de l'enregistrement du type"));
      }
    } finally {
      setSaving(false);
    }
  };

  const supprimerType = async (type) => {
    if (!confirm(t(`Êtes-vous sûr de vouloir supprimer le type "${type.nom}" ?`))) {
      return;
    }

    try {
      await api.delete(`types-dossiers/${type.id}/`);
      toast.success(t("Type supprimé avec succès"));
      chargerDonnees();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400 || error.response?.status === 409) {
        toast.error(t("Impossible de supprimer ce type car il est utilisé par des dossiers"));
      } else {
        toast.error(t("Erreur lors de la suppression du type"));
      }
    }
  };

  const typesFiltres = types.filter(type => {
    const searchLower = search.toLowerCase();
    const matchSearch = (
      type.nom?.toLowerCase().includes(searchLower) ||
      type.description?.toLowerCase().includes(searchLower) ||
      type.groupe_nom?.toLowerCase().includes(searchLower)
    );

    const matchGroupe = groupeFiltre === "tous" || type.groupe === parseInt(groupeFiltre);

    return matchSearch && matchGroupe;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getGroupeNom = (groupeId) => {
    const groupe = groupes.find(g => g.id === groupeId);
    return groupe ? groupe.nom : '-';
  };

  // Grouper les types par groupe pour l'affichage
  const typesParGroupe = typesFiltres.reduce((acc, type) => {
    const groupeNom = type.groupe_nom || 'Sans groupe';
    if (!acc[groupeNom]) {
      acc[groupeNom] = [];
    }
    acc[groupeNom].push(type);
    return acc;
  }, {});

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
          {t("Gestion des types de dossiers")}
        </h1>
        <p className="text-textGreyColor font-medium">
          {t("Créez et gérez les types de dossiers par groupe")}
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
                placeholder={t("Rechercher un type...")}
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
            {groupes.map(groupe => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom}
              </option>
            ))}
          </select>

          {/* Bouton Ajouter */}
          <button
            onClick={ouvrirModalAjout}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("Créer un type")}
          </button>
        </div>
      </div>

      {/* Liste des types */}
      {typesFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <FolderOpen className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">
            {search || groupeFiltre !== "tous" 
              ? t("Aucun type trouvé") 
              : t("Aucun type de dossier")}
          </p>
          <p className="text-gray-400 text-sm">
            {search || groupeFiltre !== "tous"
              ? t("Essayez avec d'autres critères")
              : t("Commencez par créer votre premier type de dossier")}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(typesParGroupe).map(([groupeNom, typesGroupe]) => (
            <div key={groupeNom}>
              {/* En-tête du groupe */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                  <Tag className="w-5 h-5 text-gray-600" />
                  <h2 className="font-semibold text-gray-800">{groupeNom}</h2>
                  <span className="text-sm text-gray-500">
                    ({typesGroupe.length})
                  </span>
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Types du groupe */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typesGroupe.map((type) => (
                  <div
                    key={type.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Header de la carte */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-5 h-5 text-green-500" />
                            <h3 className="font-semibold text-lg text-gray-900">
                              {type.nom}
                            </h3>
                          </div>
                          {type.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {type.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(type.date_creation)}</span>
                      </div>
                    </div>

                    {/* Statistiques */}
                    <div className="p-6 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <FolderOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{t("Dossiers")}</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {type.nombre_dossiers || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => ouvrirModalModification(type)}
                        className="p-2 text-buttonGradientPrimary hover:bg-blue-50 rounded-lg transition-colors"
                        title={t("Modifier")}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => supprimerType(type)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t("Supprimer")}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">
                {modeEdition ? t("Modifier le type") : t("Créer un type de dossier")}
              </h2>
              <button
                onClick={fermerModal}
                disabled={saving}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Groupe */}
              <div>
                <label htmlFor="groupe" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Groupe")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="groupe"
                  value={groupeId}
                  onChange={(e) => setGroupeId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">{t("Sélectionnez un groupe")}</option>
                  {groupes.map(groupe => (
                    <option key={groupe.id} value={groupe.id}>
                      {groupe.nom}
                    </option>
                  ))}
                </select>
                {groupes.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">
                    {t("Aucun groupe disponible. Veuillez d'abord créer un groupe.")}
                  </p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Nom du type")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={t("Ex: Contrat, Facture, Rapport...")}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Description")}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder={t("Description du type (optionnel)")}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={fermerModal}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {t("Annuler")}
                </button>
                <button
                  type="submit"
                  disabled={saving || !nom.trim() || !groupeId}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      {t("Enregistrement...")}
                    </>
                  ) : (
                    <>
                      {modeEdition ? t("Modifier") : t("Créer")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestionTypes;