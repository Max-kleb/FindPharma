// src/hooks/usePWA.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer les fonctionnalités PWA
 */
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [swRegistration, setSwRegistration] = useState(null);

  // Enregistrer le Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Vérifier si déjà installé
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Écouter l'installation réussie
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('✅ PWA installée avec succès!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Surveiller le statut de connexion
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Connexion rétablie');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Connexion perdue');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Enregistrer le Service Worker
  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration);
      console.log('✅ Service Worker enregistré');

      // Vérifier les mises à jour
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setIsUpdateAvailable(true);
            console.log('🔄 Mise à jour disponible');
          }
        });
      });

      // Vérifier périodiquement les mises à jour
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Toutes les heures
    } catch (error) {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    }
  }

  // Installer l'application
  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('Installation non disponible');
      return false;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Installation acceptée');
        setDeferredPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('❌ Installation refusée');
        return false;
      }
    } catch (error) {
      console.error('Erreur installation:', error);
      return false;
    }
  }, [deferredPrompt]);

  // Appliquer la mise à jour
  const applyUpdate = useCallback(() => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [swRegistration]);

  // Demander la permission pour les notifications
  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.log('Notifications non supportées');
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  return {
    isInstallable,
    isInstalled,
    isOnline,
    isUpdateAvailable,
    installApp,
    applyUpdate,
    requestNotificationPermission
  };
}

export default usePWA;
