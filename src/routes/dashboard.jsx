import { useState, useEffect, cloneElement, Fragment } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, Package, FileText, Wallet, 
  Clock, ArrowDownCircle, ArrowUpCircle, 
  LayoutDashboard, AlertCircle, ChevronRight,
  ClipboardList, Receipt, Banknote, TrendingUp, Coins
} from 'lucide-react';
import { getRole } from '@/lib/utils';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = getRole();

  const users_permissions = {
    'Assistant' : ['note_frais', 'expression_besoin'],
    'Agent Port' : ['rotations', 'clients', 'types de materiel', 'expression_besoin'],
    'Comptable' : ['factures', 'note_frais', 'devis', 'clients', 'expression_besoin', 'fournisseurs', 'bon_commande'],
    'Directeur des Opérations' : ['factures', 'note_frais', 'devis', 'clients', 'rotations', 'expression_besoin', 'fournisseurs', 'types de materiel', 'bon_commande', 'bad', 'archives', 'Rapports'],
    'Directeur Général' : ['factures', 'note_frais', 'expression_besoin', 'devis', 'clients', 'rotations', 'fournisseurs', 'types de materiel', 'bon_commande', 'archives'],
  };

  const hasAccess = (feature) => users_permissions[role]?.includes(feature);

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

      {/* --- SECTION RÉSERVÉE AU DG : FINANCES GLOBALES --- */}
      {role === 'Directeur Général' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Bloc Factures Payées */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-500 rounded-xl text-white">
                <TrendingUp size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">{t("Total Factures Payées")}</h3>
            </div>
            <div className="flex flex-wrap gap-6">
              {stats?.factures?.totaux_payes_par_devise && Object.entries(stats.factures.totaux_payes_par_devise).map(([devise, montant]) => (
                <div key={devise} className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600/70">{devise}</span>
                  <span className="text-2xl font-bold text-gray-900">{montant.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bloc Notes de Frais Validées */}
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm bg-gradient-to-br from-white to-blue-50/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 rounded-xl text-white">
                <Coins size={20} />
              </div>
              <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">{t("Total Frais Validés")}</h3>
            </div>
            <div className="flex flex-wrap gap-6">
              {stats?.notes_frais?.totaux_par_devise && Object.entries(stats.notes_frais.totaux_par_devise).map(([devise, montant]) => (
                <div key={devise} className="flex flex-col">
                  <span className="text-[10px] font-bold text-blue-600/70">{devise}</span>
                  <span className="text-2xl font-bold text-gray-900">{montant.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CARTES DE STATISTIQUES RAPIDES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasAccess('rotations') && (
          <>
            <StatCard title={t("Rotations Entrantes")} value={stats?.rotations?.total_entrantes ?? 0} icon={<ArrowDownCircle />} color="bg-green-500" />
            <StatCard title={t("Rotations Sortantes")} value={stats?.rotations?.total_sortantes ?? 0} icon={<ArrowUpCircle />} color="bg-orange-500" />
          </>
        )}
        {hasAccess('clients') && (
          <StatCard title={t("Clients Actifs")} value={stats?.clients?.total ?? 0} icon={<Users />} color="bg-indigo-600" />
        )}
      </div>

      {/* SECTION STOCK DÉTAILLÉ */}
      {hasAccess('rotations') && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/30">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter">
              <Package className="text-indigo-600 w-5 h-5" />
              {t("État des Stocks par Client")}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white text-[10px] uppercase font-bold text-gray-400 tracking-widest border-b">
                <tr>
                  <th className="px-8 py-4">{t("Client")}</th>
                  <th className="px-6 py-4">{t("Matériels")}</th>
                  <th className="px-6 py-4 text-center">{t("Disponible")}</th>
                  <th className="px-6 py-4 text-right">{t("Alerte")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats?.stocks_par_client?.map((clientData, clientIndex) => (
                  <Fragment key={clientIndex}>
                    {clientData.types.map((type, typeIndex) => (
                      <tr key={`${clientIndex}-${typeIndex}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-4">
                          {typeIndex === 0 && <span className="font-bold text-gray-900 uppercase text-sm">{clientData.client}</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-600"><ChevronRight className="inline w-4 h-4 mr-1 text-gray-300" />{type.type_materiel}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-lg font-bold ${type.quantite_disponible > 0 ? 'text-indigo-600' : 'text-red-400'}`}>{type.quantite_disponible}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {type.quantite_disponible <= 5 && <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded">STOCK FAIBLE</span>}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION DES LISTES EN ATTENTE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {hasAccess('expression_besoin') && (
          <ListCard 
            title={t("EB en attente")} 
            count={stats?.expressions_besoin?.en_attente} 
            icon={<ClipboardList className="text-yellow-600" />} 
            data={stats?.expressions_besoin?.liste_en_attente}
            bgColor="bg-yellow-50/30"
          />
        )}

        {hasAccess('devis') && (
          <ListCard 
            title={t("Devis en attente")} 
            count={stats?.devis?.en_attente} 
            icon={<Receipt className="text-blue-600" />} 
            data={stats?.devis?.liste_en_attente}
            bgColor="bg-blue-50/30"
            isDevis
          />
        )}

        {hasAccess('note_frais') && (
          <ListCard 
            title={t("Frais en attente")} 
            count={stats?.notes_frais?.en_attente} 
            icon={<Banknote className="text-red-600" />} 
            data={stats?.notes_frais?.liste_en_attente}
            bgColor="bg-red-50/30"
            isFrais
          />
        )}
      </div>
    </div>
  );
}

// Composants internes pour la lisibilité
function ListCard({ title, count, icon, data, bgColor, isDevis, isFrais }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className={`p-5 border-b border-gray-50 flex items-center justify-between ${bgColor}`}>
        <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter text-sm">
          {cloneElement(icon, { size: 20 })} {title} ({count})
        </h3>
      </div>
      <div className="max-h-[350px] overflow-y-auto">
        {data?.length > 0 ? data.map((item) => (
          <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900 text-sm truncate max-w-[180px]">
                {isDevis ? item.client_nom : (item.demandeur_nom || "Agent")}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">
                {isDevis ? item.numero_devis : new Date(item.date_demande || item.date_creation).toLocaleDateString()}
              </p>
            </div>
            {(isDevis || isFrais) && (
              <div className="text-right">
                <p className={`text-sm font-black ${isFrais ? 'text-red-600' : 'text-emerald-600'}`}>
                  {Number(item.montant_total || 0).toLocaleString()} {item.devise || 'MRU'}
                </p>
              </div>
            )}
          </div>
        )) : <div className="p-8 text-center text-gray-400 text-sm font-medium">Aucun élément</div>}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tighter group-hover:text-indigo-600 transition-colors">{value}</h2>
        </div>
        <div className={`p-3 rounded-xl text-white shadow-lg ${color}`}>
          {cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;