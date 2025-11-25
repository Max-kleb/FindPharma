// src/HeroSection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function HeroSection({ isLoggedIn }) {
  const navigate = useNavigate();

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="badge-icon">⚕️</span>
            <span>Trouvez vos médicaments rapidement</span>
          </div>
          
          <h1 className="hero-title">
            Trouvez la pharmacie la plus proche avec vos médicaments
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
            FindPharma vous aide à localiser les pharmacies autour de vous qui ont 
            les médicaments dont vous avez besoin, avec les prix et la disponibilité 
            en temps réel.
          </p>

          <div className="hero-features">
            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&auto=format&fit=crop&q=80" 
                  alt="Recherche médicaments"
                />
              </div>
              <div>
                <h3>Recherche intelligente</h3>
                <p>Trouvez vos médicaments par nom ou principe actif</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&auto=format&fit=crop&q=80" 
                  alt="Géolocalisation"
                />
              </div>
              <div>
                <h3>Géolocalisation</h3>
                <p>Pharmacies les plus proches de votre position</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-image">
                <img 
                  src="https://images.unsplash.com/photo-1556740758-90de374c12ad?w=400&auto=format&fit=crop&q=80" 
                  alt="Comparaison prix"
                />
              </div>
              <div>
                <h3>Comparaison de prix</h3>
                <p>Comparez les prix entre différentes pharmacies</p>
              </div>
            </div>

            <div className="feature-item">
              <span className="feature-icon">🛒</span>
              <div>
                <h3>Réservation facile</h3>
                <p>Ajoutez au panier et réservez vos médicaments</p>
              </div>
            </div>
          </div>

          {!isLoggedIn && (
            <div className="hero-cta">
              <button 
                className="btn-primary-large"
                onClick={() => navigate('/register')}
              >
                <span>Créer un compte</span>
                <span className="btn-arrow">→</span>
              </button>
              <button 
                className="btn-secondary-large"
                onClick={() => navigate('/login')}
              >
                <span>Se connecter</span>
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
                  <div className="card-title">Pharmacie de la Mairie</div>
                  <div className="card-distance">1.2 km</div>
                </div>
                <div className="card-status available">En stock</div>
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
                  <div className="card-title">Position détectée</div>
                  <div className="card-distance">Yaoundé, Cameroun</div>
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
          <div className="stat-label">Pharmacies partenaires</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">10 000+</div>
          <div className="stat-label">Médicaments référencés</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50 000+</div>
          <div className="stat-label">Utilisateurs actifs</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">24/7</div>
          <div className="stat-label">Service disponible</div>
        </div>
      </div>

      {/* Section comment ça marche */}
      <div className="how-it-works">
        <h2 className="section-title">Comment ça marche ?</h2>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-icon">🔍</div>
            <h3>Recherchez</h3>
            <p>Entrez le nom du médicament que vous recherchez</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-icon">📋</div>
            <h3>Comparez</h3>
            <p>Consultez les pharmacies, prix et disponibilités</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-icon">🛒</div>
            <h3>Réservez</h3>
            <p>Ajoutez au panier et réservez vos médicaments</p>
          </div>

          <div className="step-arrow">→</div>

          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-icon">✅</div>
            <h3>Récupérez</h3>
            <p>Retirez vos médicaments à la pharmacie choisie</p>
          </div>
        </div>
      </div>

      {/* Section avantages */}
      <div className="benefits-section">
        <h2 className="section-title">Pourquoi choisir FindPharma ?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Rapide et efficace</h3>
            <p>Trouvez vos médicaments en quelques secondes sans appeler plusieurs pharmacies</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">💯</div>
            <h3>Fiable</h3>
            <p>Informations vérifiées et mises à jour en temps réel par les pharmacies</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🔒</div>
            <h3>Sécurisé</h3>
            <p>Vos données personnelles et médicales sont protégées</p>
          </div>

          <div className="benefit-card">
            <div className="benefit-icon">🆓</div>
            <h3>Gratuit</h3>
            <p>Service 100% gratuit pour tous les utilisateurs au Cameroun</p>
          </div>
        </div>
      </div>

      {/* CTA final */}
      {!isLoggedIn && (
        <div className="final-cta">
          <h2>Prêt à commencer ?</h2>
          <p>Rejoignez des milliers d'utilisateurs qui trouvent leurs médicaments facilement</p>
          <button 
            className="btn-primary-large"
            onClick={() => navigate('/register')}
          >
            <span>Créer un compte gratuitement</span>
            <span className="btn-arrow">→</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default HeroSection;
