// src/ResultsDisplay.js
import React, { useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import PharmaciesList from './PharmaciesList';
import { calculateDistance, formatDistance } from './utils/distance';

// Ce composant interne force la carte à se redessiner après le rendu initial
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

// Icône pour l'utilisateur - Marqueur bleu standard
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Icône pour les pharmacies - Bâtiment vert 🏥
const pharmacyIcon = new L.DivIcon({
  html: `<div style="font-size: 42px; text-align: center; line-height: 1; filter: drop-shadow(0 2px 6px rgba(0, 168, 107, 0.6));">🏥</div>`,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
  className: 'custom-pharmacy-icon'
});

function MapResizer() {
  const map = useMap(); // Récupère l'instance de la carte Leaflet
  
  // Appelle invalidateSize() une seule fois après le premier rendu
  useEffect(() => {
    map.invalidateSize();
  }, [map]); // Le tableau de dépendances assure l'exécution après le montage

  return null; // Ce composant n'affiche rien
}

// Composant pour gérer le centrage de la carte via props
function MapController({ selectedPharmacy }) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedPharmacy) {
      console.log('🎯 Centrage sur:', selectedPharmacy.name);
      map.flyTo([selectedPharmacy.lat, selectedPharmacy.lng], 15, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [selectedPharmacy, map]);
  
  return null;
}

const mapContainerStyle = { height: '100%', width: '100%' };

