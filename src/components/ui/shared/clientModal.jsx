import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Hash } from 'lucide-react';

function ClientModal({ client, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    nif: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nom: client.nom,
        telephone: client.telephone,
        email: client.email,
        adresse: client.adresse,
        nif: client.nif
      });
    }
  }, [client]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-buttonGradientPrimary" />
            {client ? "Modifier la fiche client" : "Nouveau client"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Nom complet / Entreprise</label>
              <input
                required
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
                placeholder="Ex: SARL Global Services"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Numéro NIF</label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="text"
                  value={formData.nif}
                  onChange={(e) => setFormData({...formData, nif: e.target.value})}
                  className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
                  placeholder="N° d'identification"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Téléphone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                  className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Adresse</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <textarea
                required
                rows="3"
                value={formData.adresse}
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-buttonGradientPrimary outline-none"
                placeholder="Adresse complète du siège"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-gray-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary font-bold shadow-sm"
            >
              {client ? "Mettre à jour" : "Créer le client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ClientModal;