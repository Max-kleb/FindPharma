// src/services/api.js
// Service centralisé pour tous les appels API backend

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Recherche de médicaments
 * @param {string} query - Nom du médicament à rechercher
 * @returns {Promise<Array>} Liste des pharmacies avec le médicament
 */
export const searchMedication = async (query) => {
  try {
    const response = await fetch(`${API_URL}/api/search/?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformer les données pour le frontend
    return transformSearchResults(data);
  } catch (error) {
    console.error('Erreur recherche médicament:', error);
    throw error;
  }
};

/**
 * Récupérer les pharmacies à proximité
 * @param {number} lat - Latitude de l'utilisateur
 * @param {number} lon - Longitude de l'utilisateur
 * @param {number} radius - Rayon de recherche en mètres (défaut: 5000)
 * @returns {Promise<Array>} Liste des pharmacies proches
 */
export const getNearbyPharmacies = async (lat, lon, radius = 5000) => {
  try {
    const response = await fetch(
      `${API_URL}/api/nearby/?latitude=${lat}&longitude=${lon}&radius=${radius}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transformer les données pour le frontend
    return transformNearbyResults(data);
  } catch (error) {
    console.error('Erreur pharmacies proches:', error);
    throw error;
  }
};

/**
 * Récupérer toutes les pharmacies
 * @returns {Promise<Array>} Liste de toutes les pharmacies
 */
export const getAllPharmacies = async () => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results || data;
  } catch (error) {
    console.error('Erreur liste pharmacies:', error);
    throw error;
  }
};

// === FONCTIONS DE TRANSFORMATION ===

/**
 * Transformer les résultats de recherche de médicaments
 * Backend format → Frontend format
 */
function transformSearchResults(apiData) {
  if (!apiData.results || apiData.results.length === 0) {
    return [];
  }

  const pharmacies = [];
  
  // Pour chaque médicament trouvé
  apiData.results.forEach(medicine => {
    // Pour chaque pharmacie qui a ce médicament
    medicine.pharmacies?.forEach(pharmacy => {
      pharmacies.push({
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        stock: pharmacy.stock?.is_available ? "En Stock" : "Épuisé",
        price: pharmacy.stock?.price ? `${parseFloat(pharmacy.stock.price).toFixed(0)} XAF` : null,
        phone: pharmacy.phone,
        distance: pharmacy.distance ? formatDistance(pharmacy.distance) : null,
        lat: pharmacy.latitude,
        lng: pharmacy.longitude,
        medicineName: `${medicine.name} ${medicine.dosage}`,  // Identifier une recherche médicament
        medicine: {
          name: medicine.name,
          dosage: medicine.dosage,
          form: medicine.form
        }
      });
    });
  });

  return pharmacies;
}

/**
 * Transformer les résultats de pharmacies à proximité
 * Backend format → Frontend format
 */
function transformNearbyResults(apiData) {
  if (!apiData.pharmacies || apiData.pharmacies.length === 0) {
    return [];
  }

  return apiData.pharmacies.map(pharmacy => ({
    id: pharmacy.id,
    name: pharmacy.name,
    address: pharmacy.address,
    stock: null,  // Pas de stock car pas de recherche de médicament
    price: null,  // Pas de prix car pas de recherche de médicament
    medicineName: null,  // Pas de médicament
    phone: pharmacy.phone,
    distance: formatDistance(pharmacy.distance),
    lat: pharmacy.latitude,
    lng: pharmacy.longitude
  }));
}

/**
 * Formater la distance (mètres → km)
 * @param {number} distanceInMeters - Distance en mètres
 * @returns {string} Distance formatée (ex: "1.5 km" ou "500 m")
 */
function formatDistance(distanceInMeters) {
  if (!distanceInMeters) return null;
  
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} m`;
  }
  
  return `${(distanceInMeters / 1000).toFixed(1)} km`;
}

/**
 * Calculer la distance entre deux points (formule Haversine)
 * @param {object} point1 - {lat, lng}
 * @param {object} point2 - {lat, lng}
 * @returns {number} Distance en mètres
 */
export function calculateDistance(point1, point2) {
  const R = 6371000; // Rayon de la Terre en mètres
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en mètres
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}
