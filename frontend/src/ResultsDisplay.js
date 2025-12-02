// src/ResultsDisplay.js
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import PharmaciesList from './PharmaciesList';
import { calculateDistance, formatDistance } from './utils/distance';

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
function MapController({ pharmacyId, lat, lng }) {
  const map = useMap();
  const lastCenteredId = useRef(null);
  
  useEffect(() => {
    // Ne centrer que si c'est une nouvelle pharmacie avec des coordonnées valides
    if (pharmacyId && lat && lng && pharmacyId !== lastCenteredId.current) {
      lastCenteredId.current = pharmacyId;
      map.flyTo([lat, lng], 16, { duration: 1.0 });
    }
  }, [pharmacyId, lat, lng, map]);
  
  useEffect(() => {
    if (!pharmacyId) {
      lastCenteredId.current = null;
    }
  }, [pharmacyId]);
  
  return null;
}

const mapContainerStyle = { height: '100%', width: '100%' };

function ResultsDisplay({ results, center, userLocation, onAddToCart, onReviewSubmit }) {
  const { t } = useTranslation();
  // État pour la pharmacie sélectionnée
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  
  // Références pour les marqueurs (pour pouvoir ouvrir leurs popups)
  const markerRefs = useRef({});
  
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
      return [resultsWithDistance[0].lat, resultsWithDistance[0].lng];
    }
    return [center.lat, center.lng];
  }, [resultsWithDistance, center]);
  
  // Fonction appelée quand on clique sur une pharmacie dans la liste
  const handlePharmacyClick = (pharmacy) => {
    setSelectedPharmacy(pharmacy);
    
    // Ouvrir le popup du marqueur correspondant après un court délai
    setTimeout(() => {
      const marker = markerRefs.current[pharmacy.id];
      if (marker) {
        marker.openPopup();
      }
    }, 1100);
  };

  return (
    <div className="results-display-container results-vertical-layout">
      {/* 1. Bloc de la Carte EN HAUT */}
      <div className="map-area-top">
        <div className="map-area">
          <MapContainer 
            center={autoCenter} 
            zoom={resultsWithDistance.length > 0 ? 13 : 14}
            style={mapContainerStyle}
            scrollWheelZoom={false}
            className="map-canvas"
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapResizer />
            <MapController 
              pharmacyId={selectedPharmacy?.id} 
              lat={selectedPharmacy?.lat} 
              lng={selectedPharmacy?.lng} 
            />
            
            {/* Marqueur de l'utilisateur (bleu) */}
            {userLocation && userLocation.lat && userLocation.lng && (
              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userIcon}
                zIndexOffset={1000}
              >
                <Popup>
                  <div style={{textAlign: 'center'}}>
                    <strong>📍 {t('hero.cards.positionDetected')}</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Marqueurs des pharmacies */}
            {resultsWithDistance
              .filter(pharmacy => pharmacy.lat && pharmacy.lng)
              .map((pharmacy) => (
                <Marker 
                  key={pharmacy.id} 
                  position={[pharmacy.lat, pharmacy.lng]}
                  icon={pharmacyIcon}
                  ref={el => markerRefs.current[pharmacy.id] = el}
                  eventHandlers={{
                    click: () => setSelectedPharmacy(pharmacy)
                  }}
                >
                  <Popup>
                    <b>{pharmacy.name}</b><br/>
                    {pharmacy.medicineName && <>{pharmacy.medicineName}<br/></>}
                    {pharmacy.stock && <>{t('stocks.quantity')}: {pharmacy.stock}<br/></>}
                    {pharmacy.price && <>{t('stocks.price')}: {pharmacy.price}<br/></>}
                    {pharmacy.distance && <>{pharmacy.distance}</>}
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
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