import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Ship, ListPlus, Database, Calculator, User, Weight } from 'lucide-react';

const DEFAULT_FDA_ITEMS = [
  // --- PORTS DUES (Liés au poids) ---
  { category: 'PORT_DUES', label: 'PILOTAGE IN & OUT', grt_value: 0, rate: 0.119 },
  { category: 'PORT_DUES', label: 'TOWAGE IN & OUT', grt_value: 0, rate: 0.173 },
  { category: 'PORT_DUES', label: 'BERTH DUES', grt_value: 0, rate: 0.135 },
  { category: 'PORT_DUES', label: 'MOORING/UNMOORING', grt_value: 0, rate: 0.073 },
  { category: 'PORT_DUES', label: 'LIGHT DUES', grt_value: 0, rate: 0.033 },

  // --- OTHER EXPENSES (Forfaits fixes) ---
  { category: 'OTHER_EXPENSES', label: '1- PORT CALL TAX', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '2- PORT IMMIGRATION', grt_value: 1, rate: 400 },
  { category: 'OTHER_EXPENSES', label: '3- OTHER PORT EXPENSE', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '4- CUSTOMS OVERTIME COSTS', grt_value: 1, rate: 800 },
  { category: 'OTHER_EXPENSES', label: '5- AGENCY LUMPSUM COSTS', grt_value: 1, rate: 2500 },
  { category: 'OTHER_EXPENSES', label: '6- ISPS FEES PER CALL', grt_value: 1, rate: 500 },

  // --- STEVEDORING (Libre / Manuel) ---
  { category: 'STEVEDORING', label: 'CARGO LINER OUT', grt_value: 9188.4, rate: 4.75 },
];

const DEFAULT_REMARKS = `1) However, the total amount to be paid will be mentioned on the port invoice which will be transmitted to you as a copy, and the original port invoice will be sent to you by email or courier the final D/A.

2) Our company as agent has always fulfilled its duties to the best, and protected the ship interest that we act as agent.

3) Vessel documents needed at Nouakchott port to be sent BEFORE the vessel arrival at Nouakchott port are: cargo plan, cargo manifest, BL, vaccination list, Arms/Ammunition list, dangerous cargo list, stow away list, last port clearance, vessel sign call, and the vessel MUST have valid insurance.`;

const CATEGORIES = [
  { id: 'PORT_DUES', label: 'Ports Dues' },
  { id: 'OTHER_EXPENSES', label: 'Other Expenses' },
  { id: 'STEVEDORING', label: 'Stevedoring/Handling' }
];

