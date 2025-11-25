// src/services/api.js
// Service centralisé pour tous les appels API backend

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

/**
 * Recherche de médicaments
 * @param {string} query - Nom du médicament à rechercher
 * @param {Object} userLocation - Position de l'utilisateur {lat, lng} (optionnel)
 * @returns {Promise<Array>} Liste des pharmacies avec le médicament
 */
export const searchMedication = async (query, userLocation = null) => {
  try {
    let url = `${API_URL}/api/search/?q=${encodeURIComponent(query)}`;
    
    // Ajouter les coordonnées de l'utilisateur si disponibles
    if (userLocation && userLocation.lat && userLocation.lng) {
      url += `&latitude=${userLocation.lat}&longitude=${userLocation.lng}`;
      console.log(`📍 Position utilisateur envoyée: ${userLocation.lat}, ${userLocation.lng}`);
    } else {
      console.warn('⚠️ Aucune position utilisateur fournie - distances non calculées par le backend');
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('🔍 API Search Response:', data);
    
    // Transformer les données pour le frontend
    const transformed = transformSearchResults(data);
    console.log('✨ Transformed Results:', transformed);
    console.log(`📊 ${transformed.length} pharmacies avec coordonnées`);
    
    // Vérifier les coordonnées
    transformed.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.name}: lat=${p.lat}, lng=${p.lng}, distance=${p.distance || 'non calculée'}`);
    });
    
    return transformed;
  } catch (error) {
    console.error('❌ Erreur recherche médicament:', error);
    throw error;
  }
};

/**
 * Récupérer les pharmacies à proximité
 * @param {number} lat - Latitude de l'utilisateur
 * @param {number} lon - Longitude de l'utilisateur
 * @param {number} radiusMeters - Rayon de recherche en mètres (défaut: 5000)
 * @returns {Promise<Array>} Liste des pharmacies proches
 */
export const getNearbyPharmacies = async (lat, lon, radiusMeters = 5000) => {
  try {
    // Convertir mètres → kilomètres pour l'API backend
    const radiusKm = radiusMeters / 1000;
    console.log(`📍 Recherche pharmacies proches: rayon ${radiusKm} km (${radiusMeters} m)`);
    
    const response = await fetch(
      `${API_URL}/api/nearby/?latitude=${lat}&longitude=${lon}&radius=${radiusKm}`
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

// ============================================================
// 🏥 GESTION DES STOCKS (US 3 - Interface Administration Pharmacie)
// ============================================================

/**
 * Récupère tous les stocks d'une pharmacie
 * GET /api/pharmacies/{pharmacyId}/stocks/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {string} token - Token JWT (optionnel pour lecture publique)
 * @returns {Promise<Array>} Liste des stocks avec détails médicaments
 */
export const fetchPharmacyStocks = async (pharmacyId, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // L'API retourne un objet paginé avec {count, next, previous, results}
    // On extrait le tableau "results"
    const stocks = data.results || data;
    
    console.log(`✅ ${stocks.length} stocks chargés pour pharmacie ${pharmacyId}`);
    return stocks;
  } catch (error) {
    console.error('❌ Erreur chargement stocks:', error);
    throw error;
  }
};

/**
 * Ajoute un nouveau médicament au stock d'une pharmacie
 * POST /api/pharmacies/{pharmacyId}/stocks/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {Object} stockData - Données du stock {medicine, quantity, price, is_available}
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<Object>} Stock créé
 */
export const addStock = async (pharmacyId, stockData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || errorData.message || 'Erreur lors de l\'ajout du stock');
    }
    
    const data = await response.json();
    console.log('✅ Stock ajouté:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur ajout stock:', error);
    throw error;
  }
};

/**
 * Modifie un stock existant (quantité, prix, disponibilité)
 * PATCH /api/pharmacies/{pharmacyId}/stocks/{stockId}/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {number} stockId - ID du stock à modifier
 * @param {Object} updates - Champs à modifier {quantity?, price?, is_available?}
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<Object>} Stock mis à jour
 */
export const updateStock = async (pharmacyId, stockId, updates, token) => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la mise à jour du stock');
    }
    
    const data = await response.json();
    console.log('✅ Stock mis à jour:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur mise à jour stock:', error);
    throw error;
  }
};

/**
 * Supprime un stock
 * DELETE /api/pharmacies/{pharmacyId}/stocks/{stockId}/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {number} stockId - ID du stock à supprimer
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<boolean>} true si suppression réussie
 */
export const deleteStock = async (pharmacyId, stockId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression du stock');
    }
    
    console.log('✅ Stock supprimé');
    return true;
  } catch (error) {
    console.error('❌ Erreur suppression stock:', error);
    throw error;
  }
};

/**
 * Marque un stock comme disponible ou indisponible
 * POST /api/pharmacies/{pharmacyId}/stocks/{stockId}/mark_available/
 * POST /api/pharmacies/{pharmacyId}/stocks/{stockId}/mark_unavailable/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {number} stockId - ID du stock
 * @param {boolean} available - true pour disponible, false pour indisponible
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<Object>} Stock mis à jour
 */
export const toggleStockAvailability = async (pharmacyId, stockId, available, token) => {
  try {
    const endpoint = available ? 'mark_available' : 'mark_unavailable';
    const response = await fetch(
      `${API_URL}/api/pharmacies/${pharmacyId}/stocks/${stockId}/${endpoint}/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Erreur lors du changement de disponibilité');
    }
    
    const data = await response.json();
    console.log(`✅ Stock ${available ? 'disponible' : 'indisponible'}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur changement disponibilité:', error);
    throw error;
  }
};

/**
 * Récupère la liste de tous les médicaments disponibles
 * GET /api/medicines/
 * @returns {Promise<Array>} Liste des médicaments
 */
export const fetchMedicines = async () => {
  try {
    const response = await fetch(`${API_URL}/api/medicines/`);
    
    if (!response.ok) {
      throw new Error('Erreur lors du chargement des médicaments');
    }
    
    const data = await response.json();
    console.log(`✅ ${data.results.length} médicaments chargés`);
    return data.results; // API paginée
  } catch (error) {
    console.error('❌ Erreur chargement médicaments:', error);
    throw error;
  }
};

/**
 * Crée un nouveau médicament
 * POST /api/medicines/
 * @param {Object} medicineData - Données du médicament {name, dosage, form, description, average_price, requires_prescription}
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Médicament créé
 */
export const createMedicine = async (medicineData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/medicines/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicineData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la création du médicament');
    }
    
    const data = await response.json();
    console.log('✅ Médicament créé:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur création médicament:', error);
    throw error;
  }
};

/**
 * Met à jour un médicament existant
 * PUT /api/medicines/{id}/
 * @param {number} medicineId - ID du médicament
 * @param {Object} medicineData - Nouvelles données
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Médicament mis à jour
 */
export const updateMedicine = async (medicineId, medicineData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/medicines/${medicineId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(medicineData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la mise à jour');
    }
    
    const data = await response.json();
    console.log('✅ Médicament mis à jour:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur mise à jour médicament:', error);
    throw error;
  }
};

/**
 * Supprime un médicament
 * DELETE /api/medicines/{id}/
 * @param {number} medicineId - ID du médicament
 * @param {string} token - Token JWT
 * @returns {Promise<void>}
 */
export const deleteMedicine = async (medicineId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/medicines/${medicineId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la suppression');
    }
    
    console.log('✅ Médicament supprimé');
  } catch (error) {
    console.error('❌ Erreur suppression médicament:', error);
    throw error;
  }
};

// ============================================================
// 📝 RÉSERVATIONS (US 6)
// ============================================================

/**
 * Soumet une réservation de médicaments
 * POST /api/reservations/
 * @param {Array} items - Liste des items à réserver
 * @param {Object} contact - Informations de contact
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<Object>} Réservation créée
 */
export const submitReservation = async (items, contact, token) => {
  try {
    const response = await fetch(`${API_URL}/api/reservations/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items, contact })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de la réservation');
    }
    
    const data = await response.json();
    console.log('✅ Réservation créée:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur réservation:', error);
    throw error;
  }
};

