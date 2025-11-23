// src/ResultsDisplay.js
import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PharmaciesList from './PharmaciesList';

// Ce composant interne force la carte à se redessiner après le rendu initial
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Icônes personnalisées pour les marqueurs
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const pharmacyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MapResizer() {
  const map = useMap(); // Récupère l'instance de la carte Leaflet
  
  // Appelle invalidateSize() une seule fois après le premier rendu
  useEffect(() => {
    map.invalidateSize();
  }, [map]); // Le tableau de dépendances assure l'exécution après le montage

  return null; // Ce composant n'affiche rien
}
const mapContainerStyle = { height: '100%', width: '100%' };

function ResultsDisplay({ results, center }) {
    
  // Leaflet utilise la structure [lat, lng]
  const mapCenter = useMemo(() => [center.lat, center.lng], [center]);
  
  // Composant interne pour la carte
  const PharmaMap = () => (
    <div className="map-area">
      {/* La classe map-canvas dans App.css donne la hauteur nécessaire */}
      <MapContainer 
        center={mapCenter} 
        zoom={14} 
        style={mapContainerStyle}
        scrollWheelZoom={false}
        className="map-canvas"
      >
        {/* Tuile de fond (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapResizer />
        {/* Marqueur de l'utilisateur (bleu) */}
        <Marker position={mapCenter} icon={userIcon}>
          <Popup>Votre position actuelle</Popup>
        </Marker>

        {/* Marqueurs des pharmacies (vert) */}
        {results.map((pharmacy) => (
          <Marker 
            key={pharmacy.id} 
            position={[pharmacy.lat, pharmacy.lng]}
            icon={pharmacyIcon}
          >
            <Popup>
              <b>{pharmacy.name}</b><br/>
              Stock: {pharmacy.stock}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );

  return (
    <div className="results-display-container">
      {/* 1. Bloc de la Carte */}
      <PharmaMap />

      {/* 2. Bloc de la Liste des Pharmacies */}
      <div className="list-area">
        <PharmaciesList results={results} />
      </div>
    </div>
  );
}

export default ResultsDisplay;