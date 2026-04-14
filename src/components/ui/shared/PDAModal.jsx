import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Ship, ListPlus, Database, Calculator, User, Weight } from 'lucide-react';
import { TripIcon } from '@/assets/icons/trip';

const DEFAULT_PDA_ITEMS = [
  // --- PORTS DUES (Basé sur le GRT du navire : 16 848) ---
  { category: 'PORT_DUES', label: 'PILOTAGE IN & OUT', grt_value: 16848, rate: 0.119 },
  { category: 'PORT_DUES', label: 'TOWAGE IN & OUT', grt_value: 16848, rate: 0.173 },
  { category: 'PORT_DUES', label: 'BERTH DUES', grt_value: 16848, rate: 0.135 },
  { category: 'PORT_DUES', label: 'MOORING/UNMOORING', grt_value: 16848, rate: 0.073 },
  { category: 'PORT_DUES', label: 'LIGHT DUES', grt_value: 16848, rate: 0.033 },

  // --- OTHER EXPENSES (Forfaits fixes par escale) ---
  { category: 'OTHER_EXPENSES', label: '1- PORT CALL TAX', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '2- PORT IMMIGRATION', grt_value: 1, rate: 400 },
  { category: 'OTHER_EXPENSES', label: '3- OTHER PORT EXPENSE', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '4- CUSTOMS OVERTIME COSTS', grt_value: 1, rate: 800 },
  { category: 'OTHER_EXPENSES', label: '5- AGENCY LUMPSUM COSTS', grt_value: 1, rate: 2500 },
  { category: 'OTHER_EXPENSES', label: '6- ISPS FEES PER CALL', grt_value: 1, rate: 500 },

  // --- STEVEDORING (Basé sur le poids de la cargaison : 9 188.4 tonnes) ---
  { category: 'STEVEDORING', label: 'CARGO LINER OUT', grt_value: 9188.4, rate: 4.75 },
];

const DEFAULT_REMARKS = `1) However, the total amount to be paid will be mentioned on the port invoice which will be transmitted to you as a copy, and the original port invoice will be sent to you by email or courier the final D/A.

2) Our company as agent has always fulfilled its duties to the best, and protected the ship interest that we act as agent.

3) Vessel documents needed at Nouakchott port to be sent BEFORE the vessel arrival at Nouakchott port are: cargo plan, cargo plan, cargo manifest, BL, vaccination list, Arms/Ammunition list, dangerous cargo list, stow away list, last port clearance, vessel sign call, and the vessel MUST have valid insurance.`;

const CATEGORIES = [
  { id: 'PORT_DUES', label: 'Ports Dues' },
  { id: 'OTHER_EXPENSES', label: 'Other Expenses' },
  { id: 'STEVEDORING', label: 'Stevedoring/Handling' }
];

