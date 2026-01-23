import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Search, Plus, Receipt, Trash2, Edit3, 
  Printer, Download, Calendar, CheckCircle, XCircle, Filter 
} from 'lucide-react';
import NoteDeFraisModal from '@/components/ui/shared/noteFraisModal';
import { generateNoteFraisPdf } from '@/lib/generateNoteFraisPdf';
import { getRole } from '@/lib/utils';

function NotesDeFrais() {
  const { t } = useTranslation();
  const [liste, setListe] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => { 
    fetchNotes(); 
  }, []);

  /* =========================
     FETCH
  ========================= */
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get("notes-frais/");
      setListe(response.data);
    } catch (error) {
      toast.error(t("Erreur lors de la récupération des notes de frais"));
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     STATUS ACTIONS (NEW)
  ========================= */
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`notes-frais/${id}/status/`, { status: newStatus });
      toast.success(t(`Note mise à jour avec succès`));
      fetchNotes();
    } catch (error) {
      toast.error(t("Erreur lors du changement de statut"));
    }
  };

  /* =========================
     SAVE
  ========================= */
  const handleSave = async (formData) => { 
    try {
      if (selectedNote) {
        await api.put(`notes-frais/${selectedNote.id}/`, formData);
        toast.success(t("Note de frais mise à jour !"));
      } else {
        await api.post('notes-frais/', formData);
        toast.success(t("Note de frais créée avec succès !"));
      }
      setShowModal(false);
      fetchNotes();
    } catch (error) {
      toast.error(t("Erreur lors de l'enregistrement de la note de frais"));
    }
  };

  /* =========================
     DELETE
  ========================= */
  const handleDelete = async (id) => {
    if (!window.confirm(t("Voulez-vous vraiment supprimer cette note de frais ?"))) return;

    try {
      await api.delete(`notes-frais/${id}/`);
      toast.success(t("Note de frais supprimée !"));
      fetchNotes();
    } catch (error) {
      toast.error(t("Erreur lors de la suppression de la note de frais"));
    }
  };

  /* =========================
     PDF
  ========================= */
  const handlePrint = (note) => {
    generateNoteFraisPdf({
      reference: note.reference,
      date: new Date(note.date_creation).toLocaleDateString(),
      nom: note.user_name || "—",
      direction: "Opération",
      affectation: "Bureau siège",
      items: note.items,
      total: note.montant_total,
      tva: note.tva,
      devise: note.devise_display || "MRU",
    });
  };

  /* =========================
     FILTER LOGIC (UPDATED)
  ========================= */
  const filtered = useMemo(() => {
    return liste.filter(n => {
      const matchesSearch = n.reference.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || n.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [liste, search, statusFilter]);

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-bold text-2xl text-blackColor">
            {t("Notes de Frais")}
          </h1>
          <p className="text-textGreyColor font-medium">
            {t("Gestion des dépenses et remboursements")}
          </p>
        </div>

        <button
          onClick={() => { setSelectedNote(null); setShowModal(true); }}
          className="px-6 py-3 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary flex items-center gap-2 font-bold"
        >
          <Plus className="w-5 h-5" /> {t("Nouvelle Note")}
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* SEARCH */}
        <div className="flex-1 bg-white rounded-lg shadow-sm p-4 relative">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("Rechercher par référence (ex: NF001)...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none"
          />
        </div>

        {/* STATUS DROPDOWN */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 min-w-[200px]">
          <div className='flex items-center gap-2 w-full p-2 bg-inputFieldColor rounded-lg'>
            <Filter className="text-gray-400 w-5 h-5" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="outline-none bg-transparent font-medium text-sm w-full cursor-pointer"
            >
              <option value="all">{t("Tous les statuts")}</option>
              <option value="attente">{t("En attente")}</option>
              <option value="valide">{t("Validé")}</option>
              <option value="rejete">{t("Rejeté")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((note) => (
          <div key={note.id} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md group transition-all flex flex-col justify-between h-full">
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-lg text-buttonGradientPrimary">
                  <Receipt className="w-6 h-6" />
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Validation Actions - Only show if pending */}
                  {(note.status === 'attente' && getRole() === 'Directeur Général') && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(note.id, 'valide')}
                        title={t("Valider")}
                        className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(note.id, 'rejete')}
                        title={t("Rejeter")}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handlePrint(note)}
                    title={t("Imprimer PDF")}
                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {getRole() === 'Directeur Général' && <button
                    onClick={() => { setSelectedNote(note); setShowModal(true); }}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>}

                  { getRole() !== 'Assistant' && (
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg mb-1">{note.reference}</h3>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4" />
                {new Date(note.date_creation).toLocaleDateString()}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        note.status === 'attente' ? 'bg-gray-100 text-gray-700' : 
                        note.status === 'valide' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {note.status_display || note.status}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t pt-4 mt-auto">
              <div>
                <p className="text-xs text-gray-400 uppercase font-bold">
                  {t("Total")}
                </p>
                <p className="text-xl font-bold">
                  {Number(note.montant_total).toLocaleString()} {note.devise_display || note.devise}
                </p>
              </div>

              {note.tva && (
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded">
                  TVA 16%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <NoteDeFraisModal
          note={selectedNote}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default NotesDeFrais;