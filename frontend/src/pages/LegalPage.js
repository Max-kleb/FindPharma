// src/pages/LegalPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/LegalPage.css';

function LegalPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> {t('legal.backButton')}
        </button>
        <h1>
          <i className="fas fa-balance-scale"></i>
          {t('legal.title')}
        </h1>
        <p className="legal-subtitle">
          {t('legal.subtitle')}
        </p>
        <p className="legal-last-updated">{t('legal.lastUpdated')}</p>
      </div>

      <div className="legal-container">
        {/* Section 1: Présentation du Service */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-info-circle"></i>
            {t('legal.section1Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section1Text')}</p>
          </div>
        </section>

        {/* Section 2: Éditeur du site */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-building"></i>
            {t('legal.section2Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section2Text')}</p>
          </div>
        </section>

        {/* Section 3: Hébergement */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-server"></i>
            {t('legal.section3Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section3Text')}</p>
          </div>
        </section>

        {/* Section 4: Utilisation du Service */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-user-check"></i>
            {t('legal.section4Title')}
          </h2>
          <div className="legal-content">
            <h3>{t('legal.section4Subtitle1')}</h3>
            <p>{t('legal.section4Text1')}</p>
            
            <h3>{t('legal.section4Subtitle2')}</h3>
            <p>{t('legal.section4Text2')}</p>
            
            <h3>{t('legal.section4Subtitle3')}</h3>
            <p>{t('legal.section4Text3')}</p>
          </div>
        </section>

        {/* Section 5: Protection des Données Personnelles */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-user-shield"></i>
            {t('legal.section5Title')}
          </h2>
          <div className="legal-content">
            <h3>{t('legal.section5Subtitle1')}</h3>
            <p>{t('legal.section5Text1')}</p>
            
            <h3>{t('legal.section5Subtitle2')}</h3>
            <p>{t('legal.section5Text2')}</p>
            
            <h3>{t('legal.section5Subtitle3')}</h3>
            <p>{t('legal.section5Text3')}</p>
            
            <h3>{t('legal.section5Subtitle4')}</h3>
            <p>{t('legal.section5Text4')}</p>
          </div>
        </section>

        {/* Section 6: Responsabilité */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-exclamation-triangle"></i>
            {t('legal.section6Title')}
          </h2>
          <div className="legal-content">
            <h3>{t('legal.section6Subtitle1')}</h3>
            <p>{t('legal.section6Text1')}</p>
            
            <h3>{t('legal.section6Subtitle2')}</h3>
            <p>{t('legal.section6Text2')}</p>
            
            <h3>{t('legal.section6Subtitle3')}</h3>
            <p>{t('legal.section6Text3')}</p>
          </div>
        </section>

        {/* Section 7: Propriété Intellectuelle */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-copyright"></i>
            {t('legal.section7Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section7Text')}</p>
          </div>
        </section>

        {/* Section 8: Cookies */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-cookie-bite"></i>
            {t('legal.section8Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section8Text')}</p>
          </div>
        </section>

        {/* Section 9: Modification des Conditions */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-edit"></i>
            {t('legal.section9Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section9Text')}</p>
          </div>
        </section>

        {/* Section 10: Loi Applicable et Juridiction */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-gavel"></i>
            {t('legal.section10Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section10Text')}</p>
          </div>
        </section>

        {/* Section 11: Contact */}
        <section className="legal-section contact-section">
          <h2>
            <i className="fas fa-envelope"></i>
            {t('legal.section11Title')}
          </h2>
          <div className="legal-content">
            <p>{t('legal.section11Text')}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LegalPage;
