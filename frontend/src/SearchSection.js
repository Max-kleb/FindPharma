// src/SearchSection.js
import React, { useState } from 'react';
import GeolocationButton from './GeolocationButton';
import { searchMedication, getNearbyPharmacies } from './services/api';

function SearchSection({ setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  const [searchRadius, setSearchRadius] = useState(5000); // Rayon par défaut: 5km
  
  const handleSearch = async () => {
    const trimmedText = searchText.trim();
    if (!trimmedText) {
      setError('Veuillez entrer un nom de médicament');
      return;
    }

    setLoading(true);
    setError(null);
    setLastSearch(trimmedText);
    
    try {
      const results = await searchMedication(trimmedText);
      
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
    }
  };

  const handleGeolocation = async (position) => {
    const { latitude, longitude } = position.coords;
    
    setUserLocation({ lat: latitude, lng: longitude });
    setLoading(true);
    setError(null);
    setLastSearch(''); // Reset search query

    try {
      const results = await getNearbyPharmacies(latitude, longitude, searchRadius);
      
      if (results.length === 0) {
        setError(`Aucune pharmacie trouvée dans un rayon de ${searchRadius / 1000} km`);
        setPharmacies([]);
      } else {
        setPharmacies(results);
        setError(null);
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
        <i className="fas fa-search search-icon"></i>
        <input 
          type="text" 
          placeholder="Rechercher un médicament (Ex: Aspirine)" 
          className="search-input" 
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => {
              if (e.key === 'Enter') {
                  handleSearch();
              }
          }}
        />
        <button 
          className="search-button" 
          onClick={handleSearch}
          title="Lancer la recherche"
        >
          Rechercher
        </button>
      </div>

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
        >
          <option value="1000">1 km</option>
          <option value="2000">2 km</option>
          <option value="3000">3 km</option>
          <option value="5000">5 km</option>
          <option value="10000">10 km</option>
          <option value="20000">20 km</option>
        </select>
      </div>

      <GeolocationButton 
        onLocationFound={handleGeolocation}
        onError={(err) => setError(err.message)}
      />
    </section>
  );
}

export default SearchSection;