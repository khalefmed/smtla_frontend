import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Trash2, Edit3, Package, 
  Boxes, LayoutGrid, Info
} from 'lucide-react';
import TypeMaterielModal from '@/components/ui/shared/typeModal';

function TypesMateriel() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("types-materiel/");
      setListe(res.data);
    } catch (error) {
      toast.error(t("Erreur lors du chargement du matériel"));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedType) {
        await api.put(`types-materiel/${selectedType.id}/`, formData);
        toast.success(t("Matériel mis à jour"));
      } else {
        await api.post('types-materiel/', formData);
        toast.success(t("Nouveau matériel ajouté"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { 
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous supprimer ce type de matériel ?"))) return;
    try {
      await api.delete(`types-materiel/${id}/`);
      toast.success(t("Matériel supprimé"));
      fetchData();
    } catch (error) {
      toast.error(t("Impossible de supprimer ce matériel (déjà utilisé)"));
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(m => 
      m.nom.toLowerCase().includes(q) || 
      (m.description && m.description.toLowerCase().includes(q))
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Types de Matériel")}</h1>
          <p className="text-textGreyColor font-medium">{t("Catalogue des équipements et conteneurs")}</p>
        </div>
        <button
          onClick={() => { setSelectedType(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Ajouter un matériel")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher un matériel (Conteneur, Grue...)...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl text-buttonGradientSecondary">
                  <Package className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setSelectedType(item); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-1">{item.nom}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">
                {item.description || t("Aucune description fournie")}
              </p>
              <div className="flex items-center gap-2 pt-4 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Boxes className="w-3 h-3" /> {t("Utilisé dans les rotations")}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t("Aucun matériel trouvé")}</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <TypeMaterielModal 
          typeMateriel={selectedType} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default TypesMateriel;