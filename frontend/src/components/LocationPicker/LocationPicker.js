// src/components/LocationPicker/LocationPicker.js
/**
 * Composant professionnel de sélection de position GPS
 * Fonctionnalités:
 * - Carte Leaflet interactive
 * - Géolocalisation automatique
 * - Recherche d'adresse (Nominatim)
 * - Marqueur draggable
 * - Reverse geocoding
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

// Fix pour l'icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône personnalisée pour la pharmacie
const pharmacyIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path fill="#10b981" d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8z"/>
      <circle cx="12" cy="8" r="5" fill="white"/>
      <path fill="#10b981" d="M11 5h2v6h-2zM9 7h6v2H9z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Composant pour gérer les clics sur la carte
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Composant pour recentrer la carte
function MapController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 15, { duration: 1 });
    }
  }, [center, zoom, map]);
  
  return null;
}

// Composant pour le marqueur draggable
function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);
  
  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker != null) {
        const { lat, lng } = marker.getLatLng();
        onDragEnd(lat, lng);
      }
    },
  };
  
  return position ? (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={pharmacyIcon}
    />
  ) : null;
}

export default function LocationPicker({ 
  value = { latitude: null, longitude: null },
  onChange,
  label = "Position de la pharmacie",
  required = false,
  error = null,
  disabled = false
}) {
  const [position, setPosition] = useState(
    value.latitude && value.longitude 
      ? [value.latitude, value.longitude] 
      : null
  );
  const [mapCenter, setMapCenter] = useState([3.8480, 11.5021]); // Yaoundé par défaut
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [addressDisplay, setAddressDisplay] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);

  // Mettre à jour la position quand value change
  useEffect(() => {
    if (value.latitude && value.longitude) {
      setPosition([value.latitude, value.longitude]);
      setMapCenter([value.latitude, value.longitude]);
    }
  }, [value.latitude, value.longitude]);

  // Reverse geocoding - obtenir l'adresse à partir des coordonnées
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr`
      );
      const data = await response.json();
      if (data.display_name) {
        setAddressDisplay(data.display_name);
      }
    } catch (error) {
      console.error('Erreur reverse geocoding:', error);
    }
  }, []);

  // Gérer la sélection de position
  const handleLocationSelect = useCallback((lat, lng) => {
    if (disabled) return;
    
    const newPosition = [lat, lng];
    setPosition(newPosition);
    setMapCenter(newPosition);
    onChange({ latitude: lat, longitude: lng });
    reverseGeocode(lat, lng);
  }, [disabled, onChange, reverseGeocode]);

  // Géolocalisation automatique
  const handleGeolocation = useCallback(() => {
    if (disabled) return;
    
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
      return;
    }

    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationSelect(latitude, longitude);
        setIsLocating(false);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
        alert('Impossible d\'obtenir votre position. Vérifiez vos paramètres de localisation.');
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [disabled, handleLocationSelect]);

  // Recherche d'adresse
  const searchAddress = useCallback(async (query) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=cm&limit=5&accept-language=fr`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur recherche adresse:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce pour la recherche
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      searchAddress(query);
    }, 500);
  }, [searchAddress]);

  // Sélectionner un résultat de recherche
  const handleSelectResult = useCallback((result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    handleLocationSelect(lat, lng);
    setSearchQuery(result.display_name);
    setShowResults(false);
  }, [handleLocationSelect]);

  return (
    <div className={`location-picker ${disabled ? 'disabled' : ''} ${error ? 'has-error' : ''}`}>
      <label className="location-picker-label">
        <span className="label-icon">📍</span>
        {label}
        {required && <span className="required">*</span>}
      </label>

      {/* Barre de recherche et boutons */}
      <div className="location-picker-controls">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Rechercher une adresse au Cameroun..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            disabled={disabled}
          />
          {isSearching && <span className="search-spinner">🔍</span>}
          
          {/* Résultats de recherche */}
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="search-result-item"
                  onClick={() => handleSelectResult(result)}
                >
                  <span className="result-icon">📍</span>
                  <span className="result-text">{result.display_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="geolocation-button"
          onClick={handleGeolocation}
          disabled={disabled || isLocating}
          title="Utiliser ma position actuelle"
        >
          {isLocating ? (
            <span className="spinner">⏳</span>
          ) : (
            <span>🎯</span>
          )}
          <span className="button-text">Ma position</span>
        </button>
      </div>

      {/* Carte */}
      <div className="map-container">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="leaflet-map"
          scrollWheelZoom={!disabled}
          dragging={!disabled}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} zoom={15} />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          <DraggableMarker 
            position={position} 
            onDragEnd={handleLocationSelect}
          />
        </MapContainer>

        {/* Instructions */}
        <div className="map-instructions">
          <span>💡</span>
          <span>Cliquez sur la carte ou glissez le marqueur pour ajuster la position</span>
        </div>
      </div>

      {/* Coordonnées */}
      {position && (
        <div className="coordinates-display">
          <div className="coordinate-box">
            <label>Latitude</label>
            <input
              type="number"
              value={position[0].toFixed(6)}
              readOnly
              className="coordinate-input"
            />
          </div>
          <div className="coordinate-box">
            <label>Longitude</label>
            <input
              type="number"
              value={position[1].toFixed(6)}
              readOnly
              className="coordinate-input"
            />
          </div>
        </div>
      )}

      {/* Adresse détectée */}
      {addressDisplay && (
        <div className="address-display">
          <span className="address-icon">✅</span>
          <span className="address-text">{addressDisplay}</span>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
