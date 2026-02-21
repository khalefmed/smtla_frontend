import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Trash2, Edit3, Truck, 
  Phone, Mail, MapPin, Globe, Building2
} from 'lucide-react';
import FournisseurModal from '@/components/ui/shared/fournisseurModal';

function Fournisseurs() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);

  useEffect(() => { 
    fetchData(); 
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("fournisseurs/");
      setListe(res.data);
    } catch (error) {
      toast.error(t("Erreur lors du chargement des fournisseurs"));
    } finally { 
      setLoading(false); 
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedFournisseur) {
        await api.put(`fournisseurs/${selectedFournisseur.id}/`, formData);
        toast.success(t("Fournisseur mis à jour"));
      } else {
        await api.post('fournisseurs/', formData);
        toast.success(t("Nouveau fournisseur ajouté"));
      }
      setShowModal(false);
      fetchData();
    } catch (error) { 
    console.log(error);
      toast.error(t("Erreur lors de l'enregistrement")); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous supprimer ce fournisseur ?"))) return;
    try {
      await api.delete(`fournisseurs/${id}/`);
      toast.success(t("Fournisseur supprimé"));
      fetchData();
    } catch (error) {
      toast.error(t("Impossible de supprimer (utilisé dans des bons de commande)"));
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter(f => 
      f.nom.toLowerCase().includes(q) || 
      f.email?.toLowerCase().includes(q) ||
      f.telephone?.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Fournisseurs")}</h1>
          <p className="text-textGreyColor font-medium">{t("Gestion des prestataires et partenaires")}</p>
        </div>
        <button
          onClick={() => { setSelectedFournisseur(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Nouveau Fournisseur")}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-4 relative">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={t("Rechercher un fournisseur (Nom, Email, Tel)...")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-buttonGradientPrimary"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b text-xs uppercase font-bold text-gray-500">
              <tr>
                <th className="px-6 py-4">{t("Fournisseur")}</th>
                <th className="px-6 py-4">{t("Contact")}</th>
                <th className="px-6 py-4">{t("Localisation")}</th>
                <th className="px-6 py-4 text-center">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-buttonGradientSecondary font-bold">
                        {f.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{f.nom}</div>
                        <div className="text-[10px] text-buttonGradientPrimary font-bold uppercase tracking-tighter italic">ID: {f.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400" /> {f.telephone || "-"}
                      </div>
                      <div className="text-sm flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400" /> {f.email || "-"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {f.adresse || t("Non renseignée")}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setSelectedFournisseur(f); setShowModal(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(f.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <FournisseurModal 
          fournisseur={selectedFournisseur} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default Fournisseurs;