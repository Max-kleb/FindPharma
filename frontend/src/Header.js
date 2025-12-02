// src/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from './contexts/ThemeContext';
import './Header.css';

// Langues disponibles
const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

// Fonction pour obtenir le code langue court (fr-FR -> fr)
const getShortLang = (lang) => {
  if (!lang) return 'fr';
  return lang.split('-')[0];
};

function Header({ isLoggedIn, onLogout }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, isDark } = useTheme();
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // État local pour la langue (pour synchroniser les deux sélecteurs)
  const [currentLang, setCurrentLang] = useState(getShortLang(i18n.language));
  
  // Synchroniser avec i18n quand la langue change
  useEffect(() => {
    const handleLanguageChanged = (lng) => {
      setCurrentLang(getShortLang(lng));
    };
    
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, [i18n]);
  
  // Fonction pour changer la langue
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setCurrentLang(langCode);
  };

  // Vérifier le type d'utilisateur au montage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserType(user.user_type);
        setUserName(user.username || user.pharmacy_name || user.email);
        setUserAvatar(user.avatar || user.profile_image || null);
      } catch (err) {
        console.error('Erreur parsing user:', err);
      }
    }
  }, [isLoggedIn]);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Vérifier si l'utilisateur est admin
  const isAdmin = userType === 'admin';

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  // Générer les initiales pour l'avatar par défaut
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="app-header">
      <Link to="/" className="logo" title="Retour à l'accueil">
        <img src="/logo.svg" alt="FindPharma Logo" className="logo-image" />
        <span className="logo-text">
          <span className="logo-find">Find</span>
          <span className="logo-pharma">Pharma</span>
        </span>
      </Link>

      <nav className="header-nav">
        {isLoggedIn && userType === 'customer' && (
          <>
            <Link to="/dashboard" className="nav-link nav-link-dashboard">
              <i className="fas fa-search"></i>
              <span>{t('header.search')}</span>
            </Link>
            <Link to="/reservations" className="nav-link nav-link-reservations">
              <i className="fas fa-clipboard-list"></i>
              <span>{t('header.myReservations')}</span>
            </Link>
          </>
        )}
        
        {isLoggedIn && userType === 'pharmacy' && (
          <>
            <Link to="/stocks" className="nav-link nav-link-primary">
              📦 {t('header.manageStocks')}
            </Link>
            <Link to="/medicines" className="nav-link nav-link-primary">
              💊 {t('header.manageMedicines')}
            </Link>
          </>
        )}
        
        {isLoggedIn && isAdmin && (
          <>
            <Link to="/admin" className="nav-link nav-link-admin">
              👨‍💼 {t('header.adminDashboard')}
            </Link>
            <Link to="/medicines" className="nav-link nav-link-admin">
              💊 {t('header.manageMedicines')}
            </Link>
          </>
        )}
      </nav>

      <div className="header-auth">
        {isLoggedIn ? (
          <div className="user-menu-container" ref={menuRef}>
            <button 
              className="user-avatar-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              title={userName}
            >
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="user-avatar-img" />
              ) : (
                <span className="user-avatar-initials">{getInitials(userName)}</span>
              )}
            </button>
            
            {menuOpen && (
              <div className="user-dropdown-menu">
                <div className="user-menu-header">
                  <div className="user-menu-avatar">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} />
                    ) : (
                      <span>{getInitials(userName)}</span>
                    )}
                  </div>
                  <div className="user-menu-info">
                    <span className="user-menu-name">{userName}</span>
                    <span className="user-menu-type">
                      {userType === 'admin' ? t('header.userTypeAdmin') : 
                       userType === 'pharmacy' ? t('header.userTypePharmacy') : t('header.userTypeCustomer')}
                    </span>
                  </div>
                </div>
                
                <div className="user-menu-divider"></div>
                
                {/* Sélecteur de langue dans le menu */}
                <div className="user-menu-language">
                  <i className="fas fa-globe"></i>
                  <select 
                    value={currentLang} 
                    onChange={(e) => changeLanguage(e.target.value)}
                    className="language-select-mini"
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Toggle de thème dans le menu */}
                <div className="user-menu-theme">
                  <button 
                    className="theme-toggle-btn"
                    onClick={toggleTheme}
                    title={isDark ? t('header.lightMode') : t('header.darkMode')}
                  >
                    <i className={`fas ${isDark ? 'fa-sun' : 'fa-moon'}`}></i>
                    <span>{isDark ? t('header.lightMode') : t('header.darkMode')}</span>
                  </button>
                </div>
                
                <div className="user-menu-divider"></div>
                
                <Link to="/profile" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-user"></i>
                  <span>{t('header.myProfile')}</span>
                </Link>
                
                {userType === 'customer' && (
                  <Link to="/reservations" className="user-menu-item" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-clipboard-list"></i>
                    <span>{t('header.myReservations')}</span>
                  </Link>
                )}
                
                <div className="user-menu-divider"></div>
                
                <button className="user-menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>{t('header.logout')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Toggle de thème pour les utilisateurs non connectés */}
            <button 
              className="theme-icon-btn"
              onClick={toggleTheme}
              title={isDark ? t('header.lightMode') : t('header.darkMode')}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            {/* Sélecteur de langue pour les utilisateurs non connectés */}
            <div className="language-selector-guest">
              <select 
                value={currentLang} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-select-mini"
                title={t('header.language')}
              >
                {availableLanguages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.code.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={() => navigate('/login')} className="login-button">
              <i className="fas fa-sign-in-alt"></i>
              <span>{t('header.login')}</span>
            </button>
            <button onClick={() => navigate('/register')} className="register-button">
              <i className="fas fa-user-plus"></i>
              <span>{t('header.register')}</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;