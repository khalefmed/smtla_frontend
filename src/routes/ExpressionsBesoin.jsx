import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, 
  Download, Calendar, CheckCircle, XCircle, Filter,
  User, Ship, FileCheck, Clock, Eye, AlertCircle,
  Building2, MapPin, UserCheck
} from 'lucide-react';
import ExpressionBesoinModal from '@/components/ui/shared/ExpressionBesoinModal';
import { getRole, getUserData } from '@/lib/utils';
import { generateEbPdf } from "@/lib/generateEbPdf";

function ExpressionsBesoin() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedExpression, setSelectedExpression] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const userData = getUserData();
  const currentRole = getRole();

  useEffect(() => { 
    fetchExpressions(); 
  }, []);

  const peutGererStatut = ["Directeur des Opérations", "Comptable", "Directeur Général"].includes(currentRole);
  const peutSupprimer = ["Directeur des Opérations", "Directeur Général"].includes(currentRole);

  const peutModifier = (expression) => {
    if (expression.status === 'valide') return currentRole === "Directeur Général";
    if (expression.createur === userData?.userId && expression.status === 'attente') return true;
    return ["Directeur des Opérations", "Comptable", "Directeur Général"].includes(currentRole);
  };

  const fetchExpressions = async () => {
    try {
      setLoading(true);
      const response = await api.get("expressions-besoin/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id, newStatus) => {
    try {
      await api.patch(`expressions-besoin/${id}/valider/`, { status: newStatus });
      toast.success(t(`Statut mis à jour : ${newStatus}`));
      fetchExpressions();
    } catch (error) {
      toast.error(t("Erreur lors de la validation"));
    }
  };

  const handleSave = async (formData) => { 
    try {
      if (selectedExpression) {
        await api.put(`expressions-besoin/${selectedExpression.id}/`, formData);
        toast.success(t("Expression mise à jour !"));
      } else {
        await api.post('expressions-besoin/', formData);
        toast.success(t("Expression créée avec succès !"));
      }
      setShowModal(false);
      fetchExpressions();
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de l'enregistrement"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Confirmer la suppression ?"))) return;
    try {
      await api.delete(`expressions-besoin/${id}/`);
      toast.success(t("Supprimé !"));
      fetchExpressions();
    } catch (error) {
      toast.error(t("Erreur lors de la suppression"));
    }
  };

const handleExportPdf = (eb) => {
    try {
      toast.loading(t("Génération du PDF..."), { id: 'pdf-gen' });
      
      // Appel de votre fonction importée
      generateEbPdf(eb);
      
      toast.success(t("PDF généré avec succès"), { id: 'pdf-gen' });
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la génération du PDF"), { id: 'pdf-gen' });
    }
  };

  const filtered = useMemo(() => {
    return liste.filter(e => {
      const content = `${e.reference} ${e.client_beneficiaire_nom} ${e.navire} ${e.nom_demandeur} ${e.direction}`.toLowerCase();
      const matchesSearch = content.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || e.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [liste, search, statusFilter]);

  const getStatusBadge = (status) => {
    const s = {
      'attente': 'bg-yellow-100 text-yellow-700',
      'en_cours': 'bg-blue-100 text-blue-700',
      'valide': 'bg-green-100 text-green-700',
      'rejete': 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${s[status] || s.attente}`}>{status}</span>;
  };

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Expressions de Besoin")}</h1>
          <p className="text-gray-500 font-medium">{t("Demandes d'achats et de dépenses")}</p>
        </div>
        <button
          onClick={() => { setSelectedExpression(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold shadow-lg"
        >
          <Plus className="w-5 h-5" /> {t("Nouvelle Expression")}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Rechercher par réf, demandeur, navire...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none"
          />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <Filter className="text-gray-400 w-5 h-5" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="outline-none bg-transparent font-bold text-sm cursor-pointer"
          >
            <option value="all">{t("Tous les statuts")}</option>
            <option value="attente">{t("En attente")}</option>
            <option value="en_cours">{t("En cours")}</option>
            <option value="valide">{t("Validée")}</option>
            <option value="rejete">{t("Rejetée")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((eb) => (
          <div key={eb.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group flex flex-col justify-between h-full relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${eb.status === 'valide' ? 'bg-green-500' : eb.status === 'rejete' ? 'bg-red-500' : 'bg-yellow-500'}`} />

            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-inputFieldColor rounded-xl text-buttonGradientSecondary"><FileText className="w-6 h-6" /></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setPreviewData(eb); setShowPreview(true); }} className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                  {peutGererStatut && (eb.status === 'attente' || eb.status === 'en_cours') && (
                    <>
                      <button onClick={() => handleValidation(eb.id, 'valide')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                      <button onClick={() => handleValidation(eb.id, 'rejete')} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><XCircle className="w-4 h-4" /></button>
                    </>
                  )}
                  {eb.status === 'valide' && (
                    <button onClick={() => handleExportPdf(eb)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Download className="w-4 h-4" /></button>
                  )}
                  {peutModifier(eb) && (
                    <button onClick={() => { setSelectedExpression(eb); setShowModal(true); }} className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                  )}
                  {peutSupprimer && (
                    <button onClick={() => handleDelete(eb.id)} className="p-2 hover:bg-red-50 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2 text-gray-900">{eb.reference}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {eb.direction}
                </span>
                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {eb.affectation}
                </span>
              </div>

              <div className="space-y-3 mb-6 text-sm font-bold">
                <div className="flex items-center gap-2 text-gray-700"><UserCheck className="w-4 h-4 text-buttonGradientPrimary" /> {eb.nom_demandeur}</div>
                {/* <div className="flex items-center gap-2 text-gray-500 font-medium"><User className="w-4 h-4" /> {eb.client_beneficiaire_nom}</div> */}
                <div className="flex items-center gap-2 text-gray-500 font-medium"><Ship className="w-4 h-4" /> {eb.navire}</div>
              </div>

              <div className="flex items-center gap-2 mb-4">{getStatusBadge(eb.status)}</div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-50 pt-4 mt-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase">{t("Total")}</p>
                <p className="text-xl font-bold">{Number(eb.montant_total).toLocaleString()} {eb.devise_display}</p>
              </div>
              {eb.tva && <span className="bg-indigo-50 text-buttonGradientSecondary text-[10px] font-bold px-2 py-1 rounded">TVA 16%</span>}
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-20 animate-pulse font-bold text-gray-400">{t("Chargement...")}</div>}
      {showModal && <ExpressionBesoinModal expression={selectedExpression} onClose={() => setShowModal(false)} onSave={handleSave} />}
      {showPreview && previewData && <PreviewModal expression={previewData} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

function PreviewModal({ expression, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight"><Eye className="w-5 h-5" /> {expression.reference}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><XCircle className="w-6 h-6" /></button>
        </div>
        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          <div className="bg-inputFieldColor p-4 rounded-2xl grid grid-cols-3 gap-4 border border-inputFieldColor">
            <div><p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Demandeur</p><p className="font-bold text-sm">{expression.nom_demandeur}</p></div>
            <div><p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Direction</p><p className="font-bold text-sm">{expression.direction}</p></div>
            <div><p className="text-[10px] font-bold text-purple-400 uppercase mb-1">Affectation</p><p className="font-bold text-sm">{expression.affectation}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-6 pb-6 border-b border-gray-100">
            {/* <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Client</p><p className="font-bold">{expression.client_beneficiaire_nom}</p></div> */}
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Navire</p><p className="font-bold">{expression.navire}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">BL / AWB</p><p className="font-mono text-sm font-bold">{expression.bl_awb}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ETA</p><p className="font-bold">{new Date(expression.eta).toLocaleDateString()}</p></div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 uppercase text-[10px] font-bold border-b"><th className="pb-3">Libellé</th><th className="pb-3 text-right">Montant</th></tr></thead>
            <tbody className="divide-y divide-gray-50">
              {expression.items?.map((item, i) => (
                <tr key={i}><td className="py-3 font-medium">{item.libelle} <span className="text-[10px] text-gray-300 ml-2">({item.type})</span></td><td className="py-3 text-right font-bold">{Number(item.montant).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="p-6 bg-gray-50 rounded-2xl flex justify-between items-center">
            <span className="font-bold text-gray-400 uppercase text-xs">Total Global</span>
            <span className="text-2xl font-bold text-gray-900">{Number(expression.montant_total).toLocaleString()} {expression.devise_display}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpressionsBesoin;