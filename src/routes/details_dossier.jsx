import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Printer, Download, Camera, RefreshCw, Plus, ArrowLeft, X, ZoomIn, ZoomOut, Maximize2, Upload } from 'lucide-react';
import { aLeRole } from '@/lib/utils';

const DetailsDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dossier, setDossier] = useState(null);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [etapeLoading, setEtapeLoading] = useState(false);

  // États pour le modal PDF
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [currentPdf, setCurrentPdf] = useState(null);
  const [pdfScale, setPdfScale] = useState(1);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const iframeRef = useRef(null);

  // États pour ajouter des pièces
  const [showScanModal, setShowScanModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scannerError, setScannerError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [titrePiece, setTitrePiece] = useState('');
  const [savingPiece, setSavingPiece] = useState(false);
  const fileInputRef = useRef(null);


   // États pour le modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const API_URL = 'http://127.0.0.1:8000/api';

  const getAuthToken = () => {
    return localStorage.getItem('token') || '';
  };

  const fetchDossierDetails = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const response = await fetch(`${API_URL}/dossiers/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      setDossier(data);
      setPiecesJointes(data.pieces || []);
      
    } catch (err) {
      console.error('Erreur lors de la récupération du dossier:', err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDossierDetails();
    }
  }, [id]);

  const handleView = async (piece) => {
    if (piece.path) {
      setLoadingPdf(true);
      setShowPdfModal(true);
      setCurrentPdf({
        titre: piece.titre,
        path: piece.path
      });
      
      try {
        // Télécharger le PDF avec authentification
        const response = await fetch(`http://127.0.0.1:8000${piece.path}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du PDF');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPdfBlob(url);
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du fichier');
        setShowPdfModal(false);
      } finally {
        setLoadingPdf(false);
      }
      
      setPdfScale(1);
    }
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
    setCurrentPdf(null);
    setPdfScale(1);
    
    // Libérer la mémoire du blob
    if (pdfBlob) {
      URL.revokeObjectURL(pdfBlob);
      setPdfBlob(null);
    }
  };

  const handlePrintFromModal = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleFullscreen = () => {
    if (iframeRef.current) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      }
    }
  };

  const handleDownload = async (piece) => {
    if (piece.path) {
      try {
        const response = await fetch(`http://127.0.0.1:8000${piece.path}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors du téléchargement');
        }
        
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = piece.titre;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      } catch (error) {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du fichier');
      }
    }
  };

  // const handleCapture = () => {
  //   console.log('Capturer nouvelle pièce');
  // };

  // const handleRefresh = () => {
  //   fetchDossierDetails();
  // };

  // const handleAddPiece = () => {
  //   console.log('Ajouter pièce jointe');
  // };


  // Add these functions after the existing functions in your component:

// Handle file selection for upload
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    setUploadedFile(file);
    setTitrePiece('');
    
    // Generate preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  }
};

// Nouvelle fonction pour scanner physique
const handleScan = async () => {
  try {
    setScanning(true);
    setScannerError(null);
    
    // Méthode 1: Dialogue natif "Ouvrir avec" du navigateur (recommandé)
    // Cela ouvre le dialogue système qui détecte automatiquement les scanners
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.capture = 'environment'; // Optimisé pour scanner
    
    // Écouter la sélection
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        setUploadedFile(file);
        setTitrePiece(`Document scanné - ${file.name}`);
        
        // Preview pour les images
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e) => setPreviewUrl(e.target.result);
          reader.readAsDataURL(file);
        }
        
        setScanning(false);
      }
    };
    
    // Trigger le dialogue (simule un scan)
    input.click();
    
  } catch (error) {
    console.error('Erreur scanner:', error);
    setScannerError('Erreur lors du scan. Vérifiez que votre scanner est connecté.');
    setScanning(false);
  }
};


// Fonction avancée pour scanner USB (optionnel)
const handleScanWebUSB = async () => {
  try {
    setScanning(true);
    setScannerError(null);
    
    if (!navigator.usb) {
      throw new Error('WebUSB non supporté par ce navigateur');
    }
    
    // Demander l'accès au scanner
    const device = await navigator.usb.requestDevice({
      filters: [{ vendorId: 0x04A9 }] // Exemple pour un scanner Brother
    });
    
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);
    
    // Ici vous devriez implémenter le protocole spécifique du scanner
    // Cet exemple est simplifié - chaque scanner a son propre protocole
    
    setScannerError('Scanner détecté ! Protocole spécifique requis.');
    setScanning(false);
    
  } catch (error) {
    console.error('Erreur WebUSB:', error);
    // Fallback vers le dialogue natif
    handleScan();
  }
};



// Save piece jointe to backend
const handleSavePiece = async (file) => {
  if (!titrePiece.trim()) {
    alert('Le titre est obligatoire');
    return;
  }

  const formData = new FormData();
  formData.append('fichier', file);
  formData.append('titre', titrePiece);
  formData.append('dossier', id);

  try {
    setSavingPiece(true);

    const response = await fetch(`${API_URL}/pieces/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de l\'ajout de la pièce');
    }

    const newPiece = await response.json();
    
    // Add to local state immediately
    setPiecesJointes(prev => [newPiece, ...prev]);
    
    // Reset modal states
    setUploadedFile(null);
    setPreviewUrl(null);
    setTitrePiece('');
    
    if (showScanModal) setShowScanModal(false);
    if (showUploadModal) setShowUploadModal(false);
    
    alert('Pièce jointe ajoutée avec succès !');
    
  } catch (error) {
    console.error('Erreur sauvegarde pièce:', error);
    alert(`Erreur: ${error.message}`);
  } finally {
    setSavingPiece(false);
  }
};

