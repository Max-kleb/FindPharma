import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile'); // profile, security, preferences
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    username: '',
    bio: '',
    location: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    sms_notifications: false,
    newsletter: true,
    language: 'fr'
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      
      if (!userData) {
        navigate('/login');
        return;
      }
      
      setUser(userData);
      setFormData({
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        username: userData.username || '',
        bio: userData.bio || '',
        location: userData.location || ''
      });
      
      // Load profile image if exists
      if (userData.profile_image) {
        setImagePreview(userData.profile_image);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur chargement profil:', error);
      setErrorMessage('Erreur lors du chargement du profil');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB max
        setErrorMessage('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setProfileImage(file);
      
      // Preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // TODO: API call to update profile
      // const response = await updateUserProfile(formData, profileImage);
      
      // Simulate success
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setSuccessMessage('✅ Profil mis à jour avec succès !');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setErrorMessage('❌ Erreur lors de la mise à jour du profil');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMessage('❌ Les mots de passe ne correspondent pas');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setErrorMessage('❌ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    try {
      // TODO: API call to change password
      // await changePassword(passwordData);
      
      setSuccessMessage('✅ Mot de passe modifié avec succès !');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setErrorMessage('❌ Erreur lors du changement de mot de passe');
    }
  };

  const handleSubmitPreferences = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // TODO: API call to update preferences
      // await updatePreferences(preferences);
      
      setSuccessMessage('✅ Préférences enregistrées !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      setErrorMessage('❌ Erreur lors de la sauvegarde');
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      admin: 'Administrateur',
      pharmacy: 'Pharmacie',
      customer: 'Client'
    };
    return labels[type] || type;
  };

  const getUserTypeIcon = (type) => {
    const icons = {
      admin: '👑',
      pharmacy: '💊',
      customer: '👤'
    };
    return icons[type] || '👤';
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header with cover */}
      <div className="profile-header">
        <div className="profile-cover">
          <div className="profile-cover-gradient"></div>
        </div>
        
        <div className="profile-main-info">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" />
              ) : (
                <div className="profile-avatar-placeholder">
                  {getUserTypeIcon(user?.user_type)}
                </div>
              )}
              {isEditing && (
                <label className="profile-avatar-edit">
                  <i className="fas fa-camera"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
            
            <div className="profile-info">
              <h1 className="profile-name">
                {formData.first_name || formData.last_name 
                  ? `${formData.first_name} ${formData.last_name}`.trim()
                  : formData.username}
              </h1>
              <p className="profile-username">@{formData.username}</p>
              <span className="profile-badge">
                {getUserTypeIcon(user?.user_type)} {getUserTypeLabel(user?.user_type)}
              </span>
            </div>
          </div>
          
          <div className="profile-actions">
            {!isEditing ? (
              <button 
                className="btn-edit-profile"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-edit"></i> Modifier le profil
              </button>
            ) : (
              <button 
                className="btn-cancel-edit"
                onClick={() => {
                  setIsEditing(false);
                  loadUserProfile();
                }}
              >
                <i className="fas fa-times"></i> Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="alert alert-error">
          {errorMessage}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-user"></i> Profil
        </button>
        <button
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-lock"></i> Sécurité
        </button>
        <button
          className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <i className="fas fa-cog"></i> Préférences
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2><i className="fas fa-user-circle"></i> Informations personnelles</h2>
            
            <form onSubmit={handleSubmitProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">
                    <i className="fas fa-user"></i> Prénom
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Votre prénom"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">
                    <i className="fas fa-user"></i> Nom
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-at"></i> Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    disabled
                    title="Le nom d'utilisateur ne peut pas être modifié"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="+237 6XX XXX XXX"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">
                    <i className="fas fa-map-marker-alt"></i> Localisation
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Ville, Pays"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fas fa-align-left"></i> Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder="Parlez-nous de vous..."
                  rows="4"
                ></textarea>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-save"></i> Enregistrer les modifications
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <h2><i className="fas fa-shield-alt"></i> Sécurité du compte</h2>
            
            <form onSubmit={handleSubmitPassword} className="profile-form">
              <div className="form-group">
                <label htmlFor="current_password">
                  <i className="fas fa-key"></i> Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder="Votre mot de passe actuel"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_password">
                  <i className="fas fa-lock"></i> Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 8 caractères"
                  required
                />
                <small className="form-hint">
                  Utilisez au moins 8 caractères avec des lettres et des chiffres
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">
                  <i className="fas fa-lock"></i> Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder="Retapez le nouveau mot de passe"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <i className="fas fa-save"></i> Changer le mot de passe
                </button>
              </div>
            </form>

            <div className="security-info">
              <h3><i className="fas fa-info-circle"></i> Conseils de sécurité</h3>
              <ul>
                <li>✅ Utilisez un mot de passe unique et fort</li>
                <li>✅ Ne partagez jamais votre mot de passe</li>
                <li>✅ Changez votre mot de passe régulièrement</li>
                <li>✅ Activez la vérification en deux étapes (bientôt disponible)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="profile-section">
            <h2><i className="fas fa-sliders-h"></i> Préférences</h2>
            
            <form onSubmit={handleSubmitPreferences} className="profile-form">
              <div className="preferences-section">
                <h3><i className="fas fa-bell"></i> Notifications</h3>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <label htmlFor="email_notifications">
                      Notifications par email
                    </label>
                    <small>Recevez des alertes par email</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="email_notifications"
                      name="email_notifications"
                      checked={preferences.email_notifications}
                      onChange={handlePreferenceChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <label htmlFor="sms_notifications">
                      Notifications SMS
                    </label>
                    <small>Recevez des alertes par SMS</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="sms_notifications"
                      name="sms_notifications"
                      checked={preferences.sms_notifications}
                      onChange={handlePreferenceChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <label htmlFor="newsletter">
                      Newsletter
                    </label>
                    <small>Recevez nos actualités et offres</small>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      checked={preferences.newsletter}
                      onChange={handlePreferenceChange}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              <div className="preferences-section">
                <h3><i className="fas fa-language"></i> Langue</h3>
                
                <div className="form-group">
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      language: e.target.value
                    }))}
                  >
                    <option value="fr">🇫🇷 Français</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <i className="fas fa-save"></i> Enregistrer les préférences
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
