// src/pages/AdminDashboardPage.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AdminDashboard from '../AdminDashboard';

function AdminDashboardPage() {
  const location = useLocation();
  
  // Vérifier l'authentification et le rôle admin
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token) {
    // Sauvegarder l'URL pour redirection après login
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  // Vérifier le type d'utilisateur
  let isAdmin = false;
  try {
    const user = JSON.parse(userStr || '{}');
    isAdmin = user.user_type === 'admin' || user.is_superuser;
  } catch (err) {
    console.error('Erreur parsing user:', err);
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    // Pas admin - redirection vers accueil
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
