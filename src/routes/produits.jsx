import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Plus, 
  Package, 
  Truck, 
  Trash2, 
  Edit3, 
  Filter 
} from 'lucide-react';
import ProduitModal from '@/components/ui/shared/produitModal'; // À créer ci-dessous

function Produits() {
  const { t } = useTranslation();

  // États pour les données
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");

  // États pour le Modal (Création / Edition)
  const [showModal, setShowModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    try {
      setLoading(true);
      const response = await api.get("produits/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des produits"));
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sauvegarde (Création ou Modification)
  const handleSave = async (formData) => {
    try {
      if (selectedProduit) {
        // Mode Edition
        await api.put(`produits/${selectedProduit.id}/`, formData);
        toast.success(t("Produit mis à jour !"));
      } else {
        // Mode Création
        await api.post('produits/', formData);
        toast.success(t("Produit ajouté avec succès !"));
      }
      setShowModal(false);
      fetchProduits();
    } catch (error) {
        console.log(error)
      toast.error(t("Une erreur est survenue lors de l'enregistrement"));
    }
  };

  // Gérer la suppression
  const handleDelete = async (id) => {
    if (window.confirm(t("Voulez-vous vraiment supprimer ce produit ?"))) {
      try {
        await api.delete(`produits/${id}/`);
        toast.success(t("Produit supprimé"));
        fetchProduits();
      } catch (error) {
        toast.error(t("Erreur lors de la suppression"));
      }
    }
  };

  // Ouvrir le modal pour édition
  const openEditModal = (produit) => {
    setSelectedProduit(produit);
    setShowModal(true);
  };

  // Logique de filtrage
  const filteredProduits = useMemo(() => {
    return liste.filter((p) => {
      const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) || 
                          p.camion.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "Tous" || p.statut === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [liste, search, statusFilter]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Gestion du Stock")}</h1>
          <p className="text-textGreyColor font-medium">{t("Liste des produits arrivés et sortis")}</p>
        </div>
        <button
          onClick={() => { setSelectedProduit(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t("Ajouter un produit")}
        </button>
      </div>

      {/* Barre de Filtres */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Rechercher par nom ou camion...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-blue-500"
          >
            <option value="Tous">{t("Tous les statuts")}</option>
            <option value="arrive">{t("Arrivé")}</option>
            <option value="sortie">{t("Sorti")}</option>
          </select>
        </div>
      </div>

      {/* Tableau / Liste */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">{t("Produit")}</th>
              <th className="px-6 py-4">{t("Quantité")}</th>
              <th className="px-6 py-4">{t("Camion")}</th>
              <th className="px-6 py-4">{t("Statut")}</th>
              <th className="px-6 py-4 text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProduits.length > 0 ? (
              filteredProduits.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.nom}</td>
                  <td className="px-6 py-4 text-gray-600">{p.quantite}</td>
                  <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-400" /> {p.camion}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      p.statut === 'arrive' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {p.statut === 'arrive' ? t('Arrivé') : t('Sorti')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(p)} className="p-2 hover:bg-blue-50 text-buttonGradientPrimary rounded-lg">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {p.statut === 'arrive' && <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  {t("Aucun produit trouvé")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Création/Edition */}
      {showModal && (
        <ProduitModal 
          produit={selectedProduit} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default Produits;