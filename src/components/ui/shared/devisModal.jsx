import { useState, useEffect } from 'react';
import { X, Trash2, Ship, ListPlus, Calendar, Box, Weight, Info } from 'lucide-react';

function DevisModal({ devis, clients, onClose, onSave }) {
  const [formData, setFormData] = useState({
    client_id: '',
    port_arrive: '',
    vessel: '',
    type: '',
    description: '',
    volume: '',
    poids: '',
    voyage: '',
    is_excluding_customs: false,
    eta: '',
    etd: '',
    bl: '',
    tva: false,
    devise: 'MRU',
    remarks: '',
    commentaire: '',
    items: [{ libelle: '', prix_unitaire: '', quantite: 1 }]
  });

  useEffect(() => {
    if (devis) {
      setFormData({
        client_id: devis.client?.id || '',
        port_arrive: devis.port_arrive || '',
        vessel: devis.vessel || '',
        type: devis.type || '',
        description: devis.description || '',
        volume: devis.volume || '',
        poids: devis.poids || '',
        is_excluding_customs: devis.is_excluding_customs || false,
        voyage: devis.voyage || '',
        eta: devis.eta?.slice(0, 16) || '',
        etd: devis.etd?.slice(0, 16) || '',
        bl: devis.bl || '',
        tva: devis.tva || false,
        devise: devis.devise || 'MRU',
        commentaire: devis.commentaire || '',
        items: devis.items?.map(i => ({ libelle: i.libelle, prix_unitaire: i.prix_unitaire, quantite: i.quantite })) || [{ libelle: '', prix_unitaire: '', quantite: 1 }]
      });
    }
  }, [devis]);

  // FONCTION DE NETTOYAGE AVANT ENVOI
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // On crée une copie des données pour ne pas modifier l'état visuel du formulaire
    const cleanedData = {
      ...formData,
      // Si ETA ou ETD sont vides, on envoie null pour que Django accepte
      eta: formData.eta === "" ? null : formData.eta,
      etd: formData.etd === "" ? null : formData.etd,
    };
    
    onSave(cleanedData);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { libelle: '', prix_unitaire: '', quantite: 1 }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const calculateTotal = () => {
    const ht = formData.items.reduce((sum, item) => sum + (Number(item.prix_unitaire) * Number(item.quantite) || 0), 0);
    return formData.tva ? ht * 1.16 : ht;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <h2 className="text-xl font-bold">{devis ? "Modification Devis" : "Nouveau Devis Logistique"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-8 space-y-8">
          {/* Section 1: Identité */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Client</label>
              <select required value={formData.client_id} onChange={(e) => setFormData({...formData, client_id: e.target.value})} className="w-full p-3 bg-gray-50 border rounded-xl outline-buttonGradientPrimary text-sm font-bold">
                <option value="">Sélectionner un client</option>
                {clients?.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Navire / Type</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Ship className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input required type="text" value={formData.vessel} onChange={(e) => setFormData({...formData, vessel: e.target.value})} className="w-full pl-9 p-2.5 bg-gray-50 border rounded-xl outline-buttonGradientPrimary text-sm font-bold" placeholder="Nom" />
                </div>
                <input type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-24 p-2.5 bg-gray-50 border rounded-xl outline-buttonGradientPrimary text-sm font-bold" placeholder="Type" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-400">Bill of Lading (BL)</label>
              <input required type="text" value={formData.bl} onChange={(e) => setFormData({...formData, bl: e.target.value})} className="w-full p-2.5 bg-gray-50 border rounded-xl outline-buttonGradientPrimary text-sm font-bold" />
            </div>
          </div>

          {/* Section 2: Logistique & Marchandise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Box className="w-3 h-3"/> Volume (CBM)</label>
              <input type="text" value={formData.volume} onChange={(e) => setFormData({...formData, volume: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Ex: 450 m3" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Weight className="w-3 h-3"/> Poids (MT)</label>
              <input type="text" value={formData.poids} onChange={(e) => setFormData({...formData, poids: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Ex: 1200 Tons" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1"><Info className="w-3 h-3"/> Description Cargaison</label>
              <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" placeholder="Ex: Conteneurs 40'..." />
            </div>
          </div>

          {/* Section 3: Escales (Modification des REQUIRED ici) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div><label className="text-[10px] font-bold text-buttonGradientSecondary uppercase">Port d'arrivée</label><input required type="text" value={formData.port_arrive} onChange={(e) => setFormData({...formData, port_arrive: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] font-bold text-buttonGradientSecondary uppercase">Voyage</label><input required type="text" value={formData.voyage} onChange={(e) => setFormData({...formData, voyage: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] font-bold text-buttonGradientSecondary uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> ETA</label><input type="datetime-local" value={formData.eta} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" /></div>
            <div><label className="text-[10px] font-bold text-buttonGradientSecondary uppercase flex items-center gap-1"><Calendar className="w-3 h-3"/> ETD</label><input type="datetime-local" value={formData.etd} onChange={(e) => setFormData({...formData, etd: e.target.value})} className="w-full p-2 bg-white border rounded-lg text-sm" /></div>
          </div>

          {/* Section 4: Prestations (Ajout des labels d'en-tête) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase"><ListPlus className="w-4 h-4 text-buttonGradientSecondary"/> Prestations / Services</h3>
              <button type="button" onClick={addItem} className="text-xs font-bold text-buttonGradientSecondary hover:bg-indigo-50 px-3 py-1 rounded-lg">+ Ajouter une ligne</button>
            </div>
            
            {/* EN-TÊTE DES COLONNES */}
            <div className="flex gap-4 px-2">
              <div className="flex-1 text-[10px] font-bold text-gray-400 uppercase">Désignation / Service</div>
              <div className="w-32 text-[10px] font-bold text-gray-400 uppercase text-right">Prix Unitaire</div>
              <div className="w-16 text-[10px] font-bold text-gray-400 uppercase text-center">Qté</div>
              <div className="w-28 text-[10px] font-bold text-gray-400 uppercase text-right">Total HT</div>
              <div className="w-8"></div>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center animate-in fade-in">
                  <input required placeholder="Désignation" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} className="flex-1 p-2 border-b outline-none focus:border-buttonGradientPrimary text-sm" />
                  <input required type="number" placeholder="0.00" value={item.prix_unitaire} onChange={(e) => updateItem(index, 'prix_unitaire', e.target.value)} className="w-32 p-2 border-b text-right outline-none focus:border-buttonGradientPrimary text-sm font-bold" />
                  <input required type="number" placeholder="1" value={item.quantite} onChange={(e) => updateItem(index, 'quantite', e.target.value)} className="w-16 p-2 border-b text-center outline-none focus:border-buttonGradientPrimary text-sm" />
                  <div className="w-28 text-right font-black text-buttonGradientSecondary text-sm">{(Number(item.prix_unitaire) * Number(item.quantite) || 0).toLocaleString()}</div>
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Commentaires */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Remarques (Visible sur PDF)</label>
            <textarea value={formData.commentaire} onChange={(e) => setFormData({...formData, commentaire: e.target.value})} rows="3" className="w-full p-3 bg-gray-50 rounded-xl text-sm outline-none border focus:border-indigo-100" placeholder="Conditions de paiement, validité..."></textarea>
          </div>
        </form>

        {/* Footer */}
        <div className="p-8 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-6">
          <div className="flex gap-8 items-center">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-600 text-xs">
               <input type="checkbox" checked={formData.tva} onChange={(e) => setFormData({...formData, tva: e.target.checked})} className="w-5 h-5 accent-buttonGradientSecondary" /> Inclure TVA (16%)
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-600 text-xs">
               <input type="checkbox" checked={formData.is_excluding_customs} onChange={(e) => setFormData({...formData, is_excluding_customs: e.target.checked})} className="w-5 h-5 accent-buttonGradientSecondary" /> Excluding Customs
            </label>
            <select value={formData.devise} onChange={(e) => setFormData({...formData, devise: e.target.value})} className="p-2 bg-white border rounded-lg font-bold outline-buttonGradientPrimary text-sm">
              <option value="MRU">MRU</option><option value="EUR">EUR</option><option value="DOLLAR">USD</option>
            </select>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Global TTC</p>
              <p className="text-3xl font-bold text-buttonGradientSecondary">{calculateTotal().toLocaleString()} <span className="text-sm font-normal text-gray-400">{formData.devise}</span></p>
            </div>
            <button onClick={handleSubmit} className="px-10 py-4 bg-buttonGradientSecondary text-white rounded-2xl font-bold hover:opacity-90 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              {devis ? "Mettre à jour" : "Générer le Devis"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DevisModal;