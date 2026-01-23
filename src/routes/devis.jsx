import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, 
  ArrowRightLeft, Anchor, Calendar, User, ClipboardList
} from 'lucide-react';
import DevisModal from '@/components/ui/shared/devisModal';
import { generateFacturePDF } from '@/lib/generateDevisPdf';

function Devis() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDevis, resClients] = await Promise.all([
        api.get("devis/"),
        api.get("clients/")
      ]);
      setListe(resDevis.data);
      setClients(resClients.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedDevis) {
        await api.put(`devis/${selectedDevis.id}/`, formData);
        toast.success(t("Devis mis à jour"));
      } else {
        await api.post('devis/', formData);
        toast.success(t("Devis créé avec succès"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { toast.error(t("Erreur lors de l'enregistrement")); }
  };

  const handleConvertir = async (id) => {
    if (window.confirm(t("Voulez-vous convertir ce devis en facture ?"))) {
      try {
        await api.post(`devis/${id}/convertir-en-facture/`);
        toast.success(t("Facture générée avec succès !"));
        // Optionnel : rediriger vers la page facture ou rafraîchir
      } catch (error) { toast.error(t("Erreur lors de la conversion")); }
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(d => 
      d.reference.toLowerCase().includes(q) || 
      d.client_nom.toLowerCase().includes(q) ||
      d.vessel.toLowerCase().includes(q)
    );
  }, [liste, search]);

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

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Gestion des Devis")}</h1>
          <p className="text-textGreyColor font-medium">{t("Offres commerciales et logistique portuaire")}</p>
        </div>
        <button
          onClick={() => { setSelectedDevis(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary transition-colors flex items-center gap-2 shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Créer un Devis")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par référence, client ou navire...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-xs uppercase font-bold text-gray-500">
            <tr>
              <th className="px-6 py-4">{t("Référence / Client")}</th>
              <th className="px-6 py-4">{t("Navire / Voyage")}</th>
              <th className="px-6 py-4">{t("Dates (ETA/ETD)")}</th>
              <th className="px-6 py-4 text-right">{t("Montant")}</th>
              <th className="px-6 py-4 text-center">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((devis) => (
              <tr key={devis.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-buttonGradientPrimary">{devis.reference}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1"><User className="w-3 h-3"/> {devis.client_nom}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium flex items-center gap-1"><Anchor className="w-3 h-3 text-gray-400"/> {devis.vessel}</div>
                  <div className="text-gray-400">Voyage: {devis.voyage}</div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  <div>ETA: {new Date(devis.eta).toLocaleDateString()}</div>
                  <div>ETD: {new Date(devis.etd).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold">{Number(devis.montant_total).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{devis.devise_display}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <button 
                        onClick={() => handleGeneratePDF(devis)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title={t("Télécharger PDF")}
                    >
                        <FileText className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleConvertir(devis.id)} title={t("Convertir en Facture")} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100">
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelectedDevis(devis); setShowModal(true); }} className="p-2 bg-blue-50 text-buttonGradientPrimary rounded-lg hover:bg-blue-100">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DevisModal 
          devis={selectedDevis} 
          clients={clients}
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default Devis;