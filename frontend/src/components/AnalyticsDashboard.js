// src/components/AnalyticsDashboard.js
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { showConfirmDialog } from './NotificationSystem';
import './AnalyticsDashboard.css';

/**
 * Dashboard Analytics - Affiche les statistiques d'utilisation
 */
function AnalyticsDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalSearches: 0,
    todaySearches: 0,
    popularSearches: [],
    recentSearches: [],
    pharmaciesViewed: 0,
    reservationsCount: 0,
    averageSearchTime: 0
  });
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);

  // Charger les statistiques au montage
  useEffect(() => {
    loadStats();
  }, [timeRange]);

  // Charger les statistiques depuis localStorage et API
  const loadStats = async () => {
    setLoading(true);

    try {
      // Stats locales
      const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const viewedPharmacies = JSON.parse(localStorage.getItem('viewedPharmacies') || '[]');
      const searchCount = parseInt(localStorage.getItem('searchCount') || '0');
      
      // Calculer les recherches d'aujourd'hui
      const today = new Date().toDateString();
      const todaySearches = searchHistory.filter(s => 
        new Date(s.timestamp).toDateString() === today
      ).length;

      // Calculer les recherches populaires
      const searchCounts = {};
      searchHistory.forEach(s => {
        const query = s.query?.toLowerCase();
        if (query) {
          searchCounts[query] = (searchCounts[query] || 0) + 1;
        }
      });
      
      const popularSearches = Object.entries(searchCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }));

      // Recherches récentes (uniques)
      const recentSearches = [...new Set(searchHistory.slice(-10).map(s => s.query))].reverse();

      setStats({
        totalSearches: searchCount,
        todaySearches,
        popularSearches,
        recentSearches,
        pharmaciesViewed: viewedPharmacies.length,
        reservationsCount: parseInt(localStorage.getItem('reservationsCount') || '0'),
        averageSearchTime: 0
      });
    } catch (e) {
      console.error('Erreur chargement stats:', e);
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique simplifié
  const chartData = useMemo(() => {
    const searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const days = timeRange === 'week' ? 7 : 30;
    const data = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      
      const count = searchHistory.filter(s => 
        new Date(s.timestamp).toDateString() === dateStr
      ).length;

      data.push({
        date: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        count
      });
    }

    return data;
  }, [timeRange]);

  // Valeur max pour normaliser le graphique
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="analytics-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Chargement des statistiques...</span>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>
          <i className="fas fa-chart-line"></i>
          Tableau de bord
        </h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 'week' ? 'active' : ''} 
            onClick={() => setTimeRange('week')}
          >
            7 jours
          </button>
          <button 
            className={timeRange === 'month' ? 'active' : ''} 
            onClick={() => setTimeRange('month')}
          >
            30 jours
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-cards">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="fas fa-search"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSearches}</div>
            <div className="stat-label">Recherches totales</div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <i className="fas fa-calendar-day"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.todaySearches}</div>
            <div className="stat-label">Aujourd'hui</div>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <i className="fas fa-store"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pharmaciesViewed}</div>
            <div className="stat-label">Pharmacies consultées</div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <i className="fas fa-clipboard-check"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.reservationsCount}</div>
            <div className="stat-label">Réservations</div>
          </div>
        </div>
      </div>

      {/* Graphique simplifié */}
      <div className="analytics-chart-section">
        <h3>Activité de recherche</h3>
        <div className="simple-bar-chart">
          {chartData.map((item, index) => (
            <div key={index} className="bar-column">
              <div 
                className="bar" 
                style={{ height: `${(item.count / maxCount) * 100}%` }}
                title={`${item.count} recherche(s)`}
              >
                {item.count > 0 && <span className="bar-value">{item.count}</span>}
              </div>
              <span className="bar-label">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recherches populaires et récentes */}
      <div className="analytics-lists">
        <div className="analytics-list">
          <h3>
            <i className="fas fa-fire"></i>
            Recherches populaires
          </h3>
          {stats.popularSearches.length > 0 ? (
            <ul>
              {stats.popularSearches.map((item, index) => (
                <li key={index}>
                  <span className="rank">#{index + 1}</span>
                  <span className="query">{item.query}</span>
                  <span className="count">{item.count}x</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-list">
              <i className="fas fa-search"></i>
              <p>Aucune recherche enregistrée</p>
            </div>
          )}
        </div>

        <div className="analytics-list">
          <h3>
            <i className="fas fa-history"></i>
            Recherches récentes
          </h3>
          {stats.recentSearches.length > 0 ? (
            <ul>
              {stats.recentSearches.map((query, index) => (
                <li key={index}>
                  <i className="fas fa-search"></i>
                  <span className="query">{query}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-list">
              <i className="fas fa-clock"></i>
              <p>Aucune recherche récente</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="analytics-actions">
        <button 
          className="clear-stats-btn"
          onClick={async () => {
            const confirmed = await showConfirmDialog({
              title: 'Effacer les statistiques',
              message: 'Voulez-vous vraiment effacer toutes les statistiques ? Cette action est irréversible.',
              confirmText: 'Effacer',
              cancelText: 'Annuler',
              type: 'danger'
            });
            if (confirmed) {
              localStorage.removeItem('searchHistory');
              localStorage.removeItem('viewedPharmacies');
              localStorage.setItem('searchCount', '0');
              localStorage.setItem('reservationsCount', '0');
              loadStats();
            }
          }}
        >
          <i className="fas fa-trash"></i>
          Effacer les statistiques
        </button>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
