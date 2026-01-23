import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { X, Search, FileText, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ImportDevisModal({ onClose, onSuccess }) {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null); // Stocke l'ID du devis en cours de conversion

  useEffect(() => {
    fetchAvailableDevis();
  }, []);

  const fetchAvailableDevis = async () => {
    try {
      const response = await api.get("devis/");
      // On pourrait filtrer ici pour ne montrer que les devis non encore convertis
      setDevisList(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des devis");
    } finally { setLoading(false); }
  };

  const handleConvert = async (devisId) => {
    setSubmitting(devisId);
    try {
      await api.post(`devis/${devisId}/convertir-en-facture/`);
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
            <FileText className="w-5 h-5" /> Convertir un Devis
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full"><X/></button>
        </div>

        <div className="p-4 overflow-y-auto">
          <p className="text-sm text-gray-500 mb-4 italic">
            Sélectionnez un devis validé pour générer automatiquement la facture correspondante.
          </p>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-amber-500" /></div>
            ) : devisList.map((d) => (
              <div key={d.id} className="group p-4 border rounded-xl hover:border-amber-500 hover:bg-amber-50 transition-all flex justify-between items-center">
                <div>
                  <div className="font-bold text-gray-800">{d.reference}</div>
                  <div className="text-sm text-gray-600">{d.client_nom}</div>
                  <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{d.vessel}</div>
                </div>
                <button 
                  disabled={submitting === d.id}
                  onClick={() => handleConvert(d.id)}
                  className="bg-gray-100 group-hover:bg-amber-500 group-hover:text-white p-3 rounded-xl transition-all"
                >
                  {submitting === d.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportDevisModal;