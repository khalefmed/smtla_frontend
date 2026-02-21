import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Building2, ListPlus, ShoppingCart, Save, FileText } from 'lucide-react';

function BonCommandeModal({ bc, fournisseurs, onClose, onSave }) {
  const [formData, setFormData] = useState({
    fournisseur_id: '',
    date: new Date().toISOString().split('T')[0], // Changé date_emission -> date
    objet_commande: '', // Ajout du champ objet
    devise: 'MRU',
    items: [{ libelle: '', prix_unitaire: '', quantite: 1 }]
  });

  useEffect(() => {
    if (bc) {
      setFormData({
        fournisseur_id: bc.fournisseur.id,
        date: bc.date || bc.date_emission || '', // Gestion des deux noms de champs au cas où
        objet_commande: bc.objet_commande || '',
        devise: bc.devise || 'MRU',
        items: bc.items.map(i => ({ 
            libelle: i.libelle, 
            prix_unitaire: i.prix_unitaire, 
            quantite: i.quantite 
        }))
      });
    }
  }, [bc]);

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { libelle: '', prix_unitaire: '', quantite: 1 }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.prix_unitaire) * Number(item.quantite) || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-6 h-6" />
            <h2 className="text-xl font-bold">{bc ? "Modification Bon de Commande" : "Nouveau Bon de Commande"}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="overflow-y-auto p-8 space-y-6">
          
          {/* Section Fournisseur et Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Fournisseur / Prestataire</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <select 
                  required 
                  value={formData.fournisseur_id} 
                  onChange={(e) => setFormData({...formData, fournisseur_id: e.target.value})} 
                  className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-buttonGradientPrimary font-medium appearance-none"
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs?.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-gray-400">Date d'émission</label>
              <input 
                required 
                type="date" 
                value={formData.date} 
                onChange={(e) => setFormData({...formData, date: e.target.value})} 
                className="w-full p-3 bg-gray-50 border rounded-xl outline-buttonGradientPrimary font-medium" 
              />
            </div>
          </div>

          {/* Section Objet de la commande (Nouveau) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400">Objet de la commande</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                required 
                type="text" 
                placeholder="Ex: Achat de pièces de rechange pour Grue X" 
                value={formData.objet_commande} 
                onChange={(e) => setFormData({...formData, objet_commande: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border rounded-xl outline-buttonGradientPrimary font-medium" 
              />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ListPlus className="w-5 h-5 text-buttonGradientSecondary"/> Articles / Prestations
              </h3>
              <button type="button" onClick={addItem} className="text-sm font-bold text-buttonGradientSecondary hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors">+ Ajouter une ligne</button>
            </div>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-4 items-center animate-in fade-in slide-in-from-right-2">
                  <input required placeholder="Désignation" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} className="flex-1 p-2 border-b outline-none focus:border-buttonGradientPrimary bg-transparent font-medium" />
                  <input required type="number" placeholder="P.U" value={item.prix_unitaire} onChange={(e) => updateItem(index, 'prix_unitaire', e.target.value)} className="w-32 p-2 border-b text-right outline-none focus:border-buttonGradientPrimary bg-transparent" />
                  <input required type="number" placeholder="Qté" value={item.quantite} onChange={(e) => updateItem(index, 'quantite', e.target.value)} className="w-20 p-2 border-b text-center outline-none focus:border-buttonGradientPrimary bg-transparent" />
                  <div className="w-32 text-right font-bold text-gray-600">{(Number(item.prix_unitaire) * Number(item.quantite) || 0).toLocaleString()}</div>
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-8 border-t bg-gray-50 flex flex-wrap justify-between items-center gap-6">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Devise de paiement</label>
            <select value={formData.devise} onChange={(e) => setFormData({...formData, devise: e.target.value})} className="p-2 bg-white border rounded-lg font-bold outline-buttonGradientPrimary">
              <option value="MRU">MRU</option><option value="EUR">EUR</option><option value="DOLLAR">USD</option>
            </select>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Net à Payer</p>
              <p className="text-3xl font-bold text-buttonGradientSecondary">{calculateTotal().toLocaleString()} <span className="text-sm font-normal text-gray-400">{formData.devise}</span></p>
            </div>
            <button onClick={(e) => { e.preventDefault(); onSave(formData); }} className="px-10 py-4 bg-buttonGradientSecondary text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
              <Save className="w-5 h-5" />
              {bc ? "Mettre à jour" : "Enregistrer le BC"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BonCommandeModal;