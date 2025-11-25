// src/App.js 
import React, { useState, useMemo, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';

// Pages
import HomePage from './pages/HomePage';
import DashboardClient from './pages/DashboardClient';
import StockManagementPage from './pages/StockManagementPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MedicineManager from './MedicineManager';
import FaqPage from './pages/FaqPage';
import AboutPage from './pages/AboutPage';
import LegalPage from './pages/LegalPage';
import ProfilePage from './pages/ProfilePage';

// 💡 IMPORTS US 5, US 6, US 8
import ReservationModal from './ReservationModal';
import { submitPharmacyReview, getNearbyPharmacies } from './services/api'; 


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
  
  // 3. US 1: État pour les PHARMACIES PROCHES (chargées depuis l'API)
  const [nearbyPharmacies, setNearbyPharmacies] = useState([]); 
  
  // 4. États de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 💡 US 4: État d'authentification
  const [userToken, setUserToken] = useState(localStorage.getItem('token')); 
  
  const isLoggedIn = !!userToken;

  // 💡 US 5: État du panier
  const [cartItems, setCartItems] = useState([]); 
  
  // 💡 US 6: État pour le modal de réservation
  const [showReservationModal, setShowReservationModal] = useState(false); 

  // � Charger les pharmacies proches au démarrage
  useEffect(() => {
    const loadNearbyPharmacies = async () => {
      try {
        setLoading(true);
        // Charger les pharmacies dans un rayon de 5km autour de Yaoundé
        const pharmacies = await getNearbyPharmacies(
          userLocation.lat, 
          userLocation.lng, 
          5000 // 5km en mètres
        );
        setNearbyPharmacies(pharmacies);
        console.log(`✅ ${pharmacies.length} pharmacies proches chargées`);
      } catch (err) {
        console.error('❌ Erreur chargement pharmacies:', err);
        setError('Impossible de charger les pharmacies. Vérifiez votre connexion.');
      } finally {
        setLoading(false);
      }
    };
    
    loadNearbyPharmacies();
  }, [userLocation.lat, userLocation.lng]);

  // �💡 US 4: Handlers d'Authentification
  const handleLogout = () => {
      setUserToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('pharmacyId');
      localStorage.removeItem('pharmacyName');
      alert("Déconnexion réussie.");
      window.location.href = '/'; // Rediriger vers l'accueil
  };
  // Fin US 4 Handlers

  // 🛒 LOGIQUE US 5 : PANIER
  const addToCart = (item) => {
    console.log('🛒 Ajout au panier:', item);
    setCartItems(prev => [...prev, { ...item, quantity: 1 }]);
  };
  
  const removeFromCart = (id, index) => {
    console.log('🗑️ Retrait du panier:', id, index);
    setCartItems(prev => prev.filter((_, i) => i !== index));
  };
  
  const clearCart = () => {
    console.log('🧹 Panier vidé');
    setCartItems([]);
  };
  
  const calculateTotalPrice = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const priceValue = parseFloat(item.price?.replace(' XAF', '').replace(/\s/g, '') || '0');
      return sum + (priceValue * (item.quantity || 1));
    }, 0);
  }, [cartItems]);
  // Fin US 5 : PANIER

  // ... (LOGIQUE US 6 : RÉSERVATION - inchangée) ...
  const handleProceedToReservation = () => { /* ... */ };
  const handleReservationSubmit = async (items, contact) => { /* ... */ };
  // ... (Fin LOGIQUE US 6) ...

  // 💡 US 8 : NOTATION/AVIS (Ajout de la vérification isLoggedIn)
  const handleReviewSubmit = (pharmacy) => {
      if (!isLoggedIn) {
          alert("Vous devez être connecté pour laisser une note et un avis (US 4).");
          window.location.href = '/login';
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
    if (searchQuery.length > 0) {
      return medicationPharmacies;
    }
    return nearbyPharmacies;
  }, [searchQuery, medicationPharmacies, nearbyPharmacies]);


  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 💡 US 4: Mise à jour du Header pour les boutons d'auth */}
        <Header 
          isLoggedIn={isLoggedIn}
          onLogout={handleLogout}
        />
        
        {/* Routes de l'application */}
        <Routes>
          {/* Page d'accueil - Recherche de médicaments */}
          <Route 
            path="/" 
            element={
              <HomePage 
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                setPharmacies={setMedicationPharmacies}
                setLoading={setLoading}
                setError={setError}
                setLastSearch={setSearchQuery}
                loading={loading}
                error={error}
                resultsToDisplay={resultsToDisplay}
                cartItems={cartItems}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onProceedToReservation={handleProceedToReservation}
                onReviewSubmit={handleReviewSubmit}
                onAddToCart={addToCart}
              />
            } 
          />
          
          {/* 💡 US 4: Pages d'authentification */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Dashboard Client - Recherche de médicaments */}
          <Route 
            path="/dashboard" 
            element={
              <DashboardClient 
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                setPharmacies={setMedicationPharmacies}
                setLoading={setLoading}
                setError={setError}
                setLastSearch={setSearchQuery}
                loading={loading}
                error={error}
                resultsToDisplay={resultsToDisplay}
                cartItems={cartItems}
                onRemoveFromCart={removeFromCart}
                onClearCart={clearCart}
                onProceedToReservation={handleProceedToReservation}
                onReviewSubmit={handleReviewSubmit}
                onAddToCart={addToCart}
              />
            } 
          />
          
          {/* Page de gestion des stocks (US 3) - Pharmacies */}
          <Route path="/stocks" element={<StockManagementPage />} />
          
          {/* Page de gestion des médicaments - Pharmacies et Admins */}
          <Route path="/medicines" element={<MedicineManager />} />
          
          {/* Page admin (US 8) - Administrateurs plateforme */}
          <Route path="/admin" element={<AdminDashboardPage />} />
          
          {/* Pages d'information */}
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/legal" element={<LegalPage />} />
          
          {/* Page de profil utilisateur */}
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>

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
          <div className="footer-links">
            <a href="/about">À propos</a>
            <a href="mailto:contact@findpharma.cm">Contact</a>
            <a href="/faq">FAQ</a>
            <a href="/legal">Mentions Légales</a>
          </div>
          <div className="footer-social">
            <a 
              href="https://www.facebook.com/share/19vayRCk8F/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="facebook-button"
              title="Suivez-nous sur Facebook"
            >
              <i className="fab fa-facebook-f"></i>
              <span>Suivez-nous</span>
            </a>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;