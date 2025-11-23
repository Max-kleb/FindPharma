// src/SearchSection.js
import React, { useState } from 'react';
import GeolocationButton from './GeolocationButton';
// import axios from 'axios'; // Temporairement désactivé pour test interface 

const API_BASE_URL = 'http://localhost:8000'; // 🚨 VÉRIFIEZ VOTRE PORT BACKEND

function SearchSection({ setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  
  const handleSearch = () => {
    const trimmedText = searchText.trim();
    if (!trimmedText) return;

    setLoading(true);
    setError(null);
    setLastSearch(trimmedText);
    
    // DONNÉES SIMULÉES pour test interface
    setTimeout(() => {
      const simulatedResults = [
        {
          id: 1,
          name: "Pharmacie Centrale",
          address: "Avenue Kennedy, Yaoundé",
          stock: "En stock",
          price: "2500 FCFA",
          distance: "0.8 km",
          lat: 3.8600,
          lng: 11.5200
        },
        {
          id: 2,
          name: "Pharmacie du Marché",
          address: "Marché Central, Yaoundé",
          stock: "En stock",
          price: "2300 FCFA",
          distance: "1.5 km",
          lat: 3.8650,
          lng: 11.5150
        }
      ];
      
      setPharmacies(simulatedResults);
      setLoading(false);
    }, 800);
  };

  return (
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

      <GeolocationButton setUserLocation={setUserLocation} />
    </section>
  );
}

export default SearchSection;