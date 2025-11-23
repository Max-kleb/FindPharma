// src/App.js
import React, { useState, useMemo } from 'react'; 
import './App.css';
import Header from './Header';
import SearchSection from './SearchSection';
import ResultsDisplay from './ResultsDisplay';

// Coordonnées par défaut du centre de Yaoundé, Cameroun
const DEFAULT_CENTER = { 
  lat: 3.8480, // Latitude Yaoundé
  lng: 11.5021 // Longitude Yaoundé
};

function App() {
  // 1. État de localisation (Centrage de la carte)
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  
  // Debug: Logger userLocation à chaque changement
  React.useEffect(() => {
    console.log('🌍 App.js - userLocation:', userLocation);
  }, [userLocation]);
  
  // 2. US 2: États pour la RECHERCHE DE MÉDICAMENTS
  const [medicationPharmacies, setMedicationPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // 3. US 1: État pour les PHARMACIES PROCHES par défaut (Simulation)
  const [nearbyPharmacies, setNearbyPharmacies] = useState([
    { id: 1, name: "Pharmacie de la Mairie", address: "Mvog-Ada, Yaoundé", stock: "En Stock", price: "9 500 XAF", phone: "+237 222 00 00 01", distance: "1.2 km", lat: 3.849, lng: 11.505 },
    { id: 2, name: "Grande Pharmacie Centrale", address: "Centre Ville, Douala", stock: "Stock Limité", price: "8 990 XAF", phone: "+237 699 00 00 02", distance: "2.5 km", lat: 3.845, lng: 11.500 },
    { id: 3, name: "Pharmacie d'Urgence", address: "Quartier Fouda, Yaoundé", stock: "Épuisé", price: null, phone: null, distance: "4.1 km", lat: 3.855, lng: 11.510 },
  ]); 
  
  // 4. États de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 5. LOGIQUE CLÉ : Déterminer quels résultats doivent être affichés (US 2 > US 1)
  const resultsToDisplay = useMemo(() => {
    // Si une recherche de médicament a été lancée et a des résultats
    if (searchQuery.length > 0) {
      return medicationPharmacies;
    }
    
    // Sinon, on affiche les pharmacies proches par défaut (US 1)
    return nearbyPharmacies;
  }, [searchQuery, medicationPharmacies, nearbyPharmacies]);


  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        
        {/* Passer les fonctions de mise à jour à SearchSection */}
        <SearchSection 
          userLocation={userLocation}
          setUserLocation={setUserLocation} 
          setPharmacies={setMedicationPharmacies}
          setLoading={setLoading}
          setError={setError}
          setLastSearch={setSearchQuery}
        /> 

        {/* Affichage des feedbacks utilisateur */}
        {loading && <div className="feedback-message">⏳ Recherche en cours...</div>}
        {error && <div className="feedback-message error-api">🚨 {error}</div>}

        {/* Affichage de la Carte et de la Liste des Résultats */}
        {!loading && !error && (
            <ResultsDisplay 
              results={resultsToDisplay} 
              center={userLocation}
              userLocation={userLocation}
            />
        )}
        
      </main>
      <footer className="app-footer">
        <a href="#about">À propos</a>
        <a href="#contact">Contact</a>
        <a href="#faq">FAQ</a>
        <a href="#legal">Mentions Légales</a>
      </footer>
    </div>
  );
}

export default App;