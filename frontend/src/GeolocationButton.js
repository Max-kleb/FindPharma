// src/GeolocationButton.js
import React, { useState } from 'react';

function GeolocationButton({ setUserLocation }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGeolocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newLocation);
          setIsLoading(false);
        },
        (error) => {
          console.error("Erreur de géolocalisation :", error);
          alert("Impossible de vous localiser. Vérifiez les permissions de votre navigateur.");
          setIsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      alert("Votre navigateur ne supporte pas la géolocalisation.");
    }
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