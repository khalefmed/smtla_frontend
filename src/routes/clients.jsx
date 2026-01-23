import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  Trash2, 
  Edit3, 
  FileText, 
  Hash,
  MapPin
} from 'lucide-react';
import ClientModal from '@/components/ui/shared/clientModal';

function Clients() {
  const { t } = useTranslation();

  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await api.get("clients/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des clients"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (selectedClient) {
        await api.put(`clients/${selectedClient.id}/`, formData);
        toast.success(t("Client mis à jour !"));
      } else {
        await api.post('clients/', formData);
        toast.success(t("Client créé avec succès !"));
      }
      setShowModal(false);
      fetchClients();
    } catch (error) {
      const errorMsg = error.response?.data?.nif ? t("Ce NIF est déjà utilisé") : t("Erreur lors de l'enregistrement");
      toast.error(errorMsg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("Voulez-vous vraiment supprimer ce client ?"))) {
      try {
        await api.delete(`clients/${id}/`);
        toast.success(t("Client supprimé"));
        fetchClients();
      } catch (error) {
        toast.error(t("Impossible de supprimer un client ayant des documents liés"));
      }
    }
  };

  const openEditModal = (client) => {
    setSelectedClient(client);
    setShowModal(true);
  };

  // Filtrage côté client (Nom, Téléphone, Email ou NIF)
  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return liste.filter((c) => 
      c.nom.toLowerCase().includes(q) || 
      c.telephone.includes(q) || 
      c.email.toLowerCase().includes(q) ||
      c.nif.toLowerCase().includes(q)
    );
  }, [liste, search]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">{t("Annuaire Clients")}</h1>
          <p className="text-textGreyColor font-medium">{t("Gérez vos relations clients et consultez leur historique")}</p>
        </div>
        <button
          onClick={() => { setSelectedClient(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          {t("Nouveau Client")}
        </button>
      </div>

      {/* Barre de Recherche */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Rechercher par nom, téléphone, email ou NIF...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none border border-transparent focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tableau des Clients */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">{t("Client / NIF")}</th>
              <th className="px-6 py-4">{t("Contact")}</th>
              <th className="px-6 py-4 text-center">{t("Activité")}</th>
              <th className="px-6 py-4 text-right">{t("Actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{c.nom}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Hash className="w-3 h-3" /> {c.nif}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3 text-indigo-400" /> {c.telephone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="w-3 h-3 text-indigo-400" /> {c.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-4">
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-400 uppercase">{t("Devis")}</div>
                        <div className="text-buttonGradientPrimary font-bold">{c.nombre_devis}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-400 uppercase">{t("Factures")}</div>
                        <div className="text-green-600 font-bold">{c.nombre_factures}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEditModal(c)} className="p-2 hover:bg-indigo-50 text-buttonGradientPrimary rounded-lg" title={t("Modifier")}>
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title={t("Supprimer")}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  {t("Aucun client trouvé")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <ClientModal 
          client={selectedClient} 
          onClose={() => setShowModal(false)} 
          onSave={handleSave} 
        />
      )}
    </div>
  );
}

export default Clients;