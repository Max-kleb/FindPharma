// src/PharmaciesList.js
import React from 'react';

function PharmaciesList({ results }) {
    
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

  return (
    <div className="pharmacies-list-box">
      <h3>Pharmacies à Proximité</h3>
      {results.map((pharmacy) => (
        <div key={pharmacy.id} className="pharmacy-item">
          <div className="pharmacy-main-info">
            <p className="pharmacy-name">{pharmacy.name}</p>
            {pharmacy.price && <p className="pharmacy-price">{pharmacy.price}</p>}
          </div>
          <div className="pharmacy-details">
            {getStockDisplay(pharmacy.stock)} 
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
          </div>
        </div>
      ))}
    </div>
  );
}

export default PharmaciesList;