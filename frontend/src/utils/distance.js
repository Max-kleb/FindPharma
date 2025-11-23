// Fonction pour calculer la distance entre deux coordonnées GPS (formule de Haversine)
// Retourne la distance en kilomètres

export function calculateDistance(lat1, lon1, lat2, lon2) {
  // Rayon de la Terre en kilomètres
  const R = 6371;
  
  // Convertir les degrés en radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  const distance = R * c;
  
  return distance;
}

// Fonction pour convertir des degrés en radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

// Fonction pour formater la distance de manière lisible
export function formatDistance(distanceInKm) {
  const distanceInMeters = distanceInKm * 1000;
  
  if (distanceInMeters < 1000) {
    // Si moins de 1000 m, afficher en mètres
    return `${Math.round(distanceInMeters)} m`;
  } else {
    // Si >= 1000 m, afficher en kilomètres avec 1 décimale
    return `${distanceInKm.toFixed(1)} km`;
  }
}
