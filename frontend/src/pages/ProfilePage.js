import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProfilePage.css';

// Langues disponibles
const availableLanguages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
    language: i18n.language?.substring(0, 2) || 'fr' // Utiliser la langue de i18n
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Synchroniser les préférences de langue avec i18n
  useEffect(() => {
    const currentLang = i18n.language?.substring(0, 2) || 'fr';
    setPreferences(prev => ({ ...prev, language: currentLang }));
  }, [i18n.language]);

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
      
      setSuccessMessage(`✅ ${t('profile.profileUpdated')}`);
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      setErrorMessage(`❌ ${t('errors.profileUpdateError')}`);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setErrorMessage(`❌ ${t('profile.passwordMismatch')}`);
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setErrorMessage(`❌ ${t('register.passwordMinLength')}`);
      return;
    }
    
    try {
      // TODO: API call to change password
      // await changePassword(passwordData);
      
      setSuccessMessage(`✅ ${t('profile.passwordChanged')}`);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      setErrorMessage(`❌ ${t('profile.passwordError')}`);
    }
  };

  const handleSubmitPreferences = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // TODO: API call to update preferences
      // await updatePreferences(preferences);
      
      setSuccessMessage(`✅ ${t('profile.preferencesUpdated')}`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde préférences:', error);
      setErrorMessage(`❌ ${t('errors.saveError')}`);
    }
  };

  const getUserTypeLabel = (type) => {
    const labels = {
      admin: t('header.userTypeAdmin'),
      pharmacy: t('header.userTypePharmacy'),
      customer: t('header.userTypeCustomer')
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
        <p>{t('common.loading')}</p>
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
                <i className="fas fa-edit"></i> {t('profile.editProfile')}
              </button>
            ) : (
              <button 
                className="btn-cancel-edit"
                onClick={() => {
                  setIsEditing(false);
                  loadUserProfile();
                }}
              >
                <i className="fas fa-times"></i> {t('profile.cancel')}
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
          <i className="fas fa-user"></i> {t('profile.profileTab')}
        </button>
        <button
          className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <i className="fas fa-lock"></i> {t('profile.securityTab')}
        </button>
        <button
          className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <i className="fas fa-cog"></i> {t('profile.preferencesTab')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2><i className="fas fa-user-circle"></i> {t('profile.personalInfo')}</h2>
            
            <form onSubmit={handleSubmitProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name">
                    <i className="fas fa-user"></i> {t('profile.firstName')}
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={t('profile.firstNamePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="last_name">
                    <i className="fas fa-user"></i> {t('profile.lastName')}
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={t('profile.lastNamePlaceholder')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-at"></i> {t('profile.username')}
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    disabled
                    title={t('profile.usernameCannotChange')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i> {t('profile.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={t('profile.emailPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">
                    <i className="fas fa-phone"></i> {t('profile.phone')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={t('profile.phonePlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">
                    <i className="fas fa-map-marker-alt"></i> {t('profile.location')}
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder={t('profile.locationPlaceholder')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fas fa-align-left"></i> {t('profile.bio')}
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  placeholder={t('profile.bioPlaceholder')}
                  rows="4"
                ></textarea>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button type="submit" className="btn-save">
                    <i className="fas fa-save"></i> {t('profile.save')}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="profile-section">
            <h2><i className="fas fa-shield-alt"></i> {t('profile.accountSecurity')}</h2>
            
            <form onSubmit={handleSubmitPassword} className="profile-form">
              <div className="form-group">
                <label htmlFor="current_password">
                  <i className="fas fa-key"></i> {t('profile.currentPassword')}
                </label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  placeholder={t('profile.currentPassword')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new_password">
                  <i className="fas fa-lock"></i> {t('profile.newPassword')}
                </label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  placeholder={t('register.minChars8')}
                  required
                />
                <small className="form-hint">
                  {t('register.minChars8')}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">
                  <i className="fas fa-lock"></i> {t('profile.confirmPassword')}
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  placeholder={t('profile.confirmPassword')}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <i className="fas fa-save"></i> {t('profile.updatePassword')}
                </button>
              </div>
            </form>

            <div className="security-info">
              <h3><i className="fas fa-info-circle"></i> {t('profile.securityTips')}</h3>
              <ul>
                <li>✅ {t('profile.securityTip1')}</li>
                <li>✅ {t('profile.securityTip2')}</li>
                <li>✅ {t('profile.securityTip3')}</li>
                <li>✅ {t('profile.securityTip4')}</li>
              </ul>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="profile-section">
            <h2><i className="fas fa-sliders-h"></i> {t('profile.preferences')}</h2>
            
            <form onSubmit={handleSubmitPreferences} className="profile-form">
              <div className="preferences-section">
                <h3><i className="fas fa-bell"></i> {t('profile.notifications')}</h3>
                
                <div className="preference-item">
                  <div className="preference-info">
                    <label htmlFor="email_notifications">
                      {t('profile.emailNotifications')}
                    </label>
                    <small>{t('profile.receiveUpdates')}</small>
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
                      {t('profile.smsNotifications')}
                    </label>
                    <small>{t('profile.receiveSMS')}</small>
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
                      {t('profile.newsletter')}
                    </label>
                    <small>{t('profile.receiveNewsletter')}</small>
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
                <h3><i className="fas fa-language"></i> {t('profile.language')}</h3>
                
                <div className="form-group">
                  <select
                    value={preferences.language}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setPreferences(prev => ({
                        ...prev,
                        language: newLang
                      }));
                      // Appliquer immédiatement le changement de langue
                      i18n.changeLanguage(newLang);
                    }}
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </option>
                    ))}
                  </select>
                  <p className="language-hint">
                    ✓ {t('profile.chooseLanguage')}
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  <i className="fas fa-save"></i> {t('profile.savePreferences')}
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
