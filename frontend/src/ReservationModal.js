// src/ReservationModal.js
import React, { useState } from 'react';

function ReservationModal({ cartItems, totalPrice, onSubmit, onClose }) {
  // US 4: Utilise l'email/téléphone en l'absence de compte utilisateur connecté
  const [contact, setContact] = useState(''); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!contact.trim()) {
      alert("Veuillez fournir votre email ou numéro de téléphone pour la confirmation.");
      return;
    }
    setLoading(true);
    
    try {
      // Appelle la fonction de soumission passée par le parent (App.js)
      await onSubmit(cartItems, contact);
      // Ferme le modal et efface le panier après succès (géré dans App.js)
    } catch (error) {
      // L'alerte est gérée dans l'API
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content reservation-modal">
        <h3>Confirmation de Réservation</h3>
        
        <div className="reservation-summary">
            {cartItems.map((item, index) => (
                <p key={index}>
                    **{item.medicineName}** ({item.quantity}x) chez **{item.pharmacyName}**
                </p>
            ))}
            <hr />
            <h4>Total estimé : {totalPrice.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 })}</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="reservation-form">
          <label htmlFor="contact-info">
            Contact pour Confirmation (Email ou Téléphone) :
          </label>
          <input
            id="contact-info"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Ex: monemail@exemple.com ou +237..."
            required
            aria-label="Informations de contact pour la réservation"
          />
          
          <p className="disclaimer">
            *La réservation n'est pas une commande finale. La pharmacie confirmera le prix et la disponibilité.
          </p>

          <div className="modal-actions">
            <button type="submit" disabled={loading} className="submit-reservation-button">
              {loading ? 'Envoi en cours...' : 'Confirmer la Réservation'}
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