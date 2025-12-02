// src/ReservationModal.js
import React, { useState, useMemo } from 'react';
import './ReservationModal.css';

function ReservationModal({ cartItems, totalPrice, onSubmit, onClose, userInfo }) {
  // Informations de contact
  const [contactName, setContactName] = useState(userInfo?.username || '');
  const [contactPhone, setContactPhone] = useState('');
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
    
    // Validation
    if (!contactName.trim()) {
      alert("Veuillez fournir votre nom.");
      return;
    }
    if (!contactPhone.trim()) {
      alert("Veuillez fournir un numéro de téléphone.");
      return;
    }
    if (!pickupDate) {
      alert("Veuillez choisir une date de récupération.");
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
      
      alert(`✅ Réservation(s) créée(s) avec succès ! Vous recevrez une confirmation.`);
    } catch (error) {
      alert(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
      onClose();
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
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact-phone">Téléphone *</label>
            <input
              id="contact-phone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="contact-email">Email (optionnel)</label>
            <input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="votre@email.com"
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