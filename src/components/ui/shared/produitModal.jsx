import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

function ProduitModal({ produit, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nom: '',
    quantite: 0,
    camion: '',
    statut: 'arrive',
    date_arrivee: new Date().toISOString().slice(0, 16),
    date_sortie: '' // Initialisé à vide
  });

  useEffect(() => {
    if (produit) {
      setFormData({
        ...produit,
        date_arrivee: produit.date_arrivee ? produit.date_arrivee.slice(0, 16) : '',
        date_sortie: produit.date_sortie ? produit.date_sortie.slice(0, 16) : ''
      });
    }
  }, [produit]);

  // Fonction pour gérer le changement de statut
  const handleStatutChange = (e) => {
    const nouveauStatut = e.target.value;
    let nouvelleDateSortie = formData.date_sortie;

    // Si on passe en "sortie" et qu'aucune date n'est définie, on met la date actuelle
    if (nouveauStatut === 'sortie' && !nouvelleDateSortie) {
      nouvelleDateSortie = new Date().toISOString().slice(0, 16);
    } 
    // Si on repasse en "arrivé", on peut vider la date de sortie
    else if (nouveauStatut === 'arrive') {
      nouvelleDateSortie = '';
    }

    setFormData({
      ...formData,
      statut: nouveauStatut,
      date_sortie: nouvelleDateSortie
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // On prépare les données : si statut est 'arrive', on envoie null pour date_sortie
    const payload = {
      ...formData,
      date_sortie: formData.statut === 'sortie' ? formData.date_sortie : null
    };
    
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">
            {produit ? "Modifier le produit" : "Ajouter un produit"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* ... (champs Nom et Quantité identiques au précédent) ... */}
          <div>
            <label className="block text-sm font-medium mb-1">Nom du produit</label>
            <input
              required
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData({...formData, nom: e.target.value})}
              className="w-full p-2 border rounded-lg outline-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Statut</label>
              <select
                value={formData.statut}
                onChange={handleStatutChange}
                className="w-full p-2 border rounded-lg outline-blue-500 bg-gray-50"
              >
                <option value="arrive">Arrivé</option>
                <option value="sortie">Sorti</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantité</label>
              <input
                required
                type="number"
                value={formData.quantite}
                onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                className="w-full p-2 border rounded-lg outline-blue-500"
              />
            </div>
          </div>

          {/* Date de sortie conditionnelle */}
          {formData.statut === 'sortie' && (
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 animate-in fade-in duration-300">
              <label className="block text-sm font-medium text-orange-800 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Date de sortie obligatoire
              </label>
              <input
                required
                type="datetime-local"
                value={formData.date_sortie}
                onChange={(e) => setFormData({...formData, date_sortie: e.target.value})}
                className="w-full p-2 border border-orange-300 rounded-lg outline-orange-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Camion / Référence</label>
            <input
              required
              type="text"
              value={formData.camion}
              onChange={(e) => setFormData({...formData, camion: e.target.value})}
              className="w-full p-2 border rounded-lg outline-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-600">Date d'arrivée</label>
            <input
              required
              type="datetime-local"
              value={formData.date_arrivee}
              onChange={(e) => setFormData({...formData, date_arrivee: e.target.value})}
              className="w-full p-2 border rounded-lg outline-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-buttonGradientPrimary text-white rounded-lg hover:bg-buttonGradientSecondary font-bold">
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProduitModal;