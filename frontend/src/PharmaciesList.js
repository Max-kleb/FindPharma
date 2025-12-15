// src/PharmaciesList.js
import React from 'react';
import { Link } from 'react-router-dom';
import './PharmacyCard.css';

function PharmaciesList({ results, onPharmacyClick, selectedPharmacy, onAddToCart, onReviewSubmit }) {
    
  // Gestion de l'ajout au panier
  const handleAddToCart = (e, pharmacy) => {
    e.stopPropagation(); // Empêche le déclenchement du clic sur la pharmacy-item
    
    if (!pharmacy.price || pharmacy.stock === "Épuisé") {
      // Pas de pop-up, ajout silencieux ignoré
      return;
    }
    
    if (onAddToCart) {
      onAddToCart({
        id: pharmacy.id,
        medicineName: pharmacy.medicineName || pharmacy.medicine?.name || 'Médicament',
        pharmacyName: pharmacy.name,
        pharmacyId: pharmacy.id,
        // 💡 IDs nécessaires pour les réservations (US 6)
        medicineId: pharmacy.medicineId || pharmacy.medicine?.id,
        stockId: pharmacy.stockId,
        price: pharmacy.price,
        stock: pharmacy.stock,
        quantity: 1
      });
      // Pas de pop-up, ajout silencieux au panier
    }
  };
  
  // La fonction est DÉFINIE ici, à l'intérieur du composant.
  const getStockDisplay = (stock) => {
    switch (stock) {
      case "En Stock":
        return (
          <span className="status-info status-en-stock">
            <i className="fas fa-check-circle stock-status-icon"></i> En Stock
          </span>
        );
      case "Stock Limité":
        return (
          <span className="status-info status-stock-limite">
            <i className="fas fa-exclamation-triangle stock-status-icon"></i> Stock Limité
          </span>
        );
      case "Épuisé":
        return (
          <span className="status-info status-epuise">
            <i className="fas fa-times-circle stock-status-icon"></i> Épuisé
          </span>
        );
      default:
        return null;
    }
  };

  // Détecter si c'est une recherche de médicament ou juste des pharmacies proches
  const isMedicineSearch = results.length > 0 && results[0].medicineName;

  return (
    <div className="pharmacies-list-box">
      <h3>{isMedicineSearch ? 'Résultats de recherche' : 'Pharmacies à Proximité'}</h3>
      <div className="pharmacy-cards-wrapper">
        {results.map((pharmacy) => (
        <div 
          key={pharmacy.id} 
          className={`pharmacy-item ${selectedPharmacy?.id === pharmacy.id ? 'pharmacy-selected' : ''}`}
          onClick={() => onPharmacyClick && onPharmacyClick(pharmacy)}
          style={{ cursor: onPharmacyClick ? 'pointer' : 'default' }}
        >
          <div className="pharmacy-main-info">
            <p className="pharmacy-name">{pharmacy.name}</p>
            {isMedicineSearch && pharmacy.medicineName && (
              <p className="medicine-name">
                <i className="fas fa-pills"></i> {pharmacy.medicineName}
              </p>
            )}
            {isMedicineSearch && pharmacy.price && (
              <p className="pharmacy-price">{pharmacy.price}</p>
            )}
          </div>
          <div className="pharmacy-details">
            {isMedicineSearch && getStockDisplay(pharmacy.stock)}
            
            {/* ⭐ US 7 : Affichage de la note */}
            {pharmacy.average_rating && (
              <div className="pharmacy-rating">
                <span className="stars">
                  {'★'.repeat(Math.round(pharmacy.average_rating))}
                  {'☆'.repeat(5 - Math.round(pharmacy.average_rating))}
                </span>
                <span className="rating-value">{pharmacy.average_rating}</span>
                <span className="reviews-count">({pharmacy.reviews_count} avis)</span>
              </div>
            )}
            
            <div className="contact-distance">
              {pharmacy.phone && (
                <span className="phone-number">
                  <a href={`tel:${pharmacy.phone.replace(/\s/g, '')}`}>
                    <i className="fas fa-phone"></i> {pharmacy.phone}
                  </a>
                </span>
              )}
              {pharmacy.distance && (
                <span className="distance">
                  <i className="fas fa-walking"></i> {pharmacy.distance}
                </span>
              )}
            </div>
            {!isMedicineSearch && pharmacy.address && (
              <p className="pharmacy-address">
                <i className="fas fa-map-marker-alt"></i> {pharmacy.address}
              </p>
            )}
          </div>
          
          {/* 🛒 US 5 : Bouton Ajouter au Panier + ⭐ US 7 : Bouton Noter */}
          <div className="pharmacy-actions">
            {isMedicineSearch && pharmacy.price && pharmacy.stock !== "Épuisé" && (
              <>
                {onAddToCart ? (
                  <button 
                    className="add-to-cart-button"
                    onClick={(e) => handleAddToCart(e, pharmacy)}
                    title="Ajouter au panier"
                  >
                    <i className="fas fa-shopping-cart"></i> Ajouter
                  </button>
                ) : (
                  <button 
                    className="add-to-cart-button login-required"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Redirection silencieuse vers login
                      window.location.href = '/login';
                    }}
                    title="Connexion requise"
                  >
                    <i className="fas fa-lock"></i> Connexion
                  </button>
                )}
              </>
            )}
            
            {/* Bouton Noter */}
            {onReviewSubmit && (
              <button 
                className="review-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReviewSubmit(pharmacy);
                }}
                title="Noter cette pharmacie"
              >
                <i className="fas fa-star"></i> Noter
              </button>
            )}
            
            {/* Bouton Documentation du médicament */}
            {isMedicineSearch && pharmacy.medicineId && (
              <Link 
                to={`/medicines/${pharmacy.medicineId}`}
                className="medicine-info-button"
                onClick={(e) => e.stopPropagation()}
                title="Voir la fiche du médicament"
              >
                <i className="fas fa-info-circle"></i> Fiche
              </Link>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}

export default PharmaciesList;