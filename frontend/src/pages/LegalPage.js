// src/pages/LegalPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LegalPage.css';

function LegalPage() {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <h1>
          <i className="fas fa-balance-scale"></i>
          Mentions Légales
        </h1>
        <p className="legal-subtitle">
          Informations légales et conditions d'utilisation de FindPharma
        </p>
      </div>

      <div className="legal-container">
        {/* Éditeur du site */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-building"></i>
            Éditeur du Site
          </h2>
          <div className="legal-content">
            <p><strong>Nom de la société :</strong> FindPharma SARL</p>
            <p><strong>Forme juridique :</strong> Société à Responsabilité Limitée</p>
            <p><strong>Capital social :</strong> 1.000.000 FCFA</p>
            <p><strong>Siège social :</strong> Yaoundé, Cameroun</p>
            <p><strong>Email :</strong> contact@findpharma.cm</p>
            <p><strong>Téléphone :</strong> +237 6XX XX XX XX</p>
            <p><strong>Directrice de publication :</strong> Dr. Marie Kamga</p>
          </div>
        </section>

        {/* Hébergement */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-server"></i>
            Hébergement
          </h2>
          <div className="legal-content">
            <p><strong>Hébergeur :</strong> Vercel Inc.</p>
            <p><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
            <p><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">vercel.com</a></p>
          </div>
        </section>

        {/* Propriété intellectuelle */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-copyright"></i>
            Propriété Intellectuelle
          </h2>
          <div className="legal-content">
            <p>
              L'ensemble du contenu de ce site (textes, images, vidéos, logos, icônes, sons, logiciels, etc.) 
              est la propriété exclusive de FindPharma SARL ou de ses partenaires, et est protégé par les 
              lois camerounaises et internationales relatives à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de tout ou partie 
              des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite, sauf 
              autorisation écrite préalable de FindPharma SARL.
            </p>
            <p>
              L'utilisation non autorisée du site ou de l'un de ses éléments sera considérée comme 
              constitutive d'une contrefaçon et poursuivie conformément aux dispositions des articles 
              L.335-2 et suivants du Code de Propriété Intellectuelle.
            </p>
          </div>
        </section>

        {/* Données personnelles */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-user-shield"></i>
            Protection des Données Personnelles (RGPD)
          </h2>
          <div className="legal-content">
            <h3>Responsable du traitement</h3>
            <p>
              FindPharma SARL, représentée par Dr. Marie Kamga, est responsable du traitement 
              des données personnelles collectées sur ce site.
            </p>

            <h3>Données collectées</h3>
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li>Informations d'identification : nom, prénom, adresse email, numéro de téléphone</li>
              <li>Données de connexion : adresse IP, logs de connexion</li>
              <li>Données de géolocalisation (avec votre consentement)</li>
              <li>Historique de recherches et de réservations</li>
              <li>Cookies et traceurs (voir Politique des Cookies)</li>
            </ul>

            <h3>Finalités du traitement</h3>
            <p>Vos données sont collectées pour :</p>
            <ul>
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Traiter vos réservations de médicaments</li>
              <li>Améliorer nos services et votre expérience utilisateur</li>
              <li>Vous envoyer des notifications concernant vos réservations</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>

            <h3>Base légale du traitement</h3>
            <p>Le traitement de vos données repose sur :</p>
            <ul>
              <li>Votre consentement (notamment pour la géolocalisation)</li>
              <li>L'exécution du contrat (pour les réservations)</li>
              <li>Notre intérêt légitime (amélioration des services)</li>
              <li>Le respect d'obligations légales</li>
            </ul>

            <h3>Durée de conservation</h3>
            <p>
              Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles 
              elles sont collectées, et conformément aux obligations légales :
            </p>
            <ul>
              <li>Données de compte : durée de vie du compte + 3 ans après fermeture</li>
              <li>Données de réservation : 3 ans après la dernière transaction</li>
              <li>Logs de connexion : 1 an maximum</li>
            </ul>

            <h3>Vos droits</h3>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : <strong>privacy@findpharma.cm</strong>
            </p>

            <h3>Sécurité des données</h3>
            <p>
              FindPharma met en œuvre toutes les mesures techniques et organisationnelles appropriées 
              pour protéger vos données contre tout accès non autorisé, perte, destruction ou divulgation.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-cookie-bite"></i>
            Politique des Cookies
          </h2>
          <div className="legal-content">
            <h3>Qu'est-ce qu'un cookie ?</h3>
            <p>
              Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, 
              tablette) lors de la visite d'un site web. Il permet de conserver des informations sur 
              votre navigation.
            </p>

            <h3>Types de cookies utilisés</h3>
            <ul>
              <li>
                <strong>Cookies strictement nécessaires :</strong> essentiels au fonctionnement du site 
                (authentification, panier, préférences)
              </li>
              <li>
                <strong>Cookies de performance :</strong> collectent des informations anonymes sur 
                l'utilisation du site pour améliorer nos services
              </li>
              <li>
                <strong>Cookies fonctionnels :</strong> mémorisent vos préférences (langue, localisation)
              </li>
            </ul>

            <h3>Gestion des cookies</h3>
            <p>
              Vous pouvez à tout moment désactiver les cookies depuis les paramètres de votre navigateur. 
              Attention, la désactivation de certains cookies peut affecter votre expérience sur le site.
            </p>
          </div>
        </section>

        {/* Conditions d'utilisation */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-file-contract"></i>
            Conditions Générales d'Utilisation
          </h2>
          <div className="legal-content">
            <h3>Acceptation des conditions</h3>
            <p>
              L'utilisation du site FindPharma implique l'acceptation pleine et entière des présentes 
              conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne 
              pas utiliser ce site.
            </p>

            <h3>Objet du service</h3>
            <p>
              FindPharma est une plateforme de recherche et de réservation de médicaments. Nous 
              mettons en relation les utilisateurs avec les pharmacies partenaires, mais nous ne 
              vendons pas directement de médicaments.
            </p>

            <h3>Inscription et compte utilisateur</h3>
            <p>
              Pour accéder à certaines fonctionnalités (panier, réservation), vous devez créer un 
              compte en fournissant des informations exactes et à jour. Vous êtes responsable de 
              la confidentialité de vos identifiants.
            </p>

            <h3>Utilisation du service</h3>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Utiliser le service de manière légale et conforme à ces conditions</li>
              <li>Ne pas tenter de pirater, perturber ou endommager le site</li>
              <li>Ne pas usurper l'identité d'autrui</li>
              <li>Fournir des informations exactes lors de vos réservations</li>
              <li>Honorer vos réservations ou les annuler dans les délais prévus</li>
            </ul>

            <h3>Responsabilité</h3>
            <p>
              FindPharma ne peut être tenu responsable de :
            </p>
            <ul>
              <li>L'indisponibilité temporaire ou définitive du service</li>
              <li>Les erreurs de disponibilité ou de prix communiquées par les pharmacies</li>
              <li>Les problèmes liés à votre connexion internet</li>
              <li>L'utilisation inappropriée du service par les utilisateurs</li>
              <li>Les dommages directs ou indirects résultant de l'utilisation du site</li>
            </ul>

            <h3>Disponibilité des médicaments</h3>
            <p>
              Les informations sur la disponibilité et les prix des médicaments sont fournies par 
              les pharmacies partenaires. FindPharma met tout en œuvre pour garantir l'exactitude 
              de ces informations, mais ne peut garantir leur disponibilité effective au moment de 
              votre visite en pharmacie.
            </p>

            <h3>Réservations</h3>
            <p>
              La réservation d'un médicament via FindPharma ne constitue pas une vente. Le paiement 
              s'effectue directement en pharmacie lors du retrait. Les pharmacies se réservent le 
              droit d'annuler une réservation en cas d'indisponibilité ou d'erreur.
            </p>

            <h3>Modification des conditions</h3>
            <p>
              FindPharma se réserve le droit de modifier à tout moment ces conditions générales 
              d'utilisation. Les modifications entrent en vigueur dès leur publication sur le site. 
              Il est conseillé de consulter régulièrement cette page.
            </p>
          </div>
        </section>

        {/* Liens externes */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-link"></i>
            Liens Hypertextes
          </h2>
          <div className="legal-content">
            <p>
              Le site FindPharma peut contenir des liens vers des sites externes. FindPharma 
              n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à 
              leur contenu ou leur politique de confidentialité.
            </p>
            <p>
              La mise en place de liens hypertextes vers le site FindPharma nécessite une 
              autorisation préalable écrite de FindPharma SARL.
            </p>
          </div>
        </section>

        {/* Litiges */}
        <section className="legal-section">
          <h2>
            <i className="fas fa-gavel"></i>
            Litiges et Droit Applicable
          </h2>
          <div className="legal-content">
            <p>
              Les présentes conditions générales sont régies par le droit camerounais. 
              En cas de litige, une solution amiable sera recherchée avant toute action judiciaire.
            </p>
            <p>
              À défaut de résolution amiable, les tribunaux de Yaoundé seront seuls compétents 
              pour connaître du litige.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="legal-section contact-section">
          <h2>
            <i className="fas fa-envelope"></i>
            Nous Contacter
          </h2>
          <div className="legal-content">
            <p>
              Pour toute question concernant ces mentions légales ou la protection de vos données :
            </p>
            <div className="contact-info">
              <p>
                <i className="fas fa-envelope"></i>
                <strong>Email général :</strong> contact@findpharma.cm
              </p>
              <p>
                <i className="fas fa-shield-alt"></i>
                <strong>Protection des données :</strong> privacy@findpharma.cm
              </p>
              <p>
                <i className="fas fa-phone"></i>
                <strong>Téléphone :</strong> +237 6XX XX XX XX
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i>
                <strong>Adresse :</strong> Yaoundé, Cameroun
              </p>
            </div>
          </div>
        </section>

        {/* Mise à jour */}
        <section className="legal-section update-section">
          <p className="last-update">
            <i className="fas fa-calendar-alt"></i>
            Dernière mise à jour : 25 novembre 2025
          </p>
        </section>
      </div>
    </div>
  );
}

export default LegalPage;
