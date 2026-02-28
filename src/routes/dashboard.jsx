import { useState, useEffect, cloneElement, Fragment } from 'react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';
import { useTranslation } from "react-i18next";
import { 
  Users, Package, FileText, Wallet, 
  Clock, ArrowDownCircle, ArrowUpCircle, 
  LayoutDashboard, AlertCircle, ChevronRight,
  ClipboardList, Receipt, Banknote
} from 'lucide-react';
import { getRole } from '@/lib/utils';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = getRole(); // Récupère le rôle (ex: 'Assistant', 'Comptable', etc.)

  // Mapping des permissions selon votre structure
  const users_permissions = {
    'Assistant' : ['note_frais', 'expression_besoin'],
    'Agent Port' : ['rotations', 'clients', 'types de materiel', 'expression_besoin'],
    'Comptable' : ['factures', 'note_frais', 'devis', 'clients', 'expression_besoin', 'fournisseurs', 'bon_commande'],
    'Directeur des Opérations' : ['factures', 'note_frais', 'devis', 'clients', 'rotations', 'expression_besoin', 'fournisseurs', 'types de materiel', 'bon_commande', 'bad', 'archives', 'Rapports'],
    'Directeur Général' : ['factures', 'note_frais', 'expression_besoin', 'devis', 'clients', 'rotations', 'fournisseurs', 'types de materiel', 'bon_commande', 'archives'],
  };

  // Fonction utilitaire pour vérifier si l'utilisateur a accès à une fonctionnalité
  const hasAccess = (feature) => {
    return users_permissions[role]?.includes(feature);
  };

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

      {/* CARTES DE STATISTIQUES RAPIDES (FILTRÉES) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hasAccess('rotations') && (
          <>
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
          </>
        )}
        {hasAccess('clients') && (
          <StatCard 
            title={t("Clients Actifs")} 
            value={stats?.clients?.total ?? 0} 
            icon={<Users />} 
            color="bg-indigo-600" 
          />
        )}
      </div>

      {/* SECTION STOCK DÉTAILLÉ (Visible si accès aux rotations) */}
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
                {stats?.stocks_par_client?.length > 0 ? (
                  stats.stocks_par_client.map((clientData, clientIndex) => (
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
                  ))
                ) : (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-medium">{t("Aucun stock enregistré.")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION DES LISTES EN ATTENTE (GRID DYNAMIQUE SELON ACCÈS) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        
        {/* 1. EXPRESSIONS DE BESOINS */}
        {hasAccess('expression_besoin') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-yellow-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter text-sm">
                <ClipboardList className="text-yellow-600 w-5 h-5" />
                {t("EB en attente")} ({stats?.expressions_besoin?.en_attente})
              </h3>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {stats?.expressions_besoin?.liste_en_attente?.length > 0 ? (
                stats.expressions_besoin.liste_en_attente.map((eb) => (
                  <div key={eb.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{eb.demandeur_nom || "Agent"}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{new Date(eb.date_demande).toLocaleDateString()}</p>
                    </div>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{eb.id}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">{t("Aucune demande")}</div>
              )}
            </div>
          </div>
        )}

        {/* 2. DEVIS EN ATTENTE */}
        {hasAccess('devis') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-blue-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter text-sm">
                <Receipt className="text-blue-600 w-5 h-5" />
                {t("Devis en attente")} ({stats?.devis?.en_attente})
              </h3>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {stats?.devis?.liste_en_attente?.length > 0 ? (
                stats.devis.liste_en_attente.map((devis) => (
                  <div key={devis.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex justify-between items-center">
                    <div>
                      <p className="font-black text-gray-900 text-sm uppercase truncate max-w-[150px]">{devis.client_nom}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{devis.numero_devis}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">{Number(devis.montant_total).toLocaleString()} MRU</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">{t("Aucun devis")}</div>
              )}
            </div>
          </div>
        )}

        {/* 3. NOTES DE FRAIS EN ATTENTE */}
        {hasAccess('note_frais') && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-red-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tighter text-sm">
                <Banknote className="text-red-600 w-5 h-5" />
                {t("Frais en attente")} ({stats?.notes_frais?.en_attente})
              </h3>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {stats?.notes_frais?.liste_en_attente?.length > 0 ? (
                stats.notes_frais.liste_en_attente.map((frais) => (
                  <div key={frais.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-all flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{frais.demandeur_nom || "Collaborateur"}</p>
                      <p className="text-[11px] text-gray-500">{new Date(frais.date_creation).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-red-600">{Number(frais.montant_total || 0).toLocaleString()} MRU</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 text-sm font-medium">{t("Aucun frais en attente")}</div>
              )}
            </div>
          </div>
        )}
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