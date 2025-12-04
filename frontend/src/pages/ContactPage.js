// src/pages/ContactPage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './ContactPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

function ContactPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // Vérifier si l'utilisateur est connecté
  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('userEmail') || '';
  const username = localStorage.getItem('username') || '';
  
  const [formData, setFormData] = useState({
    name: username,
    email: userEmail,
    subject: 'general',
    message: ''
  });
  
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pré-remplir le formulaire avec les infos de l'utilisateur connecté
  useEffect(() => {
    if (isLoggedIn) {
      setFormData(prev => ({
        ...prev,
        name: username || prev.name,
        email: userEmail || prev.email
      }));
    }
  }, [isLoggedIn, username, userEmail]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Si non connecté, rediriger vers login
    if (!isLoggedIn) {
      // Sauvegarder l'URL actuelle pour revenir après connexion
      localStorage.setItem('redirectAfterLogin', '/contact');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        // Token expiré, rediriger vers login
        localStorage.setItem('redirectAfterLogin', '/contact');
        navigate('/login');
        return;
      }
      
      if (response.ok && data.success) {
        setSubmitted(true);
        // Reset form
        setFormData({
          name: username,
          email: userEmail,
          subject: 'general',
          message: ''
        });
      } else {
        setError(data.error || t('contact.errorGeneric'));
      }
    } catch (err) {
      console.error('Erreur envoi contact:', err);
      setError(t('contact.errorNetwork'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* En-tête */}
        <div className="contact-header">
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.subtitle')}</p>
        </div>

        <div className="contact-content">
          {/* Formulaire de contact */}
          <div className="contact-form-section">
            <h2><i className="fas fa-envelope"></i> {t('contact.formTitle')}</h2>
            
            {/* Message si non connecté */}
            {!isLoggedIn && (
              <div className="login-required-message">
                <i className="fas fa-info-circle"></i>
                <p>{t('contact.loginRequired')}</p>
                <button 
                  className="btn-login"
                  onClick={() => {
                    localStorage.setItem('redirectAfterLogin', '/contact');
                    navigate('/login');
                  }}
                >
                  <i className="fas fa-sign-in-alt"></i> {t('contact.loginButton')}
                </button>
              </div>
            )}
            
            {submitted ? (
              <div className="success-message">
                <i className="fas fa-check-circle"></i>
                <h3>{t('contact.successTitle')}</h3>
                <p>{t('contact.successMessage')}</p>
                <button 
                  className="btn-new-message"
                  onClick={() => setSubmitted(false)}
                >
                  {t('contact.sendAnother')}
                </button>
              </div>
            ) : isLoggedIn ? (
              <form onSubmit={handleSubmit} className="contact-form">
                {error && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="name">{t('contact.name')}</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('contact.namePlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">{t('contact.email')}</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('contact.emailPlaceholder')}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">{t('contact.subject')}</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >
                    <option value="general">{t('contact.subjectGeneral')}</option>
                    <option value="technical">{t('contact.subjectTechnical')}</option>
                    <option value="partnership">{t('contact.subjectPartnership')}</option>
                    <option value="other">{t('contact.subjectOther')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={t('contact.messagePlaceholder')}
                    rows="5"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> {t('contact.sending')}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i> {t('contact.send')}
                    </>
                  )}
                </button>
              </form>
            ) : null}
          </div>

          {/* Informations de contact */}
          <div className="contact-info-section">
            <h2><i className="fas fa-info-circle"></i> {t('contact.infoTitle')}</h2>
            
            <div className="contact-info-cards">
              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <h3>{t('contact.emailTitle')}</h3>
                <p>contact.findpharma@gmail.com</p>
                <a href="mailto:contact.findpharma@gmail.com" className="info-link">
                  {t('contact.sendEmail')}
                </a>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <h3>{t('contact.phoneTitle')}</h3>
                <p>+237 679 336 545</p>
                <a href="tel:+237679336545" className="info-link">
                  {t('contact.callUs')}
                </a>
              </div>

              <div className="info-card">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <h3>{t('contact.addressTitle')}</h3>
                <p>Yaoundé, Cameroun</p>
              </div>

              <div className="info-card availability-card">
                <div className="info-icon">
                  <i className="fas fa-clock"></i>
                </div>
                <h3>{t('contact.availabilityTitle')}</h3>
                <p className="availability-badge">
                  <i className="fas fa-check-circle"></i> {t('contact.available247')}
                </p>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="social-section">
              <h3>{t('contact.followUs')}</h3>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-link x-twitter">
                  <i className="fab fa-x-twitter"></i>
                </a>
                <a href="https://wa.me/237679336545" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
