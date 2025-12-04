// src/App.js 
import React, { useState, useMemo, useEffect } from 'react'; 
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './Header';
import Footer from './Footer';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Configuration i18n (react-i18next)
import './i18n';

// Styles de thème
import './styles/theme.css';

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
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import MesReservationsPage from './pages/MesReservationsPage';

// 💡 IMPORTS US 5, US 6, US 7
import ReservationModal from './ReservationModal';
import ReviewModal from './ReviewModal';
import { submitPharmacyReview, getNearbyPharmacies, submitReservation, refreshAccessToken } from './services/api'; 


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
      // Pas de pop-up, redirection directe
      window.location.href = '/'; // Rediriger vers l'accueil
  };
  // Fin US 4 Handlers

  // 🛒 LOGIQUE US 5 : PANIER
  const addToCart = (item) => {
    // Vérifier si l'utilisateur est connecté
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return;
    }
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

  // 💡 US 6 : RÉSERVATION
  const handleProceedToReservation = () => {
    if (!isLoggedIn) {
      // Sauvegarder l'URL et rediriger vers login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return;
    }
    if (cartItems.length === 0) {
      // Pas de pop-up, on n'ouvre simplement pas la modal
      return;
    }
    setShowReservationModal(true);
  };
  
  const handleReservationSubmit = async (reservationData) => {
    if (!userToken) {
      throw new Error("Vous devez être connecté pour faire une réservation.");
    }
    
    try {
      const result = await submitReservation(reservationData, userToken);
      console.log('✅ Réservation créée:', result);
      clearCart(); // Vider le panier après succès
      return result;
    } catch (error) {
      console.error('❌ Erreur réservation:', error);
      
      // Si le token est invalide (401), essayer de rafraîchir
      if (error.message.includes('Given token not valid') || error.message.includes('401')) {
        console.log('🔄 Token expiré, tentative de rafraîchissement...');
        
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const newAccessToken = await refreshAccessToken(refreshToken);
            
            // Mettre à jour le token dans localStorage et l'état
            localStorage.setItem('token', newAccessToken);
            setUserToken(newAccessToken);
            
            console.log('✅ Token rafraîchi avec succès');
            
            // Retenter la réservation avec le nouveau token
            const result = await submitReservation(reservationData, newAccessToken);
            console.log('✅ Réservation créée après rafraîchissement du token:', result);
            clearCart();
            return result;
          } catch (refreshError) {
            console.error('❌ Échec du rafraîchissement du token:', refreshError);
            
            // NE PAS déconnecter automatiquement - laisser l'utilisateur décider
            // handleLogout();
            
            throw new Error("Votre session a expiré. Veuillez vous reconnecter pour continuer.");
          }
        } else {
          // Pas de refresh token disponible
          throw new Error("Votre session a expiré. Veuillez vous reconnecter pour continuer.");
        }
      }
      
      throw error;
    }
  };
  // Fin US 6 : RÉSERVATION

  // 💡 US 7 : NOTATION/AVIS
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [pharmacyToReview, setPharmacyToReview] = useState(null);
  
  const handleReviewSubmit = (pharmacy) => {
      if (!isLoggedIn) {
          // Redirection silencieuse vers login
          window.location.href = '/login';
          return;
      }
      setPharmacyToReview(pharmacy);
      setShowReviewModal(true);
  };
  
  const handleReviewConfirm = async (pharmacyId, rating, comment) => {
      await submitPharmacyReview(pharmacyId, rating, comment, userToken);
  };
  // Fin US 7 : NOTATION/AVIS


  // 6. LOGIQUE CLÉ : Déterminer quels résultats doivent être affichés (US 2 > US 1)
  const resultsToDisplay = useMemo(() => {
    if (searchQuery.length > 0) {
      return medicationPharmacies;
    }
    return nearbyPharmacies;
  }, [searchQuery, medicationPharmacies, nearbyPharmacies]);


  return (
    <ThemeProvider>
      <LanguageProvider>
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
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Page de profil utilisateur */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Page Mes Réservations (US 6) */}
          <Route path="/reservations" element={<MesReservationsPage />} />
        </Routes>

        {/* US 6 : Le Modal de Réservation */}
        {showReservationModal && (
            <ReservationModal 
                cartItems={cartItems}
                totalPrice={calculateTotalPrice} 
                onSubmit={handleReservationSubmit} 
                onClose={() => setShowReservationModal(false)}
                userInfo={{
                  username: localStorage.getItem('username') || '',
                  email: localStorage.getItem('userEmail') || ''
                }}
            />
        )}

        {/* US 7 : Le Modal de Notation */}
        {showReviewModal && pharmacyToReview && (
            <ReviewModal
                pharmacy={pharmacyToReview}
                onSubmit={handleReviewConfirm}
                onClose={() => {
                  setShowReviewModal(false);
                  setPharmacyToReview(null);
                }}
            />
        )}

        <Footer />
      </div>
    </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;