function ResultsDisplay({ results, center, userLocation, onAddToCart, onReviewSubmit }) {
  // État pour la pharmacie sélectionnée
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  
  // Références pour les marqueurs (pour pouvoir ouvrir leurs popups)
  const markerRefs = useRef({});
  
  // Debug: Logger à chaque changement de userLocation
  useEffect(() => {
    console.log('🔄 ResultsDisplay - userLocation a changé:', userLocation);
  }, [userLocation]);
  
  // Calculer et ajouter la distance pour chaque pharmacie
  const resultsWithDistance = useMemo(() => {
    if (!userLocation || !userLocation.lat || !userLocation.lng) {
      return results;
    }
    
    return results.map(pharmacy => {
      // Si la pharmacie a déjà une distance (ex: données statiques), on la garde
      if (pharmacy.distance) {
        return pharmacy;
      }
      
      // Sinon, on calcule la distance si on a les coordonnées
      if (pharmacy.lat && pharmacy.lng) {
        const distanceInKm = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          pharmacy.lat,
          pharmacy.lng
        );
        
        return {
          ...pharmacy,
          distance: formatDistance(distanceInKm),
          distanceValue: distanceInKm // Pour un tri éventuel
        };
      }
      
      return pharmacy;
    });
  }, [results, userLocation]);
    
  // Calculer le centre automatique basé sur les résultats
  const autoCenter = useMemo(() => {
    if (resultsWithDistance.length > 0 && resultsWithDistance[0].lat && resultsWithDistance[0].lng) {
      // Si on a des résultats, centrer sur la première pharmacie
      console.log('📍 Auto-center sur première pharmacie:', resultsWithDistance[0].name);
      return [resultsWithDistance[0].lat, resultsWithDistance[0].lng];
    }
    // Sinon utiliser le centre fourni (position utilisateur)
    return [center.lat, center.lng];
  }, [resultsWithDistance, center]);
  
  // Fonction appelée quand on clique sur une pharmacie dans la liste
  const handlePharmacyClick = (pharmacy) => {
    console.log('🖱️ Clic sur pharmacie:', pharmacy.name);
    setSelectedPharmacy(pharmacy);
    
    // Ouvrir le popup du marqueur correspondant après un court délai
    setTimeout(() => {
      const marker = markerRefs.current[pharmacy.id];
      if (marker) {
        marker.openPopup();
      }
    }, 1600); // Attendre la fin de l'animation flyTo
  };
  
  // Debug: Log des résultats pour vérifier la structure
  console.log('ResultsDisplay - Center fourni:', center);
  console.log('ResultsDisplay - UserLocation reçu:', userLocation);
  console.log('ResultsDisplay - Center auto calculé:', autoCenter);
  console.log('ResultsDisplay - Results with distance:', resultsWithDistance);
  console.log('ResultsDisplay - Number of results:', resultsWithDistance.length);
  if (resultsWithDistance.length > 0) {
    console.log('ResultsDisplay - First result:', resultsWithDistance[0]);
  }
  
  // Composant interne pour la carte
  const PharmaMap = () => (
    <div className="map-area">
      {/* La classe map-canvas dans App.css donne la hauteur nécessaire */}
      <MapContainer 
        center={autoCenter} 
        zoom={resultsWithDistance.length > 0 ? 13 : 14}
        key={`${autoCenter[0]}-${autoCenter[1]}`} // Force re-render quand le centre change 
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
        <MapController selectedPharmacy={selectedPharmacy} />
        
        {/* Marqueur de l'utilisateur (bleu) - TOUJOURS VISIBLE */}
        {(() => {
          console.log('🔍 Vérification marqueur utilisateur:', {
            userLocation,
            hasLat: userLocation?.lat,
            hasLng: userLocation?.lng,
            condition: userLocation && userLocation.lat && userLocation.lng
          });
          
          if (userLocation && userLocation.lat && userLocation.lng) {
            console.log('✅ Affichage marqueur utilisateur à:', [userLocation.lat, userLocation.lng]);
            return (
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <div style={{textAlign: 'center'}}>
                    <strong>� Votre position</strong><br/>
                    <small>Lat: {userLocation.lat.toFixed(4)}<br/>
                    Lng: {userLocation.lng.toFixed(4)}</small>
                  </div>
                </Popup>
              </Marker>
            );
          } else {
            console.log('❌ Marqueur utilisateur NON affiché - userLocation invalide');
            return null;
          }
        })()}

        {/* Marqueurs des pharmacies (croix vertes) */}
        {resultsWithDistance
          .filter(pharmacy => pharmacy.lat && pharmacy.lng) // Filtrer les pharmacies sans coordonnées
          .map((pharmacy) => {
            console.log(`Marker for ${pharmacy.name}:`, {lat: pharmacy.lat, lng: pharmacy.lng, distance: pharmacy.distance});
            return (
              <Marker 
                key={pharmacy.id} 
                position={[pharmacy.lat, pharmacy.lng]}
                icon={pharmacyIcon}
                ref={el => markerRefs.current[pharmacy.id] = el}
                eventHandlers={{
                  click: () => {
                    console.log('📍 Clic sur marqueur:', pharmacy.name);
                    setSelectedPharmacy(pharmacy);
                  }
                }}
              >
                <Popup>
                  <b>{pharmacy.name}</b><br/>
                  {pharmacy.medicineName && <><i className="fas fa-pills"></i> {pharmacy.medicineName}<br/></>}
                  {pharmacy.stock && <>Stock: {pharmacy.stock}<br/></>}
                  {pharmacy.price && <>Prix: {pharmacy.price}<br/></>}
                  {pharmacy.distance && <><i className="fas fa-walking"></i> {pharmacy.distance}</>}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );

  return (
    <div className="results-display-container results-vertical-layout">
      {/* 1. Bloc de la Carte EN HAUT */}
      <div className="map-area-top">
        <PharmaMap />
      </div>

      {/* 2. Bloc de la Liste des Pharmacies EN BAS (horizontal) */}
      <div className="list-area-horizontal">
        <PharmaciesList 
          results={resultsWithDistance} 
          onPharmacyClick={handlePharmacyClick}
          selectedPharmacy={selectedPharmacy}
          onAddToCart={onAddToCart}
          onReviewSubmit={onReviewSubmit}
        />
      </div>
    </div>
  );
}

export default ResultsDisplay;