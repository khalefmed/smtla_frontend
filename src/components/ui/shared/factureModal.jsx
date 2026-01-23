import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Ship, Anchor, Calendar, ListPlus } from 'lucide-react';

function FactureModal({ facture, clients = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_id: '',
    port_arrive: '',
    vessel: '',
    voyage: '',
    eta: '',
    etd: '',
    bl: '',
    tva: false,
    devise: 'MRU', // Changé de 'facturee' à 'devise' pour correspondre au backend
    items: [{ libelle: '', prix_unitaire: '', quantite: 1 }]
  });

  useEffect(() => {
    if (facture) {
      setFormData({
        client_id: facture.client,
        port_arrive: facture.port_arrive,
        vessel: facture.vessel,
        voyage: facture.voyage,
        eta: facture.eta?.slice(0, 16) || '',
        etd: facture.etd?.slice(0, 16) || '',
        bl: facture.bl,
        tva: facture.tva,
        devise: facture.devise || 'MRU',
        items: facture.items.map(i => ({ 
          libelle: i.libelle, 
          prix_unitaire: i.prix_unitaire, 
          quantite: i.quantite 
        }))
      });
    }
  }, [facture]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ 
    ...formData, 
    items: [...formData.items, { libelle: '', prix_unitaire: '', quantite: 1 }] 
  });
  
  const removeItem = (index) => setFormData({ 
    ...formData, 
    items: formData.items.filter((_, i) => i !== index) 
  });

  const calculateTotal = () => {
    const ht = formData.items.reduce((sum, item) => sum + (Number(item.prix_unitaire) * Number(item.quantite) || 0), 0);
    return formData.tva ? ht * 1.16 : ht; // Corrigé à 1.1 (TVA 16%)
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white">
          <h2 className="text-xl font-bold">{facture ? "Modification Facture" : "Nouvelle Facture Logistique"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="overflow-y-auto p-8 space-y-8">
          {/* Section 1 : Client et Navire */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Client</label>
              <select 
                required 
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                className="w-full p-3 bg-gray-50 border rounded-xl outline-indigo-500"
              >
                <option value="">Sélectionner un client</option>
                {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Navire (Vessel)</label>
              <div className="relative">
                <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.vessel} onChange={(e) => setFormData({...formData, vessel: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-indigo-500" placeholder="Nom du navire" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Bill of Lading (BL)</label>
              <input required type="text" value={formData.bl} onChange={(e) => setFormData({...formData, bl: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-indigo-500" />
            </div>
          </div>

          {/* Section 2 : Logistique */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50 p-4 rounded-2xl">
            <div>
              <label className="text-[10px] font-bold text-buttonGradientPrimary uppercase">Port d'arrivée</label>
              <input required type="text" value={formData.port_arrive} onChange={(e) => setFormData({...formData, port_arrive: e.target.value})} className="w-full p-2 bg-white border rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-buttonGradientPrimary uppercase">Voyage</label>
              <input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full p-2 bg-white border rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-buttonGradientPrimary uppercase">ETA</label>
              <input required type="datetime-local" value={formData.eta} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="w-full p-2 bg-white border rounded-lg" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-buttonGradientPrimary uppercase">ETD</label>
              <input required type="datetime-local" value={formData.etd} onChange={(e) => setFormData({...formData, etd: e.target.value})} className="w-full p-2 bg-white border rounded-lg" />
            </div>
          </div>

          {/* Section 3 : Items de la facture */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-buttonGradientPrimary"/> Prestations / Services
              </h3>
              <button type="button" onClick={addItem} className="text-sm font-bold text-buttonGradientPrimary hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">
                + Ajouter une ligne
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-right-2">
                  <input required placeholder="Libellé de la prestation" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} className="flex-1 p-2 border-b outline-none focus:border-indigo-500" />
                  <input required type="number" placeholder="PU" value={item.prix_unitaire} onChange={(e) => updateItem(index, 'prix_unitaire', e.target.value)} className="w-32 p-2 border-b text-right outline-none focus:border-indigo-500" />
                  <input required type="number" placeholder="Qté" value={item.quantite} onChange={(e) => updateItem(index, 'quantite', e.target.value)} className="w-20 p-2 border-b text-center outline-none focus:border-indigo-500" />
                  <div className="w-32 text-right font-bold text-gray-600">
                    {(Number(item.prix_unitaire) * Number(item.quantite) || 0).toLocaleString()}
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-300 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer avec Totaux */}
        <div className="p-8 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-6">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
               <input 
                type="checkbox" 
                id="tva_facture" 
                checked={formData.tva} 
                onChange={(e) => setFormData({...formData, tva: e.target.checked})} 
                className="w-5 h-5 accent-indigo-600" 
               />
               <label htmlFor="tva_facture" className="text-sm font-bold text-gray-600 cursor-pointer">Appliquer TVA (16%)</label>
            </div>
            <select 
              value={formData.devise} 
              onChange={(e) => setFormData({...formData, devise: e.target.value})} 
              className="p-2 bg-white border rounded-lg font-bold outline-indigo-500"
            >
              <option value="MRU">MRU (Ouguiya)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="DOLLAR">USD (Dollar)</option>
              <option value="XOF">XOF (CFA)</option>
            </select>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Global TTC</p>
              <p className="text-3xl font-bold text-buttonGradientSecondary">
                {calculateTotal().toLocaleString()} <span className="text-sm font-normal text-gray-500">{formData.devise}</span>
              </p>
            </div>
            <button 
              onClick={(e) => { e.preventDefault(); onSave(formData); }} 
              className="px-10 py-4 bg-buttonGradientPrimary text-white rounded-2xl font-bold hover:bg-buttonGradientSecondary shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {facture ? "Mettre à jour" : "Générer la Facture"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FactureModal;