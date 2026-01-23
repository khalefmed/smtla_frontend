import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info } from 'lucide-react';

const TYPES_FRAIS = [
  { id: 'nourriture', label: 'Nourriture' },
  { id: 'hebergement', label: 'Hébergement' },
  { id: 'medicament', label: 'Médicament' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'entretien', label: 'Entretien' },
  { id: 'telecom', label: 'Télécom' },
  { id: 'avance', label: 'Avance' },
  { id: 'divers', label: 'Divers' },
];

const DEVISES = [
  { id: 'MRU', label: 'Ouguiya' },
  { id: 'EUR', label: 'Euro' },
  { id: 'DOLLAR', label: 'Dollar' },
  { id: 'XOF', label: 'Franc CFA' },
];

function NoteDeFraisModal({ note, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tva: false,
    devise: 'MRU',
    items: [{ type: 'divers', montant: '' }] // Un item par défaut
  });

  useEffect(() => {
    if (note) {
      setFormData({
        tva: note.tva,
        devise: note.devise,
        items: note.items.map(i => ({ type: i.type, montant: i.montant, libelle: i.libelle }))
      });
    }
  }, [note]);

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { type: 'divers', montant: '', libelle: '' }] });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.items.length === 0) return toast.error("Ajoutez au moins un item");
    onSave(formData);
  };

  const totalHT = formData.items.reduce((sum, item) => sum + (Number(item.montant) || 0), 0);
  const totalTTC = formData.tva ? totalHT * 1.16 : totalHT;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{note ? "Modifier la Note" : "Nouvelle Note de Frais"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Devise de paiement</label>
              <select 
                value={formData.devise}
                onChange={(e) => setFormData({...formData, devise: e.target.value})}
                className="w-full p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:buttonGradientSecondary"
              >
                {DEVISES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-8">
              <input 
                type="checkbox" id="tva" checked={formData.tva}
                onChange={(e) => setFormData({...formData, tva: e.target.checked})}
                className="w-5 h-5 accent-buttonGradientPrimary"
              />
              <label htmlFor="tva" className="text-sm font-bold  cursor-pointer text-buttonGradientPrimary">Appliquer TVA (16%)</label>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest">Détails des dépenses</h3>
              <button type="button" onClick={addItem} className="text-sm font-bold text-buttonGradientPrimary hover:underline flex items-center gap-1">
                <Plus className="w-4 h-4" /> Ajouter une ligne
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end animate-in slide-in-from-right-2">
                <div className="w-40">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Libelle</label>
                  <input 
                    required type="text" value={item.libelle}
                    onChange={(e) => updateItem(index, 'libelle', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border rounded-lg outline-buttonGradientPrimary"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Type</label>
                  <select 
                    value={item.type}
                    onChange={(e) => updateItem(index, 'type', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border rounded-lg outline-buttonGradientPrimary"
                  >
                    {TYPES_FRAIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                </div>
                <div className="w-40">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Montant</label>
                  <input 
                    required type="number" step="0.01" value={item.montant}
                    onChange={(e) => updateItem(index, 'montant', e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border rounded-lg outline-buttonGradientPrimary text-right font-bold"
                  />
                </div>
                <button type="button" onClick={() => removeItem(index)} className="p-3 text-red-400 hover:text-red-600">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </form>

        <div className="p-6 border-t bg-buttonGradientSecondary text-white rounded-b-2xl flex justify-between items-center">
          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest">Total TTC Estimé</p>
            <p className="text-3xl font-bold">{totalTTC.toLocaleString()} <span className="text-lg font-light">{formData.devise}</span></p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">Annuler</button>
            <button onClick={handleSubmit} className="px-8 py-3 bg-white text-buttonGradientSecondary rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">Enregistrer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteDeFraisModal;