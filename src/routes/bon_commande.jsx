import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, Edit3, 
  ShoppingCart, Building2, FileCheck, XCircle, Printer
} from 'lucide-react';
import BonCommandeModal from '@/components/ui/shared/bonCommandeModal';
import { generateBCPDF } from '@/lib/generateBCPdf';
import { getRole, getUserData } from '@/lib/utils';

function BonsCommande() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBC, setSelectedBC] = useState(null);

  // Rôles et Permissions
  const currentRole = getRole();
  const userData = getUserData();

  useEffect(() => { 
    fetchData(); 
  }, []);

  /* =========================
     LOGIQUE DES PERMISSIONS
  ========================= */
  const peutValider = ["Directeur des Opérations", "Comptable", "Directeur Général"].includes(currentRole);
  
  const peutSupprimer = ["Directeur Général", "Directeur des Opérations"].includes(currentRole);

  const peutModifier = (bc) => {
    // Si déjà validé, seul le DG ou le Comptable peut modifier
    if (bc.status === 'valide') return ["Comptable", "Directeur Général"].includes(currentRole);
    return true; 
  };

  /* =========================
     ACTIONS API
  ========================= */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resBC, resFournisseurs] = await Promise.all([
        api.get("bons-commande/"),
        api.get("fournisseurs/")
      ]);
      setListe(resBC.data);
      setFournisseurs(resFournisseurs.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des données"));
    } finally { setLoading(false); }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedBC) {
        await api.put(`bons-commande/${selectedBC.id}/`, formData);
        toast.success(t("Bon de commande mis à jour"));
      } else {
        await api.post('bons-commande/', formData);
        toast.success(t("Bon de commande créé avec succès"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { 
        console.error(error);
        toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleValidate = async (id, status) => {
    try {
      await api.patch(`bons-commande/${id}/valider/`, { status });
      toast.success(t(`BC ${status === 'valide' ? 'validé' : 'rejeté'}`));
      fetchData();
    } catch (error) { toast.error(t("Action non autorisée")); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous vraiment supprimer ce bon de commande ?"))) return;
    try {
      await api.delete(`bons-commande/${id}/`);
      toast.success(t("Supprimé avec succès"));
      fetchData();
    } catch (error) {
      toast.error(t("Erreur lors de la suppression"));
    }
  };

  /* =========================
     FILTRAGE ET UI
  ========================= */
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
    return liste.filter(bc => 
      bc.reference?.toLowerCase().includes(q) || 
      bc.fournisseur_nom?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Bons de Commande")}</h1>
          <p className="text-gray-500 font-medium">{t("Achats auprès des fournisseurs et prestataires")}</p>
        </div>
        <button
          onClick={() => { setSelectedBC(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:opacity-90 transition-all flex items-center gap-2 shadow-lg font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Nouveau BC")}
        </button>
      </div>

      {/* RECHERCHE */}
      <div className="bg-white rounded-xl shadow-sm p-4 relative border border-gray-100">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher par référence ou fournisseur...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary font-medium"
        />
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-400 tracking-widest">
            <tr>
              <th className="px-6 py-4">{t("Référence / Fournisseur")}</th>
              <th className="px-6 py-4">{t("Date d'émission")}</th>
              <th className="px-6 py-4 text-right">{t("Montant Total")}</th>
              <th className="px-6 py-4 text-center">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20 animate-pulse font-bold text-gray-400">{t("Chargement...")}</td></tr>
            ) : filtered.map((bc) => (
              <tr key={bc.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-bold text-buttonGradientSecondary tracking-tight">{bc.reference}</div>
                    <StatusBadge status={bc.status} />
                  </div>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-gray-400"/> {bc.fournisseur.nom}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-500">
                  {new Date(bc.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="font-bold text-lg text-gray-900">{Number(bc.montant_total).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{bc.devise_display}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-1">
                    {/* VALIDATION : Managers uniquement sur BC en attente */}
                    {bc.status === 'attente' && peutValider && (
                      <>
                        <button onClick={() => handleValidate(bc.id, 'valide')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Valider">
                          <FileCheck className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleValidate(bc.id, 'rejete')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rejeter">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    <button onClick={() => generateBCPDF(bc)} className="p-2 text-gray-400 hover:text-buttonGradientSecondary hover:bg-indigo-50 rounded-lg transition-colors" title="Imprimer">
                      <Printer className="w-5 h-5" />
                    </button>

                    {peutModifier(bc) && (
                      <button onClick={() => { setSelectedBC(bc); setShowModal(true); }} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Modifier">
                        <Edit3 className="w-5 h-5" />
                      </button>
                    )}

                    {peutSupprimer && (
                      <button onClick={() => handleDelete(bc.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Supprimer">
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

      {showModal && <BonCommandeModal bc={selectedBC} fournisseurs={fournisseurs} onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}

export default BonsCommande;