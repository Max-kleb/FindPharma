// src/services/api.js
// Service centralisé pour tous les appels API backend

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';
// URL pour la gestion des alertes (US 7)
const API_ALERTS_URL = `${API_URL}/api/alerts/subscribe/`; 
// 💡 NOUVELLE CONSTANTE POUR LES AVIS (US8)
const API_REVIEW_URL = `${API_URL}/api/reviews/`; 

/**
 * Recherche de médicaments (US 6: Ajout des filtres)
 * @param {string} query - Nom du médicament à rechercher
 * @param {Object} userLocation - Position de l'utilisateur {lat, lng} (optionnel)
 * @param {Object} filters - Filtres {prixMax, distanceKm} (US 6)
 * @returns {Promise<Array>} Liste des pharmacies avec le médicament
 */
export const searchMedication = async (query, userLocation = null, filters = {}) => {
  try {
    let url = `${API_URL}/api/search/?q=${encodeURIComponent(query)}`;
    
    // Ajouter les coordonnées de l'utilisateur si disponibles
    if (userLocation && userLocation.lat && userLocation.lng) {
      url += `&latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
      console.log(`📍 Position utilisateur envoyée: ${userLocation.lat}, ${userLocation.lng}`);
    } else {
      console.warn('⚠️ Aucune position utilisateur fournie - distances non calculées par le backend');
    }
    
    // US 6: Ajout des filtres
    if (filters.prixMax) {
      url += `&prix_max=${filters.prixMax}`; 
      console.log(`🔍 Filtre Prix Max: ${filters.prixMax} XAF`);
    }

    if (filters.distanceKm) {
      const distanceMeters = filters.distanceKm * 1000;
      url += `&distance_max=${distanceMeters}`; 
      console.log(`🔍 Filtre Distance Max: ${filters.distanceKm} km`);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 API Search Response:', data);
    
    const transformed = transformSearchResults(data);
    
    console.log('✨ Transformed Results:', transformed);
    console.log(`📊 ${transformed.length} pharmacies avec coordonnées`);
    
    return transformed;
  } catch (error) {
    console.error('❌ Erreur recherche médicament:', error);
    throw error;
  }
};

/**
 * US 7: Abonne l'utilisateur à une alerte de retour en stock.
 * @param {number} pharmacyId - ID de la pharmacie concernée
 * @param {string} medicineName - Nom du médicament
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const subscribeToStockAlert = async (pharmacyId, medicineName) => {
  // Simule la collecte de l'information de contact
  const contactInfo = prompt("Veuillez entrer votre email ou numéro de téléphone (Ex: +237...) pour être alerté du retour en stock de l'article :");

  if (!contactInfo || contactInfo.trim() === "") {
    alert("Abonnement annulé. Information de contact requise.");
    return;
  }

  try {
    console.log(`🔔 Tentative d'abonnement pour: ${medicineName}, contact: ${contactInfo}`);
    
    const response = await fetch(API_ALERTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pharmacy_id: pharmacyId,
        medicine_name: medicineName,
        contact_info: contactInfo.trim(),
      }),
    });

    if (response.status === 201 || response.status === 200) {
      alert(`✅ Abonnement réussi ! Vous serez alerté au ${contactInfo} dès le retour en stock de ${medicineName}.`);
      return response.json();
    }
    
    const errorData = await response.json();
    console.error('Erreur API alerte:', errorData);
    throw new Error(errorData.detail || "Échec de l'abonnement à l'alerte.");

  } catch (error) {
    alert(`🚨 Échec de l'abonnement: ${error.message}`);
    console.error('❌ Erreur abonnement alerte:', error);
    throw error;
  }
};

// 💡 NOUVELLE FONCTION POUR US8 (Soumission d'Avis/Notation)
/**
 * US 8: Soumet un avis et une note pour une pharmacie.
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {number} rating - Note de 1 à 5
 * @param {string} comment - Commentaire de l'utilisateur
 * @param {string} userToken - Token d'authentification de l'utilisateur (US 4)
 * @returns {Promise<Object>} Résultat de l'opération
 */
export const submitPharmacyReview = async (pharmacyId, rating, comment, userToken) => {
    try {
        const payload = {
            pharmacy_id: pharmacyId,
            score: rating,
            comment: comment
        };
        
        const response = await fetch(API_REVIEW_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // US 4: Le token est requis pour identifier l'utilisateur
                'Authorization': `Bearer ${userToken}`, 
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Échec de la soumission de l\'avis.');
        }

        const result = await response.json();
        console.log("✅ Avis soumis:", result);
        return result;

    } catch (error) {
        console.error("❌ Erreur API lors de la soumission de l'avis:", error);
        alert(`🚨 Erreur de soumission d'avis: ${error.message}`);
        throw error;
    }
};
// FIN DE L'AJOUT US8

/**
 * Récupérer les pharmacies à proximité (US 1)
 * @param {number} lat - Latitude de l'utilisateur
 * @param {number} lon - Longitude de l'utilisateur
 * @param {number} radiusMeters - Rayon de recherche en mètres (défaut: 5000)
 * @returns {Promise<Array>} Liste des pharmacies proches
 */
export const getNearbyPharmacies = async (lat, lon, radiusMeters = 5000) => {
  try {
    const radiusKm = radiusMeters / 1000;
    console.log(`📍 Recherche pharmacies proches: rayon ${radiusKm} km (${radiusMeters} m)`);
    
    const response = await fetch(
      `${API_URL}/api/nearby/?latitude=${lat}&longitude=${lon}&radius=${radiusKm}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
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
  
  apiData.results.forEach(medicine => {
    medicine.pharmacies?.forEach(pharmacy => {
      pharmacies.push({
        id: pharmacy.id,
        name: pharmacy.name,
        address: pharmacy.address,
        stock: pharmacy.stock?.is_available ? "En Stock" : "Épuisé",
        price: pharmacy.stock?.price ? `${parseFloat(pharmacy.stock.price).toFixed(0)} XAF` : null, // US 6
        phone: pharmacy.phone, // US 5
        distance: pharmacy.distance ? formatDistance(pharmacy.distance) : null,
        lat: pharmacy.latitude,
        lng: pharmacy.longitude,
        medicineName: `${medicine.name} ${medicine.dosage}`,
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
    stock: null, 
    price: null,
    medicineName: null,
    phone: pharmacy.phone,
    distance: formatDistance(pharmacy.distance),
    lat: pharmacy.latitude,
    lng: pharmacy.longitude
  }));
}

/**
 * Formater la distance (mètres → km)
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