// Update the button handlers
const handleCapture = () => {
  setShowScanModal(true);
  setUploadedFile(null);
  setPreviewUrl(null);
  setTitrePiece('');
  setScannerError(null);
};

const handleAddPiece = () => {
  setShowUploadModal(true);
  setUploadedFile(null);
  setPreviewUrl(null);
  setTitrePiece('');
};


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} - ${month} - ${year}`;
  };

  const formatEtape = (etape) => {
    const etapes = {
      'consultation': 'Consultation',
      'validation': 'Validation',
      'archive_temporaire': 'Archive temporaire',
      'archive_physique': 'Archive physique',
      'archive_final': 'Archive final',
      'archive_finale': 'Archive finale'
    };
    return etapes[etape] || etape;
  };

  const getEtapeSuivante = (etapeActuelle) => {
    const ordreEtapes = [
      'numerisation',
      'validation',
      'archive_temporaire',
      'archive_physique',
      'archive_final',
      'archive_finale'
    ];
    
    const indexActuel = ordreEtapes.indexOf(etapeActuelle);
    
    if (indexActuel === -1 || indexActuel === ordreEtapes.length - 1) {
      return null;
    }
    
    return ordreEtapes[indexActuel + 1];
  };

  const getEtapePrecedente = (etapeActuelle) => {
    const ordreEtapes = [
      'numerisation',
      'validation',
      'archive_temporaire',
      'archive_physique',
      'archive_final',
      'archive_finale'
    ];
    
    const indexActuel = ordreEtapes.indexOf(etapeActuelle);
    
    if (indexActuel === -1 || indexActuel === 0) {
      return null;
    }
    
    return ordreEtapes[indexActuel - 1];
  };

  const changerEtape = async (nouvelleEtape, direction) => {
    try {
      setEtapeLoading(true);

      if (nouvelleEtape === 'archive_temporaire') {
        // Vérifier que le dossier a un type
        if (!dossier.type) {
          throw new Error('Le dossier doit avoir un type pour être archivé');
        }

        // 1. Obtenir ou créer une boîte pour ce type
        const boiteResponse = await fetch(`${API_URL}/boites/obtenir-ou-creer/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            type_id: dossier.type
          })
        });

        if (!boiteResponse.ok) {
          throw new Error('Erreur lors de l\'obtention d\'une boîte');
        }

        const boiteData = await boiteResponse.json();

        // 2. Assigner le dossier à la boîte
        const assignerResponse = await fetch(`${API_URL}/boites/assigner/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            boite_id: boiteData.id,
            dossier_ids: [parseInt(id)]
          })
        });

        if (!assignerResponse.ok) {
          throw new Error('Erreur lors de l\'assignation à la boîte');
        }
      }

      // 3. Changer l'étape du dossier
      const response = await fetch(`${API_URL}/dossiers/${id}/etape/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          etape: nouvelleEtape
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement d\'étape');
      }

      await fetchDossierDetails();

      if (nouvelleEtape === 'archive_temporaire') {
        alert(`Le dossier est maintenant à l'étape "${formatEtape(nouvelleEtape)}" et a été assigné à une boîte d'archive.`);
      } else {
        alert(`Le dossier est maintenant à l'étape "${formatEtape(nouvelleEtape)}"`);
      }

    } catch (err) {
      console.error('Erreur lors du changement d\'étape:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setEtapeLoading(false);
    }
  };

  const handlePasserEtapeSuivante = () => {
    const etapeSuivante = getEtapeSuivante(dossier.etape);
    if (etapeSuivante) {
      setConfirmAction({
        type: 'suivante',
        etape: etapeSuivante,
        message: `Voulez-vous faire passer ce dossier de "${formatEtape(dossier.etape)}" vers "${formatEtape(etapeSuivante)}" ?`
      });
      setShowConfirmModal(true);
    }
  };

  const handleRetourEtapePrecedente = () => {
    const etapePrecedente = getEtapePrecedente(dossier.etape);
    if (etapePrecedente) {
      setConfirmAction({
        type: 'precedente',
        etape: etapePrecedente,
        message: `Voulez-vous retourner ce dossier de "${formatEtape(dossier.etape)}" à "${formatEtape(etapePrecedente)}" ?`
      });
      setShowConfirmModal(true);
    }
  };

    const confirmerChangementEtape = () => {
    if (confirmAction) {
      changerEtape(confirmAction.etape, confirmAction.type);
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const annulerChangementEtape = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
  };


  

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 mb-4">Erreur: {errorMsg}</p>
          <button
            onClick={fetchDossierDetails}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Dossier introuvable</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate('/dossiers')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux dossiers</span>
        </button>
        
        {/* Informations du dossier */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Informations du dossier</h2>
            <div className="flex gap-3">
              {( ((aLeRole("validation") || window.localStorage.getItem("role") === "super-admin")) && getEtapePrecedente(dossier.etape)) ? (
                <button
                  onClick={handleRetourEtapePrecedente}
                  disabled={etapeLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {etapeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                      </svg>
                      <span>Retour étape précédente</span>
                    </>
                  )}
                </button>
              ) : <></>}

              {( ((aLeRole("validation") || window.localStorage.getItem("role") === "super-admin") || (aLeRole('numerisation') && dossier.etape == 'numerisation')) && getEtapeSuivante(dossier.etape)) ? (
                <button
                  onClick={handlePasserEtapeSuivante}
                  disabled={etapeLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {etapeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <span>Passer à l'étape suivante</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              ) : <></>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Numéro</h3>
              <p className="text-sm text-gray-700">{dossier.numero}</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Titre</h3>
              <p className="text-sm text-gray-700">{dossier.titre}</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Type</h3>
              <p className="text-sm text-gray-700">{dossier.type_info?.nom || 'N/A'}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-4">
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Date de création</h3>
              <p className="text-sm text-gray-700">{formatDate(dossier.date_creation)}</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Étape</h3>
              <p className="text-sm text-gray-700">{formatEtape(dossier.etape)}</p>
            </div>
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-2">Libellé</h3>
              <p className="text-sm text-gray-700">{dossier.libelle || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Pièces jointes</h2>
              <div className="flex gap-3">
                <button
                  onClick={handleCapture}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Capturer"
                >
                  <Camera className="w-5 h-5 text-gray-600" />
                </button>
                {/* <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Rafraîchir"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button> */}
                <button
                  onClick={handleAddPiece}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Ajouter"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">#</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Nom du fichier</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Date de création</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {piecesJointes.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Aucune pièce jointe
                    </td>
                  </tr>
                ) : (
                  piecesJointes.map((piece, index) => (
                    <tr key={piece.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{piece.titre}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{formatDate(piece.date_creation)}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(piece)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-buttonGradientPrimary"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(piece)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                            title="Télécharger"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>


            {/* Modal de confirmation de changement d'étape */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-full ${
                  confirmAction.type === 'suivante' ? 'bg-green-100' : 'bg-orange-100'
                }`}>
                  {confirmAction.type === 'suivante' ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmation de changement d'étape
                </h3>
              </div>
              
              <p className="text-gray-700 mb-6">
                {confirmAction.message}
              </p>

              {confirmAction.etape === 'archive_temporaire' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Note :</strong> Le dossier sera automatiquement assigné à une boîte d'archive appropriée pour son type.
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={annulerChangementEtape}
                  disabled={etapeLoading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmerChangementEtape}
                  disabled={etapeLoading}
                  className={`px-6 py-2 text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 ${
                    confirmAction.type === 'suivante' 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-orange-500 hover:bg-orange-600'
                  }`}
                >
                  {etapeLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Traitement...</span>
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal PDF Viewer */}
      {showPdfModal && currentPdf && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Header du modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-800">{currentPdf.titre}</h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom arrière"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-600 px-2">
                  {Math.round(pdfScale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Zoom avant"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                <button
                  onClick={handleFullscreen}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Plein écran"
                >
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={handlePrintFromModal}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Imprimer"
                >
                  <Printer className="w-5 h-5 text-gray-600" />
                </button>
                
                <button
                  onClick={handleDownload(piece => currentPdf)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                
                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                
                <button
                  onClick={handleClosePdfModal}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  title="Fermer"
                >
                  <X className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>

            {/* Viewer PDF */}
            <div className="flex-1 overflow-auto bg-gray-100 p-4">
              {loadingPdf ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du document...</p>
                  </div>
                </div>
              ) : pdfBlob ? (
                <div 
                  className="mx-auto bg-white shadow-lg"
                  style={{
                    transform: `scale(${pdfScale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease'
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    src={pdfBlob}
                    className="w-full h-screen border-0"
                    title={currentPdf?.titre}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Impossible de charger le document</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Scanner */}
      {showScanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Scanner un document</h2>
              <button
                onClick={() => setShowScanModal(false)}
                disabled={scanning || savingPiece}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Message d'erreur du scanner */}
              {scannerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{scannerError}</p>
                    <p className="text-xs text-red-600 mt-1">
                      Veuillez vérifier que votre scanner est bien connecté et allumé.
                    </p>
                  </div>
                </div>
              )}

              {/* Zone de scan */}
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">Scannez votre document</p>
                    <button
                      type="button"
                      onClick={handleScan}
                      disabled={scanning}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {scanning ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Recherche du scanner...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5" />
                          Lancer le scan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Fichier scanné */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    {previewUrl && (
                      <div className="mt-3">
                        <img 
                          src={previewUrl} 
                          alt="Aperçu" 
                          className="max-h-48 mx-auto rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Titre */}
                  <div>
                    <label htmlFor="titre-scan" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du document <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="titre-scan"
                      type="text"
                      value={titrePiece}
                      onChange={(e) => setTitrePiece(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ex: Contrat signé"
                      required
                    />
                  </div>
                </>
              )}

              {/* Actions */}
              {uploadedFile && (
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowScanModal(false)}
                    disabled={savingPiece}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSavePiece(uploadedFile)}
                    disabled={savingPiece || !titrePiece.trim()}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {savingPiece ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Ajout en cours...
                      </>
                    ) : (
                      'Ajouter la pièce'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Ajouter une pièce jointe</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={savingPiece}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Zone d'upload */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf, .word, .doc, .docx, .ppt, .pptx"
                className="hidden"
              />

              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-center">
                    <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-4">
                      Sélectionnez un fichier depuis votre ordinateur
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Upload className="w-5 h-5" />
                      Choisir un fichier
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Formats acceptés : PDF, Word, Images (JPG, PNG, etc.)
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Fichier sélectionné */}
                  <div className="border border-gray-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedFile(null);
                          setPreviewUrl(null);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    {previewUrl && (
                      <div className="mt-3">
                        <img 
                          src={previewUrl} 
                          alt="Aperçu" 
                          className="max-h-48 mx-auto rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  {/* Titre */}
                  <div>
                    <label htmlFor="titre-upload" className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du document <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="titre-upload"
                      type="text"
                      value={titrePiece}
                      onChange={(e) => setTitrePiece(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Ex: Facture proforma"
                      required
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      disabled={savingPiece}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSavePiece(uploadedFile)}
                      disabled={savingPiece || !titrePiece.trim()}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-buttonGradientPrimary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {savingPiece ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Ajout en cours...
                        </>
                      ) : (
                        'Ajouter la pièce'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { DetailsDossier };