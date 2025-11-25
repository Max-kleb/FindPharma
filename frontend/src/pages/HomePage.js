// src/pages/HomePage.js
import React from 'react';
import SearchSection from '../SearchSection';
import ResultsDisplay from '../ResultsDisplay';
import Cart from '../Cart';
import HeroSection from '../HeroSection';

function HomePage({ 
  userLocation, 
  setUserLocation, 
  setPharmacies, 
  setLoading, 
  setError, 
  setLastSearch,
  loading,
  error,
  resultsToDisplay,
  cartItems,
  onRemoveFromCart,
  onClearCart,
  onProceedToReservation,
  onReviewSubmit,
  onAddToCart
}) {
  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = localStorage.getItem('token') !== null;

  return (
    <main className="main-content user-mode">
      {/* Section Hero - présentation de l'application */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* Affichage de la recherche seulement pour les visiteurs non connectés */}
      {!isLoggedIn && (
        <>
          {/* US1 & US2 : Section de Recherche */}
          <SearchSection 
            userLocation={userLocation}
            setUserLocation={setUserLocation} 
            setPharmacies={setPharmacies}
            setLoading={setLoading}
            setError={setError}
            setLastSearch={setLastSearch}
          /> 

          {/* Affichage des feedbacks utilisateur */}
          {loading && <div className="feedback-message">⏳ Recherche en cours...</div>}
          {error && <div className="feedback-message error-api">🚨 {error}</div>}

          {/* Affichage de la Carte et de la Liste des Résultats */}
          {!loading && !error && (
            <div className="results-and-cart-layout no-cart">
              <div className="results-container">
                <ResultsDisplay 
                  results={resultsToDisplay} 
                  center={userLocation}
                  userLocation={userLocation}
                  onReviewSubmit={onReviewSubmit}
                  onAddToCart={null}
                />
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default HomePage;
