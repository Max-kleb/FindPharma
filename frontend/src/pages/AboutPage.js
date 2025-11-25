// src/pages/AboutPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AboutPage.css';

function AboutPage() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: "Dr. Marie Kamga",
      role: "Fondatrice & Directrice",
      description: "Pharmacienne avec 15 ans d'expérience, passionnée par l'innovation en santé numérique",
      icon: "fa-user-md"
    },
    {
      name: "Jean-Paul Nguema",
      role: "Directeur Technique",
      description: "Expert en développement d'applications web et mobile, spécialisé en solutions de santé",
      icon: "fa-laptop-code"
    },
    {
      name: "Sophie Mbarga",
      role: "Responsable Partenariats",
      description: "Gère les relations avec les pharmacies partenaires à travers le pays",
      icon: "fa-handshake"
    }
  ];

  const values = [
    {
      title: "Accessibilité",
      description: "Rendre l'information sur les médicaments accessible à tous, partout et à tout moment",
      icon: "fa-universal-access",
      color: "#4CAF50"
    },
    {
      title: "Fiabilité",
      description: "Des informations vérifiées et mises à jour en temps réel pour votre sécurité",
      icon: "fa-shield-alt",
      color: "#2196F3"
    },
    {
      title: "Innovation",
      description: "Utiliser la technologie pour améliorer l'accès aux soins pharmaceutiques",
      icon: "fa-lightbulb",
      color: "#FF9800"
    },
    {
      title: "Transparence",
      description: "Prix clairs, disponibilité en temps réel, aucune surprise",
      icon: "fa-eye",
      color: "#9C27B0"
    }
  ];

  return (
    <div className="about-page">
      <div className="about-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <h1>
          <i className="fas fa-info-circle"></i>
          À Propos de FindPharma
        </h1>
        <p className="about-subtitle">
          Votre compagnon digital pour trouver vos médicaments facilement
        </p>
      </div>

      <div className="about-container">
        {/* Mission Section */}
        <section className="about-section mission-section">
          <div className="section-content">
            <div className="section-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h2>Notre Mission</h2>
            <p className="mission-text">
              FindPharma a été créé avec une mission simple mais essentielle : 
              <strong> faciliter l'accès aux médicaments pour tous</strong>. 
              Nous savons à quel point il peut être frustrant de chercher un médicament 
              en visitant plusieurs pharmacies sans succès. Notre plateforme connecte 
              les patients aux pharmacies en temps réel, leur permettant de localiser 
              instantanément les médicaments dont ils ont besoin.
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-section story-section">
          <h2>
            <i className="fas fa-book-open"></i>
            Notre Histoire
          </h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-flag"></i>
              </div>
              <div className="timeline-content">
                <h3>2023 - Le Début</h3>
                <p>
                  FindPharma naît de la frustration de ne pas trouver rapidement 
                  les médicaments nécessaires. Notre fondatrice, pharmacienne de 
                  profession, décide de créer une solution digitale.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="timeline-content">
                <h3>2024 - Lancement</h3>
                <p>
                  Lancement de la version beta avec 50 pharmacies partenaires 
                  au Cameroun. Succès immédiat avec plus de 1000 utilisateurs 
                  en un mois.
                </p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="timeline-content">
                <h3>2025 - Expansion</h3>
                <p>
                  Plus de 200 pharmacies partenaires, intégration de nouvelles 
                  fonctionnalités (réservation en ligne, géolocalisation avancée) 
                  et expansion vers d'autres villes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section values-section">
          <h2>
            <i className="fas fa-heart"></i>
            Nos Valeurs
          </h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon" style={{ backgroundColor: value.color }}>
                  <i className={`fas ${value.icon}`}></i>
                </div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="about-section team-section">
          <h2>
            <i className="fas fa-users"></i>
            Notre Équipe
          </h2>
          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-avatar">
                  <i className={`fas ${member.icon}`}></i>
                </div>
                <h3>{member.name}</h3>
                <p className="team-role">{member.role}</p>
                <p className="team-description">{member.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-section stats-section">
          <h2>FindPharma en Chiffres</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="stat-number">200+</div>
              <div className="stat-label">Pharmacies Partenaires</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Utilisateurs Actifs</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="stat-number">5,000+</div>
              <div className="stat-label">Médicaments Référencés</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Recherches par Mois</div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="about-section cta-section">
          <div className="cta-card">
            <i className="fas fa-envelope-open-text cta-icon"></i>
            <h2>Rejoignez l'Aventure FindPharma</h2>
            <p>
              Vous êtes pharmacien et souhaitez rejoindre notre réseau ? 
              Vous avez des suggestions pour améliorer notre service ?
            </p>
            <div className="cta-buttons">
              <a href="#contact" className="cta-button primary">
                <i className="fas fa-paper-plane"></i>
                Contactez-nous
              </a>
              <a href="https://www.facebook.com/share/19vayRCk8F/" target="_blank" rel="noopener noreferrer" className="cta-button secondary">
                <i className="fab fa-facebook-f"></i>
                Suivez-nous
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
