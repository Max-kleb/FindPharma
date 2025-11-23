// src/PharmaciesList.js
import React from 'react';

function PharmaciesList({ results, onPharmacyClick, selectedPharmacy }) {
    
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
                </span
              >
              )}
            </div>
            {!isMedicineSearch && pharmacy.address && (
              <p className="pharmacy-address">
                <i className="fas fa-map-marker-alt"></i> {pharmacy.address}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PharmaciesList;