// src/services/notificationService.js
import api from './api';

/**
 * Service de notification qui utilise le polling pour vérifier les mises à jour.
 * Alternative légère aux WebSocket, parfaite pour les petites applications.
 */

class NotificationService {
  constructor() {
    this.pollingInterval = null;
    this.lastCheckTime = null;
    this.listeners = new Set();
    this.isPolling = false;
    this.pollInterval = 30000; // 30 secondes par défaut
  }

  // Ajouter un listener
  addListener(callback) {
    this.listeners.add(callback);
    
    // Démarrer le polling si c'est le premier listener
    if (this.listeners.size === 1) {
      this.startPolling();
    }

    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Notifier tous les listeners
  notifyListeners(notifications) {
    this.listeners.forEach(callback => {
      try {
        callback(notifications);
      } catch (e) {
        console.error('Erreur notification listener:', e);
      }
    });
  }

  // Démarrer le polling
  startPolling() {
    if (this.isPolling) return;

    this.isPolling = true;
    this.lastCheckTime = new Date().toISOString();

    // Vérification immédiate
    this.checkForUpdates();

    // Polling régulier
    this.pollingInterval = setInterval(() => {
      this.checkForUpdates();
    }, this.pollInterval);

    console.log('📡 Notification polling démarré');
  }

  // Arrêter le polling
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('📡 Notification polling arrêté');
  }

  // Vérifier les mises à jour
  async checkForUpdates() {
    const token = localStorage.getItem('token');
    if (!token) return; // Pas connecté

    try {
      const updates = await this.fetchUpdates();
      
      if (updates && updates.length > 0) {
        this.notifyListeners(updates);
      }

      this.lastCheckTime = new Date().toISOString();
    } catch (e) {
      console.warn('Erreur vérification notifications:', e);
    }
  }

  // Récupérer les mises à jour depuis l'API
  async fetchUpdates() {
    const notifications = [];

    try {
      // Vérifier les réservations de l'utilisateur
      const reservations = await this.checkReservations();
      notifications.push(...reservations);
    } catch (e) {
      console.warn('Erreur check reservations:', e);
    }

    try {
      // Vérifier les alertes de stock (pour les pharmaciens)
      const stockAlerts = await this.checkStockAlerts();
      notifications.push(...stockAlerts);
    } catch (e) {
      console.warn('Erreur check stock:', e);
    }

    return notifications;
  }

  // Vérifier les réservations
  async checkReservations() {
    const notifications = [];
    const lastReservationCheck = localStorage.getItem('lastReservationCheck');

    try {
      const response = await api.get('/cart/reservations/');
      const reservations = response.data.results || response.data;

      // Filtrer les nouvelles réservations ou changements de statut
      reservations.forEach(reservation => {
        const lastUpdate = new Date(reservation.updated_at || reservation.created_at);
        const lastCheck = lastReservationCheck ? new Date(lastReservationCheck) : new Date(0);

        if (lastUpdate > lastCheck) {
          if (reservation.status === 'confirmed') {
            notifications.push({
              type: 'reservation',
              title: 'Réservation confirmée! ✅',
              message: `Votre réservation à ${reservation.pharmacy_name || 'la pharmacie'} a été confirmée.`,
              data: reservation
            });
          } else if (reservation.status === 'cancelled') {
            notifications.push({
              type: 'warning',
              title: 'Réservation annulée',
              message: `Votre réservation a été annulée.`,
              data: reservation
            });
          } else if (reservation.status === 'ready') {
            notifications.push({
              type: 'success',
              title: 'Commande prête! 🎉',
              message: `Votre commande est prête à être récupérée.`,
              data: reservation
            });
          }
        }
      });

      localStorage.setItem('lastReservationCheck', new Date().toISOString());
    } catch (e) {
      // Endpoint peut ne pas exister ou utilisateur non connecté
    }

    return notifications;
  }

  // Vérifier les alertes de stock (pour les pharmaciens)
  async checkStockAlerts() {
    const notifications = [];
    const userType = localStorage.getItem('userType');

    // Seulement pour les pharmaciens
    if (userType !== 'pharmacist') return notifications;

    try {
      const response = await api.get('/stocks/low-stock/');
      const lowStockItems = response.data.results || response.data;

      // Grouper les alertes
      if (lowStockItems.length > 0) {
        notifications.push({
          type: 'stock',
          title: 'Alerte stock bas ⚠️',
          message: `${lowStockItems.length} médicament(s) en stock faible`,
          data: lowStockItems
        });
      }
    } catch (e) {
      // Endpoint peut ne pas exister
    }

    return notifications;
  }

  // Changer l'intervalle de polling
  setPollingInterval(ms) {
    this.pollInterval = ms;
    if (this.isPolling) {
      this.stopPolling();
      this.startPolling();
    }
  }

  // Forcer une vérification immédiate
  forceCheck() {
    return this.checkForUpdates();
  }
}

// Singleton
const notificationService = new NotificationService();
export default notificationService;
