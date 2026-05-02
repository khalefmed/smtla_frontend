import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, Eye, Ship, Calendar, Anchor, User, Database, XCircle
} from 'lucide-react';
import FDAModal from '@/components/ui/shared/FDAModal';
import { getRole } from '@/lib/utils';
// import { generateFDAPDF } from '@/lib/generatePdaPdf';

function FDA() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]); // État pour la liste des clients
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFDA, setSelectedFDA] = useState(null);

  const currentRole = getRole();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Récupération simultanée des FDA et des Clients
      const [resFDA, resClients] = await Promise.all([
        api.get("fdas/"),
        api.get("clients/")
      ]);
      setListe(resFDA.data);
      setClients(resClients.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedFDA) {
        await api.put(`fdas/${selectedFDA.id}/`, formData);
        toast.success(t("FDA mis à jour"));
      } else {
        await api.post('fdas/', formData);
        toast.success(t("FDA créé avec succès"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { 
      console.error(error);
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Supprimer définitivement ce FDA ?"))) return;
    try {
      await api.delete(`fdas/${id}/`);
      toast.success(t("FDA supprimé"));
      fetchData();
    } catch (error) { toast.error(t("Erreur suppression")); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(p => 
      p.fda_number?.toLowerCase().includes(q) || 
      p.client_nom?.toLowerCase().includes(q) || // Utilisation de client_nom du backend
      p.vessel_name?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Final-forma Disbursement Account")}</h1>
          <p className="text-gray-500 font-medium">{t("Frais portuaires et d'agence")}</p>
        </div>
        <button
          onClick={() => { setSelectedFDA(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 flex items-center gap-2 shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Nouveau FDA")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par N°, client ou navire...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary transition-all font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">{t("FDA N° / Client")}</th>
              <th className="px-6 py-4">{t("Navire / Port")}</th>
              {/* <th className="px-6 py-4 text-right">{t("Estimation Totale")}</th> */}
              <th className="px-6 py-4 text-center">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 animate-pulse font-bold text-gray-400">{t("Chargement...")}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10 text-gray-400 font-medium">{t("Aucun FDA trouvé")}</td></tr>
            ) : filtered.map((fda) => (
              <tr key={fda.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-buttonGradientSecondary tracking-tight">{fda.fda_number}</div>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-1 mt-1">
                    <User className="w-3 h-3 text-gray-400"/> {fda.client_nom}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <Ship className="w-3.5 h-3.5 text-indigo-400"/> {fda.vessel_name}
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
                    PORT: {fda.port_of_arrival || '---'}
                  </div>
                </td>
                {/* <td className="px-6 py-4 text-right">
                  <div className="font-bold text-lg text-gray-900">{Number(fda.grand_total).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{fda.currency}</div>
                </td> */}
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1">
                    {/* MODIFICATION */}
                    <button 
                      onClick={() => { setSelectedFDA(fda); setShowModal(true); }} 
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t("Modifier")}
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>

                    {/* PDF (à implémenter) */}
                    <button  onClick={() => generateFDAPDF(fda)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={t("Générer PDF")}
                    >
                      <FileText className="w-5 h-5" />
                    </button>

                    {/* SUPPRESSION (Seulement DG) */}
                    {currentRole === 'Directeur Général' && (
                       <button 
                        onClick={() => handleDelete(fda.id)} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t("Supprimer")}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <FDAModal 
          fda={selectedFDA} 
          clients={clients} // Transmission de la liste des clients au modal
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default FDA;