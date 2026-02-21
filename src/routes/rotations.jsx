import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Package, Truck, Trash2, 
  Edit3, ArrowDownCircle, ArrowUpCircle, Calendar, Hash, User, AlertCircle
} from 'lucide-react';
import RotationModal from '@/components/ui/shared/rotationModal';

function Rotations() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState('entrantes'); // 'entrantes' ou 'sortantes'

  const [showModal, setShowModal] = useState(false);
  const [selectedRotation, setSelectedRotation] = useState(null);

  useEffect(() => {
    fetchRotations();
  }, [activeTab]);

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'entrantes' ? "rotations-entrantes/" : "rotations-sortantes/";
      const response = await api.get(endpoint);
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur de chargement"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      const endpoint = activeTab === 'entrantes' ? "rotations-entrantes/" : "rotations-sortantes/";
      
      if (selectedRotation) {
        await api.put(`${endpoint}${selectedRotation.id}/`, formData);
        toast.success(t("Mise à jour réussie"));
      } else {
        await api.post(endpoint, formData);
        toast.success(t("Rotation enregistrée"));
      }
      
      setShowModal(false);
      fetchRotations();
    } catch (error) {
      // GESTION DES ERREURS DE STOCK DU BACKEND
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        
        // Si le backend renvoie une erreur sur le champ 'quantite' (stock insuffisant)
        if (serverErrors.quantite) {
          toast.error(Array.isArray(serverErrors.quantite) ? serverErrors.quantite[0] : serverErrors.quantite, {
            duration: 5000,
            icon: <AlertCircle className="text-red-500" />
          });
        } else if (serverErrors.non_field_errors) {
          toast.error(serverErrors.non_field_errors[0]);
        } else {
          toast.error(t("Erreur lors de l'enregistrement"));
        }
      } else {
        toast.error(t("Veuillez vérifier les champs"));
      }
    }
  };

  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter((r) => 
      r.client_nom?.toLowerCase().includes(q) || 
      r.type_materiel_nom?.toLowerCase().includes(q) ||
      r.numero_bordereau?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-6 px-10 max-sm:px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">{t("Mouvements Logistiques")}</h1>
          <p className="text-gray-500 font-medium">{t("Gestion des flux clients")}</p>
        </div>
        <button
          onClick={() => { setSelectedRotation(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'entrantes' ? t("Nouvelle Entrée") : t("Nouvelle Sortie")}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-gray-100 w-fit rounded-2xl border border-gray-200">
        <button
          onClick={() => setActiveTab('entrantes')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'entrantes' ? "bg-white text-buttonGradientSecondary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ArrowDownCircle className={`w-5 h-5 ${activeTab === 'entrantes' ? "text-green-500" : ""}`} />
          {t("Entrées")}
        </button>
        <button
          onClick={() => setActiveTab('sortantes')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'sortantes' ? "bg-white text-buttonGradientSecondary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <ArrowUpCircle className={`w-5 h-5 ${activeTab === 'sortantes' ? "text-orange-500" : ""}`} />
          {t("Sorties")}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par client, bordereau ou matériel...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-buttonGradientPrimary font-medium transition-all"
        />
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div></div>
        ) : filteredData.length > 0 ? (
          filteredData.map((r) => (
            <div key={r.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all group border-l-4" 
                 style={{ borderLeftColor: activeTab === 'entrantes' ? '#22c55e' : '#f97316' }}>
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-xl ${activeTab === 'entrantes' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-gray-900 uppercase tracking-tighter">{r.type_materiel_nom}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-900 rounded font-bold text-white">QTY: {r.quantite}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-1 text-sm text-gray-500 font-bold">
                    <span className="flex items-center gap-1 text-buttonGradientSecondary"><User className="w-4 h-4" /> {r.client_nom}</span>
                    <span className="flex items-center gap-1"><Hash className="w-4 h-4 text-gray-400" /> {r.numero_bordereau}</span>
                    <span className="flex items-center gap-1"><Truck className="w-4 h-4 text-gray-400" /> {r.camion}</span>
                    <span className="flex items-center gap-1 text-gray-400 font-medium italic">
                      <Calendar className="w-4 h-4" /> 
                      {new Date(activeTab === 'entrantes' ? r.date_arrivee : r.date_sortie).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => { setSelectedRotation(r); setShowModal(true); }} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Modifier"><Edit3 className="w-5 h-5" /></button>
                <button 
                  onClick={() => { if(window.confirm(t('Supprimer cette rotation ?'))) api.delete(`rotations-${activeTab}/${r.id}/`).then(() => fetchRotations()) }} 
                  className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">
            {t("Aucune donnée disponible")}
          </div>
        )}
      </div>

      {showModal && (
        <RotationModal 
          rotation={selectedRotation} 
          type={activeTab} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default Rotations;