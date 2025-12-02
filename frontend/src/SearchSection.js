// src/SearchSection.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GeolocationButton from './GeolocationButton';
import { searchMedication, getNearbyPharmacies } from './services/api';
import { useTranslation } from 'react-i18next';

function SearchSection({ userLocation, setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000); // Rayon par défaut: 5km
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);
  const { t } = useTranslation();
  
  // Fonction de recherche avec gestion améliorée (wrapped with useCallback)
  const handleSearch = useCallback(async (query = null) => {
    const trimmedText = (query || searchText).trim().toLowerCase();
    
    if (!trimmedText) {
      setError(t('search.enterMedicine'));
      setPharmacies([]);
      return;
    }

    // Minimum 1 caractère maintenant accepté
    if (trimmedText.length < 1) {
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError(null);
    setLastSearch(trimmedText);
    
    // Incrémenter le compteur de recherches
    const currentCount = parseInt(localStorage.getItem('searchCount') || '0');
    localStorage.setItem('searchCount', (currentCount + 1).toString());
    
    try {
      // Passer la position de l'utilisateur pour calculer les distances
      const results = await searchMedication(trimmedText, userLocation);
      
      if (results.length === 0) {
        setError(t('search.noResults').replace('{query}', trimmedText));
        setPharmacies([]);
      } else {
        setPharmacies(results);
        setError(null);
      }
    } catch (err) {
      setError(t('search.errorSearch'));
      console.error('Erreur recherche:', err);
      setPharmacies([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [searchText, userLocation, setPharmacies, setLoading, setError, setLastSearch, t]);

  // Debounce pour recherche automatique pendant la frappe
  useEffect(() => {
    // Clear le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si le champ est vide, ne rien faire
    if (searchText.trim().length === 0) {
      setPharmacies([]);
      setError(null);
      return;
    }

    // Attendre 500ms après la dernière frappe avant de rechercher
    debounceTimerRef.current = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        handleSearch(searchText);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchText, handleSearch, setPharmacies, setError]); // Inclure toutes les dépendances

  const handleGeolocation = async (position) => {
    const { latitude, longitude } = position.coords;
    
    setUserLocation({ lat: latitude, lng: longitude });
    setLoading(true);
    setError(null);
    setLastSearch(''); // Reset search query

    try {
      const results = await getNearbyPharmacies(latitude, longitude, searchRadius);
      
      if (results.length === 0) {
        setError(t('search.noPharmacyInRadius').replace('{km}', searchRadius / 1000));
        setPharmacies([]);
      } else {
        setError(null);
        setPharmacies(results);
        // Message de succès (optionnel, peut être affiché dans ResultsDisplay)
        console.log(`✅ ${results.length} pharmacie(s) trouvée(s) dans un rayon de ${searchRadius / 1000} km`);
      }
    } catch (err) {
      setError(t('search.errorSearch'));
      console.error('Erreur géolocalisation:', err);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };  return (
    <section className="search-section-container">
      <div className="search-bar-box">
        <i className={`fas ${isSearching ? 'fa-spinner fa-spin' : 'fa-search'} search-icon`}></i>
        <input 
          type="text" 
          placeholder={t('search.placeholder')} 
          className="search-input" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => {
              if (e.key === 'Enter') {
                  handleSearch();
              }
          }}
          autoComplete="off"
        />
        {searchText && (
          <button 
            className="clear-button"
            onClick={() => {
              setSearchText('');
              setPharmacies([]);
              setError(null);
            }}
            title={t('search.clear')}
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        <button 
          className="search-button" 
          onClick={() => handleSearch()}
          title={t('search.searchButton')}
          disabled={isSearching || !searchText.trim()}
        >
          {isSearching ? t('search.searching') : t('search.searchButton')}
        </button>
      </div>
      
      {/* Message informatif */}
      {searchText.trim().length > 0 && searchText.trim().length < 2 && (
        <div className="search-hint">
          <i className="fas fa-info-circle"></i>
          {t('search.hintMinChars')}
        </div>
      )}

      {/* Sélecteur de rayon de recherche */}
      <div className="radius-selector">
        <label htmlFor="search-radius">
          <i className="fas fa-map-marked-alt"></i> {t('search.searchRadius')} :
        </label>
        <select 
          id="search-radius"
          value={searchRadius} 
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="radius-select"
          title={t('search.usedForLocation')}
        >
          <option value="1000">{t('search.kmAroundMe').replace('{km}', '1')}</option>
          <option value="2000">{t('search.kmAroundMe').replace('{km}', '2')}</option>
          <option value="3000">{t('search.kmAroundMe').replace('{km}', '3')}</option>
          <option value="5000">{t('search.kmAroundMe').replace('{km}', '5')}</option>
          <option value="10000">{t('search.kmAroundMe').replace('{km}', '10')}</option>
          <option value="20000">{t('search.kmAroundMe').replace('{km}', '20')}</option>
          <option value="50000">{t('search.kmAroundMe').replace('{km}', '50')}</option>
        </select>
        <span className="radius-info">
          <i className="fas fa-info-circle"></i> {t('search.usedForLocation')}
        </span>
      </div>

      <GeolocationButton 
        onLocationFound={handleGeolocation}
        onError={(err) => setError(err.message)}
      />
    </section>
  );
}

export default SearchSection;