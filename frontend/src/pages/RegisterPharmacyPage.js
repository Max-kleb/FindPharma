// src/pages/RegisterPharmacyPage.js
/**
 * Page professionnelle d'inscription pour les pharmacies
 * Formulaire en étapes (stepper) avec validation complète
 */

import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LocationPicker from '../components/LocationPicker';
import { registerPharmacy } from '../services/api';
import './RegisterPharmacyPage.css';

// Étapes du formulaire
const STEPS = {
  PHARMACY_INFO: 0,
  LOCATION: 1,
  MANAGER_INFO: 2,
  REVIEW: 3
};

export default function RegisterPharmacyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // État du formulaire
  const [currentStep, setCurrentStep] = useState(STEPS.PHARMACY_INFO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  // Données du formulaire
  const [formData, setFormData] = useState({
    // Informations pharmacie
    pharmacy_name: '',
    license_number: '',
    pharmacy_address: '',
    pharmacy_phone: '',
    pharmacy_email: '',
    opening_hours: {
      monday: '08:00-20:00',
      tuesday: '08:00-20:00',
      wednesday: '08:00-20:00',
      thursday: '08:00-20:00',
      friday: '08:00-20:00',
      saturday: '08:00-18:00',
      sunday: 'Fermé'
    },
    
    // Géolocalisation
    latitude: null,
    longitude: null,
    
    // Informations gérant
    manager_first_name: '',
    manager_last_name: '',
    manager_email: '',
    manager_phone: '',
    username: '',
    password: '',
    password2: ''
  });
  
  // Erreurs de validation par champ
  const [fieldErrors, setFieldErrors] = useState({});

  // Mise à jour des champs
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  }, [fieldErrors]);

  // Mise à jour de la position
  const handleLocationChange = useCallback((location) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.latitude,
      longitude: location.longitude
    }));
    if (fieldErrors.location) {
      setFieldErrors(prev => ({ ...prev, location: null }));
    }
  }, [fieldErrors]);

  // Mise à jour des horaires
  const handleHoursChange = useCallback((day, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: value
      }
    }));
  }, []);

  // Validation de l'étape courante
  const validateStep = useCallback((step) => {
    const errors = {};
    
    switch (step) {
      case STEPS.PHARMACY_INFO:
        if (!formData.pharmacy_name.trim()) {
          errors.pharmacy_name = 'Le nom de la pharmacie est requis';
        }
        if (!formData.license_number.trim()) {
          errors.license_number = 'Le numéro d\'agrément est requis';
        }
        if (!formData.pharmacy_address.trim()) {
          errors.pharmacy_address = 'L\'adresse est requise';
        }
        if (!formData.pharmacy_phone.trim()) {
          errors.pharmacy_phone = 'Le téléphone est requis';
        }
        break;
        
      case STEPS.LOCATION:
        if (!formData.latitude || !formData.longitude) {
          errors.location = 'Veuillez sélectionner la position de votre pharmacie sur la carte';
        }
        break;
        
      case STEPS.MANAGER_INFO:
        if (!formData.manager_first_name.trim()) {
          errors.manager_first_name = 'Le prénom est requis';
        }
        if (!formData.manager_last_name.trim()) {
          errors.manager_last_name = 'Le nom est requis';
        }
        if (!formData.manager_email.trim()) {
          errors.manager_email = 'L\'email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manager_email)) {
          errors.manager_email = 'Email invalide';
        }
        if (!formData.manager_phone.trim()) {
          errors.manager_phone = 'Le téléphone est requis';
        }
        if (!formData.username.trim()) {
          errors.username = 'Le nom d\'utilisateur est requis';
        } else if (formData.username.length < 3) {
          errors.username = 'Minimum 3 caractères';
        }
        if (!formData.password) {
          errors.password = 'Le mot de passe est requis';
        } else if (formData.password.length < 8) {
          errors.password = 'Minimum 8 caractères';
        }
        if (formData.password !== formData.password2) {
          errors.password2 = 'Les mots de passe ne correspondent pas';
        }
        break;
        
      default:
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // Vérification silencieuse si l'étape courante est complète (sans afficher les erreurs)
  const isStepComplete = useCallback((step) => {
    switch (step) {
      case STEPS.PHARMACY_INFO:
        return (
          formData.pharmacy_name.trim() !== '' &&
          formData.license_number.trim() !== '' &&
          formData.pharmacy_address.trim() !== '' &&
          formData.pharmacy_phone.trim() !== ''
        );
        
      case STEPS.LOCATION:
        return formData.latitude !== null && formData.longitude !== null;
        
      case STEPS.MANAGER_INFO:
        return (
          formData.manager_first_name.trim() !== '' &&
          formData.manager_last_name.trim() !== '' &&
          formData.manager_email.trim() !== '' &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.manager_email) &&
          formData.manager_phone.trim() !== '' &&
          formData.username.trim() !== '' &&
          formData.username.length >= 3 &&
          formData.password !== '' &&
          formData.password.length >= 8 &&
          formData.password === formData.password2
        );
        
      case STEPS.REVIEW:
        return true;
        
      default:
        return false;
    }
  }, [formData]);

  // Navigation entre les étapes
  const goToNextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.REVIEW));
    }
  }, [currentStep, validateStep]);

  const goToPreviousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, STEPS.PHARMACY_INFO));
  }, []);

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await registerPharmacy(formData);
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Erreur inscription:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage du succès
  if (submitSuccess) {
    return (
      <div className="register-pharmacy-page">
        <div className="success-container">
          <div className="success-content">
            <div className="success-icon">✅</div>
            <h1>Demande envoyée avec succès !</h1>
            <p className="success-message">
              Votre demande d'inscription pour <strong>{formData.pharmacy_name}</strong> a été soumise.
            </p>
            
            <div className="next-steps">
              <h3>Prochaines étapes :</h3>
              <ul>
                <li>📋 Notre équipe va examiner votre demande</li>
                <li>📧 Vous recevrez un email de confirmation à <strong>{formData.manager_email}</strong></li>
                <li>✅ Une fois approuvé, vous pourrez vous connecter et gérer vos stocks</li>
              </ul>
            </div>
            
            <div className="success-actions">
              <Link to="/" className="btn-home">
                Retour à l'accueil
              </Link>
              <Link to="/login" className="btn-login">
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-pharmacy-page">
      <div className="register-pharmacy-container">
        {/* Header */}
        <div className="register-pharmacy-header">
          <div className="logo">
            <span className="logo-icon">⚕️</span>
            <span className="logo-text">
              <span className="find">Find</span>
              <span className="pharma">Pharma</span>
            </span>
          </div>
          <h1>Inscription Pharmacie</h1>
          <p>Rejoignez notre réseau de pharmacies au Cameroun</p>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {[
            { step: STEPS.PHARMACY_INFO, label: 'Pharmacie', icon: '🏥' },
            { step: STEPS.LOCATION, label: 'Localisation', icon: '📍' },
            { step: STEPS.MANAGER_INFO, label: 'Gérant', icon: '👤' },
            { step: STEPS.REVIEW, label: 'Validation', icon: '✅' }
          ].map(({ step, label, icon }) => (
            <div 
              key={step}
              className={`step ${currentStep === step ? 'active' : ''} ${currentStep > step ? 'completed' : ''}`}
            >
              <div className="step-icon">{currentStep > step ? '✓' : icon}</div>
              <div className="step-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Erreur globale */}
        {error && (
          <div className="error-banner">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="register-pharmacy-form">
          
          {/* Étape 1: Informations Pharmacie */}
          {currentStep === STEPS.PHARMACY_INFO && (
            <div className="step-content">
              <h2 className="step-title">
                <span>🏥</span> Informations de la pharmacie
              </h2>
              
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="pharmacy_name">
                    Nom de la pharmacie <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="pharmacy_name"
                    name="pharmacy_name"
                    value={formData.pharmacy_name}
                    onChange={handleChange}
                    placeholder="Ex: Pharmacie du Soleil"
                    className={fieldErrors.pharmacy_name ? 'error' : ''}
                  />
                  {fieldErrors.pharmacy_name && (
                    <span className="field-error">{fieldErrors.pharmacy_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="license_number">
                    Numéro d'agrément <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="Ex: CAM-PHARM-2024-XXXX"
                    className={fieldErrors.license_number ? 'error' : ''}
                  />
                  {fieldErrors.license_number && (
                    <span className="field-error">{fieldErrors.license_number}</span>
                  )}
                  <span className="field-help">Numéro officiel délivré par le ministère de la santé</span>
                </div>

                <div className="form-group">
                  <label htmlFor="pharmacy_phone">
                    Téléphone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="pharmacy_phone"
                    name="pharmacy_phone"
                    value={formData.pharmacy_phone}
                    onChange={handleChange}
                    placeholder="+237 2XX XX XX XX"
                    className={fieldErrors.pharmacy_phone ? 'error' : ''}
                  />
                  {fieldErrors.pharmacy_phone && (
                    <span className="field-error">{fieldErrors.pharmacy_phone}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="pharmacy_address">
                    Adresse complète <span className="required">*</span>
                  </label>
                  <textarea
                    id="pharmacy_address"
                    name="pharmacy_address"
                    value={formData.pharmacy_address}
                    onChange={handleChange}
                    placeholder="Rue, quartier, ville..."
                    rows={3}
                    className={fieldErrors.pharmacy_address ? 'error' : ''}
                  />
                  {fieldErrors.pharmacy_address && (
                    <span className="field-error">{fieldErrors.pharmacy_address}</span>
                  )}
                </div>

                <div className="form-group full-width">
                  <label htmlFor="pharmacy_email">Email de contact</label>
                  <input
                    type="email"
                    id="pharmacy_email"
                    name="pharmacy_email"
                    value={formData.pharmacy_email}
                    onChange={handleChange}
                    placeholder="contact@pharmacie.cm"
                  />
                </div>
              </div>

              {/* Horaires d'ouverture */}
              <div className="opening-hours-section">
                <h3>🕐 Horaires d'ouverture</h3>
                <div className="hours-grid">
                  {[
                    { key: 'monday', label: 'Lundi' },
                    { key: 'tuesday', label: 'Mardi' },
                    { key: 'wednesday', label: 'Mercredi' },
                    { key: 'thursday', label: 'Jeudi' },
                    { key: 'friday', label: 'Vendredi' },
                    { key: 'saturday', label: 'Samedi' },
                    { key: 'sunday', label: 'Dimanche' }
                  ].map(({ key, label }) => (
                    <div key={key} className="hours-row">
                      <span className="day-label">{label}</span>
                      <input
                        type="text"
                        value={formData.opening_hours[key]}
                        onChange={(e) => handleHoursChange(key, e.target.value)}
                        placeholder="08:00-20:00 ou Fermé"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Localisation */}
          {currentStep === STEPS.LOCATION && (
            <div className="step-content">
              <h2 className="step-title">
                <span>📍</span> Localisation de la pharmacie
              </h2>
              
              <p className="step-description">
                Indiquez la position exacte de votre pharmacie. 
                Les clients utiliseront cette position pour vous trouver sur la carte.
              </p>
              
              <LocationPicker
                value={{ latitude: formData.latitude, longitude: formData.longitude }}
                onChange={handleLocationChange}
                required
                error={fieldErrors.location}
              />
            </div>
          )}

          {/* Étape 3: Informations Gérant */}
          {currentStep === STEPS.MANAGER_INFO && (
            <div className="step-content">
              <h2 className="step-title">
                <span>👤</span> Informations du gérant
              </h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="manager_first_name">
                    Prénom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="manager_first_name"
                    name="manager_first_name"
                    value={formData.manager_first_name}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className={fieldErrors.manager_first_name ? 'error' : ''}
                  />
                  {fieldErrors.manager_first_name && (
                    <span className="field-error">{fieldErrors.manager_first_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="manager_last_name">
                    Nom <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="manager_last_name"
                    name="manager_last_name"
                    value={formData.manager_last_name}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className={fieldErrors.manager_last_name ? 'error' : ''}
                  />
                  {fieldErrors.manager_last_name && (
                    <span className="field-error">{fieldErrors.manager_last_name}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="manager_email">
                    Email professionnel <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="manager_email"
                    name="manager_email"
                    value={formData.manager_email}
                    onChange={handleChange}
                    placeholder="votre.email@exemple.com"
                    className={fieldErrors.manager_email ? 'error' : ''}
                  />
                  {fieldErrors.manager_email && (
                    <span className="field-error">{fieldErrors.manager_email}</span>
                  )}
                  <span className="field-help">Cet email sera utilisé pour les notifications</span>
                </div>

                <div className="form-group">
                  <label htmlFor="manager_phone">
                    Téléphone <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="manager_phone"
                    name="manager_phone"
                    value={formData.manager_phone}
                    onChange={handleChange}
                    placeholder="+237 6XX XX XX XX"
                    className={fieldErrors.manager_phone ? 'error' : ''}
                  />
                  {fieldErrors.manager_phone && (
                    <span className="field-error">{fieldErrors.manager_phone}</span>
                  )}
                </div>

                <div className="form-divider">
                  <span>Identifiants de connexion</span>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="username">
                    Nom d'utilisateur <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Choisissez un identifiant"
                    className={fieldErrors.username ? 'error' : ''}
                  />
                  {fieldErrors.username && (
                    <span className="field-error">{fieldErrors.username}</span>
                  )}
                  <span className="field-help">Minimum 3 caractères, sans espaces</span>
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    Mot de passe <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Créez un mot de passe sécurisé"
                    className={fieldErrors.password ? 'error' : ''}
                  />
                  {fieldErrors.password && (
                    <span className="field-error">{fieldErrors.password}</span>
                  )}
                  <span className="field-help">Minimum 8 caractères</span>
                </div>

                <div className="form-group">
                  <label htmlFor="password2">
                    Confirmer le mot de passe <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    id="password2"
                    name="password2"
                    value={formData.password2}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    className={fieldErrors.password2 ? 'error' : ''}
                  />
                  {fieldErrors.password2 && (
                    <span className="field-error">{fieldErrors.password2}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Récapitulatif */}
          {currentStep === STEPS.REVIEW && (
            <div className="step-content">
              <h2 className="step-title">
                <span>✅</span> Vérification des informations
              </h2>
              
              <p className="step-description">
                Veuillez vérifier les informations avant de soumettre votre demande.
              </p>

              <div className="review-sections">
                {/* Récap Pharmacie */}
                <div className="review-section">
                  <h3>🏥 Pharmacie</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="label">Nom</span>
                      <span className="value">{formData.pharmacy_name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">N° Agrément</span>
                      <span className="value">{formData.license_number}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Téléphone</span>
                      <span className="value">{formData.pharmacy_phone}</span>
                    </div>
                    <div className="review-item full-width">
                      <span className="label">Adresse</span>
                      <span className="value">{formData.pharmacy_address}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={() => setCurrentStep(STEPS.PHARMACY_INFO)}
                  >
                    ✏️ Modifier
                  </button>
                </div>

                {/* Récap Localisation */}
                <div className="review-section">
                  <h3>📍 Localisation</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="label">Latitude</span>
                      <span className="value">{formData.latitude?.toFixed(6)}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Longitude</span>
                      <span className="value">{formData.longitude?.toFixed(6)}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={() => setCurrentStep(STEPS.LOCATION)}
                  >
                    ✏️ Modifier
                  </button>
                </div>

                {/* Récap Gérant */}
                <div className="review-section">
                  <h3>👤 Gérant</h3>
                  <div className="review-grid">
                    <div className="review-item">
                      <span className="label">Nom complet</span>
                      <span className="value">{formData.manager_first_name} {formData.manager_last_name}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Email</span>
                      <span className="value">{formData.manager_email}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Téléphone</span>
                      <span className="value">{formData.manager_phone}</span>
                    </div>
                    <div className="review-item">
                      <span className="label">Identifiant</span>
                      <span className="value">{formData.username}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="edit-btn"
                    onClick={() => setCurrentStep(STEPS.MANAGER_INFO)}
                  >
                    ✏️ Modifier
                  </button>
                </div>
              </div>

              {/* Avertissement */}
              <div className="review-notice">
                <span className="notice-icon">ℹ️</span>
                <p>
                  En soumettant cette demande, vous certifiez que les informations fournies sont exactes.
                  Votre demande sera examinée par notre équipe dans les plus brefs délais.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            {currentStep > STEPS.PHARMACY_INFO && (
              <button 
                type="button" 
                className="btn-previous"
                onClick={goToPreviousStep}
                disabled={isSubmitting}
              >
                ← Précédent
              </button>
            )}
            
            {currentStep < STEPS.REVIEW ? (
              <button 
                type="button" 
                className={`btn-next ${!isStepComplete(currentStep) ? 'btn-disabled' : ''}`}
                onClick={goToNextStep}
                disabled={!isStepComplete(currentStep)}
                title={!isStepComplete(currentStep) ? 'Veuillez remplir tous les champs obligatoires' : ''}
              >
                Suivant →
              </button>
            ) : (
              <button 
                type="submit" 
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner">⏳</span>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Soumettre la demande
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="register-pharmacy-footer">
          <p>
            Vous avez déjà un compte ?{' '}
            <Link to="/login">Se connecter</Link>
          </p>
          <p>
            Vous êtes un client ?{' '}
            <Link to="/register">Créer un compte client</Link>
          </p>
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
        </div>
      </div>
    </div>
  );
}
