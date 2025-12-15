// src/components/PWAPrompt.js
import React, { useState, useEffect } from 'react';
import usePWA from '../hooks/usePWA';
import './PWAPrompt.css';

/**
 * Composant pour afficher les prompts PWA:
 * - Bouton d'installation
 * - Bannière de mise à jour
 * - Indicateur hors-ligne
 */
function PWAPrompt() {
  const { 
    isInstallable, 
    isInstalled, 
    isOnline, 
    isUpdateAvailable, 
    installApp, 
    applyUpdate 
  } = usePWA();
  
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Afficher le prompt d'installation après quelques secondes
  useEffect(() => {
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 30000); // 30 secondes après le chargement
      
      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  // Ne rien afficher si installé et en ligne
  if (isInstalled && isOnline && !isUpdateAvailable) {
    return null;
  }

  const handleInstall = async () => {
    const installed = await installApp();
    if (installed) {
      setShowInstallPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDismissed(true);
    // Se souvenir du refus pendant 7 jours
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  return (
    <>
      {/* Bannière hors-ligne */}
      {!isOnline && (
        <div className="pwa-offline-banner">
          <i className="fas fa-wifi-slash"></i>
          <span>Vous êtes actuellement hors ligne</span>
          <button onClick={() => window.location.reload()}>
            <i className="fas fa-sync"></i>
          </button>
        </div>
      )}

      {/* Bannière de mise à jour */}
      {isUpdateAvailable && (
        <div className="pwa-update-banner">
          <div className="update-content">
            <i className="fas fa-arrow-circle-up"></i>
            <span>Une nouvelle version est disponible!</span>
          </div>
          <button className="update-btn" onClick={applyUpdate}>
            Mettre à jour
          </button>
        </div>
      )}

      {/* Prompt d'installation */}
      {showInstallPrompt && !dismissed && (
        <div className="pwa-install-prompt">
          <button className="close-btn" onClick={handleDismiss}>
            <i className="fas fa-times"></i>
          </button>
          
          <div className="prompt-icon">
            <img src="/logo192.png" alt="FindPharma" />
          </div>
          
          <div className="prompt-content">
            <h3>Installer FindPharma</h3>
            <p>
              Ajoutez l'application à votre écran d'accueil pour un accès rapide 
              et une expérience hors-ligne!
            </p>
            
            <ul className="prompt-features">
              <li><i className="fas fa-check"></i> Accès rapide depuis l'écran d'accueil</li>
              <li><i className="fas fa-check"></i> Fonctionne même hors-ligne</li>
              <li><i className="fas fa-check"></i> Notifications de réservation</li>
            </ul>
          </div>
          
          <div className="prompt-actions">
            <button className="install-btn" onClick={handleInstall}>
              <i className="fas fa-download"></i>
              Installer
            </button>
            <button className="later-btn" onClick={handleDismiss}>
              Plus tard
            </button>
          </div>
        </div>
      )}

      {/* Petit bouton d'installation dans le footer/header */}
      {isInstallable && !showInstallPrompt && !dismissed && (
        <button 
          className="pwa-install-mini"
          onClick={() => setShowInstallPrompt(true)}
          title="Installer l'application"
        >
          <i className="fas fa-download"></i>
        </button>
      )}
    </>
  );
}

export default PWAPrompt;
