import { useState, useEffect } from 'react';
import { X, Plus, Trash2, User, ListPlus, Ship, Save, FileText, Calendar, Clock, Anchor } from 'lucide-react';

function BADModal({ bad, clients, factures, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_id: '',
    facture_id: '',
    date: new Date().toISOString().split('T')[0],
    date_expiration: '',
    navire: '',
    nombre_jours: 0,
    nom_representant: '',
    items: [{ bl: '', package_number: '', weight: '' }]
  });

  useEffect(() => {
    if (bad) {
      setFormData({
        client_id: bad.client || '',
        facture_id: bad.facture || '',
        date: bad.date || '',
        date_expiration: bad.date_expiration || '',
        navire: bad.navire || '',
        nombre_jours: bad.nombre_jours || 0,
        nom_representant: bad.nom_representant || '',
        items: bad.items.map(i => ({ 
            bl: i.bl, 
            package_number: i.package_number, 
            weight: i.weight 
        }))
      });
    }
  }, [bad]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { bl: '', package_number: '', weight: '' }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientPrimary text-white">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            <h2 className="text-xl font-bold">
                {bad ? `Modification BAD #${bad.reference}` : "Nouveau Bon à Délivrer (BAD)"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="overflow-y-auto p-8 space-y-8">
          
          {/* Section 1: Parties prenantes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Client</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <select 
                  required 
                  value={formData.client_id} 
                  onChange={(e) => setFormData({...formData, client_id: e.target.value})} 
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                >
                  <option value="">Sélectionner un client</option>
                  {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Facture Associée (Optionnel)</label>
              <select 
                value={formData.facture_id} 
                onChange={(e) => setFormData({...formData, facture_id: e.target.value})} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
              >
                <option value="">Aucune facture</option>
                {factures?.map(f => <option key={f.id} value={f.id}>{f.reference} - {f.vessel}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">Nom du Représentant</label>
              <input 
                required 
                type="text" 
                value={formData.nom_representant} 
                onChange={(e) => setFormData({...formData, nom_representant: e.target.value})} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none" 
                placeholder="Identité du porteur"
              />
            </div>
          </div>

          {/* Section 2: Logistique Navire */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-600">Navire</label>
              <div className="relative">
                <Ship className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                <input required type="text" value={formData.navire} onChange={(e) => setFormData({...formData, navire: e.target.value})} className="w-full pl-10 p-2 bg-white border border-amber-200 rounded-lg outline-none" placeholder="Nom du vessel" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-600">Nombre de jours</label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-amber-400" />
                <input required type="number" value={formData.nombre_jours} onChange={(e) => setFormData({...formData, nombre_jours: e.target.value})} className="w-full pl-10 p-2 bg-white border border-amber-200 rounded-lg outline-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-600">Date d'émission</label>
              <input required type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full p-2 bg-white border border-amber-200 rounded-lg outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-amber-600 text-red-600">Date d'expiration</label>
              <input required type="date" value={formData.date_expiration} onChange={(e) => setFormData({...formData, date_expiration: e.target.value})} className="w-full p-2 bg-white border border-red-200 rounded-lg outline-none" />
            </div>
          </div>

          {/* Section 3: Items (BL, Colis, Poids) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-amber-500"/> Détails de la cargaison
              </h3>
              <button type="button" onClick={addItem} className="text-sm font-bold text-amber-600 hover:bg-amber-50 px-3 py-1 rounded-lg transition-colors">+ Ajouter un BL</button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-right-2 bg-gray-50 p-4 rounded-xl relative group">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">N° Bill of Lading (BL)</label>
                    <div className="relative">
                        <Anchor className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                        <input required placeholder="Ex: BL123456" value={item.bl} onChange={(e) => updateItem(index, 'bl', e.target.value)} className="w-full pl-10 p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <div className="w-48 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre de colis</label>
                    <input required type="text" placeholder="Ex: 10 Containers" value={item.package_number} onChange={(e) => updateItem(index, 'package_number', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-500" />
                  </div>
                  <div className="w-40 space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Poids (kg/t)</label>
                    <input required type="number" step="0.01" placeholder="0.00" value={item.weight} onChange={(e) => updateItem(index, 'weight', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-amber-500 text-right" />
                  </div>
                  <button type="button" onClick={() => removeItem(index)} className="p-2.5 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-xs text-gray-400 max-w-xs">
            * L'émission d'un BAD engage la responsabilité logistique pour la durée de validité indiquée.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="px-6 py-3 font-bold text-gray-500 hover:text-gray-700 transition-colors">Annuler</button>
            <button 
                onClick={(e) => { e.preventDefault(); onSave(formData); }} 
                className="px-10 py-4 bg-buttonGradientPrimary text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-amber-200 transition-all active:scale-95 flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {bad ? "Mettre à jour le BAD" : "Générer le BAD"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BADModal;