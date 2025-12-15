// src/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Footer.css';

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer-pro">
      {/* Section principale */}
      <div className="footer-main">
        <div className="footer-grid">
          {/* Colonne 1: Logo et description */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.svg" alt="FindPharma" className="footer-logo-img" />
              <span className="footer-logo-text">
                <span className="logo-find">Find</span>
                <span className="logo-pharma">Pharma</span>
              </span>
            </div>
            <p className="footer-description">
              Votre partenaire santé au Cameroun. Trouvez vos médicaments rapidement dans les pharmacies près de chez vous.
            </p>
            <div className="footer-social-icons">
              <a 
                href="https://www.facebook.com/share/19vayRCk8F/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-icon facebook"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f"></i>
              </a>
              <a 
                href="#" 
                className="social-icon x-twitter"
                aria-label="X (anciennement Twitter)"
                style={{ backgroundColor: '#000', color: '#fff' }}
              >
                <i className="fab fa-x-twitter"></i>
              </a>
              <a 
                href="#" 
                className="social-icon instagram"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="#" 
                className="social-icon whatsapp"
                aria-label="WhatsApp"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Colonne 2: Informations */}
          <div className="footer-links-col">
            <h4>Informations</h4>
            <ul>
              <li><Link to="/about"><i className="fas fa-info-circle"></i> À propos</Link></li>
              <li><Link to="/faq"><i className="fas fa-question-circle"></i> FAQ</Link></li>
              <li><Link to="/contact"><i className="fas fa-envelope"></i> Contact</Link></li>
              <li><Link to="/legal"><i className="fas fa-shield-alt"></i> Mentions légales</Link></li>
            </ul>
          </div>

          {/* Colonne 4: Contact */}
          <div className="footer-contact">
            <h4>Nous contacter</h4>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Yaoundé, Cameroun</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>contact.findpharma@gmail.com</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>+237 6XX XXX XXX</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-clock"></i>
              <span>Disponible 24h/24</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges de confiance - Limité à 2 */}
      <div className="footer-trust">
        <div className="trust-badges">
          <div className="trust-badge">
            <i className="fas fa-check-circle"></i>
            <span>Pharmacies vérifiées</span>
          </div>
          <div className="trust-badge">
            <i className="fas fa-headset"></i>
            <span>Support 24/7</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p className="copyright">
            © {currentYear} FindPharma. Tous droits réservés.
          </p>
          <p className="made-with">
            Fait avec <span className="heart">❤️</span> au Cameroun
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
