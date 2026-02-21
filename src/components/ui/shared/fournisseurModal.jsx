import { useState, useEffect } from 'react';
import { X, Building2, Phone, Mail, MapPin, Save, Globe } from 'lucide-react';

function FournisseurModal({ fournisseur, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: ''
  });

  useEffect(() => {
    if (fournisseur) {
      setFormData({
        nom: fournisseur.nom || '',
        telephone: fournisseur.telephone || '',
        email: fournisseur.email || '',
        adresse: fournisseur.adresse || ''
      });
    }
  }, [fournisseur]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5" />
            <h2 className="text-lg font-bold">
              {fournisseur ? "Modifier le fournisseur" : "Nouveau fournisseur"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Raison Sociale</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                required 
                type="text" 
                value={formData.nom} 
                onChange={(e) => setFormData({...formData, nom: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all font-medium" 
                placeholder="Nom de l'entreprise"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="tel" 
                  value={formData.telephone} 
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})} 
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all" 
                  placeholder="+222..."
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all" 
                  placeholder="contact@fournisseur.com"
                />
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase text-gray-400 tracking-widest ml-1">Adresse Siège</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={formData.adresse} 
                onChange={(e) => setFormData({...formData, adresse: e.target.value})} 
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-buttonGradientPrimary transition-all" 
                placeholder="Nouakchott, Mauritanie..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-3.5 bg-buttonGradientSecondary text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              {fournisseur ? "Mettre à jour" : "Créer le compte"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FournisseurModal;