// src/pages/DashboardClient.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchSection from '../SearchSection';
import ResultsDisplay from '../ResultsDisplay';
import Cart from '../Cart';
import '../DashboardClient.css';

function DashboardClient({ 
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
  const { t } = useTranslation();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState({
    searchCount: 0,
    cartTotal: 0,
    reservations: 0
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.username || user.email);
      } catch (err) {
        console.error('Erreur parsing user:', err);
      }
    }
  }, []);

  // Mettre à jour les stats séparément pour rafraîchir après recherche
  useEffect(() => {
    const updateStats = () => {
      const total = cartItems.reduce((sum, item) => {
        const price = parseFloat(item.price?.replace(/[^\d]/g, '') || 0);
        return sum + price;
      }, 0);
      
      setStats({
        searchCount: parseInt(localStorage.getItem('searchCount') || '0'),
        cartTotal: total,
        reservations: parseInt(localStorage.getItem('reservationCount') || '0')
      });
    };

    updateStats();

    // Écouter les changements de localStorage pour mettre à jour en temps réel
    const handleStorageChange = () => {
      updateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Vérifier aussi toutes les 500ms pour les changements locaux
    const interval = setInterval(updateStats, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [cartItems, resultsToDisplay]);

  return (
    <div className="dashboard-client">
      {/* En-tête du Dashboard */}
      <div className="dashboard-header">
        {/* Médicaments animés en arrière-plan */}
        <div className="floating-medicines">
          <span className="medicine-icon pill-1">💊</span>
          <span className="medicine-icon pill-2">💊</span>
          <span className="medicine-icon syringe-1">💉</span>
          <span className="medicine-icon capsule-1">💊</span>
          <span className="medicine-icon tablet-1">💊</span>
          <span className="medicine-icon pill-3">💊</span>
          <span className="medicine-icon drop-1">💧</span>
          <span className="medicine-icon pill-4">💊</span>
          <span className="medicine-icon syringe-2">💉</span>
          <span className="medicine-icon pill-5">💊</span>
        </div>
        
        <div className="welcome-section">
          <h1 className="dashboard-title">
            <i className="fas fa-user-circle"></i>
            {t('admin.welcome').replace('Admin', userName)}
          </h1>
          <p className="dashboard-subtitle">
            {t('reservations.subtitle')}
          </p>
        </div>

        {/* Cartes de statistiques */}
        <div className="stats-cards">
          <div className="stat-card stat-searches">
            <div className="stat-icon">
              <i className="fas fa-search"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.searchCount}</span>
              <span className="stat-label">{t('common.search')}</span>
            </div>
          </div>

          <div className="stat-card stat-cart">
            <div className="stat-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{cartItems.length}</span>
              <span className="stat-label">{t('cart.title')}</span>
            </div>
          </div>

          <div className="stat-card stat-total">
            <div className="stat-icon">
              <i className="fas fa-coins"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.cartTotal.toLocaleString()} {t('units.xaf')}</span>
              <span className="stat-label">{t('cart.total')}</span>
            </div>
          </div>

          <div className="stat-card stat-reservations">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.reservations}</span>
              <span className="stat-label">{t('reservations.title')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section de Recherche */}
      <div className="dashboard-search-section">
        <h2 className="section-title">
          <i className="fas fa-pills"></i>
          {t('reservations.searchMedicines')}
        </h2>
        <SearchSection 
          userLocation={userLocation}
          setUserLocation={setUserLocation} 
          setPharmacies={setPharmacies}
          setLoading={setLoading}
          setError={setError}
          setLastSearch={setLastSearch}
        />
      </div>

      {/* Affichage des feedbacks utilisateur */}
      {loading && (
        <div className="feedback-message loading-message">
          <i className="fas fa-spinner fa-spin"></i>
          {t('search.searching')}
        </div>
      )}
      {error && (
        <div className="feedback-message error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Résultats et Panier */}
      {!loading && !error && resultsToDisplay.length > 0 && (
        <div className="results-and-cart-layout">
          <div className="results-container">
            <h2 className="section-title">
              <i className="fas fa-map-marked-alt"></i>
              {t('results.title')}
            </h2>
            <ResultsDisplay 
              results={resultsToDisplay} 
              center={userLocation}
              userLocation={userLocation}
              onReviewSubmit={onReviewSubmit}
              onAddToCart={onAddToCart}
            />
          </div>
          
          <aside className="cart-sidebar">
            <Cart 
              cartItems={cartItems}
              onRemoveItem={onRemoveFromCart}
              onClearCart={onClearCart}
              onProceedToReservation={onProceedToReservation}
            />
          </aside>
        </div>
      )}

      {/* Message si aucun résultat */}
      {!loading && !error && resultsToDisplay.length === 0 && (
        <div className="no-results-message">
          <i className="fas fa-search-location"></i>
          <h3>{t('home.searchPlaceholder')}</h3>
          <p>{t('hero.features.smartSearchDesc')}</p>
        </div>
      )}
    </div>
  );
}

export default DashboardClient;
