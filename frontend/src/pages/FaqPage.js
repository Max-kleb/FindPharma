// src/pages/FaqPage.js
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/FaqPage.css';

function FaqPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  // Utiliser useMemo pour recalculer quand la langue change
  const faqQuestions = useMemo(() => [
    { q: 'q1', a: 'a1' },
    { q: 'q2', a: 'a2' },
    { q: 'q3', a: 'a3' },
    { q: 'q4', a: 'a4' },
    { q: 'q5', a: 'a5' },
    { q: 'q6', a: 'a6' },
    { q: 'q7', a: 'a7' },
    { q: 'q8', a: 'a8' },
    { q: 'q9', a: 'a9' },
    { q: 'q10', a: 'a10' },
    { q: 'q11', a: 'a11' },
    { q: 'q12', a: 'a12' }
  ], [i18n.language]);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> {t('faq.backButton')}
        </button>
        <h1>
          <i className="fas fa-question-circle"></i>
          {t('faq.title')}
        </h1>
        <p className="faq-subtitle">
          {t('faq.subtitle')}
        </p>
      </div>

      <div className="faq-container">
        <div className="faq-category">
          <div className="faq-questions">
            {faqQuestions.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={index}
                  className={`faq-item ${isOpen ? 'active' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleQuestion(index)}
                  >
                    <span className="question-text">
                      <i className="fas fa-question"></i>
                      {t(`faq.${item.q}`)}
                    </span>
                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} toggle-icon`}></i>
                  </button>
                  <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                    <p>
                      <i className="fas fa-check-circle answer-icon"></i>
                      {t(`faq.${item.a}`)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="faq-contact-section">
        <div className="contact-card">
          <i className="fas fa-envelope-open-text contact-icon"></i>
          <h3>{t('faq.stillHaveQuestions')}</h3>
          <p>{t('faq.contactUs')} <a href="https://www.facebook.com/share/19vayRCk8F/" target="_blank" rel="noopener noreferrer">{t('faq.ourFacebook')}</a> {t('faq.orEmail')} contact@findpharma.cm</p>
          <p>{t('faq.responseTime')}</p>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
