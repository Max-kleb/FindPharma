// src/components/NotificationSystem.js
import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import './NotificationSystem.css';

// Contexte pour les notifications
const NotificationContext = createContext();

// Types de notifications
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  STOCK: 'stock',
  RESERVATION: 'reservation'
};

// Icônes par type
const NOTIFICATION_ICONS = {
  success: 'fa-check-circle',
  error: 'fa-exclamation-circle',
  warning: 'fa-exclamation-triangle',
  info: 'fa-info-circle',
  stock: 'fa-boxes',
  reservation: 'fa-clock'
};

// Provider de notifications
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);

  // Charger les notifications non lues au démarrage
  useEffect(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Erreur chargement notifications:', e);
      }
    }
  }, []);

  // Sauvegarder les notifications
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Ajouter une notification
  const addNotification = useCallback((notification) => {
    const newNotif = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotif, ...prev].slice(0, 50)); // Max 50 notifications

    // Toast automatique pour les nouvelles notifications
    if (notification.showToast !== false) {
      showToast(newNotif);
    }

    return newNotif.id;
  }, []);

  // Marquer comme lu
  const markAsRead = useCallback((id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marquer toutes comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Supprimer une notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Vider toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Toast temporaire
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((notification) => {
    const toastId = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...notification, toastId }]);

    // Auto-remove après 5 secondes
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.toastId !== toastId));
    }, 5000);
  }, []);

  const removeToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  const value = {
    notifications,
    unreadCount,
    showPanel,
    setShowPanel,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    toasts,
    removeToast,
    NOTIFICATION_TYPES
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog />
    </NotificationContext.Provider>
  );
}

// Hook pour utiliser les notifications
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  return context;
}

// Container de toasts
function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.toastId} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Toast individuel
function Toast({ toast, onRemove }) {
  const icon = NOTIFICATION_ICONS[toast.type] || NOTIFICATION_ICONS.info;

  return (
    <div className={`toast toast-${toast.type}`} onClick={() => onRemove(toast.toastId)}>
      <div className="toast-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button className="toast-close" onClick={() => onRemove(toast.toastId)}>
        <i className="fas fa-times"></i>
      </button>
      <div className="toast-progress"></div>
    </div>
  );
}

// Bouton de notification (cloche)
export function NotificationBell() {
  const { unreadCount, showPanel, setShowPanel, notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  return (
    <div className="notification-bell-wrapper">
      <button 
        className="notification-bell" 
        onClick={() => setShowPanel(!showPanel)}
        aria-label="Notifications"
      >
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h3>
              <i className="fas fa-bell"></i> Notifications
            </h3>
            <div className="notification-panel-actions">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} title="Tout marquer comme lu">
                  <i className="fas fa-check-double"></i>
                </button>
              )}
              <button onClick={clearAll} title="Tout effacer">
                <i className="fas fa-trash"></i>
              </button>
              <button onClick={() => setShowPanel(false)} title="Fermer">
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div className="notification-panel-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <i className="fas fa-bell-slash"></i>
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map(notif => (
                <NotificationItem 
                  key={notif.id} 
                  notification={notif} 
                  onRead={() => markAsRead(notif.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Item de notification dans le panel
function NotificationItem({ notification, onRead }) {
  const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.info;
  const timeAgo = getTimeAgo(notification.timestamp);

  return (
    <div 
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={onRead}
    >
      <div className={`notification-item-icon ${notification.type}`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="notification-item-content">
        <div className="notification-item-title">{notification.title}</div>
        {notification.message && (
          <div className="notification-item-message">{notification.message}</div>
        )}
        <div className="notification-item-time">
          <i className="fas fa-clock"></i> {timeAgo}
        </div>
      </div>
      {!notification.read && <div className="notification-item-dot"></div>}
    </div>
  );
}

// Utilitaire pour le temps relatif
function getTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString('fr-FR');
}

// ==========================================
// COMPOSANT DE DIALOGUE DE CONFIRMATION
// ==========================================

// État global pour le dialogue de confirmation
let confirmDialogResolver = null;
let setConfirmDialogState = null;

export function ConfirmDialog() {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    type: 'warning', // warning, danger, info
    icon: 'fa-exclamation-triangle'
  });

  // Enregistrer le setter pour l'utiliser globalement
  useEffect(() => {
    setConfirmDialogState = setDialogState;
    return () => {
      setConfirmDialogState = null;
    };
  }, []);

  const handleConfirm = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
    if (confirmDialogResolver) {
      confirmDialogResolver(true);
      confirmDialogResolver = null;
    }
  };

  const handleCancel = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
    if (confirmDialogResolver) {
      confirmDialogResolver(false);
      confirmDialogResolver = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleCancel();
    if (e.key === 'Enter') handleConfirm();
  };

  useEffect(() => {
    if (dialogState.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [dialogState.isOpen]);

  if (!dialogState.isOpen) return null;

  return (
    <div className="confirm-dialog-overlay" onClick={handleCancel}>
      <div 
        className={`confirm-dialog confirm-dialog-${dialogState.type}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-dialog-header">
          <div className={`confirm-dialog-icon ${dialogState.type}`}>
            <i className={`fas ${dialogState.icon}`}></i>
          </div>
          <h3>{dialogState.title}</h3>
        </div>
        <div className="confirm-dialog-body">
          <p>{dialogState.message}</p>
        </div>
        <div className="confirm-dialog-footer">
          <button 
            className="confirm-dialog-btn cancel"
            onClick={handleCancel}
          >
            <i className="fas fa-times"></i>
            {dialogState.cancelText}
          </button>
          <button 
            className={`confirm-dialog-btn confirm ${dialogState.type}`}
            onClick={handleConfirm}
            autoFocus
          >
            <i className="fas fa-check"></i>
            {dialogState.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Fonction utilitaire pour afficher le dialogue de confirmation
export function showConfirmDialog({
  title = 'Confirmation',
  message = 'Êtes-vous sûr de vouloir continuer ?',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'warning', // warning, danger, info
  icon = null
}) {
  return new Promise((resolve) => {
    if (!setConfirmDialogState) {
      // Fallback si le composant n'est pas monté
      resolve(window.confirm(message));
      return;
    }

    // Choisir l'icône par défaut selon le type
    const defaultIcons = {
      warning: 'fa-exclamation-triangle',
      danger: 'fa-trash-alt',
      info: 'fa-info-circle'
    };

    confirmDialogResolver = resolve;
    setConfirmDialogState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      icon: icon || defaultIcons[type] || defaultIcons.warning
    });
  });
}

// Export des types
export { NOTIFICATION_TYPES };
