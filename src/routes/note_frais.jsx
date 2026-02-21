import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Receipt, Trash2, Edit3, 
  Download, CheckCircle, XCircle, Filter,
  User, Ship, FileText, Eye
} from 'lucide-react';
import NoteDeFraisModal from '@/components/ui/shared/noteFraisModal';
import { getRole } from '@/lib/utils';
import { generateNoteFraisPdf } from "@/lib/generateNoteFraisPdf";

// --- COMPOSANT PREVIEW MODAL (Adapté au NoteFraisDetailSerializer) ---
function PreviewModal({ note, onClose }) {
  if (!note) return null;

  
  // On récupère les détails de l'EB via le champ imbriqué du serializer
  const eb = note.expression_besoin_detail;

  console.log(eb.nom_demandeur)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gray-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
              <Eye className="w-5 h-5" /> {note.reference}
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Détails de la Note de Frais</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Section 1: Demandeur & Source (Basée sur l'Expression de Besoin Detail) */}
          <div className="bg-inputFieldColor p-5 rounded-2xl grid grid-cols-3 gap-4 border border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Demandeur</p>
              <p className="font-bold text-sm text-gray-900">{eb?.nom_demandeur || "N/A"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Direction</p>
              <p className="font-bold text-sm text-gray-900">{eb?.direction || "---"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase mb-1">Affectation</p>
              <p className="font-bold text-sm text-gray-900">{eb?.affectation || "---"}</p>
            </div>
          </div>

          {/* Section 2: Logistique */}
          <div className="grid grid-cols-3 gap-6 pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Navire</p>
              <p className="font-bold text-sm text-gray-800">{eb?.navire || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">BL / AWB</p>
              <p className="font-mono text-sm font-bold text-gray-800">{eb?.bl_awb || "-"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">ETA</p>
              <p className="font-bold text-sm text-gray-800">
                {eb?.eta ? new Date(eb.eta).toLocaleDateString() : "-"}
              </p>
            </div>
          </div>

          {/* Section 3: Tableau des Dépenses Réelles (Items de la Note de Frais) */}
          <div>
            <p className="text-[10px] font-bold text-indigo-500 uppercase mb-3 tracking-widest">Dépenses Réelles</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 uppercase text-[10px] font-bold border-b">
                  <th className="pb-3">Libellé</th>
                  <th className="pb-3 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {note.items?.map((item, i) => (
                  <tr key={i} className="group">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{item.libelle}</p>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase">{item.type_display}</p>
                    </td>
                    <td className="py-3 text-right font-bold text-gray-900">
                      {Number(item.montant).toLocaleString()} <span className="text-[10px] text-gray-400">{note.devise}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Total Final */}
          <div className="p-6 bg-indigo-50 rounded-2xl flex justify-between items-center border border-indigo-100 mt-4">
            <div>
                <span className="font-bold text-indigo-900 uppercase text-xs block">Total Global</span>
                <span className="text-[10px] text-indigo-400 font-medium tracking-tight italic">
                    EB Source: {eb?.reference}
                </span>
            </div>
            <span className="text-2xl font-bold text-indigo-900">
              {Number(note.montant_total).toLocaleString()} {note.devise_display}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- COMPOSANT PRINCIPAL ---
function NotesDeFrais() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const userRole = getRole();
  const isDG = userRole === 'Directeur Général' || userRole === 'admin';

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      // Ici, le backend renvoie maintenant le NoteFraisDetailSerializer
      const response = await api.get("notes-frais/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally {
      setLoading(false);
    }
  };

  const handleValidation = async (id, newStatus) => {
    try {
      await api.patch(`notes-frais/${id}/valider/`, { status: newStatus });
      toast.success(t(`Note mise à jour : ${newStatus}`));
      fetchNotes();
    } catch (error) {
      toast.error(t("Erreur lors de la validation"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous vraiment supprimer cette note ?"))) return;
    try {
      await api.delete(`notes-frais/${id}/`);
      toast.success(t("Note supprimée"));
      fetchNotes();
    } catch (error) {
      toast.error(t("Erreur lors de la suppression"));
    }
  };

  const handleSave = async (formData) => { 
    try {
      if (selectedNote) {
        await api.put(`notes-frais/${selectedNote.id}/`, formData);
        toast.success(t("Modifications enregistrées"));
      } else {
        await api.post(`notes-frais/depuis-expression/${formData.expression_besoin_id}/`);
        toast.success(t("Note de frais générée avec succès !"));
      }
      setShowModal(false);
      fetchNotes();
    } catch (error) {
      toast.error(t("Une erreur est survenue lors de l'enregistrement"));
    }
  };

  const handleExportPdf = (note) => {
    if (note.status !== 'valide') {
      toast.error(t("Le PDF est disponible uniquement pour les notes validées"));
      return;
    }
    try {
      toast.loading(t("Génération du PDF..."), { id: 'pdf-gen' });
      generateNoteFraisPdf(note);
      toast.success(t("PDF généré avec succès"), { id: 'pdf-gen' });
    } catch (error) {
      toast.error(t("Erreur lors de la génération du PDF"), { id: 'pdf-gen' });
    }
  };

  const filtered = useMemo(() => {
    return liste.filter(n => {
        // Recherche étendue sur les données imbriquées de l'EB
      const content = `${n.reference} ${n.expression_besoin_detail?.client_beneficiaire_nom} ${n.expression_besoin_detail?.navire} ${n.expression_besoin_detail?.reference}`.toLowerCase();
      const matchesSearch = content.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || n.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [liste, search, statusFilter]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Notes de Frais")}</h1>
          <p className="text-textGreyColor font-medium">{t("Suivi et validation des dépenses réelles")}</p>
        </div>
        <button onClick={() => { setSelectedNote(null); setShowModal(true); }} className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 flex items-center gap-2 font-bold shadow-lg">
          <Plus className="w-5 h-5" /> {t("Générer une Note")}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder={t("Rechercher par référence, navire ou EB...")} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-buttonGradientPrimary/20" />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
          <Filter className="text-gray-400 w-5 h-5" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="outline-none bg-transparent font-bold text-sm cursor-pointer">
            <option value="all">{t("Tous les statuts")}</option>
            <option value="attente">{t("En attente")}</option>
            <option value="valide">{t("Validé")}</option>
            <option value="rejete">{t("Rejeté")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((note) => {
          const isValide = note.status === 'valide';
          const canEdit = !isValide || isDG;
          const eb = note.expression_besoin_detail;

          return (
            <div key={note.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group flex flex-col justify-between relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${isValide ? 'bg-green-500' : note.status === 'rejete' ? 'bg-red-500' : 'bg-yellow-500'}`} />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-buttonGradientSecondary"><Receipt className="w-6 h-6" /></div>
                  <div className="flex gap-1">
                    {note.status === 'attente' && isDG && (
                      <>
                        <button onClick={() => handleValidation(note.id, 'valide')} title={t("Valider")} className="p-2 hover:bg-green-50 text-green-600 rounded-lg"><CheckCircle className="w-5 h-5" /></button>
                        <button onClick={() => handleValidation(note.id, 'rejete')} title={t("Rejeter")} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><XCircle className="w-5 h-5" /></button>
                      </>
                    )}

                    <button onClick={() => { setSelectedNote(note); setShowPreview(true); }} title={t("Voir Détails")} className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg">
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    {isValide && (
                      <button onClick={() => handleExportPdf(note)} title={t("Télécharger PDF")} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Download className="w-5 h-5" /></button>
                    )}

                    {canEdit && (
                      <button onClick={() => { setSelectedNote(note); setShowModal(true); }} title={t("Modifier")} className="p-2 hover:bg-indigo-50 text-indigo-500 rounded-lg"><Edit3 className="w-5 h-5" /></button>
                    )}

                    {!isValide && (
                      <button onClick={() => handleDelete(note.id)} title={t("Supprimer")} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-xl text-gray-900">{note.reference}</h3>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-tight">Source: {eb?.reference || "N/A"}</p>
                </div>

                <div className="space-y-2.5 mb-6">
                  {/* <div className="flex items-center gap-2 text-sm font-bold text-gray-700"><User className="w-4 h-4 text-gray-400" /> {eb?.client_beneficiaire_nom || "Client inconnu"}</div> */}
                  <div className="flex items-center gap-2 text-sm text-gray-500"><Ship className="w-4 h-4 text-gray-400" /> {eb?.navire || "-"}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-500"><FileText className="w-4 h-4 text-gray-400" /> {eb?.bl_awb || "-"}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Montant Réel")}</p>
                  <p className="text-2xl font-bold text-gray-900">{Number(note.montant_total).toLocaleString()} <span className="text-sm font-normal text-gray-500">{note.devise_display}</span></p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase ${isValide ? 'bg-green-100 text-green-700' : note.status === 'rejete' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {note.status_display}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <NoteDeFraisModal 
          note={selectedNote} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave}
        />
      )}

      {showPreview && (
        <PreviewModal 
          note={selectedNote} 
          onClose={() => setShowPreview(false)} 
        />
      )}
    </div>
  );
}

export default NotesDeFrais;