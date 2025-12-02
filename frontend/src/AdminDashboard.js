// src/AdminDashboard.js
// User Story 8 : Dashboard Administrateur avec statistiques et graphiques

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getAdminStats, getAdminActivity } from './services/api';
import './AdminDashboard.css';

// Couleurs pour les graphiques
const COLORS = ['#00A86B', '#2196F3', '#FFC107', '#E91E63', '#9C27B0'];
const STATUS_COLORS = {
  pending: '#FFA500',
  confirmed: '#4CAF50',
  ready: '#2196F3',
  completed: '#00A86B',
  cancelled: '#F44336'
};

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsData, activityData] = await Promise.all([
        getAdminStats(token),
        getAdminActivity(token)
      ]);
      
      if (statsData.error) throw new Error(statsData.error);
      if (activityData.error) throw new Error(activityData.error);
      
      setStats(statsData);
      setActivity(activityData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard loading">
        <div className="loading-spinner">
          <i className="fas fa-chart-line fa-spin"></i>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard error">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>{t('common.error')}</h2>
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">
            <i className="fas fa-redo"></i> {t('admin.actions.refresh')}
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Préparer les données pour les graphiques
  const reservationsPieData = stats.reservations_by_status 
    ? Object.entries(stats.reservations_by_status).map(([status, count]) => ({
        name: getStatusLabel(status),
        value: count,
        color: STATUS_COLORS[status] || '#999'
      }))
    : [];

  const ratingsData = stats.ratings_distribution
    ? Object.entries(stats.ratings_distribution).map(([rating, count]) => ({
        rating: `${rating} ⭐`,
        count: count
      }))
    : [];

  const userTypesData = stats.users_by_type
    ? Object.entries(stats.users_by_type).map(([type, count], index) => ({
        name: getUserTypeLabel(type),
        value: count,
        color: COLORS[index % COLORS.length]
      }))
    : [];

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1><i className="fas fa-tachometer-alt"></i> {t('admin.title')}</h1>
          <p className="last-update">
            {t('stocks.lastUpdated')} : {new Date().toLocaleString('fr-FR')}
          </p>
        </div>
        <button onClick={loadData} className="refresh-btn">
          <i className="fas fa-sync-alt"></i> {t('admin.actions.refresh')}
        </button>
      </header>

      <nav className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-th-large"></i> {t('admin.tabs.overview')}
        </button>
        <button 
          className={activeTab === 'charts' ? 'active' : ''} 
          onClick={() => setActiveTab('charts')}
        >
          <i className="fas fa-chart-bar"></i> {t('admin.charts.reservationsTrend')}
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          <i className="fas fa-history"></i> {t('admin.activity.title')}
        </button>
      </nav>

      <main className="dashboard-content">
        {activeTab === 'overview' && (
          <>
            <section className="kpi-section">
              <h2>📊 {t('admin.overview')}</h2>
              <div className="kpi-grid">
                <KpiCard 
                  icon="fa-users" 
                  label={t('admin.stats.totalUsers')} 
                  value={stats.kpis?.total_users || 0}
                  trend={stats.recent?.new_users_7d ? `+${stats.recent.new_users_7d} ${t('time.thisWeek')}` : null}
                  color="#2196F3" 
                />
                <KpiCard 
                  icon="fa-clinic-medical" 
                  label={t('admin.stats.totalPharmacies')} 
                  value={stats.kpis?.total_pharmacies || 0}
                  color="#00A86B" 
                />
                <KpiCard 
                  icon="fa-pills" 
                  label={t('admin.stats.totalMedicines')} 
                  value={stats.kpis?.total_medicines || 0}
                  color="#9C27B0" 
                />
                <KpiCard 
                  icon="fa-boxes" 
                  label={t('stocks.title')} 
                  value={stats.kpis?.total_stocks || 0}
                  color="#FF9800" 
                />
                <KpiCard 
                  icon="fa-calendar-check" 
                  label={t('admin.stats.totalReservations')} 
                  value={stats.kpis?.total_reservations || 0}
                  trend={stats.recent?.reservations_7d ? `+${stats.recent.reservations_7d} ${t('time.thisWeek')}` : null}
                  color="#E91E63" 
                />
                <KpiCard 
                  icon="fa-star" 
                  label={t('admin.tabs.reviews')} 
                  value={stats.kpis?.total_reviews || 0}
                  trend={stats.kpis?.avg_rating ? `${t('admin.stats.averageRating')}: ${stats.kpis.avg_rating}/5` : null}
                  color="#FFC107" 
                />
              </div>
            </section>

            <section className="users-section">
              <h2>👥 {t('admin.tabs.users')}</h2>
              <div className="users-type-grid">
                <div className="user-type-card admin">
                  <i className="fas fa-user-shield"></i>
                  <span className="count">{stats.users_by_type?.admin || 0}</span>
                  <span className="label">{t('header.userTypeAdmin')}</span>
                </div>
                <div className="user-type-card pharmacy">
                  <i className="fas fa-store"></i>
                  <span className="count">{stats.users_by_type?.pharmacy || 0}</span>
                  <span className="label">{t('header.userTypePharmacy')}</span>
                </div>
                <div className="user-type-card customer">
                  <i className="fas fa-user"></i>
                  <span className="count">{stats.users_by_type?.customer || 0}</span>
                  <span className="label">{t('header.userTypeCustomer')}</span>
                </div>
              </div>
            </section>

            {stats.charts?.top_medicines_searched && stats.charts.top_medicines_searched.length > 0 && (
              <section className="top-section">
                <h2>🔍 {t('admin.charts.topMedicines')}</h2>
                <div className="top-list">
                  {stats.charts.top_medicines_searched.slice(0, 5).map((search, index) => (
                    <div key={index} className="top-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{search.query}</span>
                      <span className="stats">
                        <span className="count">{search.count} {t('common.search')}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {stats.charts?.top_pharmacies && stats.charts.top_pharmacies.length > 0 && (
              <section className="top-section">
                <h2>🏆 {t('admin.charts.topPharmacies')}</h2>
                <div className="top-list">
                  {stats.charts.top_pharmacies.map((pharmacy, index) => (
                    <div key={pharmacy.id} className="top-item">
                      <span className="rank">#{index + 1}</span>
                      <span className="name">{pharmacy.name}</span>
                      <span className="stats">
                        {pharmacy.avg_rating && <span className="rating">⭐ {pharmacy.avg_rating}</span>}
                        <span className="count">{pharmacy.review_count} {t('pharmacy.reviews')}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'charts' && (
          <>
            {userTypesData.length > 0 && (
              <section className="chart-section">
                <h2>👥 Répartition des types d'utilisateurs</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={userTypesData} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        dataKey="value"
                      >
                        {userTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {reservationsPieData.length > 0 && (
              <section className="chart-section">
                <h2>📊 Statuts des réservations</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie 
                        data={reservationsPieData} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={100}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        dataKey="value"
                      >
                        {reservationsPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {ratingsData.length > 0 && (
              <section className="chart-section">
                <h2>⭐ Distribution des notes</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={ratingsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Nombre d'avis" fill="#FFC107" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {stats.charts?.top_medicines_searched && stats.charts.top_medicines_searched.length > 0 && (
              <section className="chart-section">
                <h2>💊 Top 10 recherches</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.charts.top_medicines_searched.slice(0, 10)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="query" width={150} />
                      <Tooltip />
                      <Bar dataKey="count" name="Recherches" fill="#9C27B0" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {stats.charts?.searches_by_day && stats.charts.searches_by_day.length > 0 && (
              <section className="chart-section">
                <h2>📈 Évolution des recherches (7 derniers jours)</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.charts.searches_by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name="Recherches" stroke="#00A86B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {stats.charts?.reservations_by_day && stats.charts.reservations_by_day.length > 0 && (
              <section className="chart-section">
                <h2>📅 Évolution des réservations (7 derniers jours)</h2>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.charts.reservations_by_day}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Réservations" fill="#E91E63" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'activity' && activity && (
          <>
            <section className="activity-section">
              <h2>👤 Dernières inscriptions</h2>
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Utilisateur</th>
                      <th>Email</th>
                      <th>Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.recent_users && activity.recent_users.map(u => (
                      <tr key={u.id}>
                        <td>#{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`type-badge ${u.user_type}`}>
                            {getUserTypeLabel(u.user_type)}
                          </span>
                        </td>
                        <td>{new Date(u.date_joined).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!activity.recent_users || activity.recent_users.length === 0) && (
                  <p className="no-data">Aucune inscription récente</p>
                )}
              </div>
            </section>

            <section className="activity-section">
              <h2>🏥 Dernières pharmacies</h2>
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Adresse</th>
                      <th>Date d'ajout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.recent_pharmacies && activity.recent_pharmacies.map(p => (
                      <tr key={p.id}>
                        <td>#{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.address}</td>
                        <td>{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!activity.recent_pharmacies || activity.recent_pharmacies.length === 0) && (
                  <p className="no-data">Aucune pharmacie récente</p>
                )}
              </div>
            </section>

            <section className="activity-section">
              <h2>📅 Dernières réservations</h2>
              <div className="activity-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Utilisateur</th>
                      <th>Pharmacie</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activity.recent_reservations && activity.recent_reservations.map(r => (
                      <tr key={r.id}>
                        <td>#{r.id}</td>
                        <td>{r.user}</td>
                        <td>{r.pharmacy}</td>
                        <td>
                          <span className={`status-badge ${r.status}`}>
                            {getStatusLabel(r.status)}
                          </span>
                        </td>
                        <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(!activity.recent_reservations || activity.recent_reservations.length === 0) && (
                  <p className="no-data">Aucune réservation récente</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

// Composant carte KPI
function KpiCard({ icon, label, value, trend, color }) {
  return (
    <div className="kpi-card" style={{ borderLeftColor: color }}>
      <div className="kpi-icon" style={{ backgroundColor: color }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="kpi-content">
        <span className="kpi-value">{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}</span>
        <span className="kpi-label">{label}</span>
        {trend && <span className="kpi-trend">{trend}</span>}
      </div>
    </div>
  );
}

// Fonctions utilitaires
function getStatusLabel(status) {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    ready: 'Prête',
    completed: 'Terminée',
    cancelled: 'Annulée'
  };
  return labels[status] || status;
}

function getUserTypeLabel(type) {
  const labels = {
    admin: 'Admin',
    pharmacy: 'Pharmacie',
    customer: 'Client'
  };
  return labels[type] || type;
}

export default AdminDashboard;