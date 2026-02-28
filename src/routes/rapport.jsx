import { useState } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Calendar, FileText, Download, Loader2, 
  Ship, LayoutGrid, List, Search, Database,
  ArrowDownCircle, ArrowUpCircle 
} from 'lucide-react';

// Import des fonctions de génération PDF
import { generateGeneralReportPdf } from '@/lib/generateGeneralReportPdf';
import { generateDailyReportPdf } from '@/lib/generateDailyReportPdf';

function Rapports() {
  const { t } = useTranslation();
  
  // Onglet : 'general' ou 'journalier'
  const [activeTab, setActiveTab] = useState('general'); 
  
  // Type de mouvement : 'entrees' ou 'sorties'
  const [mouvementType, setMouvementType] = useState('sorties');
  
  // Filtres de dates
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Informations manuelles
  const [vessel, setVessel] = useState("");
  const [remainingOnBoard, setRemainingOnBoard] = useState("");
  
  // États de chargement et données
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  /**
   * Appel API dynamique selon l'onglet et le type de mouvement
   */
  const fetchReport = async () => {
    try {
      setLoading(true);
      setReportData(null);
      
      const params = new URLSearchParams({
        type_mouvement: mouvementType,
      });

      if (activeTab === 'general') {
        params.append('start_date', startDate);
        params.append('end_date', endDate);
      } else {
        params.append('date', singleDate);
      }

      const endpoint = activeTab === 'general' ? 'stats/global/' : 'stats/journalier/';
      const res = await api.get(`${endpoint}?${params.toString()}`);
      
      setReportData(res.data);
      toast.success(t("Données chargées"));
    } catch (error) {
      console.error(error);
      toast.error(t("Erreur de récupération des données"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Génération du PDF avec adaptation des labels selon le flux
   */
  const handleDownloadPDF = () => {
    if (!reportData) return;
    const isEntree = mouvementType === 'entrees';

    if (activeTab === 'general') {
      generateGeneralReportPdf({
        ...reportData,
        // On adapte le titre du document
        title: isEntree ? "RAPPORT GÉNÉRAL DES ENTRÉES" : "REPORT GENERAL (SORTIES)",
        date: `Période: ${startDate} au ${endDate}`,
        navire: vessel,
        nif: "01328556"
      });
    } else {
      // Transformation pour le template Daily Report
      const dailyPdfData = {
        date: new Date(singleDate).toLocaleDateString(),
        dayNumber: reportData.day_number || "7", 
        navire: vessel,
        nif: "01328556",
        mouvementType: mouvementType, // <--- AJOUTEZ CETTE LIGNE
        colonnes: reportData.details_par_client?.map(d => d.client) || [],
        lignes: [{
          label: isEntree ? "RÉCEPTION / ENTRÉE" : "DÉCHARGEMENT / SORTIE",
          clients: reportData.details_par_client?.reduce((acc, curr) => {
            // On adapte le verbe : RECEIVED pour entrée, DISCHARGING pour sortie
            acc[curr.client] = curr.mouvements
              .map(m => `${m.quantite} ${m.type.toUpperCase()} ${isEntree ? 'DISCHARGING' : 'DISCHARGING'}`)
              .join('\n');
            return acc;
          }, {}) || {}
        }],
        totalDischarged: Object.entries(reportData.recapitulatif || {})
          .map(([type, qty]) => `${qty} ${type.toUpperCase()}`).join(' / '),
        remainingOnBoard: remainingOnBoard || "---" 
      };

      generateDailyReportPdf(dailyPdfData);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-10 max-sm:px-4 py-6">
      {/* Header & Onglets */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="font-bold text-2xl text-gray-900">{t("Reporting Logistique")}</h1>
          <p className="text-gray-500 font-medium">SMTLA.SA - Gestion des flux</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
          <button 
            onClick={() => { setActiveTab('general'); setReportData(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-white shadow-md text-buttonGradientSecondary' : 'text-gray-500 hover:text-indigo-400'}`}
          >
            <LayoutGrid className="w-4 h-4" /> {t("Vue Globale")}
          </button>
          <button 
            onClick={() => { setActiveTab('journalier'); setReportData(null); }}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'journalier' ? 'bg-white shadow-md text-buttonGradientSecondary' : 'text-gray-500 hover:text-indigo-400'}`}
          >
            <List className="w-4 h-4" /> {t("Vue Journalière")}
          </button>
        </div>
      </div>

      {/* Filtres de recherche */}
      <div className="bg-white rounded-3xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          
          {/* SÉLECTEUR DE FLUX (Entrées vs Sorties) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Type de mouvement")}</label>
            <div className="flex bg-gray-100 p-1 rounded-xl h-[52px]">
              <button 
                onClick={() => setMouvementType('entrees')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${mouvementType === 'entrees' ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500'}`}
              >
                <ArrowDownCircle className="w-4 h-4" /> {t("Entrées")}
              </button>
              <button 
                onClick={() => setMouvementType('sorties')}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all ${mouvementType === 'sorties' ? 'bg-buttonGradientPrimary text-white shadow-sm' : 'text-gray-500'}`}
              >
                <ArrowUpCircle className="w-4 h-4" /> {t("Sorties")}
              </button>
            </div>
          </div>

          {activeTab === 'general' ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Début")}</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-buttonGradientPrimary" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Fin")}</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-buttonGradientPrimary" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Date précise")}</label>
                <input type="date" value={singleDate} onChange={(e) => setSingleDate(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-sm focus:ring-2 focus:ring-buttonGradientPrimary" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-orange-500 uppercase tracking-widest ml-1">{t("Remaining On Board")}</label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                  <input type="text" placeholder="Ex: 2262 PIPES" value={remainingOnBoard} onChange={(e) => setRemainingOnBoard(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-orange-50/30 rounded-xl border border-orange-100 font-bold text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t("Navire")}</label>
            <div className="relative">
                <Ship className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={vessel} onChange={(e) => setVessel(e.target.value)} placeholder='Nom du navire' className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-none font-bold text-sm" />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={fetchReport} disabled={loading} className="flex-1 h-[52px] bg-buttonGradientPrimary text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-buttonGradientSecondary transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />} {t("Afficher")}
            </button>
            {reportData && (
              <button onClick={handleDownloadPDF} className="h-[52px] px-5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">
                <Download className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Zone d'affichage des résultats */}
      {reportData ? (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
           <div className="p-5 bg-gray-50 border-b flex justify-between items-center">
             <div className="flex items-center gap-3">
               <div className={`w-2 h-6 rounded-full ${mouvementType === 'entrees' ? 'bg-emerald-500' : 'bg-buttonGradientPrimary'}`} />
               <h2 className="text-sm font-bold text-buttonGradientPrimary uppercase tracking-wider">
                 {activeTab === 'general' ? t("Matrice récapitulative") : t("Détail des mouvements par client")}
               </h2>
             </div>
             <span className="text-[10px] font-black px-3 py-1 bg-white rounded-full border text-gray-400 uppercase">
               {mouvementType}
             </span>
           </div>
           
           <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {activeTab === 'general' ? (
                /* Rendu pour le Rapport Global */
                <>
                  <thead>
                    <tr className="bg-white border-b">
                      <th className="px-6 py-4 text-[10px] font-bold text-buttonGradientSecondary uppercase border-r bg-indigo-50/30 w-32">{t("Période")}</th>
                      {reportData.colonnes?.map((client, i) => (
                        <th key={i} className="px-6 py-4 text-[10px] font-bold text-gray-800 uppercase text-center border-r min-w-[160px]">{client}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.lignes?.map((ligne, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-buttonGradientPrimary border-r bg-indigo-50/5 text-xs">{ligne.label}</td>
                        {reportData.colonnes?.map((client, ci) => (
                          <td key={ci} className="px-6 py-4 text-[11px] font-medium text-gray-600 border-r whitespace-pre-line text-center leading-relaxed">
                            {ligne.clients[client] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-buttonGradientPrimary text-white">
                      <td className="px-6 py-5 font-bold uppercase text-[10px] tracking-widest">TOTAL {mouvementType.toUpperCase()}</td>
                      {reportData.colonnes?.map((client, i) => (
                        <td key={i} className="px-6 py-5 font-bold text-[11px] text-center whitespace-pre-line border-l border-white/10">
                          {reportData.total?.clients[client] || "-"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </>
              ) : (
                /* Rendu pour le Rapport Journalier */
                <>
                  <thead>
                    <tr className="bg-white border-b">
                      <th className="px-6 py-4 text-[10px] font-bold text-buttonGradientSecondary uppercase w-1/3">{t("Client")}</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-gray-800 uppercase">{t("Détail des flux")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {reportData.details_par_client?.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="px-6 py-5 font-bold text-sm text-buttonGradientPrimary">{item.client}</td>
                        <td className="px-6 py-5">
                          {item.mouvements?.length > 0 ? (
                            <div className="space-y-1">
                              {item.mouvements.map((m, mi) => (
                                <div key={mi} className="text-sm font-medium text-gray-600 flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${mouvementType === 'entrees' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                                  {m.quantite} {m.type.toUpperCase()} {mouvementType === 'entrees' ? 'RECEIVED' : 'DISCHARGING'} ...
                                </div>
                              ))}
                            </div>
                          ) : <span className="text-gray-300 italic text-xs">{t("Aucun mouvement")}</span>}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50/80">
                      <td className="px-6 py-6 font-bold text-buttonGradientSecondary uppercase text-[10px] tracking-widest">{t("Récapitulatif Global")}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(reportData.recapitulatif || {}).map(([type, qty], i) => (
                            <div key={i} className="bg-white px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                              <span className="text-[10px] text-gray-400 font-black mr-2 uppercase">{type} :</span>
                              <span className="text-sm font-black text-buttonGradientSecondary">{qty}</span>
                            </div>
                          ))}
                          {remainingOnBoard && (
                            <div className="bg-orange-50 px-4 py-2 rounded-xl border border-orange-100 shadow-sm">
                              <span className="text-[10px] text-orange-400 font-black mr-2 uppercase">ROB :</span>
                              <span className="text-sm font-black text-orange-600">{remainingOnBoard}</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      ) : (
        <div className="py-32 flex flex-col items-center justify-center bg-gray-50/50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <div className="bg-white p-6 rounded-full shadow-xl shadow-gray-100 mb-6 text-indigo-100">
               <FileText className="w-12 h-12" />
            </div>
            <p className="text-gray-400 font-bold text-lg">{t("Prêt à générer le rapport")}</p>
            <p className="text-gray-300 text-sm">{t("Sélectionnez vos filtres en haut")}</p>
        </div>
      )}
    </div>
  );
}

export default Rapports;