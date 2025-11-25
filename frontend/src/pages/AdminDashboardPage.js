// src/pages/AdminDashboardPage.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

function AdminDashboardPage() {
  // Vérifier l'authentification et le rôle admin
  const token = localStorage.getItem('token');
  
  if (!token) {
    // Rediriger vers l'accueil si pas connecté
    return <Navigate to="/" replace />;
  }
  
  // Vérifier que c'est un admin (token contient "admin")
  const isAdmin = token.includes('admin');
  
  if (!isAdmin) {
    alert('Accès réservé aux administrateurs');
    return <Navigate to="/" replace />;
  }
  
  // Afficher le dashboard admin
  return (
    <main className="main-content admin-mode">
      <AdminDashboard />
    </main>
  );
}

export default AdminDashboardPage;