function PDAModal({ pda, clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    // pda_number: '',
    client_id: '',
    vessel_name: '',
    port_of_arrival: 'NOUAKCHOTT',
    cargo_description: '',
    weight: '',
    voyage: '',
    currency: 'EUR',
    number_of_days: '',
    apply_vat: true,
    remarks: '',
    items: []
  });

  useEffect(() => {
    if (pda) {
      setFormData({ 
        ...pda, 
        // On s'assure de récupérer l'ID du client que ce soit un objet ou un ID direct
        client_id: pda.client?.id || pda.client || '', 
        items: pda.items || [] 
      });
    } else {
      setFormData(prev => ({
        ...prev,
        // pda_number: `PDA-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        items: [...DEFAULT_PDA_ITEMS],
        remarks: DEFAULT_REMARKS
      }));
    }
  }, [pda]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = (category) => {
    setFormData({ 
      ...formData, 
      items: [...formData.items, { category, label: '', grt_value: 0, rate: 0 }] 
    });
  };

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const calculateSubTotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.grt_value) * Number(item.rate) || 0), 0);
  };

  const calculateTotal = () => {
    const sub = calculateSubTotal();
    return formData.apply_vat ? sub * 1.16 : sub;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white">
          <h2 className="text-xl font-bold">{pda ? "Modifier PDA" : "Nouveau PDA"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          {/* Section 1: Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Numero de PDA</label>
              <input required type="text" value={formData.pda_number} onChange={(e) => setFormData({...formData, pda_number: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl font-bold outline-buttonGradientPrimary" />
            </div> */}

            {/* CHANGEMENT ICI : REMPLACEMENT PAR SELECT CLIENT */}
            <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <select 
                  required 
                  value={formData.client_id} 
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                  className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-buttonGradientPrimary appearance-none"
                >
                  <option value="">Sélectionner un client</option>
                  {clients?.map(c => (
                    <option key={c.id} value={c.id}>{c.nom}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Weight</label>
              <div className="relative mt-1">
                <Weight className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-buttonGradientPrimary" placeholder="Poids du navire" />
              </div>
            </div>

            
          </div>


          {/* Section 2: Config & Days */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
            
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Trip</label>
              <div className="relative mt-1">
                <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-buttonGradientPrimary" placeholder="Numero de voyage" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Navire</label>
              <div className="relative mt-1">
                <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.vessel_name} onChange={(e) => setFormData({...formData, vessel_name: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-buttonGradientPrimary" placeholder="Nom du navire" />
              </div>
            </div>

          </div>

          {/* Section 2: Config & Days */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Nombre de Jours</label><input type="number" value={formData.number_of_days} onChange={(e) => setFormData({...formData, number_of_days: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-buttonGradientPrimary" /></div>
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Devise</label>
              <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-buttonGradientPrimary">
                <option value="EUR">Euro (€)</option><option value="USD">Dollar ($)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer font-bold text-xs text-indigo-900">
                <input type="checkbox" checked={formData.apply_vat} onChange={(e) => setFormData({...formData, apply_vat: e.target.checked})} className="w-5 h-5 rounded-md accent-indigo-600" /> Appliquer TVA (16%)
              </label>
            </div>
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Port</label><input type="text" value={formData.port_of_arrival} onChange={(e) => setFormData({...formData, port_of_arrival: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-buttonGradientPrimary" /></div>
          </div>

          {/* Section 3: Les 3 Tableaux Dynamiques */}
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-black text-gray-800 text-[11px] uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-buttonGradientPrimary rounded-full"/> {cat.label}
                </h3>
                <button type="button" onClick={() => addItem(cat.id)} className="text-[10px] font-bold bg-white border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-all shadow-sm">+ Ajouter un item</button>
              </div>
              <div className="space-y-3 px-2">
                {formData.items.filter(i => i.category === cat.id).map((item, idx) => {
                  const globalIdx = formData.items.findIndex(orig => orig === item);
                  return (
                    <div key={globalIdx} className="flex gap-6 items-center group animate-in slide-in-from-left-2 duration-200">
                      <input placeholder="Description du service" value={item.label} onChange={(e) => updateItem(globalIdx, 'label', e.target.value)} className="flex-1 p-2 border-b border-gray-100 focus:border-indigo-400 outline-none text-sm font-medium transition-colors" />
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">GRT/Qty</span>
                         <input type="number" value={item.grt_value} onChange={(e) => updateItem(globalIdx, 'grt_value', e.target.value)} className="w-24 p-2 bg-gray-50 rounded-lg text-center text-sm font-bold border border-transparent focus:border-indigo-200" />
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Rate</span>
                         <input type="number" value={item.rate} onChange={(e) => updateItem(globalIdx, 'rate', e.target.value)} className="w-24 p-2 bg-gray-50 rounded-lg text-center text-sm font-bold border border-transparent focus:border-indigo-200" />
                      </div>
                      <div className="w-28 text-right font-black text-gray-800 text-sm">{(item.grt_value * item.rate).toLocaleString()}</div>
                      <button type="button" onClick={() => removeItem(globalIdx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Section 4: Remarques */}
          <div className="space-y-3 pt-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><Database className="w-3 h-3"/> Remarks / Conditions</label>
            <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows="3" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 ring-indigo-100 outline-none" placeholder="Ex: Port taxes subject to change..."></textarea>
          </div>
        </form>

        {/* Footer Totaux */}
        <div className="p-8 border-t bg-gray-50 flex justify-between items-center shadow-inner">
          <div className="flex flex-col">
            {/* <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Estimation Totale Finale</span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-buttonGradientPrimary tracking-tighter">
                {calculateTotal().toLocaleString()} <span className="text-sm font-bold text-gray-400 ml-1">{formData.currency}</span>
              </span>
              {formData.apply_vat && (
                <span className="text-[9px] font-black text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full uppercase">TVA 16% Incluse</span>
              )}
            </div> */}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-4 font-bold text-gray-500 hover:text-gray-800 transition-colors">Annuler</button>
            <button 
              onClick={handleSubmit} 
              className="px-12 py-4 bg-buttonGradientPrimary text-white rounded-2xl font-black shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:scale-[1.02] transition-all flex items-center gap-3 active:scale-95"
            >
              <Calculator className="w-5 h-5"/> {pda ? "Mettre à jour le PDA" : "Enregistrer le PDA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PDAModal;