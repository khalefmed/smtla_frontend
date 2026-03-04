import { useState, useEffect, useMemo, Fragment } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Package, Truck, Trash2, Ship,
  Edit3, ArrowDownCircle, ArrowUpCircle, Calendar, 
  Hash, User, AlertCircle, ChevronRight, Boxes, CheckCircle, Loader2 
} from 'lucide-react';
import RotationModal from '@/components/ui/shared/rotationModal';
import { getRole } from '@/lib/utils'; // Importation pour gérer les rôles

function Rotations() {
  const { t } = useTranslation();
  const role = getRole(); // Récupération du rôle actuel
  
  // États de données
  const [liste, setListe] = useState([]);
  const [stocks, setStocks] = useState([]);
  
  // États d'interface
  const [loading, setLoading] = useState(true);
  const [clotureLoading, setClotureLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState('entrantes');

  // États du Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRotation, setSelectedRotation] = useState(null);

  useEffect(() => {
    if (activeTab === 'stock') {
      fetchStocks();
    } else {
      fetchRotations();
    }
  }, [activeTab]);

  const fetchRotations = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'entrantes' ? "rotations-entrantes/" : "rotations-sortantes/";
      const response = await api.get(endpoint);
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur de chargement des mouvements"));
    } finally {
      setLoading(false);
    }
  };

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const response = await api.get("stocks-status/");
      setStocks(response.data);
    } catch (error) {
      toast.error(t("Erreur de chargement des stocks"));
    } finally {
      setLoading(false);
    }
  };

  const handleCloturerTout = async () => {
    if (window.confirm(t("Voulez-vous vraiment marquer toutes les rotations comme terminées ?"))) {
      try {
        setClotureLoading(true);
        await api.post("rotations/tout-terminer/");
        toast.success(t("Toutes les rotations ont été terminées avec succès"));
        fetchRotations();
      } catch (error) {
        toast.error(t("Erreur lors de la clôture des rotations"));
      } finally {
        setClotureLoading(false);
      }
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
      toast.error(t("Erreur lors de l'enregistrement"));
    }
  };

  // Filtrage intelligent
  const filteredData = useMemo(() => {
    const q = search.toLowerCase();
    
    if (activeTab === 'stock') {
      // 1. On filtre les clients par recherche
      // 2. Pour chaque client, on ne garde que les types dont la quantité > 0
      // 3. On ne garde le client que s'il lui reste au moins un type de matériel avec du stock
      return stocks
        .map(s => ({
          ...s,
          types: s.types.filter(t => t.quantite_disponible > 0)
        }))
        .filter(s => s.client.toLowerCase().includes(q) && s.types.length > 0);
    }

    return liste.filter((r) => 
      r.client_nom?.toLowerCase().includes(q) || 
      r.type_materiel_nom?.toLowerCase().includes(q) ||
      r.numero_bordereau?.toLowerCase().includes(q) ||
      r.navire?.toLowerCase().includes(q)
    );
  }, [liste, stocks, search, activeTab]);

  return (
    <div className="flex flex-col gap-6 px-10 max-sm:px-4 py-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">{t("Mouvements Logistiques")}</h1>
          <p className="text-gray-500 font-medium">{t("Gestion des flux et des stocks par client")}</p>
        </div>
        
        {activeTab !== 'stock' && (
          <div className="flex gap-3">
            {/* BOUTON CLÔTURER TOUT : Affiché seulement pour DG et DO */}
            {(role === 'Directeur Général' || role === 'Directeur des Opérations') && (
              <button
                onClick={handleCloturerTout}
                disabled={clotureLoading}
                className="px-6 py-3 border-2 border-green-500 text-green-600 rounded-xl hover:bg-green-50 transition-all flex items-center gap-2 font-bold disabled:opacity-50"
              >
                {clotureLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                {t("Clôturer tout")}
              </button>
            )}

            <button
              onClick={() => { setSelectedRotation(null); setShowModal(true); }}
              className="px-6 py-3 bg-buttonGradientSecondary text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg font-bold"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'entrantes' ? t("Nouvelle Entrée") : t("Nouvelle Sortie")}
            </button>
          </div>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1.5 bg-gray-100 w-fit rounded-2xl border border-gray-200">
        <button onClick={() => setActiveTab('entrantes')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'entrantes' ? "bg-white text-buttonGradientSecondary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <ArrowDownCircle className={`w-5 h-5 ${activeTab === 'entrantes' ? "text-green-500" : ""}`} /> {t("Entrées")}
        </button>
        <button onClick={() => setActiveTab('sortantes')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'sortantes' ? "bg-white text-buttonGradientSecondary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <ArrowUpCircle className={`w-5 h-5 ${activeTab === 'sortantes' ? "text-orange-500" : ""}`} /> {t("Sorties")}
        </button>
        <button onClick={() => setActiveTab('stock')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'stock' ? "bg-white text-buttonGradientSecondary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          <Boxes className={`w-5 h-5 ${activeTab === 'stock' ? "text-buttonGradientPrimary" : ""}`} /> {t("Stocks")}
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="bg-white rounded-2xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={activeTab === 'stock' ? t("Rechercher un client...") : t("Rechercher par client, bordereau, matériel ou navire...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl outline-none border border-transparent focus:border-buttonGradientPrimary font-medium transition-all"
        />
      </div>

      {/* CONTENT */}
      {loading ? (
         <div className="flex justify-center py-20">
           <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div>
         </div>
      ) : activeTab === 'stock' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">{t("Client")}</th>
                  <th className="px-6 py-5">{t("Type de Matériel")}</th>
                  <th className="px-6 py-5 text-center">{t("Quantité Disponible")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length > 0 ? (
                  filteredData.map((clientData, clientIdx) => (
                    <Fragment key={clientIdx}>
                      {clientData.types.map((type, typeIdx) => (
                        <tr key={`${clientIdx}-${typeIdx}`} className="hover:bg-gray-50/50 group transition-colors">
                          <td className="px-8 py-4">
                            {typeIdx === 0 && (
                              <div className="flex items-center gap-3">
                                <div className="w-1.5 h-8 rounded-full bg-buttonGradientPrimary"></div>
                                <span className="font-semibold text-gray-900 uppercase text-sm">{clientData.client}</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 font-bold text-gray-600">
                              <ChevronRight className="w-4 h-4 text-blue-300 group-hover:translate-x-1 transition-transform" />
                              {type.type_materiel}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-xl font-semibold text-buttonGradientSecondary">
                              {type.quantite_disponible}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))
                ) : (
                  <tr><td colSpan="3" className="px-6 py-20 text-center text-gray-400 font-bold">{t("Aucun stock disponible")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VUE LISTE (Même logique que précédemment) */
        <div className="grid grid-cols-1 gap-4">
          {filteredData.length > 0 ? (
            filteredData.map((r) => (
              <div key={r.id} className="bg-white border border-gray-100 p-5 rounded-2xl flex items-center justify-between hover:shadow-md transition-all border-l-4" 
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
                      <span className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded text-buttonGradientPrimary"><Ship className="w-3.5 h-3.5" /> {r.navire}</span>
                      <span className="flex items-center gap-1"><Hash className="w-4 h-4 text-gray-400" /> {r.numero_bordereau}</span>
                      <span className="flex items-center gap-1 text-gray-400 font-medium italic"><Calendar className="w-4 h-4" /> {new Date(activeTab === 'entrantes' ? r.date_arrivee : r.date_sortie).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedRotation(r); setShowModal(true); }} className="p-2.5 text-gray-400 hover:text-buttonGradientSecondary hover:bg-blue-50 rounded-xl transition-all"><Edit3 className="w-5 h-5" /></button>
                  <button onClick={() => { if(window.confirm(t('Supprimer ?'))) api.delete(`rotations-${activeTab}/${r.id}/`).then(() => fetchRotations()) }} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400 font-bold">{t("Aucune donnée disponible")}</div>
          )}
        </div>
      )}

      {showModal && <RotationModal rotation={selectedRotation} type={activeTab} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}

export default Rotations;