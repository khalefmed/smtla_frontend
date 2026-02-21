import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, FileText, Trash2, 
  Download, Calendar, User, 
  HardDrive, File, Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { getRole } from '@/lib/utils';
import ArchiveModal from '@/components/ui/shared/ArchiveModal';

// On définit la base URL pour les médias si l'API ne renvoie pas l'URL complète
const API_URL = "http://127.0.0.1:8000"; 

export default function Archives() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("tous");
  const [showModal, setShowModal] = useState(false);

  const currentRole = getRole();
  // DEBUG: console.log("Mon rôle actuel:", currentRole);
  const peutSupprimer = ["Directeur Général", "Directeur des Opérations"].includes(currentRole);

  useEffect(() => { fetchArchives(); }, []);

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const response = await api.get("archives/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors du chargement des archives"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous vraiment supprimer ce document ?"))) return;
    try {
      // On s'assure que l'ID est bien passé à l'URL
      await api.delete(`archives/${id}/`); 
      toast.success(t("Document supprimé"));
      // On met à jour la liste localement pour éviter un rechargement complet
      setListe(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur lors de la suppression"));
    }
  };

  // Fonction pour forcer le téléchargement si l'attribut download échoue
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${API_URL}${fileUrl}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(t("Erreur lors du téléchargement"));
    }
  };

  const filtered = useMemo(() => {
    return liste.filter(doc => {
      const content = `${doc.titre} ${doc.description || ''}`.toLowerCase();
      const matchSearch = content.includes(search.toLowerCase());
      const matchType = typeFilter === "tous" || doc.type_doc === typeFilter;
      return matchSearch && matchType;
    });
  }, [liste, search, typeFilter]);

  const getFileIcon = (type) => {
    switch(type) {
      case 'IMAGE': return <ImageIcon className="w-6 h-6" />;
      case 'PDF': return <FileText className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 uppercase tracking-tighter">{t("Coffre-fort Numérique")}</h1>
          <p className="text-gray-500 font-medium">{t("Archivage sécurisé des documents SMTLA")}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-xl hover:bg-buttonGradientSecondary flex items-center gap-2 font-bold text-md shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> {t("Archiver un document")}
        </button>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm p-2 relative border border-gray-100 font-bold">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Rechercher par titre, mot-clé...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-4 py-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-buttonGradientPrimary/10 transition-all"
          />
        </div>
        <div className="bg-white rounded-2xl shadow-sm p-2 border border-gray-100">
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-3 bg-gray-50 rounded-xl outline-none font-bold text-sm text-gray-600"
          >
            <option value="tous"> Tous les types</option>
            <option value="IMAGE"> Images / Scans</option>
            <option value="BL"> BL </option>
            <option value="MANIFESTE"> Manifestes</option>
          </select>
        </div>
      </div>

      {/* GRILLE DE DOCUMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filtered.map((doc) => {
          const fileUrl = doc.fichier.startsWith('http') ? doc.fichier : `${API_URL}${doc.fichier}`;
          
          return (
            <div key={doc.id} className="bg-white rounded-[2rem] border border-gray-100 p-6 hover:shadow-2xl hover:shadow-indigo-100 transition-all group relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl ${doc.type_doc === 'IMAGE' ? 'bg-amber-50 text-amber-500' : 'bg-indigo-50 text-buttonGradientPrimary'}`}>
                  {getFileIcon(doc.type_doc)}
                </div>
                <div className="flex gap-2">
                  <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 bg-gray-50 text-gray-400 hover:text-buttonGradientSecondary rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  {peutSupprimer && (
                    <button 
                      onClick={() => handleDelete(doc.id)} 
                      className="p-2 bg-gray-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mb-4 flex-1">
                <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1 line-clamp-1">{doc.titre}</h3>
                <p className="text-xs text-gray-400 font-medium line-clamp-2">{doc.description || t("Aucune description")}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50 mt-auto">
                {/* <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <User className="w-3.5 h-3.5 text-indigo-400" /> {doc.cree_par_nom || t("Utilisateur SMTLA")}
                </div> */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(doc.date_upload).toLocaleDateString()}
                </div>
              </div>

              <button 
                onClick={() => handleDownload(doc.fichier, doc.titre)}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-buttonGradientSecondary transition-all shadow-lg active:scale-95"
              >
                <Download className="w-4 h-4" /> {t("Télécharger")}
              </button>
            </div>
          );
        })}
      </div>

      {loading && <div className="text-center py-20 font-bold text-indigo-300 animate-pulse text-xs uppercase tracking-[0.3em]">{t("Accès au coffre-fort...")}</div>}
      
      {!loading && filtered.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-4 border-dashed border-white">
          <HardDrive className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-bold uppercase text-sm">{t("Aucun document trouvé")}</p>
        </div>
      )}

      {showModal && (
        <ArchiveModal 
          onClose={() => setShowModal(false)} 
          onSave={() => { setShowModal(false); fetchArchives(); }} 
        />
      )}
    </div>
  );
}