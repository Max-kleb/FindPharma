// src/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState('');

  // Vérifier le type d'utilisateur au montage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.user_type);
        setUserName(user.username || user.pharmacy_name || user.email);
      } catch (err) {
        console.error('Erreur parsing user:', err);
      }
    }
  }, [isLoggedIn]);

  const isAdmin = isLoggedIn && localStorage.getItem('token')?.includes('admin');

  return (
    <header className="app-header">
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/logo.svg" alt="FindPharma Logo" className="logo-image" />
        <span className="logo-text">
          <span className="logo-find">Find</span>
          <span className="logo-pharma">Pharma</span>
        </span>
      </div>

      <nav className="header-nav">
        <Link to="/" className="nav-link nav-link-home">
          <i className="fas fa-home"></i>
          <span>Accueil</span>
        </Link>
        
        {isLoggedIn && userType === 'customer' && (
          <Link to="/dashboard" className="nav-link nav-link-dashboard">
            <i className="fas fa-search"></i>
            <span>Rechercher</span>
          </Link>
        )}
        
        {isLoggedIn && userType === 'pharmacy' && (
          <>
            <Link to="/stocks" className="nav-link nav-link-primary">
              📦 Gérer mes Stocks
            </Link>
            <Link to="/medicines" className="nav-link nav-link-primary">
              💊 Gérer les Médicaments
            </Link>
          </>
        )}
        
        {isLoggedIn && isAdmin && (
          <>
            <Link to="/admin" className="nav-link nav-link-admin">
              👨‍💼 Dashboard Admin
            </Link>
            <Link to="/medicines" className="nav-link nav-link-admin">
              💊 Médicaments
            </Link>
          </>
        )}
      </nav>

      <div className="header-auth">
        {isLoggedIn ? (
          <>
            <span className="user-name">👋 {userName}</span>
            <button onClick={onLogout} className="logout-button">
              🚪 Déconnexion
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/login')} className="login-button">
              <i className="fas fa-sign-in-alt"></i>
              <span>Connexion</span>
            </button>
            <button onClick={() => navigate('/register')} className="register-button">
              <i className="fas fa-user-plus"></i>
              <span>Inscription</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;