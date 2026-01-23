import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, 
  FolderOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar
} from 'lucide-react';

function GestionGroupes() {
  const { t } = useTranslation();

  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [groupeSelectionne, setGroupeSelectionne] = useState(null);
  
  // Form
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    chargerGroupes();
  }, []);

  const chargerGroupes = async () => {
    try {
      setLoading(true);
      const response = await api.get('groupes/');
      setGroupes(response.data);
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors du chargement des groupes"));
    } finally {
      setLoading(false);
    }
  };

  const ouvrirModalAjout = () => {
    setModeEdition(false);
    setGroupeSelectionne(null);
    setNom("");
    setDescription("");
    setShowModal(true);
  };

  const ouvrirModalModification = (groupe) => {
    setModeEdition(true);
    setGroupeSelectionne(groupe);
    setNom(groupe.nom);
    setDescription(groupe.description || "");
    setShowModal(true);
  };

  const fermerModal = () => {
    setShowModal(false);
    setNom("");
    setDescription("");
    setGroupeSelectionne(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom.trim()) {
      toast.error(t("Le nom du groupe est requis"));
      return;
    }

    setSaving(true);

    try {
      const data = {
        nom: nom.trim(),
        description: description.trim()
      };

      if (modeEdition) {
        // Modification
        await api.put(`groupes/${groupeSelectionne.id}/`, data);
        toast.success(t("Groupe modifié avec succès"));
      } else {
        // Création
        await api.post('groupes/', data);
        toast.success(t("Groupe créé avec succès"));
      }

      chargerGroupes();
      fermerModal();

    } catch (error) {
      console.error(error);
      if (error.response?.data?.nom) {
        toast.error(t("Ce nom de groupe existe déjà"));
      } else {
        toast.error(t("Erreur lors de l'enregistrement du groupe"));
      }
    } finally {
      setSaving(false);
    }
  };

  const supprimerGroupe = async (groupe) => {
    if (!confirm(t(`Êtes-vous sûr de vouloir supprimer le groupe "${groupe.nom}" ?`))) {
      return;
    }

    try {
      await api.delete(`groupes/${groupe.id}/`);
      toast.success(t("Groupe supprimé avec succès"));
      chargerGroupes();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 400) {
        toast.error(t("Impossible de supprimer ce groupe car il contient des données"));
      } else {
        toast.error(t("Erreur lors de la suppression du groupe"));
      }
    }
  };

  const groupesFiltres = groupes.filter(groupe => {
    const searchLower = search.toLowerCase();
    return (
      groupe.nom?.toLowerCase().includes(searchLower) ||
      groupe.description?.toLowerCase().includes(searchLower)
    );
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
          {t("Gestion des groupes")}
        </h1>
        <p className="text-textGreyColor font-medium">
          {t("Créez et gérez les groupes de votre organisation")}
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
                placeholder={t("Rechercher un groupe...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={ouvrirModalAjout}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t("Créer un groupe")}
          </button>
        </div>
      </div>

      {/* Liste des groupes */}
      {groupesFiltres.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Users className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">
            {search ? t("Aucun groupe trouvé") : t("Aucun groupe")}
          </p>
          <p className="text-gray-400 text-sm">
            {search 
              ? t("Essayez avec d'autres mots-clés")
              : t("Commencez par créer votre premier groupe")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupesFiltres.map((groupe) => (
            <div
              key={groupe.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Header de la carte */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {groupe.nom}
                    </h3>
                    {groupe.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {groupe.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(groupe.date_creation)}</span>
                </div>
              </div>

              {/* Statistiques */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-4 h-4 text-buttonGradientPrimary" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("Utilisateurs")}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {groupe.nombre_utilisateurs || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FolderOpen className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{t("Types")}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {groupe.nombre_types_dossiers || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => ouvrirModalModification(groupe)}
                  className="p-2 text-buttonGradientPrimary hover:bg-blue-50 rounded-lg transition-colors"
                  title={t("Modifier")}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => supprimerGroupe(groupe)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t("Supprimer")}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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
                {modeEdition ? t("Modifier le groupe") : t("Créer un groupe")}
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
              {/* Nom */}
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("Nom du groupe")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="nom"
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder={t("Ex: Ressources Humaines")}
                  required
                  autoFocus
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
                  placeholder={t("Description du groupe (optionnel)")}
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
                  disabled={saving || !nom.trim()}
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

export default GestionGroupes;