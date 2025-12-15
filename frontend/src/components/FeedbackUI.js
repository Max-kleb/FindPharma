/**
 * FeedbackUI.js - Composant de feedback visuel premium
 * Animations de succès, erreur, chargement et confirmations
 */
import React, { useState, useEffect, useCallback } from 'react';
import './FeedbackUI.css';

// ============================================
// SUCCESS ANIMATION - Checkmark animé
// ============================================
export const SuccessAnimation = ({ 
  size = 80, 
  message = 'Succès !',
  subMessage = '',
  onComplete,
  autoHide = true,
  hideDelay = 2500 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, hideDelay);
      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, onComplete]);

  if (!visible) return null;

  return (
    <div className="feedback-overlay animate-fade-in">
      <div className="feedback-container success-container">
        <div className="success-checkmark" style={{ width: size, height: size }}>
          <svg viewBox="0 0 52 52" className="checkmark-svg">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <h3 className="feedback-title">{message}</h3>
        {subMessage && <p className="feedback-subtitle">{subMessage}</p>}
      </div>
    </div>
  );
};

// ============================================
// ERROR ANIMATION - Croix animée
// ============================================
export const ErrorAnimation = ({ 
  size = 80, 
  message = 'Erreur !',
  subMessage = '',
  onRetry,
  onDismiss 
}) => {
  return (
    <div className="feedback-overlay animate-fade-in">
      <div className="feedback-container error-container">
        <div className="error-cross" style={{ width: size, height: size }}>
          <svg viewBox="0 0 52 52" className="cross-svg">
            <circle className="cross-circle" cx="26" cy="26" r="25" fill="none"/>
            <path className="cross-line line1" fill="none" d="M16 16 36 36"/>
            <path className="cross-line line2" fill="none" d="M36 16 16 36"/>
          </svg>
        </div>
        <h3 className="feedback-title">{message}</h3>
        {subMessage && <p className="feedback-subtitle">{subMessage}</p>}
        <div className="feedback-actions">
          {onRetry && (
            <button className="feedback-btn btn-retry" onClick={onRetry}>
              <i className="fas fa-redo"></i> Réessayer
            </button>
          )}
          {onDismiss && (
            <button className="feedback-btn btn-dismiss" onClick={onDismiss}>
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// LOADING ANIMATION - Spinner moderne
// ============================================
export const LoadingSpinner = ({ 
  size = 60, 
  message = 'Chargement...',
  variant = 'default' // 'default', 'dots', 'pulse', 'pharmacy'
}) => {
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        );
      case 'pulse':
        return (
          <div className="loading-pulse" style={{ width: size, height: size }}>
            <div className="pulse-ring"></div>
            <div className="pulse-core"></div>
          </div>
        );
      case 'pharmacy':
        return (
          <div className="loading-pharmacy" style={{ fontSize: size * 0.6 }}>
            <span className="pharmacy-icon">💊</span>
          </div>
        );
      default:
        return (
          <div className="loading-spinner" style={{ width: size, height: size }}>
            <svg viewBox="0 0 50 50">
              <circle className="spinner-track" cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
              <circle className="spinner-progress" cx="25" cy="25" r="20" fill="none" strokeWidth="4"/>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="loading-container">
      {renderSpinner()}
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

// ============================================
// CONFIRMATION DIALOG - Modal de confirmation
// ============================================
export const ConfirmDialog = ({ 
  isOpen,
  title = 'Confirmer',
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  variant = 'default', // 'default', 'danger', 'warning'
  onConfirm,
  onCancel,
  icon
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'danger': return '⚠️';
      case 'warning': return '❓';
      default: return 'ℹ️';
    }
  };

  return (
    <div className="confirm-overlay animate-fade-in" onClick={onCancel}>
      <div 
        className={`confirm-dialog animate-scale-in ${variant}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon">{getIcon()}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button 
            className="confirm-btn btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn btn-confirm ${variant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// PROGRESS BAR - Barre de progression animée
// ============================================
export const ProgressBar = ({ 
  progress = 0, 
  showPercentage = true,
  variant = 'default', // 'default', 'striped', 'gradient'
  height = 8,
  animated = true
}) => {
  return (
    <div className="progress-container">
      <div 
        className={`progress-bar ${variant} ${animated ? 'animated' : ''}`}
        style={{ height }}
      >
        <div 
          className="progress-fill"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          {variant === 'striped' && <div className="progress-stripes"></div>}
        </div>
      </div>
      {showPercentage && (
        <span className="progress-text">{Math.round(progress)}%</span>
      )}
    </div>
  );
};

// ============================================
// SKELETON LOADER - Placeholder de chargement
// ============================================
export const SkeletonCard = ({ lines = 3, showImage = true, showActions = false }) => {
  return (
    <div className="skeleton-card">
      {showImage && <div className="skeleton-image skeleton-shimmer"></div>}
      <div className="skeleton-content">
        <div className="skeleton-title skeleton-shimmer"></div>
        {[...Array(lines)].map((_, i) => (
          <div 
            key={i} 
            className="skeleton-line skeleton-shimmer"
            style={{ width: `${100 - (i * 15)}%` }}
          ></div>
        ))}
      </div>
      {showActions && (
        <div className="skeleton-actions">
          <div className="skeleton-button skeleton-shimmer"></div>
          <div className="skeleton-button skeleton-shimmer"></div>
        </div>
      )}
    </div>
  );
};

// ============================================
// RIPPLE EFFECT - Effet de clic
// ============================================
export const useRipple = () => {
  const createRipple = useCallback((event) => {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple-effect');
    
    const ripple = button.querySelector('.ripple-effect');
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
    
    setTimeout(() => circle.remove(), 600);
  }, []);

  return { createRipple };
};

// ============================================
// COUNTER ANIMATION - Compteur animé
// ============================================
export const AnimatedCounter = ({ 
  end, 
  start = 0, 
  duration = 2000, 
  prefix = '', 
  suffix = '' 
}) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTime = null;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(start + (end - start) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, start, duration]);

  return (
    <span className="animated-counter">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

export default {
  SuccessAnimation,
  ErrorAnimation,
  LoadingSpinner,
  ConfirmDialog,
  ProgressBar,
  SkeletonCard,
  useRipple,
  AnimatedCounter
};
