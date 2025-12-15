import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  fetchMedicines, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} from './services/api';
import { showConfirmDialog } from './components/NotificationSystem';
import './StockManager.css'; // Réutiliser le même CSS

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MedicineManager = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [medicines, setMedicines] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [wikipediaLoading, setWikipediaLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [token, setToken] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [lastWikipediaSearch, setLastWikipediaSearch] = useState('');
    const wikipediaDebounceRef = useRef(null);
    
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        form: 'comprimé',
        description: '',
        category: 'autre',
        indications: '',
        contraindications: '',
        posology: '',
        side_effects: '',
        average_price: '',
        requires_prescription: false
    });

    const formTypes = [
        'comprimé', 'gélule', 'sirop', 'injectable', 
        'crème', 'pommade', 'solution', 'suppositoire',
        'inhalateur', 'collyre', 'autre'
    ];

    // Initialisation et vérification d'authentification
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken || !storedUser) {
            // Pas connecté - rediriger vers login
            localStorage.setItem('redirectAfterLogin', location.pathname);
            navigate('/login');
            return;
        }
        
        try {
            const userData = JSON.parse(storedUser);
            // Vérifier que c'est une pharmacie ou admin
            if (userData.user_type === 'pharmacy' || userData.user_type === 'admin') {
                setToken(storedToken);
                setIsAuthorized(true);
            } else {
                setError('Accès réservé aux pharmacies et administrateurs');
                // Rediriger vers accueil après 2 secondes
                setTimeout(() => navigate('/'), 2000);
            }
        } catch (err) {
            console.error('Erreur parsing user data:', err);
            localStorage.setItem('redirectAfterLogin', location.pathname);
            navigate('/login');
        }
    }, [navigate, location.pathname]);

    // Charger les médicaments et catégories une fois autorisé
    useEffect(() => {
        if (token) {
            loadMedicines();
            loadCategories();
        }
    }, [token]);

    const loadCategories = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/medicines/categories/`);
            if (response.ok) {
                const data = await response.json();
                // L'API renvoie {categories: [...]} donc on extrait le tableau
                setCategories(data.categories || data || []);
            }
        } catch (err) {
            console.error('Erreur chargement catégories:', err);
            setCategories([]);
        }
    };

    const loadMedicines = async () => {
        setLoading(true);
        try {
            const data = await fetchMedicines();
            setMedicines(data);
            console.log(`✅ ${data.length} médicaments chargés`);
        } catch (err) {
            setError(`Erreur de chargement: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Recherche Wikipedia pour auto-compléter les infos
    const fetchWikipediaInfo = useCallback(async (medicineName) => {
        const nameToSearch = medicineName || formData.name;
        console.log('🔍 fetchWikipediaInfo appelé avec:', nameToSearch);
        
        if (!nameToSearch || nameToSearch.length < 3) {
            console.log('❌ Nom trop court, abandon');
            return;
        }

        // Ne pas rechercher si on vient de chercher ce nom
        if (nameToSearch === lastWikipediaSearch) {
            console.log('⏭️ Déjà recherché, abandon');
            return;
        }

        setWikipediaLoading(true);
        setLastWikipediaSearch(nameToSearch);
        
        try {
            console.log('📡 Appel API Wikipedia...');
            const response = await fetch(
                `${API_BASE_URL}/api/medicines/wikipedia_info/?name=${encodeURIComponent(nameToSearch)}`
            );
            
            if (response.ok) {
                const result = await response.json();
                console.log('📦 Réponse Wikipedia:', result);
                
                // Les données sont dans result.data (structure de l'API)
                const data = result.data || result;
                
                if (data.found || result.found) {
                    console.log('✅ Données trouvées, mise à jour du formulaire');
                    setFormData(prev => {
                        const newData = {
                            ...prev,
                            description: data.description || prev.description,
                            indications: data.indications || prev.indications,
                            posology: data.posology || prev.posology,
                            contraindications: data.contraindications || prev.contraindications,
                            side_effects: data.side_effects || prev.side_effects,
                            wikipedia_url: data.wikipedia_url || ''
                        };
                        console.log('📝 Nouveau formData:', newData);
                        return newData;
                    });
                    setSuccess('✅ Documentation Wikipedia récupérée automatiquement !');
                    setTimeout(() => setSuccess(null), 3000);
                } else {
                    console.log('❌ Données non trouvées dans la réponse');
                }
            } else {
                console.log('❌ Réponse non OK:', response.status);
            }
        } catch (err) {
            console.error('❌ Erreur Wikipedia:', err);
        } finally {
            setWikipediaLoading(false);
        }
    }, [formData.name, lastWikipediaSearch]);

    // Effet pour déclencher la recherche Wikipedia automatiquement
    useEffect(() => {
        // Ne pas rechercher si on édite un médicament existant ou si pas de nom
        if (editingMedicine || !formData.name || formData.name.length < 3) {
            return;
        }

        // Debounce: attendre 800ms après la dernière frappe
        if (wikipediaDebounceRef.current) {
            clearTimeout(wikipediaDebounceRef.current);
        }

        wikipediaDebounceRef.current = setTimeout(() => {
            // Vérifier si la description est vide (pas encore documenté)
            if (!formData.description || formData.description.trim() === '') {
                fetchWikipediaInfo(formData.name);
            }
        }, 800);

        return () => {
            if (wikipediaDebounceRef.current) {
                clearTimeout(wikipediaDebounceRef.current);
            }
        };
    }, [formData.name, formData.description, editingMedicine, fetchWikipediaInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.log('📤 Soumission du formulaire avec formData:', formData);
        
        if (!token) {
            setError('Vous devez être connecté');
            return;
        }
        
        if (!formData.name || !formData.dosage) {
            setError('Nom et dosage sont requis');
            return;
        }
        
        setLoading(true);
        try {
            if (editingMedicine) {
                // Modification
                await updateMedicine(editingMedicine.id, formData, token);
                showSuccess('Médicament modifié avec succès !');
            } else {
                // Création
                await createMedicine(formData, token);
                showSuccess('Médicament ajouté avec succès !');
            }
            
            // Recharger la liste complète depuis le serveur
            await loadMedicines();
            resetForm();
        } catch (err) {
            setError(`Erreur: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            name: medicine.name,
            dosage: medicine.dosage,
            form: medicine.form,
            description: medicine.description || '',
            category: medicine.category || 'autre',
            indications: medicine.indications || '',
            contraindications: medicine.contraindications || '',
            posology: medicine.posology || '',
            side_effects: medicine.side_effects || '',
            average_price: medicine.average_price || '',
            requires_prescription: medicine.requires_prescription
        });
        setShowForm(true);
    };

    const handleDelete = async (medicineId) => {
        if (!token) return;
        
        const confirmed = await showConfirmDialog({
            title: 'Supprimer le médicament',
            message: 'Supprimer ce médicament définitivement ? Tous les stocks associés seront également supprimés.',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            await deleteMedicine(medicineId, token);
            setMedicines(medicines.filter(m => m.id !== medicineId));
            showSuccess('Médicament supprimé avec succès');
        } catch (err) {
            setError(`Impossible de supprimer: ${err.message}`);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            dosage: '',
            form: 'comprimé',
            description: '',
            category: 'autre',
            indications: '',
            contraindications: '',
            posology: '',
            side_effects: '',
            average_price: '',
            requires_prescription: false
        });
        setEditingMedicine(null);
        setShowForm(false);
        setLastWikipediaSearch(''); // Reset pour permettre nouvelle recherche
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    // Filtrage par recherche et catégorie
    const filteredMedicines = medicines.filter(med => {
        const matchesSearch = (med.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (med.dosage || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (med.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || med.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (!token) {
        return (
            <div className="loading-container">
                <h2>🔒 Accès restreint</h2>
                <p>Vous devez être connecté en tant que pharmacie ou administrateur</p>
                <button className="btn-add-stock" onClick={() => window.location.href = '/login'}>
                    Se connecter
                </button>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>
                        <span>💊</span>
                        Gestion des Médicaments
                    </h1>
                    <p>Gérer le catalogue de médicaments</p>
                </div>
                <button 
                    onClick={() => {
                        if (showForm) {
                            resetForm();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    className={`btn-add-stock ${showForm ? 'cancel' : ''}`}
                >
                    <span>{showForm ? '✖' : '➕'}</span>
                    {showForm ? 'Annuler' : 'Ajouter un médicament'}
                </button>
            </div>

            {/* Stats */}
            <div className="stats-grid fade-in">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">💊</span>
                    </div>
                    <div className="stat-value">{medicines.length}</div>
                    <div className="stat-label">Total Médicaments</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">📋</span>
                    </div>
                    <div className="stat-value">
                        {medicines.filter(m => m.requires_prescription).length}
                    </div>
                    <div className="stat-label">Sur Ordonnance</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">🆓</span>
                    </div>
                    <div className="stat-value">
                        {medicines.filter(m => !m.requires_prescription).length}
                    </div>
                    <div className="stat-label">Vente Libre</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">🔍</span>
                    </div>
                    <div className="stat-value">{filteredMedicines.length}</div>
                    <div className="stat-label">Résultats Recherche</div>
                </div>
            </div>

            {/* Messages */}
            {success && (
                <div className="alert alert-success">
                    <span>✅</span>
                    {success}
                    <button className="alert-close" onClick={() => setSuccess(null)}>✖</button>
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    <span>❌</span>
                    {error}
                    <button className="alert-close" onClick={() => setError(null)}>✖</button>
                </div>
            )}

            {/* Formulaire */}
            {showForm && (
                <div className="add-form-container">
                    <h3>
                        {editingMedicine ? '✏️ Modifier le médicament' : '➕ Ajouter un nouveau médicament'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>💊 Nom du médicament *</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Ex: Paracétamol"
                                        required
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fetchWikipediaInfo(formData.name)}
                                        disabled={wikipediaLoading || !formData.name || formData.name.length < 3}
                                        style={{
                                            background: wikipediaLoading ? '#95a5a6' : '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            cursor: formData.name && formData.name.length >= 3 ? 'pointer' : 'not-allowed',
                                            opacity: formData.name && formData.name.length >= 3 ? 1 : 0.5,
                                            minWidth: '120px'
                                        }}
                                        title="Récupérer automatiquement les informations depuis Wikipedia"
                                    >
                                        {wikipediaLoading ? '⏳ Recherche...' : '📚 Wikipedia'}
                                    </button>
                                </div>
                                <small style={{ color: '#7f8c8d', fontSize: '12px', marginTop: '4px' }}>
                                    💡 La documentation se remplit automatiquement après 3 caractères
                                </small>
                            </div>

                            <div className="form-group">
                                <label>📊 Dosage *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.dosage}
                                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                                    placeholder="Ex: 500mg"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>💊 Forme</label>
                                <select
                                    className="form-select"
                                    value={formData.form}
                                    onChange={(e) => setFormData({...formData, form: e.target.value})}
                                >
                                    {formTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>🏷️ Catégorie</label>
                                <select
                                    className="form-select"
                                    value={formData.category}
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>💵 Prix moyen (XAF)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    value={formData.average_price}
                                    onChange={(e) => setFormData({...formData, average_price: e.target.value})}
                                    placeholder="Ex: 2500"
                                />
                            </div>

                            <div className="form-group">
                                <label>Ordonnance requise</label>
                                <div className="form-checkbox-group">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={formData.requires_prescription}
                                        onChange={(e) => setFormData({...formData, requires_prescription: e.target.checked})}
                                    />
                                    <span>Ce médicament nécessite une ordonnance</span>
                                </div>
                            </div>

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>📝 Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Description du médicament"
                                    rows="2"
                                />
                            </div>

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>✅ Indications (à quoi sert ce médicament)</label>
                                <textarea
                                    className="form-input"
                                    value={formData.indications}
                                    onChange={(e) => setFormData({...formData, indications: e.target.value})}
                                    placeholder="Ex: Douleurs, fièvre, maux de tête..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>⚠️ Contre-indications</label>
                                <textarea
                                    className="form-input"
                                    value={formData.contraindications}
                                    onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
                                    placeholder="Ex: Allergie au paracétamol, insuffisance hépatique..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>💊 Posologie (dosage recommandé)</label>
                                <textarea
                                    className="form-input"
                                    value={formData.posology}
                                    onChange={(e) => setFormData({...formData, posology: e.target.value})}
                                    placeholder="Ex: 1 comprimé 3 fois par jour..."
                                    rows="2"
                                />
                            </div>

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>⚡ Effets secondaires</label>
                                <textarea
                                    className="form-input"
                                    value={formData.side_effects}
                                    onChange={(e) => setFormData({...formData, side_effects: e.target.value})}
                                    placeholder="Ex: Nausées, vertiges..."
                                    rows="2"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={resetForm}>
                                Annuler
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Traitement...' : editingMedicine ? '✅ Modifier' : '✅ Ajouter'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Barre de recherche et filtre */}
            <div className="add-form-container" style={{marginTop: '20px'}}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: 2, minWidth: '250px' }}>
                        <label>🔍 Rechercher un médicament</label>
                        <input
                            type="text"
                            className="form-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher par nom, dosage ou description..."
                        />
                    </div>
                    <div className="form-group" style={{ flex: 1, minWidth: '200px' }}>
                        <label>🏷️ Filtrer par catégorie</label>
                        <select
                            className="form-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Toutes les catégories</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Liste des médicaments */}
            {loading && !showForm ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement des médicaments...</p>
                </div>
            ) : filteredMedicines.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>{searchTerm ? 'Aucun résultat' : 'Aucun médicament enregistré'}</h3>
                    <p>{searchTerm ? 'Essayez une autre recherche' : 'Cliquez sur "Ajouter un médicament" pour commencer'}</p>
                </div>
            ) : (
                <div className="stocks-container fade-in">
                    <div className="stocks-header">
                        <h2>
                            <span>📦</span>
                            Catalogue des Médicaments
                            <span className="stocks-count">{filteredMedicines.length}</span>
                        </h2>
                    </div>

                    <table className="stocks-table">
                        <thead>
                            <tr>
                                <th>💊 Médicament</th>
                                <th>📊 Dosage</th>
                                <th>🏷️ Catégorie</th>
                                <th>💵 Prix Moyen</th>
                                <th>📋 Ordonnance</th>
                                <th>⚙️ Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMedicines.map((medicine) => (
                                <tr key={medicine.id}>
                                    <td>
                                        <div className="medicine-info">
                                            <Link 
                                                to={`/medicines/${medicine.id}`}
                                                style={{ 
                                                    color: '#2ecc71', 
                                                    textDecoration: 'none',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {medicine.name}
                                            </Link>
                                            {medicine.description && (
                                                <span className="medicine-details">
                                                    {medicine.description.substring(0, 50)}
                                                    {medicine.description.length > 50 ? '...' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="price-display">{medicine.dosage}</span>
                                    </td>
                                    <td>
                                        <span className="medicine-details">
                                            {medicine.category_display || medicine.category || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="price-display">
                                            {medicine.average_price 
                                                ? `${parseFloat(medicine.average_price).toLocaleString('fr-FR')} XAF`
                                                : '-'
                                            }
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${medicine.requires_prescription ? 'unavailable' : 'available'}`}>
                                            {medicine.requires_prescription ? '📋 Oui' : '🆓 Non'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <Link
                                                to={`/medicines/${medicine.id}`}
                                                style={{
                                                    background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    marginRight: '8px',
                                                    textDecoration: 'none'
                                                }}
                                                title="Voir détails"
                                            >
                                                👁️
                                            </Link>
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={() => handleEdit(medicine)}
                                                title="Modifier"
                                                style={{
                                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                    color: 'white',
                                                    border: 'none',
                                                    padding: '8px 12px',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    marginRight: '8px'
                                                }}
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(medicine.id)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MedicineManager;
