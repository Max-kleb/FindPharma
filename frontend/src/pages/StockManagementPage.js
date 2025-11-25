// src/pages/StockManagementPage.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import StockManager from '../StockManager';

function StockManagementPage() {
  // Vérifier l'authentification et le type d'utilisateur
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    // Rediriger vers l'accueil si pas connecté
    return <Navigate to="/" replace />;
  }
  
  try {
    const user = JSON.parse(userStr);
    
    // Debug: Afficher les infos utilisateur
    console.log('📋 StockManagementPage - User data:', user);
    console.log('📋 user_type:', user.user_type);
    console.log('📋 Comparaison:', user.user_type, '!==', 'pharmacy', '=', user.user_type !== 'pharmacy');
    
    // Vérifier que c'est une pharmacie
    if (user.user_type !== 'pharmacy') {
      console.error('❌ Accès refusé: user_type =', user.user_type);
      alert('Accès réservé aux pharmacies');
      return <Navigate to="/" replace />;
    }
    
    console.log('✅ Accès autorisé - Affichage du dashboard');
    
    // Afficher l'interface de gestion
    return (
      <main className="main-content admin-mode">
        <StockManager />
      </main>
    );
    
  } catch (error) {
    console.error('❌ Erreur parsing user:', error);
    return <Navigate to="/" replace />;
  }
}

export default StockManagementPage;
