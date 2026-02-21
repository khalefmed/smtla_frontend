import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { X, Search, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function ImportDevisModal({ onClose, onSuccess }) {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);

  useEffect(() => {
    fetchAvailableDevis();
  }, []);

  const fetchAvailableDevis = async () => {
    try {
      const response = await api.get("devis/");
      // FILTRE : On ne garde que les devis dont le statut est exactement 'valide'
      const validesuniquement = response.data.filter(d => d.status === 'valide');
      setDevisList(validesuniquement);
    } catch (error) {
      toast.error("Erreur lors du chargement des devis");
    } finally { setLoading(false); }
  };

  const handleConvert = async (devisId) => {
    setSubmitting(devisId);
    try {
      await api.post(`devis/${devisId}/convertir-en-facture//`);
      toast.success("Facture générée avec succès !");
      onSuccess();
    } catch (error) {
      toast.error("Erreur lors de la conversion");
    } finally { setSubmitting(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center bg-amber-500 text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" /> {("Importer un Devis")}
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X/></button>
        </div>

        <div className="p-4 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4 italic">
            {("Seuls les devis préalablement validés apparaissent dans cette liste.")}
          </p>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-amber-500 w-8 h-8" /></div>
            ) : devisList.length > 0 ? (
              devisList.map((d) => (
                <div key={d.id} className="group p-4 border border-gray-100 rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-800 tracking-tight">{d.reference}</div>
                    <div className="text-sm text-gray-600 font-medium">{d.client_nom}</div>
                    <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      {d.vessel}
                    </div>
                  </div>
                  <button 
                    disabled={submitting === d.id}
                    onClick={() => handleConvert(d.id)}
                    className="bg-gray-100 group-hover:bg-amber-500 group-hover:text-white p-3 rounded-xl transition-all shadow-sm"
                    title="Convertir en facture"
                  >
                    {submitting === d.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <AlertCircle className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-gray-400 font-bold">{("Aucun devis validé trouvé")}</p>
                <p className="text-xs text-gray-400">{("Veuillez d'abord valider un devis dans la gestion des devis.")}</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-end">
             <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">
                {("Annuler")}
             </button>
        </div>
      </div>
    </div>
  );
}

export default ImportDevisModal;