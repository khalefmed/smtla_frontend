import { useState, useEffect, useMemo } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { ListeDossiers } from '@/components/ui/listes/listeDossiers';
import { Calendar, Search, Camera, FolderOpen } from 'lucide-react';
import ScanModal from '@/components/ui/shared/scanModal';
import { aLeRole } from '@/lib/utils';

function Dossiers() {
  const { t } = useTranslation();

  const [liste, setListe] = useState([]);
  const [etape, setEtape] = useState("numerisation");

  const [search, setSearch] = useState("");
  const [type, setType] = useState("Tous les types");
  const [typesDossiers, setTypesDossiers] = useState([]); // Nouveau state pour les types

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  const [showScanModal, setShowScanModal] = useState(false);

  useEffect(() => {
    get(etape);
    getTypesDossiers(); // Récupérer les types au chargement
  }, [etape]);

  const get = async (selectedEtape) => {
    try {
      const response = await api.get(
        "dossiers/par-etape/?etape=" + selectedEtape
      );

      setListe(response.data);

    } catch (error) {
      console.log(error);
      toast.error(t("Erreur lors de la récupération des dossiers"));
    }
  };

  // Nouvelle fonction pour récupérer les types de dossiers
  const getTypesDossiers = async () => {
    try {
      const response = await api.get("types-dossiers/");
      setTypesDossiers(response.data);
    } catch (error) {
      console.log(error);
      toast.error(t("Erreur lors de la récupération des types"));
    }
  };

  // Fonction pour gérer la sauvegarde du scan
  const handleScanSave = async (scanData) => {
    try {
      const formData = new FormData();
      formData.append('titre', scanData.titre);
      formData.append('type_id', scanData.type); // Changé de 'type' à 'type_id'
      formData.append('libelle', scanData.libelle);
      formData.append('fichiers', scanData.file);

      const response = await api.post('/dossiers/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      toast.success(t("Dossier créé avec succès !"));
      
      // Rafraîchir la liste des dossiers
      await get(etape);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(t("Erreur lors de la création du dossier"));
      throw error;
    }
  };

  // Fonction pour parser "07 - 01 - 2026 11:13" → Date object
  const parseCustomDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return null;
    
    // Si le format est déjà "YYYY-MM-DD" ou "YYYY-MM-DD HH:mm:ss"
    if (dateString.includes('-') && !dateString.includes(' - ')) {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Format personnalisé : "DD - MM - YYYY HH:mm"
    const parts = dateString.trim().split(' ');
    const datePart = parts[0];
    const timePart = parts[1] || "00:00";
    const [day, month, year] = datePart.split(' - ').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);
    
    if (!day || !month || !year) return null;
    
    const date = new Date(year, month - 1, day, hours || 0, minutes || 0);
    return isNaN(date.getTime()) ? null : date;
  };

  // Début et fin de journée pour les filtres
  const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filtered = useMemo(() => {
    return liste.filter((dossier) => {
      // 1. Recherche texte
      const text = search.toLowerCase().trim();
      const matchSearch =
        !text ||
        dossier.titre?.toLowerCase().includes(text) ||
        dossier.numero?.toLowerCase().includes(text) ||
        dossier.libelle?.toLowerCase().includes(text) ||
        dossier.date_creation?.toLowerCase().includes(text);
      
      // 2. Filtre par type - utilise type_info.nom au lieu de type
      const matchType = type === "Tous les types" || dossier.type_info?.nom === type;
      
      let matchDate = true;
      
      // 3. Filtre par date
      const dossierDate = parseCustomDate(dossier.date_creation);
      
      if (dossierDate) {
        if (dateDebut) {
          const debut = new Date(dateDebut);
          const debutDay = startOfDay(debut);
          matchDate = matchDate && dossierDate >= debutDay;
        }
        
        if (dateFin) {
          const fin = new Date(dateFin);
          const finDay = endOfDay(fin);
          matchDate = matchDate && dossierDate <= finDay;
        }
      } else {
        if (dateDebut || dateFin) {
          matchDate = false;
        }
      }
      
      return matchSearch && matchType && matchDate;
    });
  }, [liste, search, type, dateDebut, dateFin]);

  return (
    <div className="flex flex-col gap-10 px-10 max-sm:px-4">

      <div>
        <h1 className="font-bold text-2xl text-blackColor">
          {t("Dossiers")}
        </h1>

        <p className="text-textGreyColor font-medium">
          {t("Page de gestion des dossiers")}
        </p>
      </div>

      {/* Tabs */}
      { (<div className="flex bg-inputFieldColor gap-8 rounded-lg p-1">
        <button
          onClick={() => setEtape("numerisation")}
          className={`py-2 px-1 w-full rounded-lg font-medium transition-colors ${
            etape === "numerisation"
              ? " bg-white"
              : ""
          }`}
        >
          {t("Numérisation")}
        </button>
        <button
          onClick={() => setEtape("validation")}
          className={`py-2 w-full px-1  font-medium transition-colors ${
            etape === "validation"
              ? "bg-white"
              : ""
          }`}
        >
          {t("Validation")}
        </button>
      </div>)}

      {/* Bouton Scanner - Visible uniquement en numérisation */}
      { (
        <div className="flex justify-end">
          <button
            onClick={() => setShowScanModal(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2 shadow-sm"
          >
            <Camera className="w-5 h-5" />
            {t("Scanner un document")}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-4 items-center">

          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("Recherche ...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-inputFieldColor rounded-lg outline-none"
              />
            </div>
          </div>

          {/* Type - Dynamique depuis le backend */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="px-4 py-3 bg-inputFieldColor rounded-lg outline-none min-w-[180px]"
          >
            <option value="Tous les types">{t("Tous les types")}</option>
            {typesDossiers.map((typeDossier) => (
              <option key={typeDossier.id} value={typeDossier.nom}>
                {typeDossier.nom}
              </option>
            ))}
          </select>

          {/* Date début */}
          <div className="relative">
            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-4 py-3 pl-10 bg-inputFieldColor rounded-lg outline-none"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Date fin */}
          <div className="relative">
            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-4 py-3 pl-10 bg-inputFieldColor rounded-lg outline-none"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

        </div>
      </div>

      {/* Liste des dossiers ou message vide */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <FolderOpen className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 text-lg font-medium">
            {t("Pas de dossiers")}
          </p>
          <p className="text-gray-400 text-sm">
            {search || dateDebut || dateFin || type !== "Tous les types"
              ? t("Aucun dossier ne correspond à vos critères de recherche")
              : t("Aucun dossier dans cette étape pour le moment")}
          </p>
        </div>
      ) : (
        <ListeDossiers donnees={filtered} />
      )}

      {/* Modal de scan */}
      <ScanModal
        isOpen={showScanModal}
        onClose={() => setShowScanModal(false)}
        onSave={handleScanSave}
        typesDossiers={typesDossiers} // Passer les types au modal
      />

    </div>
  );
}

export default Dossiers;