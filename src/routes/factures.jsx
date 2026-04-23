import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import {
  Search, Plus, FileCheck, Trash2, Edit3,
  Anchor, User, FileStack, FileText, EyeOff, XCircle, Eye, Ship, 
  Calendar, Box, Weight, Info, CreditCard, CheckCircle2,
  FileDown
} from 'lucide-react';
import FactureModal from '@/components/ui/shared/factureModal';
import ImportDevisModal from '@/components/ui/shared/importDevisModal';
import { generateFacturePDF } from '@/lib/generateFacturePdf';
import { generateRecuPDF } from '@/lib/generateRecuPdf';
import { getRole } from '@/lib/utils';

// --- NOUVEAU MODAL DE PAIEMENT ---
function PaymentModal({ facture, onClose, onConfirm }) {
  const [moyen, setMoyen] = useState('espece');
  const [refRecu, setRefRecu] = useState(''); // Nouveau champ
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!refRecu.trim()) {
      toast.error("Veuillez saisir la référence du reçu");
      return;
    }
    setLoading(true);
    // On envoie les deux informations au parent
    await onConfirm(facture.id, { moyen, reference_recu: refRecu });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <CreditCard className="w-5 h-5" /> Enregistrer le paiement
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Facture à solder</p>
            <p className="font-bold text-gray-900">{facture.reference} — {Number(facture.montant_total).toLocaleString()} {facture.devise_display}</p>
          </div>

          {/* CHAMP RÉFÉRENCE REÇU (Saisie manuelle) */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Référence du Reçu</label>
            <input 
              required
              type="text"
              value={refRecu}
              onChange={(e) => setRefRecu(e.target.value)}
              placeholder="Ex: BMCI-011254"
              className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl font-bold outline-none focus:ring-2 focus:buttonGradientPrimary focus:border-transparent"
            />
          </div>

          {/* MOYEN DE PAIEMENT */}
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Moyen de Paiement</label>
            <select 
              value={moyen} 
              onChange={(e) => setMoyen(e.target.value)}
              className="w-full mt-1 p-3 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:buttonGradientPrimary appearance-none"
            >
              <option value="espece">Espèce</option>
              <option value="cheque">Chèque</option>
              <option value="virement">Virement</option>
              <option value="wallet">Wallet</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 font-bold text-gray-500">Annuler</button>
            <button 
              disabled={loading}
              type="submit" 
              className="flex-1 py-3 bg-buttonGradientPrimary text-white rounded-xl font-bold shadow-lg hover:bg-buttonGradientSecondary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? "Traitement..." : <><CheckCircle2 className="w-4 h-4"/> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- PREVIEW MODAL (Inchangé mais on pourrait ajouter les infos de paiement ici) ---
function FacturePreviewModal({ facture, onClose }) {
  if (!facture) return null;
  const nomClient = facture.client?.nom || facture.client_nom || "Client inconnu";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" /> {facture.reference}
            </h2>
            <p className="text-xs opacity-70 uppercase font-bold tracking-widest">{nomClient}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Infos de paiement si payée */}
            {facture.status === 'paye' && (
                <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-bold text-green-700 uppercase">Numéro de reçu</p>
                        <p className="font-black text-green-900">{facture.numero_recu || '---'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-green-700 uppercase">Payée le</p>
                        <p className="font-black text-green-900">{facture.date_paiement ? new Date(facture.date_paiement).toLocaleDateString() : '---'}</p>
                    </div>
                </div>
            )}

          {/* ... reste de la preview identique à votre code ... */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Navire / Type</p>
              <p className="font-bold text-sm flex items-center gap-1">
                <Ship className="w-3 h-3 text-amber-600"/> {facture.vessel || '---'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Port</p>
              <p className="font-bold text-sm text-gray-700">{facture.port_arrive || '---'}</p>
            </div>
            {/* Ajoutez les autres colonnes ici comme dans votre code original */}
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 uppercase text-[10px] font-bold border-b">
                <th className="pb-3 text-left">Désignation</th>
                <th className="pb-3 text-center">Qté</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {facture.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 font-medium text-gray-800">{item.libelle}</td>
                  <td className="py-3 text-center">{item.quantite}</td>
                  <td className="py-3 text-right font-bold">{(item.quantite * item.prix_unitaire).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <div className="w-full space-y-3">
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

  const [showFactureModal, setShowFactureModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false); // NOUVEAU
  const [selectedFacture, setSelectedFacture] = useState(null);

  const currentRole = getRole();

  useEffect(() => { fetchData(); }, []);

  const peutValider = ["Comptable", "Directeur Général"].includes(currentRole);
  const peutSupprimer = ["Directeur Général"].includes(currentRole);
  const peutModifier = ["Comptable", "Directeur Général"].includes(currentRole);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resFactures, resClients] = await Promise.all([api.get("factures/"), api.get("clients/")]);
      setListe(resFactures.data);
      setClients(resClients.data);
    } catch (error) { toast.error(t("Erreur lors de la récupération des données")); }
    finally { setLoading(false); }
  };

  // NOUVELLE FONCTION POUR LE PAIEMENT
const handlePay = async (id, data) => {
  try {
    // data contient { moyen, reference_recu }
    const res = await api.patch(`factures/${id}/payer/`, data);
    
    toast.success(
      <div>
        <p className="font-bold">Facture payée avec succès !</p>
        <p className="text-xs">Numéro de système : {res.data.numero_recu}</p>
      </div>, 
      { duration: 5000 }
    );
    
    setShowPaymentModal(false);
    fetchData(); // Rafraîchir la liste pour voir le statut "payé"
  } catch (error) {
    const errorMsg = error.response?.data?.error || "Erreur lors de l'enregistrement du paiement";
    toast.error(errorMsg);
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
    } catch (error) { toast.error(t("Erreur lors de l'enregistrement")); }
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

  const handleDownloadPDF = (facture) => {
    if (facture.status !== 'valide' && facture.status !== 'paye') {
      toast.error(t("Le PDF n'est disponible que pour les factures validées ou payées"));
      return;
    }
    generateFacturePDF(facture);
  };


  const handleDownloadRecu = (facture) => {
    if (facture.status !== 'paye') {
      toast.error(t("Le PDF n'est disponible que pour les factures validées ou payées"));
      return;
    }
    generateRecuPDF(facture);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(f =>
      f.reference?.toLowerCase().includes(q) ||
      (f.client?.nom || f.client_nom)?.toLowerCase().includes(q) ||
      f.vessel?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  const StatusBadge = ({ status, recu }) => {
    const config = {
      attente: "bg-amber-100 text-amber-700 border-amber-200",
      valide: "bg-indigo-100 text-indigo-700 border-indigo-200",
      paye: "bg-green-100 text-green-700 border-green-200",
      rejete: "bg-red-100 text-red-700 border-red-200"
    };
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase ${config[status] || config.attente}`}>
          {status}
        </span>
        {/* {status === 'paye' && recu && (
          <span className="text-[9px] font-bold text-green-600 bg-white px-1 border border-green-100 rounded">
            REC: {recu}
          </span>
        )} */}
      </div>
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
          placeholder={t("Rechercher une facture...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary font-medium"
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
                    <div className="flex items-center gap-3 mb-1">
                      <div className="font-bold text-buttonGradientSecondary tracking-tight">{f.reference}</div>
                      <StatusBadge status={f.status} recu={f.numero_recu} />
                    </div>
                    <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                      <User className="w-3 h-3 text-gray-400"/> {f.client?.nom || f.client_nom}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold flex items-center gap-2 text-gray-800">
                        <Anchor className="w-4 h-4 text-indigo-400" /> {f.vessel || '---'}
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 mt-1 uppercase">BL: {f.bl || '---'} | Voy: {f.voyage || '---'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-lg text-gray-900">{Number(f.montant_total).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{f.devise_display}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      {/* BOUTON PAIEMENT SI VALIDE */}
                      {peutValider && f.status === 'valide' && (
                        <button 
                          onClick={() => { setSelectedFacture(f); setShowPaymentModal(true); }} 
                          className="p-2 text-white bg-buttonGradientPrimary hover:bg-buttonGradientSecondary rounded-lg shadow-sm transition-all flex items-center gap-1 text-[10px] font-bold px-3"
                          title="Marquer comme payée"
                        >
                          <CreditCard className="w-4 h-4" /> PAYER
                        </button>
                      )}

                      <button onClick={() => { setSelectedFacture(f); setShowPreview(true); }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>


                      {peutValider && f.status === 'attente' && (
                        <>
                          <button onClick={() => handleValidate(f.id, 'valide')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Valider">
                            <FileCheck className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleValidate(f.id, 'rejete')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Rejeter">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      {peutValider && f.status === 'paye' && (
                        <>
                          <button 
                            onClick={() => handleDownloadRecu(f)} 
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Télécharger le reçu"
                          >
                            <FileDown className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      
                      <button onClick={() => handleDownloadPDF(f)} className={`p-2 rounded-lg transition-colors ${(f.status === 'valide' || f.status === 'paye') ? 'text-gray-600 hover:text-buttonGradientSecondary hover:bg-indigo-50' : 'text-gray-200 cursor-not-allowed'}`}>
                        <FileText className="w-5 h-5" />
                      </button>

                      {peutModifier && (
                        <button onClick={() => { setSelectedFacture(f); setShowFactureModal(true); console.log("clicked") }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit3 className="w-5 h-5" />
                        </button>
                      )}

                      {f.status !== 'paye' && (
                        <button onClick={() => handleDelete(f.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
      {/* AFFICHAGE DU MODAL DE PAIEMENT */}
      {showPaymentModal && <PaymentModal facture={selectedFacture} onClose={() => setShowPaymentModal(false)} onConfirm={handlePay} />}
    </div>
  );
}

export default Factures;