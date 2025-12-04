// src/pages/MesReservationsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReservations, cancelReservation, getReservationDetails } from '../services/api';
import { useTranslation } from 'react-i18next';
import './MesReservationsPage.css';

function MesReservationsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadReservations();
  }, [token, filterStatus, navigate]);
  
  const loadReservations = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = filterStatus === 'all' ? null : filterStatus;
      const data = await getMyReservations(token, status);
      setReservations(data);
    } catch (err) {
      setError(t('reservations.loadError'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewDetails = async (reservationId) => {
    try {
      const details = await getReservationDetails(reservationId, token);
      setSelectedReservation(details);
    } catch (err) {
      // Erreur silencieuse
      console.error('Erreur détails réservation:', err);
    }
  };
  
  const handleCancelReservation = async (reservationId) => {
    const reason = prompt(t('reservations.cancelReason'));
    if (reason === null) return; // L'utilisateur a annulé
    
    try {
      await cancelReservation(reservationId, reason, token);
      // Pas de pop-up, rechargement direct
      loadReservations();
      setSelectedReservation(null);
    } catch (err) {
      // Erreur silencieuse
      console.error('Erreur annulation:', err);
    }
  };
  
  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { label: t('reservations.status.pending'), class: 'status-pending', icon: '⏳' },
      'confirmed': { label: t('reservations.status.confirmed'), class: 'status-confirmed', icon: '✓' },
      'ready': { label: t('reservations.status.ready'), class: 'status-ready', icon: '📦' },
      'collected': { label: t('reservations.status.collected'), class: 'status-collected', icon: '✅' },
      'cancelled': { label: t('reservations.status.cancelled'), class: 'status-cancelled', icon: '❌' },
      'expired': { label: t('reservations.status.expired'), class: 'status-expired', icon: '⌛' }
    };
    
    const config = statusConfig[status] || { label: status, class: '', icon: '?' };
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading && reservations.length === 0) {
    return (
      <div className="mes-reservations-page">
        <div className="loading-spinner">{t('common.loading')}</div>
      </div>
    );
  }
  
  return (
    <div className="mes-reservations-page">
      <div className="page-header">
        <h1>📋 {t('reservations.title')}</h1>
        <p>{t('myReservations.subtitle')}</p>
      </div>
      
      {/* Filtres */}
      <div className="filters-section">
        <label>{t('myReservations.filterByStatus')}:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">{t('myReservations.statusAll')}</option>
          <option value="pending">{t('reservations.status.pending')}</option>
          <option value="confirmed">{t('reservations.status.confirmed')}</option>
          <option value="ready">{t('reservations.status.ready')}</option>
          <option value="collected">{t('myReservations.statusCollected')}</option>
          <option value="cancelled">{t('reservations.status.cancelled')}</option>
          <option value="expired">{t('myReservations.statusExpired')}</option>
        </select>
        <button onClick={loadReservations} className="refresh-btn">
          🔄 {t('myReservations.refresh')}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Liste des réservations */}
      <div className="reservations-container">
        {reservations.length === 0 ? (
          <div className="empty-state">
            <p>📭 {t('reservations.noReservations')}</p>
            <button onClick={() => navigate('/dashboard')} className="cta-button">
              {t('myReservations.searchMedicines')}
            </button>
          </div>
        ) : (
          <div className="reservations-list">
            {reservations.map((reservation) => (
              <div 
                key={reservation.id} 
                className={`reservation-card ${selectedReservation?.id === reservation.id ? 'selected' : ''}`}
                onClick={() => handleViewDetails(reservation.id)}
              >
                <div className="reservation-header">
                  <span className="reservation-number">
                    #{reservation.reservation_number}
                  </span>
                  {getStatusBadge(reservation.status)}
                </div>
                
                <div className="reservation-body">
                  <p className="pharmacy-name">
                    📍 {reservation.pharmacy_name}
                  </p>
                  <p className="items-count">
                    🛒 {reservation.total_items} {t('myReservations.items')}
                  </p>
                  <p className="total-price">
                    💰 {parseFloat(reservation.total_price || 0).toLocaleString('fr-CM')} XAF
                  </p>
                </div>
                
                <div className="reservation-footer">
                  <span className="date">
                    📅 {formatDate(reservation.pickup_date)}
                  </span>
                  {reservation.is_cancellable && (
                    <button 
                      className="cancel-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelReservation(reservation.id);
                      }}
                    >
                      {t('reservations.cancel')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Panneau de détails */}
        {selectedReservation && (
          <div className="details-panel">
            <div className="details-header">
              <h2>{t('myReservations.reservationDetails')}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedReservation(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="details-content">
              <div className="detail-section">
                <h3>{t('myReservations.generalInfo')}</h3>
                <p><strong>{t('myReservations.number')}:</strong> {selectedReservation.reservation_number}</p>
                <p><strong>{t('myReservations.statusLabel')}:</strong> {getStatusBadge(selectedReservation.status)}</p>
                <p><strong>{t('myReservations.pharmacyLabel')}:</strong> {selectedReservation.pharmacy_name}</p>
                <p><strong>{t('pharmacy.address')}:</strong> {selectedReservation.pharmacy_address}</p>
                <p><strong>{t('pharmacy.phone')}:</strong> {selectedReservation.pharmacy_phone}</p>
              </div>
              
              <div className="detail-section">
                <h3>{t('myReservations.contact')}</h3>
                <p><strong>{t('myReservations.name')}:</strong> {selectedReservation.contact_name}</p>
                <p><strong>{t('pharmacy.phone')}:</strong> {selectedReservation.contact_phone}</p>
                {selectedReservation.contact_email && (
                  <p><strong>{t('auth.email')}:</strong> {selectedReservation.contact_email}</p>
                )}
              </div>
              
              <div className="detail-section">
                <h3>{t('myReservations.reservedItems')}</h3>
                <ul className="items-list">
                  {selectedReservation.items?.map((item, index) => (
                    <li key={index}>
                      <span className="item-name">{item.medicine_name}</span>
                      <span className="item-qty">× {item.quantity}</span>
                      <span className="item-price">
                        {parseFloat(item.subtotal || 0).toLocaleString('fr-CM')} XAF
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="total-row">
                  <strong>{t('myReservations.total')}:</strong>
                  <span>{parseFloat(selectedReservation.total_price || 0).toLocaleString('fr-CM')} XAF</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>{t('myReservations.dates')}</h3>
                <p><strong>{t('myReservations.createdAt')}:</strong> {formatDate(selectedReservation.created_at)}</p>
                <p><strong>{t('myReservations.pickupDate')}:</strong> {formatDate(selectedReservation.pickup_date)}</p>
                {selectedReservation.confirmed_at && (
                  <p><strong>{t('myReservations.confirmedAt')}:</strong> {formatDate(selectedReservation.confirmed_at)}</p>
                )}
                {selectedReservation.collected_at && (
                  <p><strong>{t('myReservations.collectedAt')}:</strong> {formatDate(selectedReservation.collected_at)}</p>
                )}
                {selectedReservation.cancelled_at && (
                  <p><strong>{t('myReservations.cancelledAt')}:</strong> {formatDate(selectedReservation.cancelled_at)}</p>
                )}
              </div>
              
              {selectedReservation.notes && (
                <div className="detail-section">
                  <h3>{t('myReservations.notes')}</h3>
                  <p>{selectedReservation.notes}</p>
                </div>
              )}
              
              {selectedReservation.pharmacy_notes && (
                <div className="detail-section">
                  <h3>{t('myReservations.pharmacyNotes')}</h3>
                  <p>{selectedReservation.pharmacy_notes}</p>
                </div>
              )}
              
              {selectedReservation.is_cancellable && (
                <div className="actions-section">
                  <button 
                    className="cancel-reservation-btn"
                    onClick={() => handleCancelReservation(selectedReservation.id)}
                  >
                    ❌ {t('myReservations.cancelReservation')}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MesReservationsPage;
