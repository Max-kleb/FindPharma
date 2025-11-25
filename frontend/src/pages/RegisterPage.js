// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getAllPharmacies } from '../services/api';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [pharmacyId, setPharmacyId] = useState('');
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Charger la liste des pharmacies au chargement du composant
  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const data = await getAllPharmacies();
        setPharmacies(data);
      } catch (err) {
        console.error('Erreur chargement pharmacies:', err);
      }
    };
    fetchPharmacies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation du mot de passe
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    // Validation pour les pharmacies
    if (userType === 'pharmacy' && !pharmacyId) {
      setError('Veuillez sélectionner une pharmacie');
      setLoading(false);
      return;
    }

    try {
      // Préparer les données supplémentaires
      const extraData = {};
      if (userType === 'pharmacy' && pharmacyId) {
        extraData.pharmacy_id = parseInt(pharmacyId);
      }

      // Appel API d'inscription
      const data = await register(username, email, password, userType, extraData);
      
      console.log('✅ Inscription réussie:', data);
      
      // Afficher le message de succès
      setSuccess(true);
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container success-container">
          <div className="success-message">
            <span className="success-icon">✅</span>
            <h2>Inscription réussie !</h2>
            <p>Votre compte a été créé avec succès.</p>
            <p className="redirect-message">
              Redirection vers la page de connexion...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="register-logo">
            <span className="logo-plus">⚕️</span>
            <span className="logo-text">
              <span className="logo-find">Find</span>
              <span className="logo-pharma">Pharma</span>
            </span>
          </div>
          <h1>Créer un Compte</h1>
          <p>Rejoignez FindPharma dès maintenant</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="userType">
              <span className="label-icon">👥</span>
              Type de compte
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="select-input"
              required
            >
              <option value="customer">👤 Client</option>
              <option value="pharmacy">💊 Pharmacie</option>
            </select>
            <small className="help-text">
              {userType === 'customer' 
                ? 'Compte pour rechercher et réserver des médicaments' 
                : 'Compte pour gérer les stocks de votre pharmacie'}
            </small>
          </div>

          {/* Sélecteur de pharmacie (visible uniquement si type = pharmacy) */}
          {userType === 'pharmacy' && (
            <div className="form-group">
              <label htmlFor="pharmacyId">
                <span className="label-icon">🏥</span>
                Sélectionner votre pharmacie
              </label>
              <select
                id="pharmacyId"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                className="select-input"
                required
              >
                <option value="">-- Choisir une pharmacie --</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.address}
                  </option>
                ))}
              </select>
              <small className="help-text">
                Sélectionnez la pharmacie que vous représentez
              </small>
            </div>
          )}

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
              placeholder="Choisissez un nom d'utilisateur"
              required
              autoComplete="username"
              autoFocus
              minLength={3}
            />
            <small className="help-text">Minimum 3 caractères</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              required
              autoComplete="email"
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
              placeholder="Créez un mot de passe sécurisé"
              required
              autoComplete="new-password"
              minLength={8}
            />
            <small className="help-text">Minimum 8 caractères</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">🔒</span>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre mot de passe"
              required
              autoComplete="new-password"
              minLength={8}
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
                Création en cours...
              </>
            ) : (
              <>
                <span className="button-icon">📝</span>
                Créer mon compte
              </>
            )}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="login-link">
              Se connecter
            </Link>
          </p>
          <Link to="/" className="back-link">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
