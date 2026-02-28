import { useState, useEffect } from 'react';
import { api } from "@/lib/api";
import { 
  X, Calendar, Package, Truck, Save, Hash, 
  User, Info, Ship // Ajout de l'icône Ship
} from 'lucide-react';

function RotationModal({ rotation, type, onClose, onSave }) {
  const [clients, setClients] = useState([]);
  const [typesMateriel, setTypesMateriel] = useState([]);
  
  const [formData, setFormData] = useState({
    client_id: '',
    type_materiel_id: '',
    numero_bordereau: '',
    observation: '',
    camion: '',
    quantite: 1,
    navire: '', // Valeur par défaut identique au modèle Django
    [type === 'entrantes' ? 'date_arrivee' : 'date_sortie']: new Date().toISOString().slice(0, 16)
  });

  useEffect(() => {
    // Chargement des données nécessaires
    Promise.all([
      api.get('clients/'),
      api.get('types-materiel/')
    ]).then(([resC, resT]) => {
      setClients(resC.data);
      setTypesMateriel(resT.data);
    });

    if (rotation) {
      setFormData({
        client_id: rotation.client,
        type_materiel_id: rotation.type_materiel,
        numero_bordereau: rotation.numero_bordereau,
        observation: rotation.observation || '',
        camion: rotation.camion,
        quantite: rotation.quantite,
        navire: rotation.navire || 'MV-BRIALLANCE', // Récupération du navire existant
        [type === 'entrantes' ? 'date_arrivee' : 'date_sortie']: 
          (type === 'entrantes' ? rotation.date_arrivee : rotation.date_sortie).slice(0, 16)
      });
    }
  }, [rotation, type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-6 text-white flex justify-between items-center ${type === 'entrantes' ? 'bg-buttonGradientPrimary' : 'bg-orange-600'}`}>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6" />
            <h2 className="text-lg font-bold">
              {rotation ? "Modifier Rotation" : (type === 'entrantes' ? "Nouvelle Entrée" : "Nouvelle Sortie")}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Client Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Client</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <select 
                required 
                value={formData.client_id} 
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-medium appearance-none"
              >
                <option value="">Choisir un client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Material Selection */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Type de Matériel</label>
                <select 
                required 
                value={formData.type_materiel_id} 
                onChange={(e) => setFormData({...formData, type_materiel_id: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-medium"
                >
                <option value="">Choisir...</option>
                {typesMateriel.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
                </select>
            </div>
            {/* Navire Selection/Input */}
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Navire</label>
                <div className="relative">
                    <Ship className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                    <input 
                        required 
                        type="text" 
                        placeholder="Nom du navire"
                        value={formData.navire} 
                        onChange={(e) => setFormData({...formData, navire: e.target.value})} 
                        className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 font-medium" 
                    />
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">N° Bordereau</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.numero_bordereau} onChange={(e) => setFormData({...formData, numero_bordereau: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Quantité</label>
              <input required type="number" value={formData.quantite} onChange={(e) => setFormData({...formData, quantite: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Camion</label>
              <div className="relative">
                <Truck className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input required type="text" value={formData.camion} onChange={(e) => setFormData({...formData, camion: e.target.value})} className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">
                {type === 'entrantes' ? "Date d'arrivée" : "Date de sortie"}
              </label>
              <input 
                required 
                type="datetime-local" 
                value={type === 'entrantes' ? formData.date_arrivee : formData.date_sortie} 
                onChange={(e) => setFormData({...formData, [type === 'entrantes' ? 'date_arrivee' : 'date_sortie']: e.target.value})} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-indigo-500" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Observations</label>
            <div className="relative">
              <Info className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <textarea 
                value={formData.observation} 
                onChange={(e) => setFormData({...formData, observation: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none min-h-[60px] focus:border-indigo-500" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">Annuler</button>
            <button type="submit" className={`flex-1 px-6 py-3.5 text-white rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${type === 'entrantes' ? 'bg-buttonGradientPrimary' : 'bg-orange-600'}`}>
              <Save className="w-4 h-4" /> Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RotationModal;