// src/Header.js
import React from 'react';
import './Header.css'; // Assurez-vous que ce fichier existe !

function Header() {
  return (
   <header className="app-header">
      <div className="logo">
        {/* Icône croix médicale */}
        <i className="fas fa-plus-circle logo-icon"></i>
        
        {/* STRUCTURE POUR LE NOM EN DEUX COULEURS */}
        <span className="logo-text">
          <span className="logo-find">Find</span>
          <span className="logo-pharma">Pharma</span>
        </span>
        
      </div>
      <a href="/login" className="login-link">
        <i className="fas fa-user-circle"></i>
      </a>
    </header>
  );
}

export default Header;