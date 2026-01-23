import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, Package, FileText, Wallet, 
  TrendingUp, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { getRole } from '@/lib/utils';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = getRole();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get("dashboard/stats/");
      setStats(response.data);
    } catch (error) {
      toast.error(t("Erreur lors du chargement des statistiques"));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-medium">{t("Chargement...")}</div>;

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* HEADER */}
      <div>
        <h1 className="font-bold text-2xl text-blackColor">
          {t("Tableau de Bord")}
        </h1>
        <p className="text-textGreyColor font-medium">
          {t("Bienvenue")}, {t("Voici le résumé de l'activité.")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        
        {/* SECTION PRODUITS */}
        {stats?.produits && (
          <>
            <StatCard 
              title={t("Produits en Stock")} 
              value={stats.produits.en_stock} 
              icon={<Package />} 
              color="bg-blue-500" 
            />
            <StatCard 
              title={t("Sorties Camions")} 
              value={stats.produits.sortis} 
              icon={<TrendingUp />} 
              color="bg-orange-500" 
            />
          </>
        )}

        {/* SECTION CLIENTS */}
        {stats?.clients && (
          <StatCard 
            title={t("Total Clients")} 
            value={stats.clients.total} 
            icon={<Users />} 
            color="bg-purple-500" 
          />
        )}

        {/* SECTION FINANCES (DEVIS/FACTURES) */}
        {stats?.factures && (
          <StatCard 
            title={t("Total Facturé")} 
            value={`${Number(stats.factures.somme_totale).toLocaleString()} MRU`} 
            icon={<FileText />} 
            color="bg-green-600" 
          />
        )}

        {/* SECTION NOTES DE FRAIS */}
        {stats?.notes_frais && (
          <>
            <StatCard 
              title={t("Frais en Attente")} 
              value={stats.notes_frais.en_attente} 
              icon={<Clock />} 
              color="bg-yellow-500" 
              subtitle={t("A valider")}
            />
            <StatCard 
              title={t("Total Frais Validés")} 
              value={`${Number(stats.notes_frais.total_montant).toLocaleString()} MRU`} 
              icon={<Wallet />} 
              color="bg-red-500" 
            />
          </>
        )}
      </div>

      {/* RECAPITULATIF VISUEL */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" /> {t("Statut des Opérations")}
             </h3>
             <p className="text-sm text-gray-500 italic">
                {t("Toutes les données sont à jour selon votre niveau d'accès.")}
             </p>
          </div>
      </div> */}
    </div>
  );
}

/* COMPOSANT RÉUTILISABLE POUR LES CARTES */
function StatCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-bold text-textGreyColor uppercase tracking-wider mb-1">
            {title}
          </p>
          <h2 className="text-2xl font-bold text-blackColor">
            {value}
          </h2>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg text-white ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;