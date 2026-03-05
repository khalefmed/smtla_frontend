import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, 
  ArrowRightLeft, Anchor, User, FileCheck, XCircle, Filter, Eye, Ship, Calendar
} from 'lucide-react';
import DevisModal from '@/components/ui/shared/devisModal';
import { generateDevisPDF } from '@/lib/generateDevisPdf';
import { getRole, getUserData } from '@/lib/utils';

// --- COMPOSANT DE VUE DÉTAILLÉE ---
function DevisPreviewModal({ devis, onClose }) {
  if (!devis) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-buttonGradientSecondary text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" /> {devis.reference}
            </h2>
            <p className="text-xs opacity-80 uppercase font-bold tracking-widest">{devis.client?.nom || devis.client_nom}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Info Logistique */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Navire</p>
              <p className="font-bold text-sm flex items-center gap-1">
                <Ship className="w-3 h-3 text-indigo-500"/> {devis.vessel || '---'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Voyage</p>
              <p className="font-bold text-sm">{devis.voyage || '---'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">ETA</p>
              <p className="font-bold text-sm flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500"/> 
                {devis.eta ? new Date(devis.eta).toLocaleDateString() : '---'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Port</p>
              <p className="font-bold text-sm">{devis.port_arrive || '---'}</p>
            </div>
          </div>

          {/* Table Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-[10px] font-bold border-b">
                <th className="pb-3">Désignation</th>
                <th className="pb-3 text-center">Qté</th>
                <th className="pb-3 text-right">P.U</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {devis.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-gray-800">{item.libelle}</td>
                  <td className="py-3 text-center">{item.quantite}</td>
                  <td className="py-3 text-right">{Number(item.prix_unitaire).toLocaleString()}</td>
                  <td className="py-3 text-right font-bold">{(item.quantite * item.prix_unitaire).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end pt-4 border-t">
            <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">TVA (16%)</span>
                    <span className="font-bold text-gray-700">{devis.tva ? "Inclus" : "Non incluse"}</span>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl flex justify-between items-center">
                    <span className="font-bold text-indigo-900 text-xs uppercase">Total TTC</span>
                    <span className="text-xl font-bold text-indigo-900">{Number(devis.montant_total).toLocaleString()} {devis.devise_display}</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Devis() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // État pour l'oeil
  const [selectedDevis, setSelectedDevis] = useState(null);

  const currentRole = getRole();

  useEffect(() => { fetchData(); }, []);

  const peutGererStatut = ["Directeur des Opérations", "Comptable", "Directeur Général"].includes(currentRole);
  const peutConvertir = ["Comptable", "Directeur Général", "Directeur des Opérations"].includes(currentRole);
  const peutModifier = (devis) => {
    if (devis.status === 'valide') return ["Directeur des Opérations", "Directeur Général"].includes(currentRole);
    return true; 
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resDevis, resClients] = await Promise.all([api.get("devis/"), api.get("clients/")]);
      setListe(resDevis.data);
      setClients(resClients.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    try {
      const dataToSend = { ...formData };
      if (!formData.eta || formData.eta === "") {
        dataToSend.eta = null;
      } else {
        dataToSend.eta = new Date(formData.eta).toISOString();
      }

      if (!formData.etd || formData.etd === "") {
        dataToSend.etd = null;
      } else {
        dataToSend.etd = new Date(formData.etd).toISOString();
      }
      if (selectedDevis) {
        await api.put(`devis/${selectedDevis.id}/`, dataToSend);
        toast.success(t("Devis mis à jour"));
      } else {
        await api.post('devis/', dataToSend);
        toast.success(t("Devis créé avec succès"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { 
      console.log(error);
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleValidate = async (id, status) => {
    try {
      await api.patch(`devis/${id}/valider/`, { status });
      toast.success(t(`Devis ${status === 'valide' ? 'validé' : 'rejeté'}`));
      fetchData();
    } catch (error) { toast.error(t("Action non autorisée")); }
  };

  const handleConvertir = async (id) => {
    if (!window.confirm(t("Voulez-vous convertir ce devis en facture ?"))) return;
    try {
      await api.post(`devis/${id}/convertir-en-facture/`);
      toast.success(t("Facture générée avec succès !"));
      fetchData();
    } catch (error) { toast.error(t("Erreur lors de la conversion")); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Supprimer définitivement ce devis ?"))) return;
    try {
      await api.delete(`devis/${id}/`);
      toast.success(t("Devis supprimé"));
      fetchData();
    } catch (error) { toast.error(t("Erreur suppression")); }
  };

  const handleDownloadPDF = (devis) => {
    // if (devis.status !== 'valide') {
    //   toast.error(t("Le PDF n'est disponible que pour les devis validés"));
    //   return;
    // }
    generateDevisPDF(devis);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      attente: "bg-amber-100 text-amber-700 border-amber-200",
      valide: "bg-green-100 text-green-700 border-green-200",
      rejete: "bg-red-100 text-red-700 border-red-200"
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${config[status] || config.attente}`}>
        {status}
      </span>
    );
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(d => 
      d.reference?.toLowerCase().includes(q) || 
      d.client?.nom?.toLowerCase().includes(q) ||
      d.vessel?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Gestion des Devis")}</h1>
          <p className="text-gray-500 font-medium">{t("Offres commerciales et logistique portuaire")}</p>
        </div>
        <button
          onClick={() => { setSelectedDevis(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 flex items-center gap-2 shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Nouveau Devis")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par référence, client ou navire...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary transition-all font-medium"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">{t("Référence / Client")}</th>
              <th className="px-6 py-4">{t("Navire / Voyage")}</th>
              <th className="px-6 py-4 text-right">{t("Montant")}</th>
              <th className="px-6 py-4 text-center">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 animate-pulse font-bold text-gray-400">{t("Chargement...")}</td></tr>
            ) : filtered.map((devis) => (
              <tr key={devis.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-buttonGradientSecondary tracking-tight">{devis.reference}</div>
                    <StatusBadge status={devis.status} />
                  </div>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-gray-400"/> {devis.client?.nom || devis.client_nom}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800 flex items-center gap-1">
                    <Anchor className="w-3.5 h-3.5 text-indigo-400"/> {devis.vessel || '---'}
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase">
                    {/* Vérification si eta existe avant de créer l'objet Date */}
                    ETA: {devis.eta ? new Date(devis.eta).toLocaleDateString() : '---'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-lg text-gray-900">{Number(devis.montant_total).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase">{devis.devise_display}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1">
                    {/* OEIL : Détails */}
                    <button onClick={() => { setSelectedDevis(devis); setShowPreview(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Voir détails">
                      <Eye className="w-5 h-5" />
                    </button>

                    {devis.status === 'attente' && peutGererStatut && (
                      <>
                        <button onClick={() => handleValidate(devis.id, 'valide')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Valider">
                          <FileCheck className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleValidate(devis.id, 'rejete')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Rejeter">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {devis.status === 'valide' && peutConvertir && (
                      <button onClick={() => handleConvertir(devis.id)} title={t("Convertir en Facture")} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg">
                        <ArrowRightLeft className="w-5 h-5" />
                      </button>
                    )}

                    {/* PDF : Uniquement si valide (via handleDownloadPDF) */}
                    <button 
                        onClick={() => handleDownloadPDF(devis)} 
                        className={`p-2 rounded-lg transition-colors ${devis.status === 'valide' ? 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50' : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'}`} 
                        title="PDF"
                    >
                      <FileText className="w-5 h-5" />
                    </button>

                    {peutModifier(devis) && (
                      <button onClick={() => { setSelectedDevis(devis); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Modifier">
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}

                    {/* SUPPRESSION : Uniquement si NON valide et DG */}
                    {currentRole === 'Directeur Général' && devis.status !== 'valide' && (
                       <button onClick={() => handleDelete(devis.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Supprimer">
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

      {showModal && <DevisModal devis={selectedDevis} clients={clients} onClose={() => setShowModal(false)} onSave={handleSave} />}
      
      {showPreview && <DevisPreviewModal devis={selectedDevis} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

export default Devis;