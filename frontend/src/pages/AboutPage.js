// src/pages/AboutPage.js
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/AboutPage.css';

function AboutPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Utiliser useMemo pour recalculer quand la langue change
  const teamMembers = useMemo(() => [
    {
      name: t('about.teamMember1Name'),
      role: t('about.teamMember1Role'),
      description: t('about.teamMember1Desc'),
      icon: "fa-code"
    },
    {
      name: t('about.teamMember2Name'),
      role: t('about.teamMember2Role'),
      description: t('about.teamMember2Desc'),
      icon: "fa-user-tie"
    },
    {
      name: t('about.teamMember3Name'),
      role: t('about.teamMember3Role'),
      description: t('about.teamMember3Desc'),
      icon: "fa-laptop-code"
    },
    {
      name: t('about.teamMember4Name'),
      role: t('about.teamMember4Role'),
      description: t('about.teamMember4Desc'),
      icon: "fa-database"
    },
    {
      name: t('about.teamMember5Name'),
      role: t('about.teamMember5Role'),
      description: t('about.teamMember5Desc'),
      icon: "fa-palette"
    }
  ], [t, i18n.language]);

  const values = useMemo(() => [
    {
      title: t('about.valueAccessibilityTitle'),
      description: t('about.valueAccessibilityDesc'),
      icon: "fa-universal-access",
      color: "#4CAF50"
    },
    {
      title: t('about.valueReliabilityTitle'),
      description: t('about.valueReliabilityDesc'),
      icon: "fa-shield-alt",
      color: "#2196F3"
    },
    {
      title: t('about.valueInnovationTitle'),
      description: t('about.valueInnovationDesc'),
      icon: "fa-lightbulb",
      color: "#FF9800"
    },
    {
      title: t('about.valueTransparencyTitle'),
      description: t('about.valueTransparencyDesc'),
      icon: "fa-eye",
      color: "#9C27B0"
    }
  ], [t, i18n.language]);

  return (
    <div className="about-page">
      <div className="about-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> {t('about.backButton')}
        </button>
        <h1>
          <i className="fas fa-info-circle"></i>
          {t('about.title')}
        </h1>
        <p className="about-subtitle">
          {t('about.subtitle')}
        </p>
      </div>

      <div className="about-container">
        {/* Mission Section */}
        <section className="about-section mission-section">
          <div className="section-content">
            <div className="section-icon">
              <i className="fas fa-bullseye"></i>
            </div>
            <h2>{t('about.missionTitle')}</h2>
            <p className="mission-text">
              {t('about.missionText')}
            </p>
          </div>
        </section>

        {/* Story Section */}
        <section className="about-section story-section">
          <h2>
            <i className="fas fa-book-open"></i>
            {t('about.storyTitle')}
          </h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-flag"></i>
              </div>
              <div className="timeline-content">
                <h3>{t('about.story2023Title')}</h3>
                <p>{t('about.story2023Text')}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-rocket"></i>
              </div>
              <div className="timeline-content">
                <h3>{t('about.story2024Title')}</h3>
                <p>{t('about.story2024Text')}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="timeline-content">
                <h3>{t('about.story2025Title')}</h3>
                <p>{t('about.story2025Text')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-section values-section">
          <h2>
            <i className="fas fa-heart"></i>
            {t('about.valuesTitle')}
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
            {t('about.teamTitle')}
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
          <h2>{t('about.statsTitle')}</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-store"></i>
              </div>
              <div className="stat-number">200+</div>
              <div className="stat-label">{t('about.statsPharmacies')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-number">10,000+</div>
              <div className="stat-label">{t('about.statsUsers')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="stat-number">5,000+</div>
              <div className="stat-label">{t('about.statsMedicines')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-search"></i>
              </div>
              <div className="stat-number">50,000+</div>
              <div className="stat-label">{t('about.statsSearches')}</div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="about-section cta-section">
          <div className="cta-card">
            <i className="fas fa-envelope-open-text cta-icon"></i>
            <h2>{t('about.ctaTitle')}</h2>
            <p>{t('about.ctaText')}</p>
            <div className="cta-buttons">
              <a href="#contact" className="cta-button primary">
                <i className="fas fa-paper-plane"></i>
                {t('about.ctaContact')}
              </a>
              <a href="https://www.facebook.com/share/19vayRCk8F/" target="_blank" rel="noopener noreferrer" className="cta-button secondary">
                <i className="fab fa-facebook-f"></i>
                {t('about.ctaFollow')}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
