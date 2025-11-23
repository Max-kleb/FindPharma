// src/GeolocationButton.js
import React, { useState } from 'react';

function GeolocationButton({ onLocationFound, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      if (onError) {
        onError(new Error("Votre navigateur ne supporte pas la géolocalisation."));
      } else {
        alert("Votre navigateur ne supporte pas la géolocalisation.");
      }
      return;
    }

    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (onLocationFound) {
          onLocationFound(position);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation :", error);
        if (onError) {
          onError(error);
        } else {
          alert("Impossible de vous localiser. Vérifiez les permissions de votre navigateur.");
        }
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <button 
      className="geolocation-button"
      onClick={handleGeolocation}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <i className="fas fa-spinner fa-spin"></i>
          Localisation en cours... 
        </>
      ) : (
        <>
          <i className="fas fa-map-marker-alt"></i>
          Me localiser
        </>
      )}
    </button>
  );
}

export default GeolocationButton;