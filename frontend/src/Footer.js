// src/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="app-footer">
      <div className="footer-links">
        <Link to="/about">{t('footer.about')}</Link>
        <a href="mailto:contact@findpharma.cm">{t('footer.contact')}</a>
        <Link to="/faq">{t('footer.faq')}</Link>
        <Link to="/legal">{t('footer.legal')}</Link>
      </div>
      <div className="footer-social">
        <a 
          href="https://www.facebook.com/share/19vayRCk8F/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="facebook-button"
          title={t('footer.followUs')}
        >
          <i className="fab fa-facebook-f"></i>
          <span>{t('footer.followUs')}</span>
        </a>
      </div>
    </footer>
  );
}

export default Footer;