function FDAModal({ fda, clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_id: '',
    vessel_name: '',
    port_of_arrival: 'NOUAKCHOTT',
    cargo_description: '',
    weight: '',
    voyage: '',
    currency: 'EUR',
    port_inv_number: '',
    apply_vat: true,
    // remarks: '',
    items: []
  });

  // Initialisation
  useEffect(() => {
    if (fda) {
      setFormData({ 
        ...fda, 
        client_id: fda.client?.id || fda.client || '', 
        items: fda.items || [] 
      });
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...DEFAULT_FDA_ITEMS],
        // remarks: DEFAULT_REMARKS
      }));
    }
  }, [fda]);

  // LOGIQUE DE SYNCHRONISATION : Uniquement pour PORT_DUES
  useEffect(() => {
    const numericWeight = parseFloat(formData.weight) || 0;
    
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        // LIAISON RESTREINTE À PORT_DUES UNIQUEMENT
        if (item.category === 'PORT_DUES') {
          return { ...item, grt_value: numericWeight };
        }
        return item;
      })
    }));
  }, [formData.weight]);

  const ufdateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = (category) => {
    const currentWeight = parseFloat(formData.weight) || 0;
    // Seul un nouvel item de PORT_DUES prend le poids par défaut
    const initialGrt = (category === 'PORT_DUES') ? currentWeight : 0;
    
    setFormData({ 
      ...formData, 
      items: [...formData.items, { category, label: '', grt_value: initialGrt, rate: 0 }] 
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
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white">
          <h2 className="text-xl font-bold">{fda ? "Modifier FDA" : "Nouveau FDA"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
                  <option value="">Sélectionner un client</option>
                  {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Weight (Pilote les Port Dues)</label>
              <div className="relative mt-1">
                <Weight className="absolute left-3 top-3.5 w-4 h-4 text-indigo-500" />
                <input required type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full pl-10 p-3 bg-indigo-50 border border-indigo-100 rounded-xl font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Total Weight" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Navire</label>
              <div className="relative mt-1">
                <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.vessel_name} onChange={(e) => setFormData({...formData, vessel_name: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom du navire" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase">Trip / Voyage</label>
              <div className="relative mt-1">
                <Database className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="N° de voyage" />
              </div>
            </div>
          </div>

          {/* Section 3: Port, Days & Currency */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Port Inv Number</label><input type="text" value={formData.port_inv_number} onChange={(e) => setFormData({...formData, port_inv_number: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500" /></div>
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Devise</label>
              <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-none">
                <option value="EUR">Euro (€)</option><option value="USD">Dollar ($)</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer font-bold text-xs text-indigo-900">
                <input type="checkbox" checked={formData.apply_vat} onChange={(e) => setFormData({...formData, apply_vat: e.target.checked})} className="w-5 h-5 rounded-md accent-indigo-600" /> TVA (16%)
              </label>
            </div>
            <div><label className="text-[10px] font-bold text-indigo-900 uppercase">Port</label><input type="text" value={formData.port_of_arrival} onChange={(e) => setFormData({...formData, port_of_arrival: e.target.value})} className="w-full p-2 mt-1 bg-white border rounded-lg font-bold outline-none" /></div>
          </div>

          {/* Tableaux Dynamiques */}
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="font-black text-gray-800 text-[11px] uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-1.5 h-4 bg-buttonGradientPrimary rounded-full"/> {cat.label}
                </h3>
                <button type="button" onClick={() => addItem(cat.id)} className="text-[10px] font-bold bg-white border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full hover:bg-indigo-50 transition-all shadow-sm">+ Ajouter</button>
              </div>
              <div className="space-y-3 px-2">
                {formData.items.filter(i => i.category === cat.id).map((item, idx) => {
                  const globalIdx = formData.items.findIndex(orig => orig === item);
                  // LIAISON RESTREINTE ICI
                  const isLinked = item.category === 'PORT_DUES';
                  
                  return (
                    <div key={globalIdx} className="flex gap-6 items-center group animate-in slide-in-from-left-2 duration-200">
                      <input placeholder="Désignation" value={item.label} onChange={(e) => ufdateItem(globalIdx, 'label', e.target.value)} className="flex-1 p-2 border-b border-gray-100 focus:border-indigo-400 outline-none text-sm font-medium" />
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">GRT/Qty</span>
                         <input type="number" disabled={isLinked} value={item.grt_value} onChange={(e) => ufdateItem(globalIdx, 'grt_value', e.target.value)} className={`w-24 p-2 rounded-lg text-center text-sm font-bold border border-transparent ${isLinked ? 'bg-indigo-100 text-indigo-700 cursor-not-allowed' : 'bg-gray-50'}`} />
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Rate</span>
                         <input type="number" step="0.001" value={item.rate} onChange={(e) => ufdateItem(globalIdx, 'rate', e.target.value)} className="w-24 p-2 bg-gray-50 rounded-lg text-center text-sm font-bold border border-transparent focus:border-indigo-200" />
                      </div>
                      <div className="w-28 text-right font-black text-gray-800 text-sm">{(item.grt_value * item.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                      <button type="button" onClick={() => removeItem(globalIdx)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* <div className="space-y-3 pt-4">
            <label className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-2"><Database className="w-3 h-3"/> Remarks / Conditions</label>
            <textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows="4" className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 ring-indigo-100 outline-none"></textarea>
          </div> */}
        </form>

        <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-right flex-1 px-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estimation Totale</p>
            <p className="text-4xl font-black text-buttonGradientPrimary tracking-tighter">
              {calculateTotal().toLocaleString()} <span className="text-sm font-bold text-gray-400">{formData.currency}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-4 font-bold text-gray-500 hover:text-gray-800 transition-colors">Annuler</button>
            <button onClick={handleSubmit} className="px-12 py-4 bg-buttonGradientPrimary text-white rounded-2xl font-black shadow-lg hover:scale-[1.02] transition-all flex items-center gap-3 active:scale-95">
              <Calculator className="w-5 h-5"/> {fda ? "Mettre à jour" : "Enregistrer le FDA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FDAModal;