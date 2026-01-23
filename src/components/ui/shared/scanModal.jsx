import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Upload, AlertCircle } from 'lucide-react';

const ScanModal = ({ isOpen, onClose, onSave, typesDossiers = [] }) => {
  const [scannedFile, setScannedFile] = useState(null);
  const [titre, setTitre] = useState('');
  const [typeId, setTypeId] = useState('');
  const [libelle, setLibelle] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const fileInputRef = useRef(null);

  // Détecter et se connecter au scanner
  const detectScanner = async () => {
    try {
      // Vérifier si l'API Web Scanning est disponible (expérimental)
      if ('scanner' in navigator) {
        // API expérimentale pour scanner
        const scanner = await navigator.scanner.getDevices();
        return scanner.length > 0 ? scanner[0] : null;
      }
      
      // Sinon, essayer avec l'API TWAIN via une bibliothèque tierce
      // Ou utiliser une API backend pour communiquer avec le scanner
      
      // Pour la démo, on simule la recherche d'un scanner
      return null; // Pas de scanner détecté
      
    } catch (error) {
      console.error('Erreur lors de la détection du scanner:', error);
      return null;
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScannerError(null);
    
    try {
      // Essayer de détecter un scanner
      const scanner = await detectScanner();
      
      if (!scanner) {
        // Aucun scanner détecté
        setScannerError('Aucune machine de scan connectée');
        setScanning(false);
        
        // Fermer automatiquement l'erreur après 5 secondes
        setTimeout(() => {
          setScannerError(null);
        }, 5000);
        
        return;
      }
      
      // Si un scanner est détecté, lancer le scan
      // NOTE: Cette partie dépendra de votre implémentation réelle
      // Vous devrez peut-être utiliser une bibliothèque comme:
      // - Dynamic Web TWAIN
      // - Scanner.js
      // - Ou une API backend qui communique avec le scanner
      
      // Pour l'instant, on simule un scan
      alert('Scanner détecté ! Fonctionnalité de scan à implémenter avec votre driver.');
      
    } catch (error) {
      console.error('Erreur lors du scan:', error);
      setScannerError('Erreur lors de la connexion au scanner');
      
      setTimeout(() => {
        setScannerError(null);
      }, 5000);
    } finally {
      setScanning(false);
    }
  };

  const handleImport = () => {
    // Ouvrir le sélecteur de fichier pour importer depuis le PC
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScannedFile(file);
      
      // Créer une preview pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
      
      // Définir automatiquement le titre avec le nom du fichier
      if (!titre) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Enlever l'extension
        setTitre(fileName);
      }
    }
  };

//   const handleScan = () => {
//     // Simuler le scan en ouvrant le sélecteur de fichier
//     fileInputRef.current?.click();
//   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!scannedFile || !titre || !typeId || !libelle) {
      alert('Veuillez remplir tous les champs et scanner/sélectionner un document');
      return;
    }

    setLoading(true);
    
    try {
      await onSave({
        file: scannedFile,
        titre,
        type: typeId, // Envoyer l'ID du type
        libelle
      });
      
      // Réinitialiser le formulaire
      resetForm();
      onClose();
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setScannedFile(null);
    setTitre('');
    setTypeId('');
    setLibelle('');
    setPreviewUrl(null);
    setScannerError(null);
  };

  const handleClose = () => {
    if (!loading) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Scanner un document</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Message d'erreur du scanner */}
          {scannerError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {scannerError}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Veuillez vérifier que votre scanner est bien connecté et allumé, 
                  ou utilisez l'option "Importer" pour sélectionner un fichier depuis votre ordinateur.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setScannerError(null)}
                className="p-1 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {/* Zone de scan/upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document scanné
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf"
              className="hidden"
              aria-label="Sélectionner un fichier"
            />
            
            {!scannedFile ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Scannez ou importez votre document
                  </p>
                  <div className="flex gap-3 justify-center">
                    <button
                      type="button"
                      onClick={handleScan}
                      disabled={scanning}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {scanning ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Recherche...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4" />
                          Scanner
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleImport}
                      disabled={scanning}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      <Upload className="w-4 h-4" />
                      Importer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Scanner : Utilise un scanner physique connecté • Importer : Depuis votre ordinateur
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{scannedFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(scannedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScannedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    aria-label="Supprimer le fichier"
                  >
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                
                {/* Preview pour les images */}
                {previewUrl && (
                  <div className="mt-3">
                    <img 
                      src={previewUrl} 
                      alt="Aperçu du document" 
                      className="max-h-48 mx-auto rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Titre */}
          <div>
            <label htmlFor="titre" className="block text-sm font-medium text-gray-700 mb-2">
              Titre du document <span className="text-red-500">*</span>
            </label>
            <input
              id="titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Ex: Contrat d'adhésion"
              required
            />
          </div>

          {/* Type - Dynamique depuis le backend */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type de document <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            >
              <option value="">Sélectionnez un type</option>
              {typesDossiers.length > 0 ? (
                typesDossiers.map((typeDossier) => (
                  <option key={typeDossier.id} value={typeDossier.id}>
                    {typeDossier.nom}
                    {typeDossier.groupe_nom && ` (${typeDossier.groupe_nom})`}
                  </option>
                ))
              ) : (
                <option value="" disabled>Aucun type disponible</option>
              )}
            </select>
            {typesDossiers.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                Aucun type de dossier n'est disponible. Veuillez en créer un depuis l'administration.
              </p>
            )}
          </div>

          {/* Libellé */}
          <div>
            <label htmlFor="libelle" className="block text-sm font-medium text-gray-700 mb-2">
              Libellé / Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="libelle"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Description détaillée du document..."
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !scannedFile || !typeId}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Création en cours...
                </>
              ) : (
                'Créer le dossier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScanModal;