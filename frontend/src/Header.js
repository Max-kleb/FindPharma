// src/Header.js
import React from 'react';
import './Header.css'; 

/**
 * Composant Header. 
 * 💡 US 4: Accepte les props pour gérer l'état d'authentification et les actions.
 */
function Header({ isLoggedIn, onLogin, onRegister, onLogout }) {
  
  // Fonction pour gérer le clic sur le lien de connexion/inscription
  const handleAuthClick = (mode) => (e) => {
      e.preventDefault(); // Empêche la navigation
      if (mode === 'login') {
          onLogin();
      } else if (mode === 'register') {
          onRegister();
      }
  };
  
  // Fonction pour gérer la déconnexion
  const handleLogoutClick = (e) => {
      e.preventDefault();
      onLogout();
  };

  return (
   <header className="app-header">
      <div className="logo">
        {/* Icône croix verte pharmaceutique */}
        <span className="logo-plus">⚕️</span>
        
        {/* STRUCTURE POUR LE NOM EN DEUX COULEURS */}
        <span className="logo-text">
          <span className="logo-find">Find</span>
          <span className="logo-pharma">Pharma</span>
        </span>
      </div>
      
      <div className="auth-controls">
        {isLoggedIn ? (
          // 💡 État Connecté
          <a href="#" onClick={handleLogoutClick} className="logout-link" title="Se déconnecter">
            <i className="fas fa-sign-out-alt"></i> Déconnexion
          </a>
        ) : (
          // 💡 État Déconnecté
          <>
            <a href="#" onClick={handleAuthClick('register')} className="register-link" title="Créer un compte">
                <i className="fas fa-user-plus"></i> S'inscrire
            </a>
            <a href="#" onClick={handleAuthClick('login')} className="login-link" title="Se connecter">
                <i className="fas fa-sign-in-alt"></i> Connexion
            </a>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;