import { useState, useEffect, cloneElement, Fragment } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, Package, FileText, Wallet, 
  Clock, ArrowDownCircle, ArrowUpCircle, 
  LayoutDashboard, AlertCircle, ChevronRight
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

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-buttonGradientSecondary"></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 px-10 max-sm:px-4 py-6">
      {/* HEADER */}
      <div>
        <h1 className="font-bold text-2xl text-gray-900 flex items-center gap-2">
          <LayoutDashboard className="text-buttonGradientSecondary w-8 h-8" /> {t("Tableau de Bord")}
        </h1>
        <p className="text-gray-500 font-medium italic">
          {t("Bienvenue")}, {role}. {t("Résumé en temps réel de votre activité.")}
        </p>
      </div>

      {/* CARTES DE STATISTIQUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t("Rotations Entrantes")} 
          value={stats?.rotations?.total_entrantes ?? 0} 
          icon={<ArrowDownCircle />} 
          color="bg-green-500" 
        />
        <StatCard 
          title={t("Rotations Sortantes")} 
          value={stats?.rotations?.total_sortantes ?? 0} 
          icon={<ArrowUpCircle />} 
          color="bg-orange-500" 
        />
        <StatCard 
          title={t("Clients Actifs")} 
          value={stats?.clients?.total ?? 0} 
          icon={<Users />} 
          color="bg-buttonGradientSecondary" 
        />
        <StatCard 
          title={t("Total Facturé")} 
          value={`${Number(stats?.factures?.somme_totale ?? 0).toLocaleString()} MRU`} 
          icon={<FileText />} 
          color="bg-buttonGradientSecondary" 
        />
      </div>

      {/* SECTION STOCK DÉTAILLÉ (Structure Imbriquée) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
            <Package className="text-buttonGradientPrimary w-5 h-5" />
            {t("État des Stocks par Client")}
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b">
              <tr>
                <th className="px-8 py-4">{t("Client")}</th>
                <th className="px-6 py-4">{t("Matériels en possession")}</th>
                <th className="px-6 py-4 text-center">{t("Quantité Disponible")}</th>
                <th className="px-6 py-4 text-right">{t("Alerte")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats?.stocks_par_client?.length > 0 ? (
                stats.stocks_par_client.map((clientData, clientIndex) => (
                  <Fragment key={clientIndex}>
                    {/* Pour chaque type de matériel du client */}
                    {clientData.types.map((type, typeIndex) => (
                      <tr key={`${clientIndex}-${typeIndex}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-4">
                          {typeIndex === 0 && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-buttonGradientPrimary"></div>
                              <span className="font-bold text-gray-900 uppercase text-sm">
                                {clientData.client}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-bold text-gray-600">
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                            {type.type_materiel}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-lg font-bold ${type.quantite_disponible > 0 ? 'text-buttonGradientSecondary' : 'text-red-400'}`}>
                            {type.quantite_disponible}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {type.quantite_disponible <= 5 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">
                              <AlertCircle className="w-3 h-3" /> {t("STOCK FAIBLE")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">
                    {t("Aucun stock n'est actuellement enregistré.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION FINANCES / NOTES DE FRAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl">
                <Clock className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Frais en Attente")}</p>
                <h3 className="text-xl font-bold text-gray-900">{stats?.notes_frais?.en_attente ?? 0}</h3>
            </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                <Wallet className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("Total Frais Validés")}</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {Number(stats?.notes_frais?.total_montant ?? 0).toLocaleString()} MRU
                </h3>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tighter">
            {value}
          </h2>
        </div>
        <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
          {cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;