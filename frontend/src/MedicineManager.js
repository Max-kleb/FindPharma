import React, { useState, useEffect } from 'react';
import { 
  fetchMedicines, 
  createMedicine, 
  updateMedicine, 
  deleteMedicine 
} from './services/api';
import './StockManager.css'; // Réutiliser le même CSS

const MedicineManager = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [token, setToken] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        dosage: '',
        form: 'comprimé',
        description: '',
        average_price: '',
        requires_prescription: false
    });

    const formTypes = [
        'comprimé', 'gélule', 'sirop', 'injection', 
        'crème', 'pommade', 'autre'
    ];

    // Initialisation
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser && storedToken) {
            try {
                const userData = JSON.parse(storedUser);
                // Vérifier que c'est une pharmacie ou admin
                if (userData.user_type === 'pharmacy' || userData.user_type === 'admin') {
                    setToken(storedToken);
                } else {
                    setError('Accès réservé aux pharmacies et administrateurs');
                }
            } catch (err) {
                console.error('Erreur parsing user data:', err);
            }
        }
    }, []);

    // Charger les médicaments
    useEffect(() => {
        loadMedicines();
    }, []);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
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
                const updated = await updateMedicine(editingMedicine.id, formData, token);
                setMedicines(medicines.map(m => m.id === updated.id ? updated : m));
                showSuccess('Médicament modifié avec succès !');
            } else {
                // Création
                const created = await createMedicine(formData, token);
                setMedicines([...medicines, created]);
                showSuccess('Médicament ajouté avec succès !');
            }
            
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
            average_price: medicine.average_price || '',
            requires_prescription: medicine.requires_prescription
        });
        setShowForm(true);
    };

    const handleDelete = async (medicineId) => {
        if (!token) return;
        
        if (!window.confirm('Supprimer ce médicament définitivement ? Tous les stocks associés seront également supprimés.')) {
            return;
        }
        
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
            average_price: '',
            requires_prescription: false
        });
        setEditingMedicine(null);
        setShowForm(false);
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    // Filtrage par recherche
    const filteredMedicines = medicines.filter(med => 
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.dosage.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Ex: Paracétamol"
                                    required
                                />
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

                            <div className="form-group" style={{gridColumn: '1 / -1'}}>
                                <label>📝 Description</label>
                                <textarea
                                    className="form-input"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Description du médicament (optionnel)"
                                    rows="3"
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

            {/* Barre de recherche */}
            <div className="add-form-container" style={{marginTop: '20px'}}>
                <div className="form-group">
                    <label>🔍 Rechercher un médicament</label>
                    <input
                        type="text"
                        className="form-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher par nom ou dosage..."
                    />
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
                                <th>💊 Forme</th>
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
                                            <span className="medicine-name">{medicine.name}</span>
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
                                            {medicine.form.charAt(0).toUpperCase() + medicine.form.slice(1)}
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
