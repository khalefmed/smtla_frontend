import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import {
  Search, Plus, FileCheck, Trash2, Edit3,
  Anchor, User, FileStack, FileText, EyeOff, XCircle, Eye, Ship, Calendar
} from 'lucide-react';
import FactureModal from '@/components/ui/shared/factureModal';
import ImportDevisModal from '@/components/ui/shared/importDevisModal';
import { generateFacturePDF } from '@/lib/generateFacturePdf';
import { getRole, getUserData } from '@/lib/utils';

// --- COMPOSANT DE VUE DÉTAILLÉE (PREVIEW) ---
// --- COMPOSANT DE VUE DÉTAILLÉE (PREVIEW) MODIFIÉ ---
function FacturePreviewModal({ facture, onClose }) {
  if (!facture) return null;

  // Sécurité pour le nom du client
  // On cherche d'abord dans l'objet imbriqué, sinon dans la propriété client_nom
  const nomClient = facture.client?.nom || facture.client_nom || "Client inconnu";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> {facture.reference}
            </h2>
            {/* Utilisation du nom sécurisé ici */}
            <p className="text-xs opacity-70 uppercase font-bold tracking-widest">{nomClient}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* ... reste du code identique ... */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Navire / Vessel</p>
              <p className="font-bold text-sm flex items-center gap-1"><Ship className="w-3 h-3 text-amber-600"/> {facture.vessel}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bill of Lading</p>
              <p className="font-bold text-sm">{facture.bl || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Voyage</p>
              <p className="font-bold text-sm">{facture.voyage || "-"}</p>
            </div>
          </div>

          {/* Table Items */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-[10px] font-bold border-b">
                <th className="pb-3 text-left">Désignation</th>
                <th className="pb-3 text-center">Qté</th>
                <th className="pb-3 text-right">P.U</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facture.items?.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-3 font-medium text-gray-800">{item.libelle}</td>
                  <td className="py-3 text-center text-gray-600">{item.quantite}</td>
                  <td className="py-3 text-right text-gray-600">{Number(item.prix_unitaire).toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-gray-900">{(item.quantite * item.prix_unitaire).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totaux */}
          <div className="flex justify-end pt-6 border-t border-gray-100">
            <div className="w-full space-y-3">
                <div className="flex justify-between text-sm px-2">
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Taxe (TVA 16%)</span>
                    <span className={`font-bold ${facture.tva ? 'text-amber-600' : 'text-gray-400'}`}>
                      {facture.tva ? "Incluse" : "Exonérée"}
                    </span>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl flex justify-between items-center border border-amber-100">
                    <span className="font-bold text-amber-900 text-xs uppercase">Montant Net TTC</span>
                    <span className="text-2xl font-bold text-amber-900">
                      {Number(facture.montant_total).toLocaleString()} <span className="text-sm font-medium">{facture.devise_display}</span>
                    </span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Factures() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);

  const currentRole = getRole();

  useEffect(() => { fetchData(); }, []);

  const peutValider = ["Directeur des Opérations", "Comptable", "Directeur Général"].includes(currentRole);
  const peutSupprimer = ["Directeur des Opérations", "Directeur Général"].includes(currentRole);

  const peutModifier = (facture) => {
    if (facture.status === 'valide') return ["Comptable", "Directeur Général"].includes(currentRole);
    return ["Comptable", "Directeur des Opérations", "Directeur Général", "Assistant"].includes(currentRole);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFactures, resClients] = await Promise.all([api.get("factures/"), api.get("clients/")]);
      setListe(resFactures.data);
      setClients(resClients.data);
    } catch (error) { toast.error(t("Erreur lors de la récupération des données")); }
    finally { setLoading(false); }
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
      console.error(error)
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleValidate = async (id, status) => {
    try {
      await api.patch(`factures/${id}/valider/`, { status });
      toast.success(t(`Facture ${status === 'valide' ? 'validée' : 'rejetée'}`));
      fetchData();
    } catch (error) { toast.error(t("Permission refusée")); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Êtes-vous sûr de vouloir supprimer cette facture ?"))) return;
    try {
      await api.delete(`factures/${id}/`);
      toast.success(t("Facture supprimée"));
      fetchData();
    } catch (error) { toast.error(t("Erreur lors de la suppression")); }
  };

  // --- LOGIQUE PDF RESTREINTE ---
  const handleDownloadPDF = (facture) => {
    if (facture.status !== 'valide') {
      toast.error(t("Le PDF n'est disponible que pour les factures validées"));
      return;
    }
    generateFacturePDF(facture);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(f =>
      f.reference?.toLowerCase().includes(q) ||
      f.client_nom?.toLowerCase().includes(q) ||
      f.vessel?.toLowerCase().includes(q)
    );
  }, [liste, search]);

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

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Facturation")}</h1>
          <p className="text-gray-500 font-medium">{t("Gestion des factures et règlements")}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImportModal(true)} className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 flex items-center gap-2 font-bold shadow-md transition-all">
            <FileStack className="w-5 h-5" /> {t("Importer Devis")}
          </button>
          <button onClick={() => { setSelectedFacture(null); setShowFactureModal(true); }} className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold shadow-md transition-all">
            <Plus className="w-5 h-5" /> {t("Nouvelle Facture")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher une facture (réf, client, navire)...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">{t("Facture / Client")}</th>
                <th className="px-6 py-4">{t("Détails Logistiques")}</th>
                <th className="px-6 py-4 text-right">{t("Montant Total")}</th>
                <th className="px-6 py-4 text-center">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-bold text-buttonGradientSecondary tracking-tight">{f.reference}</div>
                      {f.est_privee && <EyeOff className="w-3.5 h-3.5 text-red-500" title="Facture Privée" />}
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400"/> {f.client.nom}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold flex items-center gap-2 text-gray-800"><Anchor className="w-4 h-4 text-indigo-400" /> {f.vessel}</div>
                    <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase">BL: {f.bl} | Voyage: {f.voyage}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-lg text-gray-900">{Number(f.montant_total).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      {f.devise_display}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      {/* OEIL : Preview */}
                      <button onClick={() => { setSelectedFacture(f); setShowPreview(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>

                      {peutValider && f.status === 'attente' && (
                        <>
                          <button onClick={() => handleValidate(f.id, 'valide')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Valider">
                            <FileCheck className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleValidate(f.id, 'rejete')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rejeter">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      {/* PDF : Uniquement si Valide */}
                      <button 
                        onClick={() => handleDownloadPDF(f)} 
                        className={`p-2 rounded-lg transition-colors ${f.status === 'valide' ? 'text-gray-600 hover:text-buttonGradientSecondary hover:bg-indigo-50' : 'text-gray-200 cursor-not-allowed'}`}
                        title="PDF"
                      >
                        <FileText className="w-5 h-5" />
                      </button>

                      {peutModifier(f) && (
                        <button onClick={() => { setSelectedFacture(f); setShowFactureModal(true); }} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Modifier">
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}

                      {/* SUPPRESSION : Interdite si la facture est validée */}
                      {peutSupprimer && f.status !== 'valide' && (
                        <button onClick={() => handleDelete(f.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showFactureModal && <FactureModal facture={selectedFacture} onClose={() => setShowFactureModal(false)} onSave={handleSave} clients={clients} />}
      {showImportModal && <ImportDevisModal onClose={() => setShowImportModal(false)} onSuccess={() => { setShowImportModal(false); fetchData(); }} />}
      {showPreview && <FacturePreviewModal facture={selectedFacture} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

export default Factures;