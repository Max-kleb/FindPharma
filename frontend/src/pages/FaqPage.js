// src/pages/FaqPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FaqPage.css';

function FaqPage() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = [
    {
      category: "Utilisation de la plateforme",
      questions: [
        {
          question: "Comment rechercher un médicament ?",
          answer: "Sur la page d'accueil ou le tableau de bord, entrez le nom du médicament dans la barre de recherche et cliquez sur 'Rechercher'. Vous pouvez également activer votre localisation pour trouver les pharmacies les plus proches."
        },
        {
          question: "Comment activer ma géolocalisation ?",
          answer: "Cliquez sur le bouton avec l'icône de localisation. Votre navigateur vous demandera l'autorisation d'accéder à votre position. Acceptez pour permettre à FindPharma de trouver les pharmacies près de chez vous."
        },
        {
          question: "La recherche fonctionne-t-elle sans géolocalisation ?",
          answer: "Oui, vous pouvez rechercher des médicaments sans activer la géolocalisation, mais vous ne verrez pas les distances calculées entre votre position et les pharmacies."
        }
      ]
    },
    {
      category: "Compte utilisateur",
      questions: [
        {
          question: "Dois-je créer un compte pour utiliser FindPharma ?",
          answer: "Non, vous pouvez rechercher des médicaments et voir leur disponibilité sans compte. Cependant, un compte est nécessaire pour ajouter des articles au panier et effectuer des réservations."
        },
        {
          question: "Comment créer un compte ?",
          answer: "Cliquez sur 'Inscription' dans le menu, remplissez le formulaire avec vos informations (nom, prénom, email, téléphone et mot de passe), puis validez. Vous recevrez une confirmation par email."
        },
        {
          question: "J'ai oublié mon mot de passe, que faire ?",
          answer: "Cliquez sur 'Mot de passe oublié ?' sur la page de connexion. Entrez votre adresse email et suivez les instructions pour réinitialiser votre mot de passe."
        }
      ]
    },
    {
      category: "Commandes et réservations",
      questions: [
        {
          question: "Comment réserver un médicament ?",
          answer: "Après avoir recherché un médicament, cliquez sur 'Ajouter au panier' pour les médicaments disponibles. Accédez ensuite à votre panier et cliquez sur 'Réserver' pour finaliser votre réservation."
        },
        {
          question: "Combien de temps ma réservation est-elle valable ?",
          answer: "Votre réservation est généralement valable 48 heures. Passé ce délai, les médicaments peuvent être remis en vente. Vérifiez les conditions spécifiques de chaque pharmacie."
        },
        {
          question: "Puis-je annuler une réservation ?",
          answer: "Oui, vous pouvez annuler une réservation depuis votre tableau de bord dans la section 'Mes réservations'. Contactez également la pharmacie pour confirmer l'annulation."
        },
        {
          question: "Le paiement se fait-il en ligne ?",
          answer: "Non, actuellement le paiement se fait directement en pharmacie lors du retrait de vos médicaments. FindPharma permet uniquement la réservation en ligne."
        }
      ]
    },
    {
      category: "Informations sur les pharmacies",
      questions: [
        {
          question: "Comment contacter une pharmacie ?",
          answer: "Les informations de contact (téléphone, adresse) sont affichées sur chaque fiche pharmacie. Vous pouvez cliquer sur le numéro de téléphone pour appeler directement depuis votre smartphone."
        },
        {
          question: "Les horaires des pharmacies sont-ils affichés ?",
          answer: "Oui, les horaires d'ouverture sont indiqués sur la fiche de chaque pharmacie. Nous vous recommandons de vérifier par téléphone avant de vous déplacer."
        },
        {
          question: "Puis-je voir les pharmacies de garde ?",
          answer: "Cette fonctionnalité est en cours de développement. Pour l'instant, nous vous conseillons de contacter votre municipalité ou de consulter les sites officiels pour connaître les pharmacies de garde."
        }
      ]
    },
    {
      category: "Problèmes techniques",
      questions: [
        {
          question: "La carte ne s'affiche pas, que faire ?",
          answer: "Vérifiez votre connexion internet et actualisez la page. Si le problème persiste, essayez de vider le cache de votre navigateur ou utilisez un autre navigateur."
        },
        {
          question: "Je ne trouve pas le médicament que je cherche",
          answer: "Vérifiez l'orthographe du nom du médicament. Vous pouvez également essayer avec le nom générique ou la substance active. Si le médicament n'apparaît pas, il n'est peut-être pas disponible dans les pharmacies référencées."
        },
        {
          question: "L'application est lente, pourquoi ?",
          answer: "Cela peut être dû à votre connexion internet ou à une forte affluence sur le site. Essayez de rafraîchir la page ou de réessayer plus tard."
        }
      ]
    },
    {
      category: "Confidentialité et sécurité",
      questions: [
        {
          question: "Mes données personnelles sont-elles protégées ?",
          answer: "Oui, FindPharma prend la protection de vos données très au sérieux. Toutes les informations sont cryptées et stockées de manière sécurisée. Consultez notre page 'Mentions Légales' pour plus de détails."
        },
        {
          question: "Qui peut voir mon historique de recherche ?",
          answer: "Votre historique de recherche est privé et n'est accessible que par vous. Nous ne partageons pas ces informations avec des tiers sans votre consentement."
        },
        {
          question: "Puis-je supprimer mon compte ?",
          answer: "Oui, vous pouvez demander la suppression de votre compte en nous contactant via le formulaire de contact. Toutes vos données personnelles seront supprimées conformément au RGPD."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <h1>
          <i className="fas fa-question-circle"></i>
          Foire Aux Questions (FAQ)
        </h1>
        <p className="faq-subtitle">
          Trouvez rapidement des réponses à vos questions sur FindPharma
        </p>
      </div>

      <div className="faq-container">
        {faqData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="faq-category">
            <h2 className="category-title">
              <i className="fas fa-folder-open"></i>
              {category.category}
            </h2>
            <div className="faq-questions">
              {category.questions.map((item, questionIndex) => {
                const index = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === index;
                return (
                  <div
                    key={questionIndex}
                    className={`faq-item ${isOpen ? 'active' : ''}`}
                  >
                    <button
                      className="faq-question"
                      onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                    >
                      <span className="question-text">
                        <i className="fas fa-question"></i>
                        {item.question}
                      </span>
                      <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} toggle-icon`}></i>
                    </button>
                    <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                      <p>
                        <i className="fas fa-check-circle answer-icon"></i>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="faq-contact-section">
        <div className="contact-card">
          <i className="fas fa-envelope-open-text contact-icon"></i>
          <h3>Vous ne trouvez pas votre réponse ?</h3>
          <p>Notre équipe est là pour vous aider</p>
          <a href="#contact" className="contact-button">
            <i className="fas fa-paper-plane"></i>
            Nous contacter
          </a>
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
