// src/ReservationModal.js
import React, { useState, useMemo } from 'react';
import './ReservationModal.css';

function ReservationModal({ cartItems, totalPrice, onSubmit, onClose, userInfo }) {
  // Informations de contact
  const [contactName, setContactName] = useState(userInfo?.username || '');
  const [contactPhone, setContactPhone] = useState(userInfo?.phone || '');
  const [contactEmail, setContactEmail] = useState(userInfo?.email || '');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Date de récupération (par défaut demain à 10h)
  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(10, 0, 0, 0);
    return date.toISOString().slice(0, 16);
  }, []);
  const [pickupDate, setPickupDate] = useState(tomorrow);

  // Fonction pour formater automatiquement le numéro de téléphone camerounais
  const formatPhoneNumber = (value) => {
    // Retirer tous les caractères non numériques sauf le +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si commence par +237, garder tel quel
    if (cleaned.startsWith('+237')) {
      cleaned = cleaned.substring(0, 13); // +237 + 9 chiffres max
      
      // Formater: +237 6XX XXX XXX
      if (cleaned.length > 4) {
        cleaned = cleaned.substring(0, 4) + ' ' + cleaned.substring(4);
      }
      if (cleaned.length > 8) {
        cleaned = cleaned.substring(0, 8) + ' ' + cleaned.substring(8);
      }
      if (cleaned.length > 12) {
        cleaned = cleaned.substring(0, 12) + ' ' + cleaned.substring(12);
      }
      
      return cleaned;
    }
    
    // Si commence par 6 ou 2 (numéros camerounais), ajouter +237
    if (cleaned.startsWith('6') || cleaned.startsWith('2')) {
      cleaned = '+237' + cleaned.substring(0, 9);
      
      // Formater
      if (cleaned.length > 4) {
        cleaned = cleaned.substring(0, 4) + ' ' + cleaned.substring(4);
      }
      if (cleaned.length > 8) {
        cleaned = cleaned.substring(0, 8) + ' ' + cleaned.substring(8);
      }
      if (cleaned.length > 12) {
        cleaned = cleaned.substring(0, 12) + ' ' + cleaned.substring(12);
      }
      
      return cleaned;
    }
    
    // Si commence par 237, ajouter le +
    if (cleaned.startsWith('237')) {
      cleaned = '+' + cleaned.substring(0, 12);
      
      // Formater
      if (cleaned.length > 4) {
        cleaned = cleaned.substring(0, 4) + ' ' + cleaned.substring(4);
      }
      if (cleaned.length > 8) {
        cleaned = cleaned.substring(0, 8) + ' ' + cleaned.substring(8);
      }
      if (cleaned.length > 12) {
        cleaned = cleaned.substring(0, 12) + ' ' + cleaned.substring(12);
      }
      
      return cleaned;
    }
    
    // Sinon, retourner tel quel (limité à 17 caractères)
    return cleaned.substring(0, 17);
  };

  // Gestionnaire du changement de numéro de téléphone avec formatage
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setContactPhone(formatted);
  };

  // Grouper les items par pharmacie
  const itemsByPharmacy = useMemo(() => {
    const grouped = {};
    cartItems.forEach(item => {
      const pharmacyId = item.pharmacyId;
      if (!grouped[pharmacyId]) {
        grouped[pharmacyId] = {
          pharmacyId: pharmacyId,
          pharmacyName: item.pharmacyName,
          items: []
        };
      }
      grouped[pharmacyId].items.push(item);
    });
    return Object.values(grouped);
  }, [cartItems]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation (pas de pop-up, on empêche simplement la soumission)
    if (!contactName.trim() || !contactPhone.trim() || !pickupDate) {
      // Laisser les validations HTML5 et les erreurs visuelles gérer cela
      return;
    }
    
    setLoading(true);
    
    try {
      // Créer une réservation par pharmacie
      for (const pharmacyGroup of itemsByPharmacy) {
        const reservationData = {
          pharmacy_id: pharmacyGroup.pharmacyId,
          items: pharmacyGroup.items.map(item => ({
            medicine_id: item.medicineId || item.id,
            stock_id: item.stockId,
            pharmacy_id: pharmacyGroup.pharmacyId,
            quantity: item.quantity || 1
          })),
          contact_name: contactName,
          contact_phone: contactPhone,
          contact_email: contactEmail,
          pickup_date: new Date(pickupDate).toISOString(),
          notes: notes
        };
        
        await onSubmit(reservationData);
      }
      
      // Pas de pop-up, fermeture directe
      onClose();
    } catch (error) {
      // Erreur silencieuse ou affichée dans l'UI si nécessaire
      console.error('Erreur réservation:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content reservation-modal">
        <h3>🛒 Confirmation de Réservation</h3>
        
        <div className="reservation-summary">
          <h4>Articles à réserver :</h4>
          {itemsByPharmacy.map((group, gIndex) => (
            <div key={gIndex} className="pharmacy-group">
              <p className="pharmacy-name">📍 <strong>{group.pharmacyName}</strong></p>
              <ul>
                {group.items.map((item, index) => (
                  <li key={index}>
                    {item.medicineName} × {item.quantity || 1} - {item.price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <hr />
          <h4>Total estimé : {totalPrice.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 })}</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-group">
            <label htmlFor="contact-name">Nom complet *</label>
            <input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Votre nom"
              required
              autoComplete="name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact-phone">Téléphone *</label>
            <input
              id="contact-phone"
              type="tel"
              value={contactPhone}
              onChange={handlePhoneChange}
              placeholder="+237 6XX XXX XXX"
              required
              autoComplete="tel"
            />
            <small className="help-text">Format: +237 6XX XXX XXX (formaté automatiquement)</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="contact-email">Email (optionnel)</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="votre@email.com"
              autoComplete="email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="pickup-date">Date de récupération souhaitée *</label>
            <input
              id="pickup-date"
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (optionnel)</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Instructions particulières..."
              rows={2}
            />
          </div>
          
          <p className="disclaimer">
            * La réservation n'est pas une commande finale. La pharmacie confirmera la disponibilité et le prix exact.
          </p>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-reservation-button">
              {loading ? 'Envoi en cours...' : '✓ Confirmer la Réservation'}
            </button>
            <button type="button" onClick={onClose} className="cancel-button">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservationModal;