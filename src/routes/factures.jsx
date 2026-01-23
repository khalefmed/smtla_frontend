import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import {
  Search, Plus, FileCheck, Trash2, Edit3,
  Download, Anchor, User, Printer, FileStack, FileText
} from 'lucide-react';
import FactureModal from '@/components/ui/shared/factureModal';
import ImportDevisModal from '@/components/ui/shared/importDevisModal';
import { generateFacturePDF } from '@/lib/generateFacturePdf';

function Factures() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  // Modals
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFactures, resClients] = await Promise.all([
        api.get("factures/"),
        api.get("clients/")
      ]);
      setListe(resFactures.data);
      setClients(resClients.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedFacture) {
        await api.put(`factures/${selectedFacture.id}/`, formData);
        toast.success(t("Facture mise à jour"));
      } else {
        await api.post('factures/', formData);
        toast.success(t("Facture créée avec succès"));
      }
      setShowFactureModal(false);
      fetchData();
    } catch (error) { 
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    fetchData();
    toast.success(t("Le devis a été converti en facture !"));
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Êtes-vous sûr de vouloir supprimer cette facture ?"))) {
      return;
    }
    
    try {
      await api.delete(`factures/${id}/`);
      toast.success(t("Facture supprimée avec succès"));
      fetchData();
    } catch (error) {
      toast.error(t("Erreur lors de la suppression"));
    }
  };

  const handleGeneratePDF = async (facture) => {
    try {
      // Récupérer les détails complets du client
      const clientRes = await api.get(`clients/${facture.client}/`);
      const client = clientRes.data;
      
      // Récupérer les détails complets de la facture si nécessaire
      const factureRes = await api.get(`factures/${facture.id}/`);
      const factureComplete = factureRes.data;
      
      // Générer le PDF
      await generateFacturePDF(factureComplete, client);
      toast.success(t("PDF généré avec succès"));
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error(t("Erreur lors de la génération du PDF"));
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(f =>
      f.reference.toLowerCase().includes(q) ||
      f.client_nom.toLowerCase().includes(q) ||
      f.vessel.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* Header avec double action */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Facturation")}</h1>
          <p className="text-textGreyColor font-medium">{t("Suivi des factures clients et règlements")}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2 shadow-sm font-bold"
          >
            <FileStack className="w-5 h-5" /> {t("Importer un Devis")}
          </button>
          <button
            onClick={() => { 
              setSelectedFacture(null); 
              setShowFactureModal(true); 
            }}
            className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary transition-colors flex items-center gap-2 shadow-sm font-bold"
          >
            <Plus className="w-5 h-5" /> {t("Nouvelle Facture")}
          </button>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher une facture (N°, Client, Navire)...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-indigo-500"
        />
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buttonGradientPrimary"></div>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">{t("Facture / Client")}</th>
                <th className="px-6 py-4">{t("Détails Logistiques")}</th>
                <th className="px-6 py-4 text-right">{t("Montant Total")}</th>
                <th className="px-6 py-4 text-center">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                    {t("Aucune facture trouvée")}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-buttonGradientPrimary">{f.reference}</div>
                      <div className="text-sm font-medium text-gray-600 flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400"/> {f.client_nom}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-indigo-400" /> {f.vessel}
                      </div>
                      <div className="text-xs text-gray-400">
                        BL: {f.bl} | Voyage: {f.voyage}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-lg text-gray-900">
                        {Number(f.montant_total).toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                        {f.devise_display} {f.tva && "+ TVA 16%"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleGeneratePDF(f)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title={t("Télécharger PDF")}
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { 
                            setSelectedFacture(f); 
                            setShowFactureModal(true); 
                          }} 
                          className="p-2 text-gray-400 hover:text-buttonGradientPrimary hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("Modifier")}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(f.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("Supprimer")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showFactureModal && (
        <FactureModal
          facture={selectedFacture}
          onClose={() => setShowFactureModal(false)}
          onSave={handleSave}
          clients={clients}
        />
      )}
      
      {showImportModal && (
        <ImportDevisModal
          onClose={() => setShowImportModal(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}

export default Factures;