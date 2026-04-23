import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Receipt, Save, FileText, CreditCard, Anchor } from 'lucide-react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';

const TYPES_FRAIS = [
  { id: 'nourriture', label: 'Nourriture' },
  { id: 'hebergement', label: 'Hébergement' },
  { id: 'medicament', label: 'Médicament' },
  { id: 'carburant', label: 'Carburant' },
  { id: 'entretien', label: 'Entretien' },
  { id: 'telecom', label: 'Télécom' },
  { id: 'avance_salaire', label: 'Avance sur salaire' },
  { id: 'avance_paiement', label: 'Avance sur paiement' },
  { id: 'equipement', label: 'Équipement' },
];

const DEVISES = [
  { id: 'MRU', label: 'Ouguiya' }, { id: 'EUR', label: 'Euro' },
  { id: 'DOLLAR', label: 'Dollar' }, { id: 'XOF', label: 'Franc CFA' },
];

function NoteDeFraisModal({ note, onClose, onSave }) {
  const [ebList, setEbList] = useState([]);
  const [formData, setFormData] = useState({
    expression_besoin_id: '',
    client_nom: '',
    navire: '',
    bl_awb: '',
    eta: '',
    tva: false,
    devise: 'MRU',
    items: []
  });

  useEffect(() => {
    if (!note) {
      api.get('expressions-besoin/').then(res => {
        setEbList(res.data.filter(eb => eb.status === 'valide'));
      });
    } else {
      setFormData({
        expression_besoin_id: note.expression_besoin || '',
        client_nom: note.expression_besoin_detail?.client_beneficiaire_nom || '',
        navire: note.expression_besoin_detail?.navire || '',
        bl_awb: note.expression_besoin_detail?.bl_awb || '',
        eta: note.expression_besoin_detail?.eta ? note.expression_besoin_detail.eta.split('T')[0] : '',
        tva: note.expression_besoin_detail?.tva || false,
        devise: note.expression_besoin_detail?.devise || 'MRU',
        items: note.items.map(i => ({ ...i }))
      });
    }
  }, [note]);

  const handleEbChange = (ebId) => {
    const eb = ebList.find(e => e.id === parseInt(ebId));
    if (eb) {
      setFormData({
        expression_besoin_id: ebId,
        client_nom: eb.client_beneficiaire_nom || '',
        navire: eb.navire || '',
        bl_awb: eb.bl_awb || '',
        eta: eb.eta ? eb.eta.split('T')[0] : '',
        tva: eb.tva || false,
        devise: eb.devise || 'MRU',
        items: eb.items.map(item => ({
          libelle: item.libelle,
          type: item.type,
          montant: item.montant
        }))
      });
    }
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { libelle: '', type: 'divers', montant: '' }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const totalHT = formData.items.reduce((sum, item) => sum + (Number(item.montant) || 0), 0);
  const totalTTC = formData.tva ? totalHT * 1.16 : totalHT;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note && !formData.expression_besoin_id) return toast.error("Veuillez sélectionner une EB");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-buttonGradientSecondary rounded-lg text-white">
              <Receipt className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {note ? `Modifier la Note : ${note.reference}` : "Nouvelle Note de Frais"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          
          {/* 1. SELECTION EB (Uniquement en création) */}
          {!note && (
            <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <h3 className="font-bold text-indigo-900 uppercase text-xs flex items-center gap-2">
                <FileText className="w-4 h-4" /> Sélection de l'Expression de Besoin
              </h3>
              <select 
                required
                value={formData.expression_besoin_id}
                onChange={(e) => handleEbChange(e.target.value)}
                className="w-full p-3 bg-white border border-indigo-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Choisir une EB validée --</option>
                {ebList.map(eb => (
                  <option key={eb.id} value={eb.id}>{eb.reference} - {eb.client_beneficiaire_nom}</option>
                ))}
              </select>
            </div>
          )}

          {/* 2. DÉTAILS LOGISTIQUES (Toujours modifiables une fois l'EB choisie ou en Edition) */}
          {(formData.expression_besoin_id || note) && (
            <>
              {/* <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
                <h3 className="font-bold text-slate-700 uppercase text-xs flex items-center gap-2">
                  <Anchor className="w-4 h-4" /> Détails logistiques
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Client" value={formData.client_nom} onChange={(e) => setFormData({...formData, client_nom: e.target.value})} className="p-2.5 bg-white border rounded-xl font-medium" />
                  <input type="text" placeholder="Navire" value={formData.navire} onChange={(e) => setFormData({...formData, navire: e.target.value})} className="p-2.5 bg-white border rounded-xl font-medium" />
                  <input type="text" placeholder="BL / AWB" value={formData.bl_awb} onChange={(e) => setFormData({...formData, bl_awb: e.target.value})} className="p-2.5 bg-white border rounded-xl font-medium" />
                  <input type="date" value={formData.eta} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="p-2.5 bg-white border rounded-xl font-medium" />
                </div>
              </div> */}

              {/* 3. LISTE DES DÉPENSES */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="font-bold text-gray-700 uppercase text-xs flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Détails des dépenses
                  </h3>
                  <button type="button" onClick={addItem} className="text-buttonGradientSecondary font-bold text-sm flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" /> Ajouter ligne
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-end animate-in slide-in-from-left-2 duration-200">
                    <input required type="text" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} placeholder="Libellé" className="flex-1 p-2.5 bg-gray-50 border rounded-lg focus:bg-white transition-all outline-none focus:border-indigo-300" />
                    <select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)} className="w-40 p-2.5 bg-gray-50 border rounded-lg outline-none">
                      {TYPES_FRAIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input required type="number" step="0.01" value={item.montant} onChange={(e) => updateItem(index, 'montant', e.target.value)} placeholder="0.00" className="w-32 p-2.5 bg-gray-50 border rounded-lg text-right font-bold text-buttonGradientSecondary" />
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* 4. TVA ET DEVISE (EN BAS) */}
              {/* <div className="grid grid-cols-2 gap-6 items-center pt-4 border-t">
                <select 
                  value={formData.devise} 
                  onChange={(e) => setFormData({...formData, devise: e.target.value})} 
                  className="p-3 bg-gray-100 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  {DEVISES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
                <label className="flex items-center gap-3 font-bold text-buttonGradientSecondary cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.tva} 
                    onChange={(e) => setFormData({...formData, tva: e.target.checked})} 
                    className="w-5 h-5 accent-buttonGradientSecondary transition-transform group-hover:scale-110" 
                  />
                  <span>Appliquer TVA (16%)</span>
                </label>
              </div> */}
            </>
          )}
        </form>

        {/* Footer avec Montant Total */}
        <div className="p-6 border-t bg-buttonGradientSecondary text-white rounded-b-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase opacity-80 tracking-wider">Montant Total {formData.tva ? 'TTC' : 'HT'}</p>
            <p className="text-3xl font-bold">
              {totalTTC.toLocaleString()} 
              <span className="text-lg font-light ml-2">{formData.devise}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition-all">
              Annuler
            </button>
            <button onClick={handleSubmit} className="px-8 py-3 bg-white text-buttonGradientSecondary rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Save className="w-5 h-5" /> 
              {note ? "Mettre à jour" : "Générer la Note"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoteDeFraisModal;