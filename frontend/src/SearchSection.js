// src/SearchSection.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GeolocationButton from './GeolocationButton';
import { searchMedication, getNearbyPharmacies } from './services/api';

function SearchSection({ userLocation, setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000); // Rayon par défaut: 5km
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);
  
  // Fonction de recherche avec gestion améliorée (wrapped with useCallback)
  const handleSearch = useCallback(async (query = null) => {
    const trimmedText = (query || searchText).trim().toLowerCase();
    
    if (!trimmedText) {
      setError('Veuillez entrer un nom de médicament');
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
        setError(`Aucune pharmacie ne propose "${trimmedText}" actuellement`);
        setPharmacies([]);
      } else {
        setPharmacies(results);
        setError(null);
      }
    } catch (err) {
      setError('Erreur lors de la recherche. Vérifiez que le serveur backend est lancé.');
      console.error('Erreur recherche:', err);
      setPharmacies([]);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [searchText, userLocation, setPharmacies, setLoading, setError, setLastSearch]);

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
        setError(`Aucune pharmacie trouvée dans un rayon de ${searchRadius / 1000} km. Essayez d'augmenter le rayon de recherche.`);
        setPharmacies([]);
      } else {
        setError(null);
        setPharmacies(results);
        // Message de succès (optionnel, peut être affiché dans ResultsDisplay)
        console.log(`✅ ${results.length} pharmacie(s) trouvée(s) dans un rayon de ${searchRadius / 1000} km`);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des pharmacies proches');
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
          placeholder="Rechercher un médicament (Ex: doli, asp, ibu...)" 
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
            title="Effacer"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        <button 
          className="search-button" 
          onClick={() => handleSearch()}
          title="Lancer la recherche"
          disabled={isSearching || !searchText.trim()}
        >
          {isSearching ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>
      
      {/* Message informatif */}
      {searchText.trim().length > 0 && searchText.trim().length < 2 && (
        <div className="search-hint">
          <i className="fas fa-info-circle"></i>
          Tapez au moins 2 caractères pour lancer la recherche
        </div>
      )}

      {/* Sélecteur de rayon de recherche */}
      <div className="radius-selector">
        <label htmlFor="search-radius">
          <i className="fas fa-map-marked-alt"></i> Rayon de recherche :
        </label>
        <select 
          id="search-radius"
          value={searchRadius} 
          onChange={(e) => setSearchRadius(Number(e.target.value))}
          className="radius-select"
          title="Choisissez la distance maximale pour trouver des pharmacies proches"
        >
          <option value="1000">1 km autour de moi</option>
          <option value="2000">2 km autour de moi</option>
          <option value="3000">3 km autour de moi</option>
          <option value="5000">5 km autour de moi</option>
          <option value="10000">10 km autour de moi</option>
          <option value="20000">20 km autour de moi</option>
          <option value="50000">50 km autour de moi</option>
        </select>
        <span className="radius-info">
          <i className="fas fa-info-circle"></i> Utilisé lors de la localisation
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