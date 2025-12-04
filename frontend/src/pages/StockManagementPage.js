// src/pages/StockManagementPage.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import StockManager from '../StockManager';

function StockManagementPage() {
  const location = useLocation();
  
  // Vérifier l'authentification et le type d'utilisateur
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    // Sauvegarder l'URL pour redirection après login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Vérifier que c'est une pharmacie
    if (user.user_type !== 'pharmacy') {
      console.error('❌ Accès refusé: user_type =', user.user_type);
      // Redirection vers accueil si pas pharmacie
      return <Navigate to="/" replace />;
    }
    
    // Afficher l'interface de gestion
    return (
      <main className="main-content admin-mode">
        <StockManager />
      </main>
    );
    
  } catch (error) {
    console.error('❌ Erreur parsing user:', error);
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
}

export default StockManagementPage;
