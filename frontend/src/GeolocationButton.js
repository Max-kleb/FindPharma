// src/GeolocationButton.js
import React, { useState } from 'react';

function GeolocationButton({ onLocationFound, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const handleGeolocation = () => {
    // Vérifier si on est sur un contexte sécurisé (HTTPS ou localhost)
    const isSecureContext = window.isSecureContext || 
                           window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';
    
    if (!navigator.geolocation) {
      const error = new Error("Votre navigateur ne supporte pas la géolocalisation.");
      setErrorMessage("Géolocalisation non supportée par votre navigateur");
      if (onError) onError(error);
      return;
    }

    // Avertissement si pas en contexte sécurisé
    if (!isSecureContext) {
      console.warn("⚠️ La géolocalisation peut ne pas fonctionner en HTTP. Utilisez localhost ou HTTPS.");
    }

    setIsLoading(true);
    setErrorMessage(null);

    // Options pour la géolocalisation - on essaie d'abord avec haute précision
    const highAccuracyOptions = { 
      enableHighAccuracy: true, 
      timeout: 15000,  // 15 secondes
      maximumAge: 300000 // Cache la position pendant 5 minutes
    };
    
    // Fallback avec précision moindre mais plus rapide
    const lowAccuracyOptions = { 
      enableHighAccuracy: false, 
      timeout: 10000,
      maximumAge: 600000 // 10 minutes
    };

    const onSuccess = (position) => {
      console.log("📍 Position obtenue:", position.coords.latitude, position.coords.longitude);
      console.log("📍 Précision:", position.coords.accuracy, "mètres");
      if (onLocationFound) {
        onLocationFound(position);
      }
      setIsLoading(false);
      setErrorMessage(null);
    };
    
    const onErrorHandler = (error) => {
      console.error("Erreur de géolocalisation :", error);
      
      // Si timeout avec haute précision, réessayer avec basse précision
      if (error.code === error.TIMEOUT) {
        console.log("🔄 Réessai avec précision moindre...");
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          (fallbackError) => {
            handleFinalError(fallbackError);
          },
          lowAccuracyOptions
        );
        return;
      }
      
      handleFinalError(error);
    };
    
    const handleFinalError = (error) => {
      setIsLoading(false);
      
      // Messages d'erreur plus explicites
      let message = "";
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = "📍 Veuillez autoriser la localisation dans votre navigateur";
          break;
        case error.POSITION_UNAVAILABLE:
          message = "📍 Position non disponible. Vérifiez votre GPS.";
          break;
        case error.TIMEOUT:
          message = "📍 Délai dépassé. Vérifiez que le GPS est activé et réessayez.";
          break;
        default:
          message = "📍 Erreur de localisation. Essayez de rafraîchir la page.";
      }
      
      setErrorMessage(message);
      if (onError) onError(error);
    };

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onErrorHandler,
      highAccuracyOptions
    );
  };

  return (
    <div className="geolocation-container">
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
      {errorMessage && (
        <div className="geolocation-error">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default GeolocationButton;