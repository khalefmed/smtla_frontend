import { useState, useEffect } from 'react';
import { X, Package, AlignLeft, Save } from 'lucide-react';

function TypeMaterielModal({ typeMateriel, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: '',
    description: ''
  });

  useEffect(() => {
    if (typeMateriel) {
      setFormData({
        nom: typeMateriel.nom || '',
        description: typeMateriel.description || ''
      });
    }
  }, [typeMateriel]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {typeMateriel ? "Modifier le matériel" : "Nouveau matériel"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nom du matériel */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
              Nom du matériel / Équipement
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                required 
                type="text" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all" 
                placeholder="Ex: Conteneur 20 pieds, Grue mobile..."
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
              Description (Optionnel)
            </label>
            <div className="relative">
              <AlignLeft className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <textarea 
                rows="4"
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all resize-none" 
                placeholder="Précisions techniques ou usage..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3 bg-buttonGradientSecondary text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {typeMateriel ? "Mettre à jour" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TypeMaterielModal;