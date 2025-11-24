// src/PharmaciesList.js
import React from 'react';
// US 7: Import de la fonction d'abonnement au service API
import { subscribeToStockAlert } from './services/api'; 

/**
 * Liste des pharmacies affichées.
 * 💡 US 5 (Panier) : Ajout des props onAddToCart.
 * 💡 US 8 (Avis) : Ajout des props onReviewSubmit.
 */
function PharmaciesList({ 
    results, 
    onPharmacyClick, 
    selectedPharmacy, 
    userLocation, 
    onReviewSubmit, // US 8: Pour soumettre un avis
    onAddToCart     // US 5: Pour ajouter au panier
}) {
    
  // US 7: Fonction de gestion de l'alerte
  const handleSubscribeToAlert = async (pharmacyId, medicineName) => {
    // Vérification essentielle pour l'US 7 : on a besoin de l'ID du médicament et du nom.
    if (!pharmacyId || !medicineName) {
      console.error("Informations d'alerte manquantes (ID Pharmacie ou Nom Médicament)");
      alert("Erreur : Impossible de s'abonner à l'alerte. Informations manquantes.");
      return;
    }
    
    // Appel au service API (le service gère l'affichage du prompt et des alertes)
    await subscribeToStockAlert(pharmacyId, medicineName);
  };
    
  // US 5: Fonction pour générer le lien Google Maps
  const getDirectionsLink = (pharmacy) => {
      if (userLocation && pharmacy.lat && pharmacy.lng) {
          const origin = `${userLocation.lat},${userLocation.lng}`;
          const destination = `${pharmacy.lat},${pharmacy.lng}`;
          // Utilisation du lien valide de Google Maps
          return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
      }
      return '#';
  };
    
  // 💡 US 5 (Panier) : Fonction pour gérer l'ajout au panier
  const handleAddToCart = (pharmacy) => {
    if (!onAddToCart) return;

    if (pharmacy.stock !== "En Stock" && pharmacy.stock !== "Stock Limité") {
        alert("Cet article n'est malheureusement pas en stock et ne peut être ajouté au panier pour l'instant.");
        return;
    }

    const itemToAdd = {
        id: pharmacy.id, 
        medicineName: pharmacy.medicineName,
        pharmacyName: pharmacy.name,
        price: pharmacy.price,
        quantity: 1, 
        pharmacyLat: pharmacy.lat,
        pharmacyLng: pharmacy.lng,
        medicineDetails: pharmacy.medicine, 
    };
    
    onAddToCart(itemToAdd);
    alert(`${pharmacy.medicineName} chez ${pharmacy.name} a été ajouté à votre panier !`);
  };

  const getStockDisplay = (stock) => {
    switch (stock) {
      case "En Stock":
        return (<span className="status-info status-en-stock"><i className="fas fa-check-circle stock-status-icon"></i> En Stock</span>);
      case "Stock Limité":
        return (<span className="status-info status-stock-limite"><i className="fas fa-exclamation-triangle stock-status-icon"></i> Stock Limité</span>);
      case "Épuisé":
        return (<span className="status-info status-epuise"><i className="fas fa-times-circle stock-status-icon"></i> Épuisé</span>);
      default:
        return null;
    }
  };

  const isMedicineSearch = results.length > 0 && results[0].medicineName;

  return (
    <div className="pharmacies-list-box">
      <h3>{isMedicineSearch ? 'Résultats de recherche' : 'Pharmacies à Proximité'}</h3>
      {results.map((pharmacy) => (
        <div 
          key={pharmacy.id} 
          className={`pharmacy-item ${selectedPharmacy?.id === pharmacy.id ? 'pharmacy-selected' : ''}`}
          onClick={() => onPharmacyClick && onPharmacyClick(pharmacy)}
          style={{ cursor: onPharmacyClick ? 'pointer' : 'default' }}
        >
          <div className="pharmacy-main-info">
            <p className="pharmacy-name">{pharmacy.name}</p>
            
            {/* 💡 US 8: Affichage de la note moyenne */}
            {pharmacy.averageRating && (
                <p className="pharmacy-rating">
                    <i className="fas fa-star rating-icon"></i> 
                    **{pharmacy.averageRating.toFixed(1)}** <span className="review-count">({pharmacy.reviewCount || 0} avis)</span>
                </p>
            )}

            {isMedicineSearch && pharmacy.medicineName && (
              <p className="medicine-name"><i className="fas fa-pills"></i> {pharmacy.medicineName}</p>
            )}
            {isMedicineSearch && pharmacy.price && (
              <p className="pharmacy-price">{pharmacy.price}</p>
            )}
          </div>
          
          <div className="pharmacy-details">
            
            <div className="stock-info-actions">
              {isMedicineSearch && getStockDisplay(pharmacy.stock)}
              
              {/* US 7: Bouton d'alerte (si épuisé) */}
              {isMedicineSearch && pharmacy.stock === "Épuisé" && pharmacy.medicine && (
                  <button 
                      className="alert-button"
                      onClick={(e) => {
                          e.stopPropagation(); 
                          handleSubscribeToAlert(pharmacy.id, pharmacy.medicine.name);
                      }}
                      title="M'alerter par email ou téléphone dès que le stock est renouvelé."
                  >
                      <i className="fas fa-bell"></i> M'alerter
                  </button>
              )}

              {/* 💡 US 5 (Panier): Bouton Ajouter au Panier (si en stock) */}
              {isMedicineSearch && pharmacy.stock !== "Épuisé" && onAddToCart && (
                  <button 
                      className="add-to-cart-button"
                      onClick={(e) => {
                          e.stopPropagation(); 
                          handleAddToCart(pharmacy);
                      }}
                      title="Ajouter cet article à votre panier de simulation ou de réservation."
                  >
                      <i className="fas fa-cart-plus"></i> Ajouter au Panier
                  </button>
              )}
            </div>

            <div className="contact-distance">
              
              {/* US 5/Contact: Contact Téléphone */}
              {pharmacy.phone && (
                <span className="phone-number">
                  <a href={`tel:${pharmacy.phone.replace(/\s/g, '')}`} title="Appeler la pharmacie">
                    <i className="fas fa-phone"></i> {pharmacy.phone}
                  </a>
                </span>
              )}

              {pharmacy.distance && (
                <span className="distance">
                  <i className="fas fa-walking"></i> {pharmacy.distance}
                </span>
              )}
            </div>
            
            {/* 💡 US 8: Bouton pour laisser un avis */}
            {onReviewSubmit && (
                <button 
                    className="review-button"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onReviewSubmit(pharmacy); 
                    }}
                    title="Laisser une note et un avis pour cette pharmacie."
                >
                    <i className="fas fa-comment-dots"></i> Noter
                </button>
            )}

            {/* US 5/Contact: Adresse et Bouton Itinéraire */}
            {pharmacy.address && (
              <p className="pharmacy-address">
                <i className="fas fa-map-marker-alt"></i> {pharmacy.address}
                
                <a 
                  href={getDirectionsLink(pharmacy)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="direction-button"
                  title="Obtenir l'itinéraire"
                >
                  <i className="fas fa-route"></i> Itinéraire
                </a>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default PharmaciesList;