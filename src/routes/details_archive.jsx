import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, Printer, Download, Camera, RefreshCw, Plus, ArrowLeft, Package, ArrowRight } from 'lucide-react';

const DetailsArchive = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [dossier, setDossier] = useState(null);
  const [piecesJointes, setPiecesJointes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [desarchivageLoading, setDesarchivageLoading] = useState(false);
  const [etapeLoading, setEtapeLoading] = useState(false);

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

  const handleView = (piece) => {
    if (piece.path) {
      window.open(piece.path, '_blank');
    }
  };

  const handlePrint = (piece) => {
    if (piece.path) {
      const printWindow = window.open(piece.path, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  const handleDownload = (piece) => {
    if (piece.path) {
      const link = document.createElement('a');
      link.href = piece.path;
      link.download = piece.titre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCapture = () => {
    console.log('Capturer nouvelle pièce');
  };

  const handleRefresh = () => {
    fetchDossierDetails();
  };

  const handleAddPiece = () => {
    console.log('Ajouter pièce jointe');
  };

  const handleDesarchiver = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désarchiver ce dossier ? Il sera retiré de sa boîte et son étape sera changée en "Validation".')) {
      return;
    }

    try {
      setDesarchivageLoading(true);

      // 1. Retirer le dossier de la boîte
      const retirerResponse = await fetch(`${API_URL}/boites/retirer/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          dossier_ids: [parseInt(id)]
        })
      });

      if (!retirerResponse.ok) {
        throw new Error('Erreur lors du retrait de la boîte');
      }

      // 2. Changer l'étape du dossier à "validation"
      const etapeResponse = await fetch(`${API_URL}/dossiers/${id}/etape/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          etape: 'validation'
        })
      });

      if (!etapeResponse.ok) {
        throw new Error('Erreur lors du changement d\'étape');
      }

      // 3. Rafraîchir les données du dossier
      await fetchDossierDetails();

      // 4. Afficher un message de succès
      alert('Dossier désarchivé avec succès ! Il a été retiré de la boîte et son étape a été changée en "Validation".');

      // 5. Optionnel : Rediriger vers la page des dossiers en validation
      // navigate('/dossiers');

    } catch (err) {
      console.error('Erreur lors du désarchivage:', err);
      alert(`Erreur lors du désarchivage: ${err.message}`);
    } finally {
      setDesarchivageLoading(false);
    }
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
      'numerisation': 'Numérisation',
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
      return null; // Pas d'étape suivante
    }
    
    return ordreEtapes[indexActuel + 1];
  };

  const handlePasserEtapeSuivante = async () => {
    const etapeSuivante = getEtapeSuivante(dossier.etape);
    
    if (!etapeSuivante) {
      alert('Ce dossier est déjà à la dernière étape.');
      return;
    }

    if (!window.confirm(`Voulez-vous faire passer ce dossier de "${formatEtape(dossier.etape)}" à "${formatEtape(etapeSuivante)}" ?`)) {
      return;
    }

    try {
      setEtapeLoading(true);

      const response = await fetch(`${API_URL}/dossiers/${id}/etape/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          etape: etapeSuivante
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors du changement d\'étape');
      }

      // Rafraîchir les données
      await fetchDossierDetails();

      alert(`Le dossier est maintenant à l'étape "${formatEtape(etapeSuivante)}"`);

    } catch (err) {
      console.error('Erreur lors du changement d\'étape:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setEtapeLoading(false);
    }
  };

  const getTauxRemplissage = (boite) => {
    if (!boite) return 0;
    return boite.nombre_dossiers && boite.taille 
      ? Math.round((boite.nombre_dossiers / boite.taille) * 100) 
      : 0;
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
          onClick={() => navigate('/archives')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour aux archives</span>
        </button>
        
        {/* Informations du dossier */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Informations du dossier</h2>
            {/* {getEtapeSuivante(dossier.etape) && (
              dossier.etape !== 'archive_final' && (<button
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
                   (<>
                    <span>Passer à "{formatEtape(getEtapeSuivante(dossier.etape))}"</span>
                    <ArrowRight className="w-4 h-4" />
                  </>)
                )}
              </button>)
            )} */}
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
              <p className="text-sm text-gray-700">{dossier.type || 'N/A'}</p>
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

        {/* Informations de la boîte d'archive */}
        {dossier.boite && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-buttonGradientPrimary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Boîte d'archive</h2>
                  <button
                    onClick={handleDesarchiver}
                    disabled={desarchivageLoading}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {desarchivageLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Désarchivage...</span>
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4" />
                        <span>Désarchiver</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Référence</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      Boîte {dossier.boite.reference}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Capacité</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {dossier.boite.taille} dossiers
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Remplissage</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      {dossier.boite.nombre_dossiers || 0}/{dossier.boite.taille}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Taux</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-buttonGradientPrimary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getTauxRemplissage(dossier.boite)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">
                        {getTauxRemplissage(dossier.boite)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message si pas de boîte */}
        {!dossier.boite && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Ce dossier n'est pas encore assigné à une boîte d'archive.
              </p>
            </div>
          </div>
        )}

        {/* Pièces jointes */}
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
                <button
                  onClick={handleRefresh}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Rafraîchir"
                >
                  <RefreshCw className="w-5 h-5 text-gray-600" />
                </button>
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
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Voir"
                          >
                            <Eye className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handlePrint(piece)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Imprimer"
                          >
                            <Printer className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDownload(piece)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download className="w-5 h-5 text-gray-600" />
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
    </div>
  );
};

export { DetailsArchive };