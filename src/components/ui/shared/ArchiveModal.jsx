import { useState } from 'react';
import { X, Upload, FileText, Info, Tag, HardDrive } from 'lucide-react';
import { api } from "@/lib/api";
import toast from 'react-hot-toast';

function ArchiveModal({ onClose, onSave }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type_doc: 'PDF',
    fichier: null
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. On vérifie qu'on a bien un objet File
  if (!formData.fichier) {
    return toast.error("Veuillez sélectionner un fichier sur votre disque");
  }

  // 2. On utilise FormData pour envoyer du binaire
  const data = new FormData();
  data.append('titre', formData.titre);
  data.append('description', formData.description);
  data.append('type_doc', formData.type_doc);
  
  // C'est ici que ça se joue : formData.fichier doit être l'objet issu de l'input type="file"
  data.append('fichier', formData.fichier); 

  try {
    setLoading(true);
    // 3. Envoi au serveur
    await api.post('archives/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    toast.success("Document stocké avec succès");
    onSave();
  } catch (error) {
    toast.error("Erreur lors du transfert");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 font-bold">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-8 border-b flex justify-between items-center bg-buttonGradientSecondary text-white">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tighter flex items-center gap-2">
              <HardDrive className="w-6 h-6" /> Nouveau Document
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3"/> Titre du document *
            </label>
            <input 
              type="text" 
              required
              value={formData.titre}
              onChange={(e) => setFormData({...formData, titre: e.target.value})}
              className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl focus:border-buttonGradientPrimary/20 focus:bg-white outline-none transition-all"
              placeholder="Ex: Facture Logistique Janvier 2026"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Tag className="w-3 h-3"/> Type de document
              </label>
              <select 
                value={formData.type_doc}
                onChange={(e) => setFormData({...formData, type_doc: e.target.value})}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 border-gray-50"
              >
                <option value="IMAGE">Image</option>
                <option value="BL">BL</option>
                <option value="MANIFESTE">MANIFESTE</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3 h-3"/> Fichier *
              </label>
              <label className="w-full flex items-center justify-center p-4 bg-indigo-50 text-buttonGradientSecondary rounded-2xl border-2 border-dashed border-indigo-200 cursor-pointer hover:bg-indigo-100 transition-all">
                <Upload className="w-5 h-5 mr-2" />
                <span className="text-xs font-bold uppercase truncate">
                  {formData.fichier ? formData.fichier.name : "Choisir"}
                </span>
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => setFormData({...formData, fichier: e.target.files[0]})}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Description (Optionnel)
            </label>
            <textarea 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-4 bg-gray-50 border-2 border-gray-50 rounded-2xl h-24 outline-none focus:border-buttonGradientPrimary/20"
              placeholder="Notes complémentaires sur le document..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-4 font-bold text-gray-400 uppercase text-xs tracking-widest hover:text-gray-600"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-buttonGradientSecondary shadow-xl disabled:opacity-50 transition-all"
            >
              {loading ? "En cours..." : "Lancer l'archivage"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ArchiveModal;