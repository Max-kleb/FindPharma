// src/pages/AdminPendingPharmacies.js
/**
 * Page d'administration pour la validation des pharmacies en attente
 * Interface professionnelle avec statistiques et actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  getPendingPharmacies, 
  approvePharmacy, 
  rejectPharmacy,
  getPharmacyRegistrationStats 
} from '../services/api';
import './AdminPendingPharmacies.css';

export default function AdminPendingPharmacies() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [pharmacies, setPharmacies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal de rejet
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Modal de détails
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsPharmacy, setDetailsPharmacy] = useState(null);

  // Charger les données
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [pharmaciesData, statsData] = await Promise.all([
        getPendingPharmacies(),
        getPharmacyRegistrationStats()
      ]);
      setPharmacies(pharmaciesData);
      setStats(statsData);
    } catch (err) {
      console.error('Erreur chargement:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Approuver une pharmacie
  const handleApprove = async (pharmacy) => {
    if (!window.confirm(`Approuver "${pharmacy.name}" ?`)) return;
    
    setIsProcessing(true);
    try {
      await approvePharmacy(pharmacy.id);
      // Retirer de la liste
      setPharmacies(prev => prev.filter(p => p.id !== pharmacy.id));
      // Mettre à jour les stats
      setStats(prev => prev ? {
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      } : prev);
      
      // Notification
      alert(`✅ La pharmacie "${pharmacy.name}" a été approuvée !`);
    } catch (err) {
      console.error('Erreur approbation:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Ouvrir modal de rejet
  const openRejectModal = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // Confirmer le rejet
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Veuillez indiquer un motif de refus');
      return;
    }

    setIsProcessing(true);
    try {
      await rejectPharmacy(selectedPharmacy.id, rejectReason);
      // Retirer de la liste
      setPharmacies(prev => prev.filter(p => p.id !== selectedPharmacy.id));
      // Mettre à jour les stats
      setStats(prev => prev ? {
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      } : prev);
      
      setShowRejectModal(false);
      alert(`❌ La demande de "${selectedPharmacy.name}" a été rejetée.`);
    } catch (err) {
      console.error('Erreur rejet:', err);
      alert(`Erreur: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Afficher les détails
  const showDetails = (pharmacy) => {
    setDetailsPharmacy(pharmacy);
    setShowDetailsModal(true);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-pending-page">
        <div className="loading-container">
          <div className="loading-spinner">⏳</div>
          <p>Chargement des demandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-pending-page">
        <div className="error-container">
          <div className="error-icon">❌</div>
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">
            🔄 Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-pending-page">
      <div className="admin-pending-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1>
              <span className="header-icon">📋</span>
              Pharmacies en attente
            </h1>
            <p>Validez ou rejetez les demandes d'inscription des pharmacies</p>
          </div>
          <button onClick={() => navigate('/admin')} className="back-btn">
            ← Retour
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card pending">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">En attente</span>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <span className="stat-value">{stats.approved}</span>
                <span className="stat-label">Approuvées</span>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon">❌</div>
              <div className="stat-info">
                <span className="stat-value">{stats.rejected}</span>
                <span className="stat-label">Refusées</span>
              </div>
            </div>
            <div className="stat-card total">
              <div className="stat-icon">🏥</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total_pharmacies}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>
          </div>
        )}

        {/* Liste des pharmacies en attente */}
        <div className="pharmacies-list">
          {pharmacies.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h2>Aucune demande en attente</h2>
              <p>Toutes les demandes ont été traitées.</p>
            </div>
          ) : (
            pharmacies.map((pharmacy) => (
              <div key={pharmacy.id} className="pharmacy-card">
                <div className="pharmacy-header">
                  <div className="pharmacy-name">
                    <span className="pharmacy-icon">🏥</span>
                    <h3>{pharmacy.name}</h3>
                  </div>
                  <span className="status-badge pending">En attente</span>
                </div>

                <div className="pharmacy-details">
                  <div className="detail-row">
                    <span className="detail-icon">📜</span>
                    <span className="detail-label">N° Agrément:</span>
                    <span className="detail-value">{pharmacy.license_number}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span className="detail-label">Adresse:</span>
                    <span className="detail-value">{pharmacy.address}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📞</span>
                    <span className="detail-label">Téléphone:</span>
                    <span className="detail-value">{pharmacy.phone}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">👤</span>
                    <span className="detail-label">Gérant:</span>
                    <span className="detail-value">
                      {pharmacy.manager_name || 'N/A'} ({pharmacy.manager_email || 'N/A'})
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-icon">📅</span>
                    <span className="detail-label">Soumis le:</span>
                    <span className="detail-value">{formatDate(pharmacy.submitted_at)}</span>
                  </div>
                </div>

                <div className="pharmacy-actions">
                  <button 
                    className="action-btn details"
                    onClick={() => showDetails(pharmacy)}
                  >
                    👁️ Détails
                  </button>
                  <button 
                    className="action-btn approve"
                    onClick={() => handleApprove(pharmacy)}
                    disabled={isProcessing}
                  >
                    ✅ Approuver
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => openRejectModal(pharmacy)}
                    disabled={isProcessing}
                  >
                    ❌ Rejeter
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && selectedPharmacy && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header reject">
              <h2>❌ Rejeter la demande</h2>
              <button 
                className="modal-close"
                onClick={() => setShowRejectModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>
                Vous êtes sur le point de rejeter la demande de{' '}
                <strong>{selectedPharmacy.name}</strong>.
              </p>
              
              <div className="form-group">
                <label htmlFor="rejectReason">
                  Motif du refus <span className="required">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Indiquez le motif du refus (sera communiqué au demandeur)..."
                  rows={4}
                />
              </div>
              
              <div className="modal-notice">
                <span>⚠️</span>
                <p>Un email sera envoyé au gérant avec le motif du refus.</p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowRejectModal(false)}
                disabled={isProcessing}
              >
                Annuler
              </button>
              <button 
                className="btn-confirm reject"
                onClick={handleReject}
                disabled={isProcessing || !rejectReason.trim()}
              >
                {isProcessing ? '⏳ Traitement...' : '❌ Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showDetailsModal && detailsPharmacy && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header details">
              <h2>🏥 {detailsPharmacy.name}</h2>
              <button 
                className="modal-close"
                onClick={() => setShowDetailsModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="details-grid">
                <div className="details-section">
                  <h3>📋 Informations Pharmacie</h3>
                  <div className="details-list">
                    <div className="details-item">
                      <span className="label">Nom</span>
                      <span className="value">{detailsPharmacy.name}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">N° Agrément</span>
                      <span className="value highlight">{detailsPharmacy.license_number}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Adresse</span>
                      <span className="value">{detailsPharmacy.address}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Téléphone</span>
                      <span className="value">{detailsPharmacy.phone}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Email</span>
                      <span className="value">{detailsPharmacy.email || 'Non renseigné'}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Position GPS</span>
                      <span className="value">
                        {detailsPharmacy.latitude?.toFixed(6)}, {detailsPharmacy.longitude?.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="details-section">
                  <h3>👤 Informations Gérant</h3>
                  <div className="details-list">
                    <div className="details-item">
                      <span className="label">Nom complet</span>
                      <span className="value">{detailsPharmacy.manager_name || 'N/A'}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Email</span>
                      <span className="value">{detailsPharmacy.manager_email || 'N/A'}</span>
                    </div>
                    <div className="details-item">
                      <span className="label">Téléphone</span>
                      <span className="value">{detailsPharmacy.manager_phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="details-section full-width">
                  <h3>🕐 Horaires d'ouverture</h3>
                  <div className="hours-display">
                    {detailsPharmacy.opening_hours && Object.keys(detailsPharmacy.opening_hours).length > 0 ? (
                      Object.entries(detailsPharmacy.opening_hours).map(([day, hours]) => (
                        <div key={day} className="hours-item">
                          <span className="day">{day}</span>
                          <span className="hours">{hours}</span>
                        </div>
                      ))
                    ) : (
                      <p className="no-hours">Horaires non renseignés</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Carte de localisation */}
              <div className="map-preview">
                <h3>📍 Localisation</h3>
                <div className="map-placeholder">
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${detailsPharmacy.latitude}&mlon=${detailsPharmacy.longitude}#map=17/${detailsPharmacy.latitude}/${detailsPharmacy.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    🗺️ Voir sur OpenStreetMap
                  </a>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowDetailsModal(false)}
              >
                Fermer
              </button>
              <button 
                className="btn-confirm approve"
                onClick={() => {
                  setShowDetailsModal(false);
                  handleApprove(detailsPharmacy);
                }}
              >
                ✅ Approuver
              </button>
              <button 
                className="btn-confirm reject"
                onClick={() => {
                  setShowDetailsModal(false);
                  openRejectModal(detailsPharmacy);
                }}
              >
                ❌ Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
