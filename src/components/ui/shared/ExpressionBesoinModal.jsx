import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Info, AlertCircle, Building2, MapPin, UserCheck } from 'lucide-react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';

const TYPES_FRAIS = [
  { id: 'nourriture', label: 'Nourriture' }, { id: 'hebergement', label: 'Hébergement' },
  { id: 'medicament', label: 'Médicament' }, { id: 'carburant', label: 'Carburant' },
  { id: 'entretien', label: 'Entretien' }, { id: 'telecom', label: 'Télécom' },
  { id: 'avance_salaire', label: 'Avance sur salaire' }, { id: 'avance_paiement', label: 'Avance sur paiement' },
  { id: 'equipement', label: 'Équipement'},
];

const DEVISES = [
  { id: 'MRU', label: 'Ouguiya' }, { id: 'EUR', label: 'Euro' },
  { id: 'DOLLAR', label: 'Dollar' }, { id: 'XOF', label: 'Franc CFA' },
];

function ExpressionBesoinModal({ expression, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(true);
  
  const [formData, setFormData] = useState({
    nom_demandeur: '',
    direction: '',
    affectation: '',
    client_beneficiaire_id: '',
    bl_awb: '',
    navire: '',
    eta: '',
    tva: false,
    devise: 'MRU',
    items: [{ type: 'equipement', libelle: '' }] // Suppression du champ montant visuel
  });

  useEffect(() => {
    fetchClients();
    if (expression) {
      setFormData({
        nom_demandeur: expression.nom_demandeur || 'Non spécifié',
        direction: expression.direction || 'EXPLOITATION',
        affectation: expression.affectation || 'CHANTIER',
        client_beneficiaire_id: expression.client_beneficiaire || '',
        bl_awb: expression.bl_awb || '',
        navire: expression.navire || '',
        eta: expression.eta ? expression.eta.split('T')[0] : '',
        tva: expression.tva,
        devise: expression.devise,
        // On stocke temporairement le montant d'origine pour l'envoi en cas de modification
        items: expression.items.map(i => ({ type: i.type, libelle: i.libelle, _originalMontant: i.montant }))
      });
    }
  }, [expression]);

  const fetchClients = async () => {
    try {
      const response = await api.get('clients/');
      setClients(response.data);
    } catch (error) {
      toast.error("Erreur clients");
    } finally {
      setLoadingClients(false);
    }
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { type: 'equipement', libelle: '' }] });
  const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Traitement adaptatif des items avant envoi
    const processedItems = formData.items.map(item => {
      const baseItem = { type: item.type, libelle: item.libelle };
      
      if (expression) {
        // En cas de modification : si une valeur existait, on la remet, sinon on ne met rien
        if (item._originalMontant !== undefined && item._originalMontant !== null && item._originalMontant !== '') {
          baseItem.montant = item._originalMontant;
        }
      } else {
        // En cas d'ajout : on force la valeur à 0
        baseItem.montant = 0;
      }
      return baseItem;
    });

    const dataToSend = {
      ...formData,
      items: processedItems
    };

    onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center bg-inputFieldColor">
          <h2 className="text-xl font-bold text-gray-800">{expression ? "Modifier l'EB" : "Nouvelle Expression de Besoin"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-inputFieldColor rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200">
            <h3 className="font-bold text-slate-700 uppercase text-xs flex items-center gap-2"><UserCheck className="w-4 h-4" /> Origine de la demande</h3>
            <div className="grid grid-cols-3 gap-4">
              <input type="text" placeholder="Nom du demandeur" value={formData.nom_demandeur} onChange={(e) => setFormData({...formData, nom_demandeur: e.target.value})} className="p-2.5 bg-white border rounded-xl" />
              <input type="text" placeholder="Direction" value={formData.direction} onChange={(e) => setFormData({...formData, direction: e.target.value})} className="p-2.5 bg-white border rounded-xl" />
              <input type="text" placeholder="Affectation" value={formData.affectation} onChange={(e) => setFormData({...formData, affectation: e.target.value})} className="p-2.5 bg-white border rounded-xl" />
            </div>
          </div>

          <div className="bg-inputFieldColor p-4 rounded-xl space-y-4">
            <h3 className="font-bold text-gray-700 uppercase text-xs flex items-center gap-2"><Info className="w-4 h-4" /> Détails logistiques</h3>
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="BL / AWB" value={formData.bl_awb} onChange={(e) => setFormData({...formData, bl_awb: e.target.value})} className="p-3 bg-white border rounded-xl" />
              <input required type="text" placeholder="Navire" value={formData.navire} onChange={(e) => setFormData({...formData, navire: e.target.value})} className="p-3 bg-white border rounded-xl" />
              <input required type="datetime-local" value={formData.eta} onChange={(e) => setFormData({...formData, eta: e.target.value})} className="p-3 bg-white border rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 items-center">
            <select value={formData.devise} onChange={(e) => setFormData({...formData, devise: e.target.value})} className="p-3 bg-gray-100 rounded-xl">
              {DEVISES.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
            <label className="flex items-center gap-2 font-bold text-buttonGradientSecondary"><input type="checkbox" checked={formData.tva} onChange={(e) => setFormData({...formData, tva: e.target.checked})} className="w-5 h-5 accent-buttonGradientSecondary" /> Appliquer TVA (16%)</label>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center"><h3 className="font-bold text-gray-700 uppercase text-xs">Détails des dépenses</h3><button type="button" onClick={addItem} className="text-buttonGradientSecondary font-bold flex items-center gap-1"><Plus className="w-4 h-4" /> Ajouter ligne</button></div>
            {formData.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end animate-in fade-in-50 duration-150">
                <input required type="text" value={item.libelle} onChange={(e) => updateItem(index, 'libelle', e.target.value)} placeholder="Libellé" className="flex-1 p-2.5 bg-gray-50 border rounded-lg" />
                <select value={item.type} onChange={(e) => updateItem(index, 'type', e.target.value)} className="w-48 p-2.5 bg-gray-50 border rounded-lg">{TYPES_FRAIS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select>
                {formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="p-2.5 text-red-400 hover:text-red-600"><Trash2 className="w-5 h-5" /></button>}
              </div>
            ))}
          </div>
        </form>

        {/* Footer épuré sans calculs de prix */}
        <div className="p-6 border-t bg-buttonGradientSecondary text-white rounded-b-2xl flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase opacity-80">Expression de besoin</p>
            <p className="text-sm font-medium opacity-90">Validation séquentielle requise après enregistrement</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 bg-white/10 rounded-xl font-bold">Annuler</button>
            <button onClick={handleSubmit} className="px-8 py-3 bg-white text-buttonGradientSecondary rounded-xl font-bold shadow-lg">{expression ? "Mettre à jour" : "Créer l'expression"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpressionBesoinModal;