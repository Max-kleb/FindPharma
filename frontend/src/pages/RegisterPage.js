// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register, getAllPharmacies, sendVerificationCode } from '../services/api';
import EmailVerificationModal from '../EmailVerificationModal'; // Correct path
import { useTranslation } from 'react-i18next';
import './RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  
  // États pour la vérification email
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [devCode, setDevCode] = useState(null); // Code de dev pour affichage direct

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

  // Étape 1 : Vérifier l'email d'abord
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation du mot de passe
    if (password.length < 8) {
      setError(t('register.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    // Validation pour les pharmacies
    if (userType === 'pharmacy' && !pharmacyId) {
      setError(t('register.selectPharmacy'));
      return;
    }

    // Si l'email n'est pas encore vérifié, envoyer le code de vérification
    if (!emailVerified) {
      setLoading(true);
      try {
        const response = await sendVerificationCode(email, username);
        
        // 🔧 Si mode dev, récupérer le code pour l'afficher
        if (response.dev_mode && response.verification_code) {
          setDevCode(response.verification_code);
          console.log('🔧 MODE DEV : Code de vérification:', response.verification_code);
        }
        
        setShowVerificationModal(true);
      } catch (err) {
        console.error('❌ Erreur envoi code:', err);
        setError(err.message || t('register.verificationCodeError'));
      } finally {
        setLoading(false);
      }
      return;
    }

    // Si l'email est vérifié, procéder à l'inscription
    await proceedWithRegistration();
  };

  // Étape 2 : Inscription après vérification de l'email
  const proceedWithRegistration = async () => {
    setLoading(true);
    setError(null);

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

  // Callback appelé quand l'email est vérifié
  const handleEmailVerified = () => {
    setEmailVerified(true);
    setShowVerificationModal(false);
    // Procéder automatiquement à l'inscription
    proceedWithRegistration();
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="register-container success-container">
          <div className="success-message">
            <span className="success-icon">✅</span>
            <h2>{t('register.successTitle')}</h2>
            <p>{t('register.successMessage')}</p>
            <p className="redirect-message">
              {t('register.redirecting')}
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
          <h1>{t('register.title')}</h1>
          <p>{t('register.subtitle')}</p>
        </div>

        {/* Badge de vérification email */}
        {emailVerified && (
          <div className="verification-badge">
            <i className="fas fa-check-circle"></i>
            <span>{t('register.emailVerified')}</span>
          </div>
        )}

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
              {t('register.accountType')}
            </label>
            <select
              id="userType"
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="select-input"
              required
            >
              <option value="customer">👤 {t('register.customer')}</option>
              <option value="pharmacy">💊 {t('register.pharmacy')}</option>
            </select>
            <small className="help-text">
              {userType === 'customer' 
                ? t('register.customerHelp')
                : t('register.pharmacyHelp')}
            </small>
          </div>

          {/* Sélecteur de pharmacie (visible uniquement si type = pharmacy) */}
          {userType === 'pharmacy' && (
            <div className="form-group">
              <label htmlFor="pharmacyId">
                <span className="label-icon">🏥</span>
                {t('register.selectYourPharmacy')}
              </label>
              <select
                id="pharmacyId"
                value={pharmacyId}
                onChange={(e) => setPharmacyId(e.target.value)}
                className="select-input"
                required
              >
                <option value="">-- {t('register.choosePharmacy')} --</option>
                {pharmacies.map((pharmacy) => (
                  <option key={pharmacy.id} value={pharmacy.id}>
                    {pharmacy.name} - {pharmacy.address}
                  </option>
                ))}
              </select>
              <small className="help-text">
                {t('register.pharmacySelectHelp')}
              </small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <span className="label-icon">👤</span>
              {t('auth.username')}
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('register.usernamePlaceholder')}
              required
              autoComplete="username"
              autoFocus
              minLength={3}
            />
            <small className="help-text">{t('register.minChars3')}</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <span className="label-icon">📧</span>
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder')}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <span className="label-icon">🔒</span>
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('register.passwordPlaceholder')}
              required
              autoComplete="new-password"
              minLength={8}
            />
            <small className="help-text">{t('register.minChars8')}</small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <span className="label-icon">🔒</span>
              {t('auth.confirmPassword')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
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
                {emailVerified ? t('register.creating') : t('register.sendingCode')}
              </>
            ) : emailVerified ? (
              <>
                <span className="button-icon">✅</span>
                {t('register.finalize')}
              </>
            ) : (
              <>
                <span className="button-icon">📧</span>
                {t('register.verifyEmail')}
              </>
            )}
          </button>

          {!emailVerified && (
            <p className="verification-notice">
              <i className="fas fa-info-circle"></i>
              {t('register.verificationNotice')}
            </p>
          )}
        </form>

        <div className="register-footer">
          <p>
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="login-link">
              {t('auth.loginButton')}
            </Link>
          </p>
          <Link to="/" className="back-link">
            ← {t('common.back')}
          </Link>
        </div>
      </div>

      {/* Modal de vérification email */}
      {showVerificationModal && (
        <EmailVerificationModal
          email={email}
          username={username}
          devCode={devCode}
          onVerified={handleEmailVerified}
          onClose={() => setShowVerificationModal(false)}
        />
      )}
    </div>
  );
}

export default RegisterPage;
