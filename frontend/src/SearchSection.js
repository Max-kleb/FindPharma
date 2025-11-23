// src/SearchSection.js
import React, { useState } from 'react';
import GeolocationButton from './GeolocationButton';
import { searchMedication, getNearbyPharmacies } from './services/api';

function SearchSection({ setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  
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
      const results = await getNearbyPharmacies(latitude, longitude);
      
      if (results.length === 0) {
        setError('Aucune pharmacie trouvée à proximité');
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
        <i className="fas fa-search search-icon" onClick={handleSearch} title="Lancer la recherche"></i>
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
        <i className="fas fa-sliders-h search-filter-icon"></i>
      </div>

      <GeolocationButton 
        onLocationFound={handleGeolocation}
        onError={(err) => setError(err.message)}
      />
    </section>
  );
}

export default SearchSection;