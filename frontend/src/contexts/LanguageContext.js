// src/contexts/LanguageContext.js
// Contexte pour gérer l'internationalisation (i18n) de l'application

import React, { createContext, useContext, useState, useEffect } from 'react';

// Traductions
const translations = {
  fr: {
    // Header
    header: {
      search: 'Rechercher',
      myReservations: 'Mes Réservations',
      manageStocks: 'Gérer mes Stocks',
      manageMedicines: 'Gérer les Médicaments',
      adminDashboard: 'Dashboard Admin',
      login: 'Connexion',
      register: 'Inscription',
      logout: 'Déconnexion',
      myProfile: 'Mon Profil',
      userTypeAdmin: 'Administrateur',
      userTypePharmacy: 'Pharmacie',
      userTypeCustomer: 'Client',
      language: 'Langue',
    },
    // Page d'accueil
    home: {
      title: 'Trouvez vos médicaments facilement',
      subtitle: 'Recherchez et localisez les pharmacies qui disposent de vos médicaments',
      searchPlaceholder: 'Rechercher un médicament...',
      searchButton: 'Rechercher',
      nearbyPharmacies: 'Pharmacies à proximité',
      noResults: 'Aucun résultat trouvé',
      loading: 'Chargement...',
    },
    // Recherche
    search: {
      results: 'résultats',
      available: 'Disponible',
      unavailable: 'Indisponible',
      inStock: 'En stock',
      outOfStock: 'Rupture de stock',
      price: 'Prix',
      quantity: 'Quantité',
      reserve: 'Réserver',
      seeDetails: 'Voir détails',
      filters: 'Filtres',
      sortBy: 'Trier par',
      distance: 'Distance',
      rating: 'Note',
      placeholder: 'Rechercher un médicament (Ex: doli, asp, ibu...)',
      searchButton: 'Rechercher',
      searching: 'Recherche...',
      clear: 'Effacer',
      enterMedicine: 'Veuillez entrer un nom de médicament',
      noResults: 'Aucune pharmacie ne propose "{query}" actuellement',
      errorSearch: 'Erreur lors de la recherche. Vérifiez que le serveur backend est lancé.',
      hintMinChars: 'Tapez au moins 2 caractères pour lancer la recherche',
      searchRadius: 'Rayon de recherche',
      usedForLocation: 'Utilisé lors de la localisation',
      kmAroundMe: '{km} km autour de moi',
      noPharmacyInRadius: 'Aucune pharmacie trouvée dans un rayon de {km} km. Essayez d\'augmenter le rayon de recherche.',
    },
    // Pharmacies
    pharmacy: {
      openNow: 'Ouvert',
      closed: 'Fermé',
      open24h: 'Ouvert 24h/24',
      phone: 'Téléphone',
      address: 'Adresse',
      schedule: 'Horaires',
      reviews: 'avis',
      seeOnMap: 'Voir sur la carte',
      getDirections: 'Itinéraire',
      call: 'Appeler',
    },
    // Réservations
    reservations: {
      title: 'Mes Réservations',
      noReservations: 'Vous n\'avez aucune réservation',
      status: {
        pending: 'En attente',
        confirmed: 'Confirmée',
        ready: 'Prête',
        completed: 'Terminée',
        cancelled: 'Annulée',
      },
      cancel: 'Annuler',
      details: 'Détails',
    },
    // Mes réservations (page)
    myReservations: {
      subtitle: 'Consultez et gérez vos réservations de médicaments',
      filterByStatus: 'Filtrer par statut',
      statusAll: 'Tous',
      statusCollected: 'Récupérée',
      statusExpired: 'Expirée',
      refresh: 'Actualiser',
      searchMedicines: 'Rechercher des médicaments',
      items: 'article(s)',
      reservationDetails: 'Détails de la réservation',
      generalInfo: 'Informations générales',
      number: 'Numéro',
      statusLabel: 'Statut',
      pharmacyLabel: 'Pharmacie',
      contact: 'Contact',
      name: 'Nom',
      reservedItems: 'Articles réservés',
      total: 'Total',
      dates: 'Dates',
      createdAt: 'Créée le',
      pickupDate: 'Récupération prévue',
      confirmedAt: 'Confirmée le',
      collectedAt: 'Récupérée le',
      cancelledAt: 'Annulée le',
      notes: 'Notes',
      pharmacyNotes: 'Notes de la pharmacie',
      cancelReservation: 'Annuler cette réservation',
      loadError: 'Erreur lors du chargement des réservations',
      detailsError: 'Erreur lors du chargement des détails',
      cancelReason: 'Raison de l\'annulation (optionnel):',
      cancelSuccess: 'Réservation annulée avec succès',
    },
    // Profil
    profile: {
      title: 'Mon Profil',
      personalInfo: 'Informations personnelles',
      preferences: 'Préférences',
      security: 'Sécurité',
      language: 'Langue',
      notifications: 'Notifications',
      save: 'Enregistrer',
      changePassword: 'Changer le mot de passe',
      deleteAccount: 'Supprimer le compte',
    },
    // Authentification
    auth: {
      loginTitle: 'Connexion',
      registerTitle: 'Inscription',
      email: 'Email',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le mot de passe',
      username: 'Nom d\'utilisateur',
      forgotPassword: 'Mot de passe oublié ?',
      noAccount: 'Pas encore de compte ?',
      hasAccount: 'Déjà un compte ?',
      loginButton: 'Se connecter',
      registerButton: 'S\'inscrire',
      accessAccount: 'Accédez à votre compte FindPharma',
      usernamePlaceholder: 'Entrez votre nom d\'utilisateur',
      passwordPlaceholder: 'Entrez votre mot de passe',
      loggingIn: 'Connexion en cours...',
      loginError: 'Erreur lors de la connexion',
      createAccount: 'Créer un compte',
      testAccount: 'Compte de test',
      emailPlaceholder: 'votre.email@exemple.com',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      registering: 'Inscription en cours...',
      registerError: 'Erreur lors de l\'inscription',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      createYourAccount: 'Créez votre compte FindPharma',
    },
    // Inscription
    register: {
      title: 'Créer un Compte',
      subtitle: 'Rejoignez FindPharma dès maintenant',
      accountType: 'Type de compte',
      customer: 'Client',
      pharmacy: 'Pharmacie',
      customerHelp: 'Compte pour rechercher et réserver des médicaments',
      pharmacyHelp: 'Compte pour gérer les stocks de votre pharmacie',
      selectYourPharmacy: 'Sélectionner votre pharmacie',
      choosePharmacy: 'Choisir une pharmacie',
      pharmacySelectHelp: 'Sélectionnez la pharmacie que vous représentez',
      selectPharmacy: 'Veuillez sélectionner une pharmacie',
      usernamePlaceholder: 'Choisissez un nom d\'utilisateur',
      passwordPlaceholder: 'Créez un mot de passe sécurisé',
      minChars3: 'Minimum 3 caractères',
      minChars8: 'Minimum 8 caractères',
      passwordMinLength: 'Le mot de passe doit contenir au moins 8 caractères',
      verificationCodeError: 'Erreur lors de l\'envoi du code de vérification',
      emailVerified: 'Email vérifié avec succès',
      creating: 'Création en cours...',
      sendingCode: 'Envoi du code...',
      finalize: 'Finaliser l\'inscription',
      verifyEmail: 'Vérifier mon email',
      verificationNotice: 'Un code de vérification sera envoyé à votre email',
      successTitle: 'Inscription réussie !',
      successMessage: 'Votre compte a été créé avec succès.',
      redirecting: 'Redirection vers la page de connexion...',
    },
    // Messages communs
    common: {
      loading: 'Chargement...',
      error: 'Erreur',
      success: 'Succès',
      cancel: 'Annuler',
      confirm: 'Confirmer',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      close: 'Fermer',
      back: 'Retour',
      next: 'Suivant',
      previous: 'Précédent',
      seeMore: 'Voir plus',
      seeLess: 'Voir moins',
      yes: 'Oui',
      no: 'Non',
    },
    // Unités
    units: {
      km: 'km',
      m: 'm',
      fcfa: 'FCFA',
    },
    // Footer
    footer: {
      about: 'À propos',
      contact: 'Contact',
      faq: 'FAQ',
      legal: 'Mentions Légales',
      followUs: 'Suivez-nous',
    },
    // Section Hero
    hero: {
      badge: 'Trouvez vos médicaments rapidement',
      title: 'Trouvez la pharmacie la plus proche avec vos médicaments',
      description: 'FindPharma vous aide à localiser les pharmacies autour de vous qui ont les médicaments dont vous avez besoin, avec les prix et la disponibilité en temps réel.',
      features: {
        smartSearch: 'Recherche intelligente',
        smartSearchDesc: 'Trouvez vos médicaments par nom ou principe actif',
        geolocation: 'Géolocalisation',
        geolocationDesc: 'Pharmacies les plus proches de votre position',
        priceComparison: 'Comparaison de prix',
        priceComparisonDesc: 'Comparez les prix entre différentes pharmacies',
        easyReservation: 'Réservation facile',
        easyReservationDesc: 'Ajoutez au panier et réservez vos médicaments',
      },
      cta: {
        createAccount: 'Créer un compte',
        login: 'Se connecter',
        createAccountFree: 'Créer un compte gratuitement',
      },
      cards: {
        pharmacyName: 'Pharmacie de la Mairie',
        inStock: 'En stock',
        positionDetected: 'Position détectée',
        location: 'Yaoundé, Cameroun',
      },
      stats: {
        pharmacies: 'Pharmacies partenaires',
        medicines: 'Médicaments référencés',
        users: 'Utilisateurs actifs',
        availability: 'Service disponible',
      },
      howItWorks: {
        title: 'Comment ça marche ?',
        step1: 'Recherchez',
        step1Desc: 'Entrez le nom du médicament que vous recherchez',
        step2: 'Comparez',
        step2Desc: 'Consultez les pharmacies, prix et disponibilités',
        step3: 'Réservez',
        step3Desc: 'Ajoutez au panier et réservez vos médicaments',
        step4: 'Récupérez',
        step4Desc: 'Retirez vos médicaments à la pharmacie choisie',
      },
      benefits: {
        title: 'Pourquoi choisir FindPharma ?',
        fast: 'Rapide et efficace',
        fastDesc: 'Trouvez vos médicaments en quelques secondes sans appeler plusieurs pharmacies',
        reliable: 'Fiable',
        reliableDesc: 'Informations vérifiées et mises à jour en temps réel par les pharmacies',
        secure: 'Sécurisé',
        secureDesc: 'Vos données personnelles et médicales sont protégées',
        free: 'Gratuit',
        freeDesc: 'Service 100% gratuit pour tous les utilisateurs au Cameroun',
      },
      finalCta: {
        title: 'Prêt à commencer ?',
        description: 'Rejoignez des milliers d\'utilisateurs qui trouvent leurs médicaments facilement',
      },
    },
  },
  
  en: {
    // Header
    header: {
      search: 'Search',
      myReservations: 'My Reservations',
      manageStocks: 'Manage Stocks',
      manageMedicines: 'Manage Medicines',
      adminDashboard: 'Admin Dashboard',
      login: 'Login',
      register: 'Sign Up',
      logout: 'Logout',
      myProfile: 'My Profile',
      userTypeAdmin: 'Administrator',
      userTypePharmacy: 'Pharmacy',
      userTypeCustomer: 'Customer',
      language: 'Language',
    },
    // Home page
    home: {
      title: 'Find your medications easily',
      subtitle: 'Search and locate pharmacies that have your medications',
      searchPlaceholder: 'Search for a medication...',
      searchButton: 'Search',
      nearbyPharmacies: 'Nearby Pharmacies',
      noResults: 'No results found',
      loading: 'Loading...',
    },
    // Search
    search: {
      results: 'results',
      available: 'Available',
      unavailable: 'Unavailable',
      inStock: 'In stock',
      outOfStock: 'Out of stock',
      price: 'Price',
      quantity: 'Quantity',
      reserve: 'Reserve',
      seeDetails: 'See details',
      filters: 'Filters',
      sortBy: 'Sort by',
      distance: 'Distance',
      rating: 'Rating',
      placeholder: 'Search for a medication (Ex: doli, asp, ibu...)',
      searchButton: 'Search',
      searching: 'Searching...',
      clear: 'Clear',
      enterMedicine: 'Please enter a medication name',
      noResults: 'No pharmacy currently offers "{query}"',
      errorSearch: 'Search error. Make sure the backend server is running.',
      hintMinChars: 'Type at least 2 characters to start searching',
      searchRadius: 'Search radius',
      usedForLocation: 'Used for location',
      kmAroundMe: '{km} km around me',
      noPharmacyInRadius: 'No pharmacy found within {km} km radius. Try increasing the search radius.',
    },
    // Pharmacies
    pharmacy: {
      openNow: 'Open',
      closed: 'Closed',
      open24h: 'Open 24/7',
      phone: 'Phone',
      address: 'Address',
      schedule: 'Hours',
      reviews: 'reviews',
      seeOnMap: 'See on map',
      getDirections: 'Get directions',
      call: 'Call',
    },
    // Reservations
    reservations: {
      title: 'My Reservations',
      noReservations: 'You have no reservations',
      status: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        ready: 'Ready',
        completed: 'Completed',
        cancelled: 'Cancelled',
      },
      cancel: 'Cancel',
      details: 'Details',
    },
    // My reservations (page)
    myReservations: {
      subtitle: 'View and manage your medication reservations',
      filterByStatus: 'Filter by status',
      statusAll: 'All',
      statusCollected: 'Collected',
      statusExpired: 'Expired',
      refresh: 'Refresh',
      searchMedicines: 'Search for medications',
      items: 'item(s)',
      reservationDetails: 'Reservation details',
      generalInfo: 'General information',
      number: 'Number',
      statusLabel: 'Status',
      pharmacyLabel: 'Pharmacy',
      contact: 'Contact',
      name: 'Name',
      reservedItems: 'Reserved items',
      total: 'Total',
      dates: 'Dates',
      createdAt: 'Created on',
      pickupDate: 'Expected pickup',
      confirmedAt: 'Confirmed on',
      collectedAt: 'Collected on',
      cancelledAt: 'Cancelled on',
      notes: 'Notes',
      pharmacyNotes: 'Pharmacy notes',
      cancelReservation: 'Cancel this reservation',
      loadError: 'Error loading reservations',
      detailsError: 'Error loading details',
      cancelReason: 'Cancellation reason (optional):',
      cancelSuccess: 'Reservation cancelled successfully',
    },
    // Profile
    profile: {
      title: 'My Profile',
      personalInfo: 'Personal Information',
      preferences: 'Preferences',
      security: 'Security',
      language: 'Language',
      notifications: 'Notifications',
      save: 'Save',
      changePassword: 'Change password',
      deleteAccount: 'Delete account',
    },
    // Authentication
    auth: {
      loginTitle: 'Login',
      registerTitle: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm password',
      username: 'Username',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      hasAccount: 'Already have an account?',
      loginButton: 'Log in',
      registerButton: 'Sign up',
      accessAccount: 'Access your FindPharma account',
      usernamePlaceholder: 'Enter your username',
      passwordPlaceholder: 'Enter your password',
      loggingIn: 'Logging in...',
      loginError: 'Login error',
      createAccount: 'Create account',
      testAccount: 'Test account',
      emailPlaceholder: 'your.email@example.com',
      confirmPasswordPlaceholder: 'Confirm your password',
      registering: 'Signing up...',
      registerError: 'Registration error',
      passwordMismatch: 'Passwords do not match',
      createYourAccount: 'Create your FindPharma account',
    },
    // Registration
    register: {
      title: 'Create Account',
      subtitle: 'Join FindPharma now',
      accountType: 'Account type',
      customer: 'Customer',
      pharmacy: 'Pharmacy',
      customerHelp: 'Account to search and reserve medications',
      pharmacyHelp: 'Account to manage your pharmacy inventory',
      selectYourPharmacy: 'Select your pharmacy',
      choosePharmacy: 'Choose a pharmacy',
      pharmacySelectHelp: 'Select the pharmacy you represent',
      selectPharmacy: 'Please select a pharmacy',
      usernamePlaceholder: 'Choose a username',
      passwordPlaceholder: 'Create a secure password',
      minChars3: 'Minimum 3 characters',
      minChars8: 'Minimum 8 characters',
      passwordMinLength: 'Password must be at least 8 characters',
      verificationCodeError: 'Error sending verification code',
      emailVerified: 'Email verified successfully',
      creating: 'Creating...',
      sendingCode: 'Sending code...',
      finalize: 'Complete registration',
      verifyEmail: 'Verify my email',
      verificationNotice: 'A verification code will be sent to your email',
      successTitle: 'Registration successful!',
      successMessage: 'Your account has been created successfully.',
      redirecting: 'Redirecting to login page...',
    },
    // Common messages
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      seeMore: 'See more',
      seeLess: 'See less',
      yes: 'Yes',
      no: 'No',
    },
    // Units
    units: {
      km: 'km',
      m: 'm',
      fcfa: 'FCFA',
    },
    // Footer
    footer: {
      about: 'About',
      contact: 'Contact',
      faq: 'FAQ',
      legal: 'Legal Notice',
      followUs: 'Follow us',
    },
    // Hero Section
    hero: {
      badge: 'Find your medications quickly',
      title: 'Find the nearest pharmacy with your medications',
      description: 'FindPharma helps you locate pharmacies around you that have the medications you need, with real-time prices and availability.',
      features: {
        smartSearch: 'Smart Search',
        smartSearchDesc: 'Find your medications by name or active ingredient',
        geolocation: 'Geolocation',
        geolocationDesc: 'Pharmacies closest to your location',
        priceComparison: 'Price Comparison',
        priceComparisonDesc: 'Compare prices between different pharmacies',
        easyReservation: 'Easy Reservation',
        easyReservationDesc: 'Add to cart and reserve your medications',
      },
      cta: {
        createAccount: 'Create Account',
        login: 'Log in',
        createAccountFree: 'Create a free account',
      },
      cards: {
        pharmacyName: 'Town Hall Pharmacy',
        inStock: 'In stock',
        positionDetected: 'Position detected',
        location: 'Yaoundé, Cameroon',
      },
      stats: {
        pharmacies: 'Partner pharmacies',
        medicines: 'Listed medications',
        users: 'Active users',
        availability: 'Service available',
      },
      howItWorks: {
        title: 'How does it work?',
        step1: 'Search',
        step1Desc: 'Enter the name of the medication you are looking for',
        step2: 'Compare',
        step2Desc: 'Check pharmacies, prices and availability',
        step3: 'Reserve',
        step3Desc: 'Add to cart and reserve your medications',
        step4: 'Pick up',
        step4Desc: 'Collect your medications at the chosen pharmacy',
      },
      benefits: {
        title: 'Why choose FindPharma?',
        fast: 'Fast and efficient',
        fastDesc: 'Find your medications in seconds without calling multiple pharmacies',
        reliable: 'Reliable',
        reliableDesc: 'Verified information updated in real-time by pharmacies',
        secure: 'Secure',
        secureDesc: 'Your personal and medical data is protected',
        free: 'Free',
        freeDesc: '100% free service for all users in Cameroon',
      },
      finalCta: {
        title: 'Ready to get started?',
        description: 'Join thousands of users who find their medications easily',
      },
    },
  },
  
  es: {
    // Header
    header: {
      search: 'Buscar',
      myReservations: 'Mis Reservas',
      manageStocks: 'Gestionar Stocks',
      manageMedicines: 'Gestionar Medicamentos',
      adminDashboard: 'Panel Admin',
      login: 'Iniciar sesión',
      register: 'Registrarse',
      logout: 'Cerrar sesión',
      myProfile: 'Mi Perfil',
      userTypeAdmin: 'Administrador',
      userTypePharmacy: 'Farmacia',
      userTypeCustomer: 'Cliente',
      language: 'Idioma',
    },
    // Página de inicio
    home: {
      title: 'Encuentra tus medicamentos fácilmente',
      subtitle: 'Busca y localiza las farmacias que tienen tus medicamentos',
      searchPlaceholder: 'Buscar un medicamento...',
      searchButton: 'Buscar',
      nearbyPharmacies: 'Farmacias cercanas',
      noResults: 'No se encontraron resultados',
      loading: 'Cargando...',
    },
    // Búsqueda
    search: {
      results: 'resultados',
      available: 'Disponible',
      unavailable: 'No disponible',
      inStock: 'En stock',
      outOfStock: 'Agotado',
      price: 'Precio',
      quantity: 'Cantidad',
      reserve: 'Reservar',
      seeDetails: 'Ver detalles',
      filters: 'Filtros',
      sortBy: 'Ordenar por',
      distance: 'Distancia',
      rating: 'Valoración',
      placeholder: 'Buscar un medicamento (Ej: doli, asp, ibu...)',
      searchButton: 'Buscar',
      searching: 'Buscando...',
      clear: 'Borrar',
      enterMedicine: 'Por favor ingrese un nombre de medicamento',
      noResults: 'Ninguna farmacia ofrece "{query}" actualmente',
      errorSearch: 'Error de búsqueda. Verifique que el servidor backend esté funcionando.',
      hintMinChars: 'Escriba al menos 2 caracteres para iniciar la búsqueda',
      searchRadius: 'Radio de búsqueda',
      usedForLocation: 'Usado para la ubicación',
      kmAroundMe: '{km} km a mi alrededor',
      noPharmacyInRadius: 'No se encontró ninguna farmacia en un radio de {km} km. Intente aumentar el radio de búsqueda.',
    },
    // Farmacias
    pharmacy: {
      openNow: 'Abierto',
      closed: 'Cerrado',
      open24h: 'Abierto 24h',
      phone: 'Teléfono',
      address: 'Dirección',
      schedule: 'Horario',
      reviews: 'opiniones',
      seeOnMap: 'Ver en el mapa',
      getDirections: 'Cómo llegar',
      call: 'Llamar',
    },
    // Reservas
    reservations: {
      title: 'Mis Reservas',
      noReservations: 'No tienes reservas',
      status: {
        pending: 'Pendiente',
        confirmed: 'Confirmada',
        ready: 'Lista',
        completed: 'Completada',
        cancelled: 'Cancelada',
      },
      cancel: 'Cancelar',
      details: 'Detalles',
    },
    // Mis reservas (página)
    myReservations: {
      subtitle: 'Consulta y gestiona tus reservas de medicamentos',
      filterByStatus: 'Filtrar por estado',
      statusAll: 'Todos',
      statusCollected: 'Recogida',
      statusExpired: 'Expirada',
      refresh: 'Actualizar',
      searchMedicines: 'Buscar medicamentos',
      items: 'artículo(s)',
      reservationDetails: 'Detalles de la reserva',
      generalInfo: 'Información general',
      number: 'Número',
      statusLabel: 'Estado',
      pharmacyLabel: 'Farmacia',
      contact: 'Contacto',
      name: 'Nombre',
      reservedItems: 'Artículos reservados',
      total: 'Total',
      dates: 'Fechas',
      createdAt: 'Creada el',
      pickupDate: 'Recogida prevista',
      confirmedAt: 'Confirmada el',
      collectedAt: 'Recogida el',
      cancelledAt: 'Cancelada el',
      notes: 'Notas',
      pharmacyNotes: 'Notas de la farmacia',
      cancelReservation: 'Cancelar esta reserva',
      loadError: 'Error al cargar las reservas',
      detailsError: 'Error al cargar los detalles',
      cancelReason: 'Motivo de cancelación (opcional):',
      cancelSuccess: 'Reserva cancelada exitosamente',
    },
    // Perfil
    profile: {
      title: 'Mi Perfil',
      personalInfo: 'Información personal',
      preferences: 'Preferencias',
      security: 'Seguridad',
      language: 'Idioma',
      notifications: 'Notificaciones',
      save: 'Guardar',
      changePassword: 'Cambiar contraseña',
      deleteAccount: 'Eliminar cuenta',
    },
    // Autenticación
    auth: {
      loginTitle: 'Iniciar sesión',
      registerTitle: 'Registrarse',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      username: 'Nombre de usuario',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      loginButton: 'Entrar',
      registerButton: 'Registrarse',
      accessAccount: 'Accede a tu cuenta FindPharma',
      usernamePlaceholder: 'Ingresa tu nombre de usuario',
      passwordPlaceholder: 'Ingresa tu contraseña',
      loggingIn: 'Iniciando sesión...',
      loginError: 'Error de inicio de sesión',
      createAccount: 'Crear cuenta',
      testAccount: 'Cuenta de prueba',
      emailPlaceholder: 'tu.correo@ejemplo.com',
      confirmPasswordPlaceholder: 'Confirma tu contraseña',
      registering: 'Registrando...',
      registerError: 'Error de registro',
      passwordMismatch: 'Las contraseñas no coinciden',
      createYourAccount: 'Crea tu cuenta FindPharma',
    },
    // Registro
    register: {
      title: 'Crear Cuenta',
      subtitle: 'Únete a FindPharma ahora',
      accountType: 'Tipo de cuenta',
      customer: 'Cliente',
      pharmacy: 'Farmacia',
      customerHelp: 'Cuenta para buscar y reservar medicamentos',
      pharmacyHelp: 'Cuenta para gestionar el inventario de tu farmacia',
      selectYourPharmacy: 'Seleccionar tu farmacia',
      choosePharmacy: 'Elegir una farmacia',
      pharmacySelectHelp: 'Selecciona la farmacia que representas',
      selectPharmacy: 'Por favor selecciona una farmacia',
      usernamePlaceholder: 'Elige un nombre de usuario',
      passwordPlaceholder: 'Crea una contraseña segura',
      minChars3: 'Mínimo 3 caracteres',
      minChars8: 'Mínimo 8 caracteres',
      passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
      verificationCodeError: 'Error al enviar el código de verificación',
      emailVerified: 'Email verificado exitosamente',
      creating: 'Creando...',
      sendingCode: 'Enviando código...',
      finalize: 'Completar registro',
      verifyEmail: 'Verificar mi email',
      verificationNotice: 'Se enviará un código de verificación a tu email',
      successTitle: '¡Registro exitoso!',
      successMessage: 'Tu cuenta ha sido creada exitosamente.',
      redirecting: 'Redirigiendo a la página de inicio de sesión...',
    },
    // Mensajes comunes
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      confirm: 'Confirmar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar',
      close: 'Cerrar',
      back: 'Volver',
      next: 'Siguiente',
      previous: 'Anterior',
      seeMore: 'Ver más',
      seeLess: 'Ver menos',
      yes: 'Sí',
      no: 'No',
    },
    // Unidades
    units: {
      km: 'km',
      m: 'm',
      fcfa: 'FCFA',
    },
    // Footer
    footer: {
      about: 'Acerca de',
      contact: 'Contacto',
      faq: 'FAQ',
      legal: 'Aviso Legal',
      followUs: 'Síguenos',
    },
    // Sección Hero
    hero: {
      badge: 'Encuentra tus medicamentos rápidamente',
      title: 'Encuentra la farmacia más cercana con tus medicamentos',
      description: 'FindPharma te ayuda a localizar las farmacias cerca de ti que tienen los medicamentos que necesitas, con precios y disponibilidad en tiempo real.',
      features: {
        smartSearch: 'Búsqueda inteligente',
        smartSearchDesc: 'Encuentra tus medicamentos por nombre o principio activo',
        geolocation: 'Geolocalización',
        geolocationDesc: 'Farmacias más cercanas a tu ubicación',
        priceComparison: 'Comparación de precios',
        priceComparisonDesc: 'Compara precios entre diferentes farmacias',
        easyReservation: 'Reserva fácil',
        easyReservationDesc: 'Añade al carrito y reserva tus medicamentos',
      },
      cta: {
        createAccount: 'Crear cuenta',
        login: 'Iniciar sesión',
        createAccountFree: 'Crear una cuenta gratis',
      },
      cards: {
        pharmacyName: 'Farmacia del Ayuntamiento',
        inStock: 'En stock',
        positionDetected: 'Posición detectada',
        location: 'Yaundé, Camerún',
      },
      stats: {
        pharmacies: 'Farmacias asociadas',
        medicines: 'Medicamentos registrados',
        users: 'Usuarios activos',
        availability: 'Servicio disponible',
      },
      howItWorks: {
        title: '¿Cómo funciona?',
        step1: 'Busca',
        step1Desc: 'Introduce el nombre del medicamento que buscas',
        step2: 'Compara',
        step2Desc: 'Consulta farmacias, precios y disponibilidad',
        step3: 'Reserva',
        step3Desc: 'Añade al carrito y reserva tus medicamentos',
        step4: 'Recoge',
        step4Desc: 'Retira tus medicamentos en la farmacia elegida',
      },
      benefits: {
        title: '¿Por qué elegir FindPharma?',
        fast: 'Rápido y eficiente',
        fastDesc: 'Encuentra tus medicamentos en segundos sin llamar a varias farmacias',
        reliable: 'Confiable',
        reliableDesc: 'Información verificada y actualizada en tiempo real por las farmacias',
        secure: 'Seguro',
        secureDesc: 'Tus datos personales y médicos están protegidos',
        free: 'Gratuito',
        freeDesc: 'Servicio 100% gratuito para todos los usuarios en Camerún',
      },
      finalCta: {
        title: '¿Listo para empezar?',
        description: 'Únete a miles de usuarios que encuentran sus medicamentos fácilmente',
      },
    },
  },
};

// Créer le contexte
const LanguageContext = createContext();

// Provider du contexte
export function LanguageProvider({ children }) {
  // Récupérer la langue sauvegardée ou utiliser le français par défaut
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('appLanguage');
    return saved || 'fr';
  });

  // Sauvegarder la langue quand elle change
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    // Mettre à jour l'attribut lang du document HTML
    document.documentElement.lang = language;
  }, [language]);

  // Fonction pour obtenir une traduction
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k];
      } else {
        // Fallback vers le français si la clé n'existe pas
        value = translations['fr'];
        for (const fk of keys) {
          if (value && value[fk]) {
            value = value[fk];
          } else {
            return key; // Retourner la clé si non trouvée
          }
        }
        break;
      }
    }
    
    return value;
  };

  // Changer la langue
  const changeLanguage = (newLang) => {
    if (translations[newLang]) {
      setLanguage(newLang);
    }
  };

  // Langues disponibles
  const availableLanguages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      availableLanguages,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personnalisé pour utiliser le contexte
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
