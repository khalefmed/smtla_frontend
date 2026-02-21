import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info, Receipt, Save, AlertCircle, FileText } from 'lucide-react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';

function NoteDeFraisModal({ note, onClose, onSave }) {
  const [ebList, setEbList] = useState([]);
  const [formData, setFormData] = useState({
    expression_besoin_id: '',
    items: []
  });

  useEffect(() => {
    if (!note) {
      api.get('expressions-besoin/').then(res => {
        // On ne montre que les EB validées
        setEbList(res.data.filter(eb => eb.status === 'valide'));
      });
    } else {
      setFormData({
        expression_besoin_id: note.expression_besoin,
        items: note.items.map(i => ({ ...i }))
      });
    }
  }, [note]);

  const updateItemMontant = (index, val) => {
    const newItems = [...formData.items];
    newItems[index].montant = val;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.expression_besoin_id) return toast.error("Sélectionnez une Expression de Besoin");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 bg-buttonGradientSecondary text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Receipt className="w-6 h-6" />
            <h2 className="text-lg font-extrabold">{note ? "Ajuster les frais réels" : "Générer depuis EB"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {!note ? (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-buttonGradientSecondary shrink-0" />
                <p className="text-sm text-indigo-900 leading-relaxed">
                  Choisissez une <b>Expression de Besoin</b> validée. Le système récupérera automatiquement le client, le navire et les dépenses prévues pour créer la note.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Sélectionner l'EB</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <select 
                    required
                    value={formData.expression_besoin_id}
                    onChange={(e) => setFormData({...formData, expression_besoin_id: e.target.value})}
                    className="w-full pl-10 p-4 bg-gray-50 border border-gray-200 rounded-xl font-bold outline-none focus:border-buttonGradientPrimary appearance-none text-gray-700"
                  >
                    <option value="">-- Liste des EB validées --</option>
                    {ebList.map(eb => (
                      <option key={eb.id} value={eb.id}>{eb.reference} - {eb.client_beneficiaire_nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase mb-4">Détails des dépenses (Montants Réels)</p>
              {formData.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-buttonGradientSecondary uppercase">{item.type}</p>
                    <p className="font-bold text-gray-800">{item.libelle}</p>
                  </div>
                  <div className="w-32">
                    <input 
                      type="number"
                      step="0.01"
                      value={item.montant}
                      onChange={(e) => updateItemMontant(idx, e.target.value)}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-right font-bold text-buttonGradientSecondary focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all">Annuler</button>
            <button type="submit" className="flex-1 px-6 py-4 bg-buttonGradientSecondary text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 hover:bg-buttonGradientPrimary transition-all">
              <Save className="w-5 h-5" /> {note ? "Enregistrer" : "Générer la Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NoteDeFraisModal;