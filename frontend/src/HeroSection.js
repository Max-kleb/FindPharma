// src/HeroSection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function HeroSection({ isLoggedIn }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-icon">⚕️</span>
            <span>{t('hero.badge')}</span>
          </div>
          
          <h1 className="hero-title">
            {t('hero.title')}
          </h1>
          
          {/* Image illustration principale */}
          <div className="hero-image-mobile">
            <img 
              src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=800&auto=format&fit=crop&q=80" 
              alt="Pharmacie moderne"
              className="hero-main-image"
            />
          </div>
          
          <p className="hero-description">
            {t('hero.description')}
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80" 
                  alt={t('hero.features.smartSearch')}
                />
              </div>
              <div>
                <h3>{t('hero.features.smartSearch')}</h3>
                <p>{t('hero.features.smartSearchDesc')}</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80" 
                  alt={t('hero.features.geolocation')}
                />
              </div>
              <div>
                <h3>{t('hero.features.geolocation')}</h3>
                <p>{t('hero.features.geolocationDesc')}</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80" 
                  alt={t('hero.features.priceComparison')}
                />
              </div>
              <div>
                <h3>{t('hero.features.priceComparison')}</h3>
                <p>{t('hero.features.priceComparisonDesc')}</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <div>
                <h3>{t('hero.features.easyReservation')}</h3>
                <p>{t('hero.features.easyReservationDesc')}</p>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="hero-cta">
              <button 
                className="btn-primary-large"
                onClick={() => navigate('/register')}
              >
                <span>{t('hero.cta.createAccount')}</span>
                <span className="btn-arrow">→</span>
              </button>
              <button 
                className="btn-secondary-large"
                onClick={() => navigate('/login')}
              >
                <span>{t('hero.cta.login')}</span>
              </button>
            </div>
          )}
        </div>

        <div className="hero-image">
          <div className="hero-illustration">
            {/* Image de fond - pharmacie moderne */}
            <img 
              src="https://images.unsplash.com/photo-1585435557343-3b092031a831?w=1200&auto=format&fit=crop&q=80" 
              alt="Pharmacie moderne au Cameroun"
              className="hero-bg-image"
            />
            
            <div className="illustration-overlay"></div>
            <div className="illustration-circle circle-1"></div>
            <div className="illustration-circle circle-2"></div>
            <div className="illustration-circle circle-3"></div>
            
            <div className="illustration-content">
              <div className="pharmacy-card card-1">
                <div className="card-icon">🏥</div>
                <div className="card-text">
                  <div className="card-title">{t('hero.cards.pharmacyName')}</div>
                  <div className="card-distance">1.2 km</div>
                </div>
                <div className="card-status available">{t('hero.cards.inStock')}</div>
              </div>

              <div className="pharmacy-card card-2">
                <div className="card-icon">💊</div>
                <div className="card-text">
                  <div className="card-title">Paracétamol 500mg</div>
                  <div className="card-price">2 500 XAF</div>
                </div>
              </div>

              <div className="pharmacy-card card-3">
                <div className="card-icon">📍</div>
                <div className="card-text">
                  <div className="card-title">{t('hero.cards.positionDetected')}</div>
                  <div className="card-distance">{t('hero.cards.location')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section statistiques */}
      <div className="hero-stats">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">{t('hero.stats.pharmacies')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10 000+</div>
          <div className="stat-label">{t('hero.stats.medicines')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50 000+</div>
          <div className="stat-label">{t('hero.stats.users')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">{t('hero.stats.availability')}</div>
        </div>
      </div>

      {/* Section comment ça marche */}
      <div className="how-it-works">
        <h2 className="section-title">{t('hero.howItWorks.title')}</h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-icon">🔍</div>
            <h3>{t('hero.howItWorks.step1')}</h3>
            <p>{t('hero.howItWorks.step1Desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-icon">📋</div>
            <h3>{t('hero.howItWorks.step2')}</h3>
            <p>{t('hero.howItWorks.step2Desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-icon">🛒</div>
            <h3>{t('hero.howItWorks.step3')}</h3>
            <p>{t('hero.howItWorks.step3Desc')}</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-icon">✅</div>
            <h3>{t('hero.howItWorks.step4')}</h3>
            <p>{t('hero.howItWorks.step4Desc')}</p>
          </div>
        </div>
      </div>

      {/* Section avantages */}
      <div className="benefits-section">
        <h2 className="section-title">{t('hero.benefits.title')}</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>{t('hero.benefits.fast')}</h3>
            <p>{t('hero.benefits.fastDesc')}</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">💯</div>
            <h3>{t('hero.benefits.reliable')}</h3>
            <p>{t('hero.benefits.reliableDesc')}</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h3>{t('hero.benefits.secure')}</h3>
            <p>{t('hero.benefits.secureDesc')}</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🆓</div>
            <h3>{t('hero.benefits.free')}</h3>
            <p>{t('hero.benefits.freeDesc')}</p>
          </div>
        </div>
      </div>

      {/* CTA final */}
      {!isLoggedIn && (
        <div className="final-cta">
          <h2>{t('hero.finalCta.title')}</h2>
          <p>{t('hero.finalCta.description')}</p>
          <button 
            className="btn-primary-large"
            onClick={() => navigate('/register')}
          >
            <span>{t('hero.cta.createAccountFree')}</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
