import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, 
  Download, Calendar, Eye, User, Ship, 
  Clock, XCircle, AlertCircle, Tag, Anchor
} from 'lucide-react';
import BADModal from '@/components/ui/shared/BADModal';
import { getRole } from '@/lib/utils';
import { generateBadPDF } from '@/lib/generateBadPdf';

export  function BAD() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [clients, setClients] = useState([]);
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // États des modaux
  const [showModal, setShowModal] = useState(false);
  const [selectedBAD, setSelectedBAD] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const currentRole = getRole();

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  const peutModifierOuSupprimer = ["Directeur des Opérations", "Directeur Général", "Agent de Port"].includes(currentRole);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Récupération globale pour alimenter le tableau et les formulaires
      const [resBAD, resClients, resFactures] = await Promise.all([
        api.get("bads/"),
        api.get("clients/"),
        api.get("factures/")
      ]);
      setListe(resBAD.data);
      setClients(resClients.data);
      setFactures(resFactures.data);
    } catch (error) {
      toast.error(t("Erreur lors du chargement des données logistiques"));
    } finally {
      setLoading(false);
    }
  };

  const fetchBADsOnly = async () => {
    try {
      const response = await api.get("bads/");
      setListe(response.data);
    } catch (error) {
      console.error("Erreur refresh:", error);
    }
  };

  const handleSave = async (formData) => { 
    try {
      if (selectedBAD) {
        await api.put(`bads/${selectedBAD.id}/`, formData);
        toast.success(t("BAD mis à jour avec succès"));
      } else {
        await api.post('bads/', formData);
        toast.success(t("Nouveau BAD généré"));
      }
      setShowModal(false);
      fetchBADsOnly();
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de l'enregistrement du BAD"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous vraiment supprimer ce document ?"))) return;
    try {
      await api.delete(`bads/${id}/`);
      toast.success(t("Document supprimé"));
      fetchBADsOnly();
    } catch (error) {
      toast.error(t("Action refusée ou erreur serveur"));
    }
  };

  const handleDownloadPdf = async (bad) => {
    const loadingToast = toast.loading(t("Génération du PDF en cours..."));
    try {
      // Optionnel : récupérer les détails complets du client pour le PDF
      const clientDetails = clients.find(c => c.id === bad.client) || null;
      await generateBadPDF(bad, clientDetails);
      toast.success(t("Téléchargement lancé"), { id: loadingToast });
    } catch (error) {
      toast.error(t("Erreur génération PDF"), { id: loadingToast });
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(b => 
      b.reference?.toString().includes(q) ||
      b.client_nom?.toLowerCase().includes(q) ||
      b.navire?.toLowerCase().includes(q) ||
      b.nom_representant?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* SECTION TITRE & ACTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Bons à Délivrer")}</h1>
          <p className="text-gray-500 font-medium">{t("Suivi et gestion des sorties cargo")}</p>
        </div>
        <button
          onClick={() => { setSelectedBAD(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:bg-buttonGradientSecondary flex items-center gap-2 font-bold shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t("Créer un BAD")}
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white rounded-2xl shadow-sm p-4 relative border border-gray-100 font-bold">
        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par référence, client, navire...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-14 pr-4 py-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-buttonGradientPrimary/20 transition-all"
        />
      </div>

      {/* GRILLE DES BADs */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-buttonGradientPrimary"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("Chargement...")}</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bad) => (
            <div key={bad.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all group flex flex-col relative overflow-hidden">
              
              {/* Badge d'expiration rapide */}
              <div className="absolute top-0 right-0 w-2 h-full bg-buttonGradientPrimary group-hover:bg-amber-500 transition-colors"></div>

              <div className="flex justify-between items-start mb-5">
                <div className="p-3 bg-blue-50 rounded-xl text-buttonGradientPrimary">
                  <FileText className="w-6 h-6" />
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {bad.facture_ref ? (
                    <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-amber-100 uppercase">
                      <Tag className="w-3 h-3" /> {bad.facture_ref}
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-gray-300 italic uppercase">Sans facture liée</span>
                  )}
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setPreviewData(bad); setShowPreview(true); }} className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg"><Eye className="w-4 h-4" /></button>
                    {peutModifierOuSupprimer && (
                      <>
                        <button onClick={() => { setSelectedBAD(bad); setShowModal(true); }} className="p-2 bg-blue-50 hover:bg-blue-100 text-buttonGradientPrimary rounded-lg"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(bad.id)} className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h3 className="font-black text-xl text-gray-900 tracking-tight italic">BAD-{bad.reference}</h3>
                <p className="text-sm font-bold text-buttonGradientPrimary uppercase truncate mt-1">{bad.client_nom}</p>
              </div>

              <div className="space-y-3 mb-6 flex-1 border-l-4 border-blue-50 pl-4 py-1">
                <div className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                  <Ship className="w-4 h-4 text-blue-400" /> {bad.navire || "Non spécifié"}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <User className="w-4 h-4 text-gray-400" /> {bad.nom_representant}
                </div>
                <div className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase">
                  <Calendar className="w-4 h-4" /> {t("Expire le")} : {new Date(bad.date_expiration).toLocaleDateString()}
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Franchise")}</span>
                  <span className="font-black text-buttonGradientPrimary text-xl">{bad.nombre_jours} {t("Jours")}</span>
                </div>
                <button 
                  onClick={() => handleDownloadPdf(bad)}
                  className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase hover:bg-black transition-all shadow-md active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">{t("Aucun bon à délivrer disponible")}</p>
        </div>
      )}

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <BADModal 
          bad={selectedBAD} 
          clients={clients} 
          factures={factures} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}

      {/* MODAL PREVIEW (DÉTAILS) */}
      {showPreview && previewData && (
        <PreviewBADModal 
          bad={previewData} 
          onClose={() => setShowPreview(false)} 
          onDownload={() => handleDownloadPdf(previewData)}
        />
      )}
    </div>
  );
}

// --- SOUS-COMPOSANT PREVIEW ---
function PreviewBADModal({ bad, onClose, onDownload }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex flex-col">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <Eye className="w-6 h-6 text-blue-400" /> BAD-{bad.reference}
            </h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
              Détails du document logistique
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-colors"><XCircle className="w-7 h-7" /></button>
        </div>
        
        <div className="p-10 space-y-8">
          {/* Infos Principales */}
          <div className="grid grid-cols-2 gap-8 pb-8 border-b border-gray-100 font-bold">
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Client</p><p className="text-gray-900 text-lg">{bad.client_nom}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Navire</p><p className="text-buttonGradientPrimary text-lg uppercase">{bad.navire}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Représentant</p><p className="text-gray-900">{bad.nom_representant}</p></div>
            <div><p className="text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">Validité jusqu'au</p><p className="text-red-500 font-black">{new Date(bad.date_expiration).toLocaleDateString()}</p></div>
          </div>

          {/* Tableau des Items */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Anchor className="w-4 h-4 text-buttonGradientPrimary" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Liste des BL & Cargaison</p>
             </div>
             <div className="overflow-hidden border border-gray-100 rounded-3xl">
               <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-gray-400 uppercase text-[9px] font-black tracking-widest">
                    <th className="p-5">N° BL</th>
                    <th className="p-5 text-center">Colis / Unités</th>
                    <th className="p-5 text-right">Poids Brut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-bold">
                  {bad.items?.map((item, i) => (
                    <tr key={i} className="hover:bg-blue-50/40 transition-colors">
                      <td className="p-5 text-buttonGradientPrimary font-mono tracking-tighter">{item.bl}</td>
                      <td className="p-5 text-center text-gray-700">{item.package_number}</td>
                      <td className="p-5 text-right text-gray-900">{item.weight} <span className="text-[10px] text-gray-400 uppercase">Kg</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>

          {/* Widget Franchise */}
          <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] flex justify-between items-center border border-blue-100">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-buttonGradientPrimary rounded-2xl text-white shadow-lg shadow-blue-200">
                 <Clock className="w-6 h-6" />
               </div>
               <div>
                  <span className="font-black text-blue-900 uppercase text-xs block">Franchise accordée</span>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Délai de sortie cargo</span>
               </div>
            </div>
            <span className="text-4xl font-black text-buttonGradientPrimary">{bad.nombre_jours} <span className="text-sm font-bold text-blue-400 uppercase tracking-normal">Jours</span></span>
          </div>

          {/* Action Footer */}
          <button 
            onClick={onDownload}
            className="w-full bg-gray-900 text-white py-6 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-[0.98]"
          >
            <Download className="w-5 h-5" /> Télécharger l'original (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}