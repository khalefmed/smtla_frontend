import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Ship, Database, Calculator, User, Weight, DollarSign, Globe } from 'lucide-react';

const DEFAULT_FDA_ITEMS = [
  // --- PORTS DUES ---
  { category: 'PORT_DUES', label: 'PILOTAGE IN & OUT', grt_value: 22070, rate: 0.119, port_inv: 825276, price_mru: 279094, price_devise: 6343.05 },
  { category: 'PORT_DUES', label: 'TOWAGE IN & OUT x 02', grt_value: 22070, rate: 0.346, port_inv: 825276, price_mru: 811482, price_devise: 18442.77 },
  { category: 'PORT_DUES', label: 'BERTH DUES', grt_value: 22070, rate: 0.135, port_inv: 825276, price_mru: 1125765, price_devise: 25585.57 },
  { category: 'PORT_DUES', label: 'MOORING/UNMOORING', grt_value: 22070, rate: 0.063, port_inv: 825276, price_mru: 147756, price_devise: 3358.09 },
  { category: 'PORT_DUES', label: 'LIGHT DUES', grt_value: 22070, rate: 0.033, port_inv: 825276, price_mru: 68797, price_devise: 1563.57 },

  // --- OTHER EXPENSES (Total Recap) ---
  { category: 'OTHER_EXPENSES', label: '1- PORT CALL TAX', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '2- PORT IMMIGRATION', grt_value: 1, rate: 400 },
  { category: 'OTHER_EXPENSES', label: '3- OTHER PORT EXPENSE', grt_value: 1, rate: 500 },
  { category: 'OTHER_EXPENSES', label: '4- CUSTOMS OVERTIME COSTS', grt_value: 1, rate: 800 },
  { category: 'OTHER_EXPENSES', label: '5- AGENCY LUMPSUM COSTS', grt_value: 1, rate: 2500 },
  { category: 'OTHER_EXPENSES', label: '6- ISPS FEES PER CALL', grt_value: 1, rate: 500 },

  // --- STEVEDORING/HANDLING ON BOARD ---
  { category: 'STEVEDORING', label: 'CARGO LINER OUT', grt_value: 6367.411, rate: 4.75 },
  { category: 'STEVEDORING', label: 'TALC INV SHORE CRANE', grt_value: 792.72, rate: 10 },
  { category: 'STEVEDORING', label: 'Port Charges', grt_value: 1810.37, rate: 1.5 },
  { category: 'STEVEDORING', label: 'MOORING LINE -06', grt_value: 6, rate: 850 },
  { category: 'STEVEDORING', label: 'TIRES ON DECK BY SOCOMI', grt_value: 1, rate: 15000 },
  { category: 'STEVEDORING', label: '10 TIRES FOR THE CAPTAIN', grt_value: 1, rate: 2000 },
  { category: 'STEVEDORING', label: 'FORKLIFT 13 TONS 96 HOURS', grt_value: 108, rate: 35 },
  { category: 'STEVEDORING', label: 'FORKLIFT 16 TONS 71 HOURS', grt_value: 71, rate: 45 },
  { category: 'STEVEDORING', label: 'SHIFTING MV BOA CHANG', grt_value: 1, rate: 4000 },
  { category: 'STEVEDORING', label: 'SHIFTING MV HL BRILLANCE', grt_value: 1, rate: 6000 },
  { category: 'STEVEDORING', label: 'TIPS FOR UNLASHING', grt_value: 1, rate: 500 },
  { category: 'STEVEDORING', label: 'TIPS AUTORISATION FOR USING HOT FOR UNLASHING', grt_value: 1, rate: 250 },
];

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
    items: []
  });

  useEffect(() => {
    if (fda) {
      setFormData({ ...fda, client_id: fda.client?.id || fda.client || '', items: fda.items || [] });
    } else {
      setFormData(prev => ({ ...prev, items: [...DEFAULT_FDA_ITEMS] }));
    }
  }, [fda]);

  useEffect(() => {
    const numericWeight = parseFloat(formData.weight) || 0;
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.category === 'PORT_DUES' ? { ...item, grt_value: numericWeight } : item
      )
    }));
  }, [formData.weight]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = (category) => {
    const currentWeight = parseFloat(formData.weight) || 0;
    setFormData({ 
      ...formData, 
      items: [...formData.items, { 
        category, 
        label: '', 
        grt_value: category === 'PORT_DUES' ? currentWeight : 0, 
        rate: 0,
        port_inv: 0,
        devise: 0,
        price_mru: 0,
        price_devise: 0
      }] 
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white font-bold">
          <h2 className="text-xl">{fda ? "Modifier FDA" : "Nouveau FDA"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* TOP INFO - Ajout du sélecteur de devise */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
             <div className="md:col-span-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Client</label>
                <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full p-2.5 mt-1 bg-white border rounded-xl font-bold outline-none border-gray-200">
                  <option value="">Sélectionner</option>
                  {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
             </div>
             <div>
                <label className="text-[10px] font-bold text-buttonGradientPrimary uppercase">Weight (GRT)</label>
                <input required type="number" step="0.01" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} className="w-full p-2.5 mt-1 bg-white border-2 border-indigo-100 rounded-xl font-black text-buttonGradientPrimary" />
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Devise Principale</label>
                <select value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} className="w-full p-2.5 mt-1 bg-white border border-gray-200 rounded-xl font-black text-blue-600 outline-none">
                  <option value="EUR">EURO (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Navire</label>
                <input required type="text" value={formData.vessel_name} onChange={(e) => setFormData({...formData, vessel_name: e.target.value})} className="w-full p-2.5 mt-1 bg-white border rounded-xl font-bold" />
             </div>
             <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Trip / Voyage</label>
                <input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full p-2.5 mt-1 bg-white border rounded-xl font-bold" />
             </div>
          </div>

          {/* TABLEAUX PAR CATÉGORIE */}
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="space-y-3">
              <div className="flex justify-between items-center bg-gray-100/50 p-2 rounded-lg">
                <h3 className="font-black text-gray-700 text-xs uppercase flex items-center gap-2">
                  <div className="w-1 h-4 bg-buttonGradientPrimary rounded-full" /> {cat.label}
                </h3>
                <button type="button" onClick={() => addItem(cat.id)} className="text-[10px] font-bold text-buttonGradientPrimary hover:underline">+ Ajouter</button>
              </div>

              {/* HEADER DE TABLE Spécifique */}
              <div className="grid grid-cols-12 gap-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="col-span-3">Désignation</div>
                <div className="col-span-1 text-center">GRT (Weight)</div>
                {cat.id !== 'PORT_DUES' && <div className="col-span-1 text-center">Rate</div>}
                {cat.id === 'PORT_DUES' && (
                  <>
                    <div className="col-span-1 text-center">Port Inv</div>
                    <div className="col-span-1 text-center">{formData.currency}</div>
                    <div className="col-span-2 text-center text-buttonGradientPrimary">Price MRU</div>
                    <div className="col-span-2 text-center text-blue-500">Price {formData.currency}</div>
                  </>
                )}
                {cat.id !== 'PORT_DUES' && <div className="col-span-6 text-right pr-12">Total Item</div>}
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-2">
                {formData.items.filter(i => i.category === cat.id).map((item, _) => {
                  const globalIdx = formData.items.findIndex(orig => orig === item);
                  const isPortDue = item.category === 'PORT_DUES';
                  
                  return (
                    <div key={globalIdx} className="grid grid-cols-12 gap-3 items-center bg-white border border-gray-100 p-2 rounded-xl group hover:border-indigo-200 transition-all">
                      <input className="col-span-3 text-sm font-bold outline-none bg-transparent" value={item.label} onChange={(e) => updateItem(globalIdx, 'label', e.target.value)} />
                      
                      <input type="number" disabled={isPortDue} className={`col-span-1 p-1.5 rounded-lg text-center text-sm font-bold ${isPortDue ? 'bg-indigo-50 text-buttonGradientPrimary' : 'bg-gray-50'}`} value={item.grt_value} onChange={(e) => updateItem(globalIdx, 'grt_value', e.target.value)} />
                      
                      {cat.id !== 'PORT_DUES' && (
                        <input type="number" step="0.001" className="col-span-1 p-1.5 bg-gray-50 rounded-lg text-center text-sm font-bold outline-none focus:ring-1 ring-indigo-300" value={item.rate} onChange={(e) => updateItem(globalIdx, 'rate', e.target.value)} />
                      )}

                      {isPortDue ? (
                        <>
                          <input type="number" step="0.01" className="col-span-1 p-1.5 bg-gray-50 rounded-lg text-center text-xs font-medium" value={item.port_inv} onChange={(e) => updateItem(globalIdx, 'port_inv', e.target.value)} />
                          <input type="number" step="0.01" className="col-span-1 p-1.5 bg-gray-50 rounded-lg text-center text-xs font-medium" value={item.devise} onChange={(e) => updateItem(globalIdx, 'devise', e.target.value)} />
                          <input type="number" step="0.01" className="col-span-2 p-1.5 bg-indigo-50 text-buttonGradientPrimary rounded-lg text-center text-sm font-black" value={item.price_mru} onChange={(e) => updateItem(globalIdx, 'price_mru', e.target.value)} />
                          <input type="number" step="0.01" className="col-span-2 p-1.5 bg-blue-50 text-blue-700 rounded-lg text-center text-sm font-black" value={item.price_devise} onChange={(e) => updateItem(globalIdx, 'price_devise', e.target.value)} />
                        </>
                      ) : (
                        <div className="col-span-6 text-right font-black text-gray-800 pr-4">
                          {(item.grt_value * item.rate).toLocaleString(undefined, {minimumFractionDigits: 2})}
                        </div>
                      )}

                      <button type="button" onClick={() => removeItem(globalIdx)} className="col-span-1 flex justify-center text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </form>

        {/* FOOTER */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
           <div className="flex gap-8 items-center">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Net</p>
                <p className="text-2xl font-black text-gray-900">{calculateSubTotal().toLocaleString()} <span className="text-xs">{formData.currency}</span></p>
              </div>
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <input type="checkbox" checked={formData.apply_vat} onChange={(e) => setFormData({...formData, apply_vat: e.target.checked})} className="w-4 h-4 accent-buttonGradientPrimary" id="vat" />
                <label htmlFor="vat" className="text-xs font-bold text-gray-600 cursor-pointer">Appliquer TVA (16%)</label>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] font-bold text-buttonGradientPrimary uppercase tracking-widest">Estimation TTC</p>
                <p className="text-4xl font-black text-buttonGradientPrimary tracking-tighter">
                  {calculateTotal().toLocaleString()} <span className="text-sm font-bold opacity-70">{formData.currency}</span>
                </p>
              </div>
              <button onClick={handleSubmit} className="px-10 py-4 bg-buttonGradientPrimary text-white rounded-2xl font-black shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-3 active:scale-95">
                <Calculator className="w-5 h-5"/> {fda ? "Mettre à jour" : "Enregistrer"}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default FDAModal;