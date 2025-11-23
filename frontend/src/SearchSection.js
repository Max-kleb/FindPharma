// src/SearchSection.js
import React, { useState } from 'react';
import GeolocationButton from './GeolocationButton';
import axios from 'axios'; 

const API_BASE_URL = 'http://localhost:8000'; // 🚨 VÉRIFIEZ VOTRE PORT BACKEND

function SearchSection({ setUserLocation, setPharmacies, setLoading, setError, setLastSearch }) {
  const [searchText, setSearchText] = useState('');
  
  const handleSearch = async () => {
    const trimmedText = searchText.trim();
    if (!trimmedText) return;

    setLoading(true);
    setError(null);
    setPharmacies([]); // Réinitialisation des résultats précédents
    setLastSearch(trimmedText); // Enregistre le terme pour l'affichage du titre
    
    try {
        const response = await axios.get(`${API_BASE_URL}/api/recherche_medicament/`, {
            params: {
                nom: trimmedText 
            }
        });
        
        // ATTENTION : Adaptation des noms de champs du backend aux noms du frontend (lat/lng)
        const adaptedData = response.data.map(p => ({
            ...p,
            lat: p.latitude, // Renomme 'latitude' en 'lat'
            lng: p.longitude // Renomme 'longitude' en 'lng'
        }));

        setPharmacies(adaptedData); // Met à jour l'état central avec les résultats adaptés

    } catch (err) {
        console.error("Erreur API de recherche :", err);
        const message = err.response?.data?.error || "Erreur de connexion ou API non disponible.";
        setError(message);
    } finally {
        setLoading(false);
    }
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