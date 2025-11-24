// src/SearchSection.js
import React, { useState, useEffect, useRef } from 'react';
import GeolocationButton from './GeolocationButton';
import FilterControls from './FilterControls'; // 💡 Import pour l'US 6
import { searchMedication, getNearbyPharmacies } from './services/api';

function SearchSection({ userLocation, setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000); 
  const [isSearching, setIsSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  // 💡 US 6: États pour gérer le filtre
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ 
    prixMax: 50000, 
    distanceKm: 10 
  }); 

  // Fonction pour mettre à jour et relancer la recherche après application des filtres
  const handleApplyFilters = (newFilters) => {
      setActiveFilters(newFilters);
      // Relance la recherche avec le texte actuel et les nouveaux filtres
      if (searchText.trim()) {
          handleSearch(searchText, newFilters); 
      }
  };

  // 💡 Modification: handleSearch accepte les filtres en paramètre
  const handleSearch = async (query = null, filters = activeFilters) => {
    const trimmedText = (query || searchText).trim().toLowerCase();
    
    if (!trimmedText) {
      setError('Veuillez entrer un nom de médicament');
      setPharmacies([]);
      return;
    }

    if (trimmedText.length < 1) {
      return;
    }

    setIsSearching(true);
    setLoading(true);
    setError(null);
    setLastSearch(trimmedText);
    
    try {
      // 💡 US 6: Passage des filtres à la fonction API
      const results = await searchMedication(trimmedText, userLocation, filters);
      
      if (results.length === 0) {
        setError(`Aucune pharmacie ne propose "${trimmedText}" actuellement avec ces filtres.`);
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
  };

  // Debounce pour recherche automatique (mis à jour pour utiliser handleSearch)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchText.trim().length === 0) {
      setPharmacies([]);
      setError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      if (searchText.trim().length >= 2) {
        // Appelle la recherche avec le texte actuel et les filtres actifs par défaut
        handleSearch(searchText); 
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchText]); 

  const handleGeolocation = async (position) => {
    // ... logique existante de géolocalisation ...
    const { latitude, longitude } = position.coords;
    
    setUserLocation({ lat: latitude, lng: longitude });
    setLoading(true);
    setError(null);
    setLastSearch(''); 

    try {
      // Pour la recherche de pharmacies proches (US 1), les filtres US 6 sont moins pertinents.
      const results = await getNearbyPharmacies(latitude, longitude, searchRadius);
      
      if (results.length === 0) {
        setError(`Aucune pharmacie trouvée dans un rayon de ${searchRadius / 1000} km. Essayez d'augmenter le rayon de recherche.`);
        setPharmacies([]);
      } else {
        setError(null);
        setPharmacies(results);
      }
    } catch (err) {
      setError('Erreur lors de la récupération des pharmacies proches');
      console.error('Erreur géolocalisation:', err);
      setPharmacies([]);
    } finally {
      setLoading(false);
    }
  };  
  
  return (
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
        
        {/* 💡 US 6: Icône pour ouvrir le panneau de filtre */}
        <i 
            className="fas fa-sliders-h search-filter-icon" 
            onClick={() => setIsFilterModalOpen(true)}
            title="Ouvrir les filtres avancés"
        ></i>

        <button 
          className="search-button" 
          onClick={() => handleSearch()}
          title="Lancer la recherche"
          disabled={isSearching || !searchText.trim()}
        >
          {isSearching ? 'Recherche...' : 'Rechercher'}
        </button>
      </div>
      
      {/* ... autres éléments (message, select radius) ... */}

      <GeolocationButton 
        onLocationFound={handleGeolocation}
        onError={(err) => setError(err.message)}
      />

      {/* 💡 US 6: Affichage du panneau de filtre */}
      {isFilterModalOpen && (
          <FilterControls 
              currentFilters={activeFilters}
              onApplyFilters={handleApplyFilters}
              onClose={() => setIsFilterModalOpen(false)}
          />
      )}
    </section>
  );
}

export default SearchSection;