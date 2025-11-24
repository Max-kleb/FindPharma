import React, { useState, useEffect } from 'react';
// Il faudra importer les fonctions d'API pour les statistiques
// import { fetchStats } from './services/api'; 

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPharmacies: 0,
        medicationSearchesLastMonth: 0,
        topSearched: "Doliprane",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. Chargement des statistiques
    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            try {
                // 💡 Appel API à Franck pour obtenir les données du Dashboard
                // const data = await fetchStats(); 
                
                // --- Données de test (à remplacer par l'appel API réel) ---
                const testData = {
                    totalUsers: 1540,
                    totalPharmacies: 45,
                    medicationSearchesLastMonth: 9870,
                    topSearched: "Doliprane 1000mg",
                    reservationsToday: 15,
                    averagePharmacyRating: 4.2 // US7
                };
                // -----------------------------------------------------------

                setStats(testData);
            } catch (err) {
                setError("Erreur lors du chargement des statistiques. Vérifiez le Back-end.");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) return <div className="loading-message">Chargement du tableau de bord...</div>;
    if (error) return <div className="error-message">🚨 {error}</div>;

    // 2. Rendu des statistiques
    return (
        <div className="admin-dashboard-container">
            <h2>📊 Tableau de Bord Administrateur</h2>
            <p>Vue d'ensemble et statistiques d'utilisation de la plateforme.</p>
            
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>{stats.totalUsers}</h3>
                    <p>Utilisateurs Inscrits (US4)</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.totalPharmacies}</h3>
                    <p>Pharmacies Partenaires (US3)</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.medicationSearchesLastMonth}</h3>
                    <p>Recherches de Médicaments (Mois)</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.reservationsToday}</h3>
                    <p>Réservations Aujourd'hui (US6)</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.averagePharmacyRating} / 5</h3>
                    <p>Note Moyenne des Pharmacies (US7)</p>
                </div>
                <div className="stat-card">
                    <h3>{stats.topSearched}</h3>
                    <p>Médicament le plus Recherché</p>
                </div>
            </div>
            {/* Si vous avez un paquet de graphiques, vous pouvez les ajouter ici pour plus de détails */}
        </div>
    );
};

export default AdminDashboard;