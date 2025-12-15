// src/components/LazyLoad.js
import React, { Suspense, lazy } from 'react';
import './LazyLoad.css';

/**
 * Skeleton Loader - Placeholder pendant le chargement
 */
export function Skeleton({ width, height, variant = 'rect', animation = 'pulse' }) {
  const style = {
    width: width || '100%',
    height: height || '20px'
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} skeleton-${animation}`}
      style={style}
    />
  );
}

/**
 * Card Skeleton - Pour les cartes de pharmacies
 */
export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <Skeleton height="160px" variant="rect" />
      <div className="skeleton-card-content">
        <Skeleton width="70%" height="24px" />
        <Skeleton width="50%" height="16px" />
        <Skeleton width="40%" height="16px" />
        <div className="skeleton-card-actions">
          <Skeleton width="100px" height="36px" variant="rounded" />
          <Skeleton width="100px" height="36px" variant="rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * List Skeleton - Pour les listes
 */
export function ListSkeleton({ count = 5 }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <Skeleton width="48px" height="48px" variant="circle" />
          <div className="skeleton-list-content">
            <Skeleton width="60%" height="18px" />
            <Skeleton width="40%" height="14px" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Skeleton - Pour les tableaux
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width="100%" height="40px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} width="100%" height="32px" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Page Skeleton - Skeleton pour une page entière
 */
export function PageSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-page-header">
        <Skeleton width="200px" height="40px" />
        <Skeleton width="300px" height="20px" />
      </div>
      <div className="skeleton-page-content">
        <div className="skeleton-page-sidebar">
          <Skeleton height="200px" />
          <ListSkeleton count={3} />
        </div>
        <div className="skeleton-page-main">
          <div className="skeleton-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading Spinner
 */
export function LoadingSpinner({ size = 'medium', text = '' }) {
  return (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner"></div>
      {text && <span className="loading-text">{text}</span>}
    </div>
  );
}

/**
 * Lazy Load Wrapper - Wrapper pour les composants lazy loaded
 */
export function LazyLoadWrapper({ fallback = <PageSkeleton />, children }) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * Helper pour créer un composant lazy avec retry
 */
export function lazyWithRetry(importFn, retries = 3, interval = 1000) {
  return lazy(() => {
    return new Promise((resolve, reject) => {
      const attemptLoad = (retriesLeft) => {
        importFn()
          .then(resolve)
          .catch((error) => {
            if (retriesLeft > 0) {
              setTimeout(() => attemptLoad(retriesLeft - 1), interval);
            } else {
              reject(error);
            }
          });
      };
      attemptLoad(retries);
    });
  });
}

/**
 * Image lazy loading avec placeholder
 */
export function LazyImage({ src, alt, placeholder, className, ...props }) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  return (
    <div className={`lazy-image-wrapper ${className || ''}`}>
      {!loaded && !error && (
        <div className="lazy-image-placeholder">
          {placeholder || <Skeleton width="100%" height="100%" />}
        </div>
      )}
      {error && (
        <div className="lazy-image-error">
          <i className="fas fa-image"></i>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{ display: loaded ? 'block' : 'none' }}
        {...props}
      />
    </div>
  );
}

export default {
  Skeleton,
  CardSkeleton,
  ListSkeleton,
  TableSkeleton,
  PageSkeleton,
  LoadingSpinner,
  LazyLoadWrapper,
  lazyWithRetry,
  LazyImage
};
