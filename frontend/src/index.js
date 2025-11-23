// src/index.js

import React from 'react';
// Importe le client racine de React 18 pour le rendu asynchrone
import ReactDOM from 'react-dom/client'; 

import './index.css'; // Vos styles de base
import App from './App';
import reportWebVitals from './reportWebVitals'; // Utilitaires de performance (optionnel)

// 1. Crée la racine de l'application (correspondant à l'élément 'root' dans public/index.html)
const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. Rend le composant <App />
root.render(
  // <React.StrictMode> est bon pour détecter les problèmes potentiels
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();