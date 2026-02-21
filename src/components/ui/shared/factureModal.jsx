import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Ship, ListPlus, ShieldCheck, EyeOff, Calendar, Anchor } from 'lucide-react';

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
    est_privee: false,
    devise: 'MRU',
    items: [{ libelle: '', prix_unitaire: '', quantite: 1 }]
  });

  useEffect(() => {
    if (facture) {
      // Important : Si facture.client est un objet (venu du DetailSerializer), 
      // on prend l'ID, sinon on prend la valeur telle quelle.
      const clientId = facture.client?.id || facture.client;

      setFormData({
        client_id: clientId || '',
        port_arrive: facture.port_arrive || '',
        vessel: facture.vessel || '',
        voyage: facture.voyage || '',
        eta: facture.eta?.slice(0, 16) || '',
        etd: facture.etd?.slice(0, 16) || '',
        bl: facture.bl || '',
        tva: facture.tva || false,
        est_privee: facture.est_privee || false,
        devise: facture.devise || 'MRU',
        items: facture.items ? facture.items.map(i => ({ 
          libelle: i.libelle, 
          prix_unitaire: i.prix_unitaire, 
          quantite: i.quantite 
        })) : [{ libelle: '', prix_unitaire: '', quantite: 1 }]
      });
    }
  }, [facture]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { libelle: '', prix_unitaire: '', quantite: 1 }] });
  
  const removeItem = (index) => {
    if (formData.items.length > 1) {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    }
  };

  const calculateTotal = () => {
    const ht = formData.items.reduce((sum, item) => sum + (Number(item.prix_unitaire) * Number(item.quantite) || 0), 0);
    return formData.tva ? ht * 1.16 : ht;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            {facture ? <ShieldCheck className="w-6 h-6"/> : <Plus className="w-6 h-6"/>}
            {facture ? "Modification Facture" : "Nouvelle Facture Logistique"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="overflow-y-auto p-8 space-y-8">
          {/* SECTION CLIENT & NAVIRE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Client</label>
              <select 
                required 
                value={formData.client_id} 
                onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Sélectionner un client</option>
                {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Navire (Vessel)</label>
              <div className="relative">
                <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.vessel} onChange={(e) => setFormData({...formData, vessel: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nom du navire" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Bill of Lading (BL)</label>
              <div className="relative">
                <Anchor className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.bl} onChange={(e) => setFormData({...formData, bl: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Référence BL" />
              </div>
            </div>
          </div>

          {/* SECTION DATES & PORT */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-400 uppercase">Port d'arrivée</label>
                <input required type="text" value={formData.port_arrive} onChange={(e) => setFormData({...formData, port_arrive: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-400 uppercase">Voyage</label>
                <input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> ETA</label>
                <input required type="datetime-local" value={formData.eta} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> ETD</label>
                <input required type="datetime-local" value={formData.etd} onChange={(e) => setFormData({...formData, etd: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" />
            </div>
          </div>

          {/* SECTION PRESTATIONS */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-buttonGradientSecondary"/> Prestations / Services
              </h3>
              <button type="button" onClick={addItem} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all">
                + AJOUTER LIGNE
              </button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center group animate-in slide-in-from-left-2">
                  <input required placeholder="Désignation du service" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} className="flex-1 p-2 border-b border-transparent focus:border-indigo-500 outline-none transition-all font-medium" />
                  <input required type="number" placeholder="Prix" value={item.prix_unitaire} onChange={(e) => updateItem(index, 'prix_unitaire', e.target.value)} className="w-32 p-2 border-b border-transparent focus:border-indigo-500 text-right outline-none font-bold text-gray-700" />
                  <input required type="number" placeholder="Qté" value={item.quantite} onChange={(e) => updateItem(index, 'quantite', e.target.value)} className="w-20 p-2 border-b border-transparent focus:border-indigo-500 text-center outline-none" />
                  <div className="w-32 text-right font-bold text-indigo-600">
                    {(Number(item.prix_unitaire) * Number(item.quantite) || 0).toLocaleString()}
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeItem(index)} 
                    className={`p-2 transition-colors ${formData.items.length > 1 ? 'text-red-300 hover:text-red-500' : 'text-gray-200 cursor-not-allowed'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* FOOTER ACTIONS */}
        <div className="p-8 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-6">
          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-600 text-sm">
               <input type="checkbox" checked={formData.tva} onChange={(e) => setFormData({...formData, tva: e.target.checked})} className="w-5 h-5 accent-indigo-600" /> TVA (16%)
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-red-600 text-sm bg-red-50 px-3 py-2 rounded-xl border border-red-100 hover:bg-red-100 transition-all">
               <input type="checkbox" checked={formData.est_privee} onChange={(e) => setFormData({...formData, est_privee: e.target.checked})} className="w-5 h-5 accent-red-600" /> 
               <EyeOff className="w-4 h-4"/> Facture Privée
            </label>
            <select value={formData.devise} onChange={(e) => setFormData({...formData, devise: e.target.value})} className="p-2 bg-white border rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="MRU">MRU</option>
              <option value="EUR">EUR</option>
              <option value="DOLLAR">USD</option>
            </select>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Net à payer</p>
              <p className="text-3xl font-bold text-indigo-900">
                {calculateTotal().toLocaleString()} 
                <span className="text-sm font-normal text-gray-400 ml-1">{formData.devise}</span>
              </p>
            </div>
            <button 
                onClick={(e) => { e.preventDefault(); onSave(formData); }} 
                className="px-10 py-4 bg-buttonGradientSecondary text-white rounded-2xl font-bold hover:shadow-xl hover:scale-[1.02] transition-all active:scale-95 shadow-indigo-200"
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