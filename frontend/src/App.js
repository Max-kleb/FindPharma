// src/App.js 
import React, { useState, useMemo } from 'react'; 
import './App.css';
import Header from './Header';
import SearchSection from './SearchSection';
import ResultsDisplay from './ResultsDisplay';
import StockManager from './StockManager'; 
import AdminDashboard from './AdminDashboard';

// 💡 IMPORTS US 4
import AuthModal from './AuthModal'; 
// 💡 IMPORTS US 5, US 6, US 8
import Cart from './Cart'; 
import ReservationModal from './ReservationModal';
import { submitReservation, submitPharmacyReview } from './services/api'; 


// Coordonnées par défaut du centre de Yaoundé, Cameroun
const DEFAULT_CENTER = { 
  lat: 3.8480, // Latitude Yaoundé
  lng: 11.5021 // Longitude Yaoundé
};

function App() {
  // ... (États US 1, US 2, US 5, US 6 inchangés) ...

  // 1. État de localisation (Centrage de la carte)
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  
  // 2. US 2: États pour la RECHERCHE DE MÉDICAMENTS
  const [medicationPharmacies, setMedicationPharmacies] = useState([]);
  const [searchQuery, setSearchQuery] = useState(''); 
  
  // 3. US 1: État pour les PHARMACIES PROCHES par défaut (Ajout de data US 8)
  const [nearbyPharmacies, setNearbyPharmacies] = useState([
    { id: 1, name: "Pharmacie de la Mairie", address: "Mvog-Ada, Yaoundé", stock: "En Stock", price: "9 500 XAF", phone: "+237 222 00 00 01", distance: "1.2 km", lat: 3.849, lng: 11.505, averageRating: 4.5, reviewCount: 12, medicine: { name: "Paracétamol", dosage: "500mg" } },
    { id: 2, name: "Grande Pharmacie Centrale", address: "Centre Ville, Douala", stock: "Stock Limité", price: "8 990 XAF", phone: "+237 699 00 00 02", distance: "2.5 km", lat: 3.845, lng: 11.500, averageRating: 3.8, reviewCount: 5, medicine: { name: "Paracétamol", dosage: "500mg" } },
    { id: 3, name: "Pharmacie d'Urgence", address: "Quartier Fouda, Yaoundé", stock: "Épuisé", price: null, phone: null, distance: "4.1 km", lat: 3.855, lng: 11.510, averageRating: 0, reviewCount: 0, medicine: { name: "Paracétamol", dosage: "500mg" } },
  ]); 
  
  // 4. États de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 💡 US 4: Nouveaux États pour l'authentification et le rôle
  const [userToken, setUserToken] = useState(null); 
  const [showAuthModal, setShowAuthModal] = useState(false); 
  const [authMode, setAuthMode] = useState('login'); 
  
  const isLoggedIn = !!userToken;
  // Simulation : l'utilisateur est admin si son token (simulé) l'indique.
  const isAdmin = isLoggedIn && userToken.includes('admin'); 

  // 5. US3 & US4 : Gestion du Rôle et de la Vue
  const [currentView, setCurrentView] = useState('user'); 

  // 💡 US 5: État du panier
  const [cartItems, setCartItems] = useState([]); 
  
  // 💡 US 6: État pour le modal de réservation
  const [showReservationModal, setShowReservationModal] = useState(false); 

  // 💡 US 4: Handlers d'Authentification
  const handleAuthSuccess = (token, role) => {
      setUserToken(token);
      // Le token est passé à l'API pour les US 6 et US 8
  };

  const handleLogout = () => {
      setUserToken(null);
      setCurrentView('user'); // Retour à la vue utilisateur par défaut
      alert("Déconnexion réussie.");
  };
  
  const openAuthModal = (mode) => {
      setAuthMode(mode);
      setShowAuthModal(true);
  };
  // Fin US 4 Handlers

  // Fonction pour basculer entre les vues
  const toggleView = () => {
      setCurrentView(currentView === 'user' ? 'admin' : 'user');
  };

  // ... (LOGIQUE US 5 : PANIER - inchangée) ...
  const addToCart = (item) => { /* ... */ };
  const removeFromCart = (id, index) => { /* ... */ };
  const clearCart = () => { /* ... */ };
  const calculateTotalPrice = useMemo(() => { /* ... */ }, [cartItems]);
  // ... (Fin LOGIQUE US 5) ...

  // ... (LOGIQUE US 6 : RÉSERVATION - inchangée) ...
  const handleProceedToReservation = () => { /* ... */ };
  const handleReservationSubmit = async (items, contact) => { /* ... */ };
  // ... (Fin LOGIQUE US 6) ...

  // 💡 US 8 : NOTATION/AVIS (Ajout de la vérification isLoggedIn)
  const handleReviewSubmit = (pharmacy) => {
      if (!isLoggedIn) {
          alert("Vous devez être connecté pour laisser une note et un avis (US 4).");
          openAuthModal('login');
          return;
      }
      const rating = prompt(`Notez ${pharmacy.name} de 1 à 5 :`);
      const comment = prompt(`Laissez un commentaire (optionnel) :`);
      
      if (rating && !isNaN(parseInt(rating))) {
          submitPharmacyReview(pharmacy.id, parseInt(rating), comment, userToken); // Passage du token
      } else {
          alert("Note annulée ou invalide.");
      }
  };


  // 6. LOGIQUE CLÉ : Déterminer quels résultats doivent être affichés (US 2 > US 1)
  const resultsToDisplay = useMemo(() => {
    if (currentView === 'admin') return [];
      
    if (searchQuery.length > 0) {
      return medicationPharmacies;
    }
    
    return nearbyPharmacies;
  }, [searchQuery, medicationPharmacies, nearbyPharmacies, currentView]);


  // 7. FONCTION DE RENDU CONDITIONNEL
  const renderContent = () => {
      // 🚨 Vue Administration (US3 et US8)
      if (currentView === 'admin' && isAdmin) {
          // ... (Contenu admin inchangé) ...
          return (
              <main className="main-content admin-mode">
                  <StockManager />
                  <AdminDashboard /> 
              </main>
          );
      }
      
      // 🛒 Vue Utilisateur (US1, US2, US4, US5, US6, US8)
      return (
          <main className="main-content user-mode">
              
              {/* US1 & US2 : Section de Recherche */}
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

              {/* Affichage de la Carte et de la Liste des Résultats + Panier */}
              {!loading && !error && (
                  <div className="results-and-cart-layout">
                      <div className="results-container">
                          <ResultsDisplay 
                            results={resultsToDisplay} 
                            center={userLocation}
                            userLocation={userLocation}
                            // Props passées à PharmaciesList via ResultsDisplay
                            onReviewSubmit={handleReviewSubmit} // US 8
                            onAddToCart={addToCart}           // US 5
                          />
                      </div>
                      
                      <aside className="cart-sidebar">
                          <Cart 
                              cartItems={cartItems}
                              onRemoveItem={removeFromCart}
                              onClearCart={clearCart}
                              onProceedToReservation={handleProceedToReservation} // US 6
                          />
                      </aside>
                  </div>
              )}
              
          </main>
      );
  };


  return (
    <div className="app-container">
      {/* 💡 US 4: Mise à jour du Header pour les boutons d'auth */}
      <Header 
        isLoggedIn={isLoggedIn}
        onLogin={() => openAuthModal('login')}
        onRegister={() => openAuthModal('register')}
        onLogout={handleLogout}
      />
      
      {/* 🧭 Bouton de Bascule */}
      {isLoggedIn && isAdmin && (
          <button onClick={toggleView} className="toggle-view-button">
              {currentView === 'user' 
                  ? 'Aller à la Gestion (US3/US8)' 
                  : 'Retour à la Recherche'}
          </button>
      )}

      {renderContent()}
      
      {/* 💡 US 4: Le Modal d'Authentification (affiché au-dessus de tout) */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      )}

      {/* US 6 : Le Modal de Réservation */}
      {showReservationModal && (
          <ReservationModal 
              cartItems={cartItems}
              totalPrice={calculateTotalPrice} 
              onSubmit={handleReservationSubmit} 
              onClose={() => setShowReservationModal(false)}
          />
      )}

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