// ============================================================
// ⭐ AVIS ET NOTATIONS (US 8)
// ============================================================

/**
 * Soumet un avis et une note pour une pharmacie
 * POST /api/pharmacies/{pharmacyId}/reviews/
 * @param {number} pharmacyId - ID de la pharmacie
 * @param {number} rating - Note de 1 à 5
 * @param {string} comment - Commentaire (optionnel)
 * @param {string} token - Token JWT (requis)
 * @returns {Promise<Object>} Avis créé
 */
export const submitPharmacyReview = async (pharmacyId, rating, comment, token) => {
  try {
    const response = await fetch(`${API_URL}/api/pharmacies/${pharmacyId}/reviews/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        rating: parseInt(rating), 
        comment: comment || '' 
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Erreur lors de l\'envoi de l\'avis');
    }
    
    const data = await response.json();
    console.log('✅ Avis soumis:', data);
    return data;
  } catch (error) {
    console.error('❌ Erreur soumission avis:', error);
    throw error;
  }
};

// ============================================================
// 🔐 AUTHENTIFICATION (US 4)
// ============================================================

/**
 * Connexion utilisateur
 * POST /api/auth/login/
 * @param {string} username - Nom d'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} {user, tokens, message}
 */
export const login = async (username, password) => {
  try {
    console.log(`🔐 Tentative de connexion: ${username}`);
    
    const response = await fetch(`${API_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error || errorData.detail || 'Identifiants invalides';
      console.error('❌ Erreur connexion:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Connexion réussie:', data.user.username);
    console.log('   Type:', data.user.user_type);
    console.log('   Token reçu:', data.tokens.access.substring(0, 20) + '...');
    
    return data;
  } catch (error) {
    console.error('❌ Erreur connexion:', error.message);
    throw error;
  }
};

/**
 * Inscription utilisateur
 * POST /api/auth/register/
 * @param {string} username - Nom d'utilisateur
 * @param {string} email - Email
 * @param {string} password - Mot de passe
 * @param {string} userType - Type d'utilisateur (customer, pharmacy, admin)
 * @param {Object} extraData - Données supplémentaires (firstName, lastName, phone, etc.)
 * @returns {Promise<Object>} {user, tokens, message}
 */
export const register = async (username, email, password, userType = 'customer', extraData = {}) => {
  try {
    console.log(`📝 Tentative d'inscription: ${username} (${email})`);
    
    const requestData = {
      username,
      email,
      password,
      password2: password, // Backend exige la confirmation du mot de passe
      user_type: userType,
      ...extraData
    };
    
    const response = await fetch(`${API_URL}/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Extraire les messages d'erreur du backend
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.username) {
        errorMessage = `Username: ${errorData.username[0]}`;
      } else if (errorData.email) {
        errorMessage = `Email: ${errorData.email[0]}`;
      } else if (errorData.password) {
        errorMessage = `Mot de passe: ${errorData.password[0]}`;
      }
      
      console.error('❌ Erreur inscription:', errorMessage);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Inscription réussie:', data.user.username);
    console.log('   Type:', data.user.user_type);
    console.log('   Token reçu:', data.tokens.access.substring(0, 20) + '...');
    
    return data;
  } catch (error) {
    console.error('❌ Erreur inscription:', error.message);
    throw error;
  }
};

/**
 * Rafraîchir le token JWT
 * POST /api/auth/token/refresh/
 * @param {string} refreshToken - Token de rafraîchissement
 * @returns {Promise<string>} Nouveau access token
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    console.log('🔄 Rafraîchissement du token...');
    
    const response = await fetch(`${API_URL}/api/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token de rafraîchissement expiré ou invalide');
    }

    const data = await response.json();
    console.log('✅ Token rafraîchi avec succès');
    
    return data.access;
  } catch (error) {
    console.error('❌ Erreur refresh token:', error.message);
    throw error;
  }
};
