// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Appel API de connexion
      const data = await login(username, password);
      
      // Extraire les données
      const accessToken = data.tokens.access;
      const refreshToken = data.tokens.refresh;
      const user = data.user;
      
      // Sauvegarder dans localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('💾 Données sauvegardées dans localStorage:');
      console.log('   - token:', accessToken.substring(0, 20) + '...');
      console.log('   - user:', JSON.stringify(user));
      console.log('   - user_type:', user.user_type);
      
      // Si c'est une pharmacie, sauvegarder les infos pharmacie
      if (user.user_type === 'pharmacy' && user.pharmacy) {
        localStorage.setItem('pharmacyId', user.pharmacy.toString());
        localStorage.setItem('pharmacyName', user.pharmacy_name || '');
        console.log('   - pharmacyId:', user.pharmacy);
        console.log('   - pharmacyName:', user.pharmacy_name);
      }
      
      console.log('✅ Connexion réussie:', user);
      
      // Redirection selon le type d'utilisateur
      if (user.user_type === 'pharmacy') {
        console.log('🔄 Redirection vers /stocks (pharmacy)');
        navigate('/stocks');
      } else if (user.user_type === 'admin') {
        console.log('🔄 Redirection vers /admin');
        navigate('/admin');
      } else {
        console.log('🔄 Redirection vers / (customer)');
        navigate('/');
      }
      
      // Recharger la page pour mettre à jour le header
      console.log('🔄 Rechargement de la page...');
      window.location.reload();
      
    } catch (err) {
      console.error('❌ Erreur connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <span className="logo-plus">⚕️</span>
            <span className="logo-text">
              <span className="logo-find">Find</span>
              <span className="logo-pharma">Pharma</span>
            </span>
          </div>
          <h1>Connexion</h1>
          <p>Accédez à votre compte FindPharma</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Entrez votre nom d'utilisateur"
              required
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Connexion en cours...
              </>
            ) : (
              <>
                <span className="button-icon">🔑</span>
                Se connecter
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="register-link">
              Créer un compte
            </Link>
          </p>
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>

        <div className="test-account-info">
          <p className="test-label">🧪 Compte de test</p>
          <p className="test-credentials">
            <strong>Username:</strong> admin_centrale<br />
            <strong>Password:</strong> admin123
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
