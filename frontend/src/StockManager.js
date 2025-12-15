import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  fetchPharmacyStocks, 
  addStock, 
  updateStock, 
  deleteStock,
  toggleStockAvailability,
  fetchMedicines
} from './services/api';
import { showConfirmDialog } from './components/NotificationSystem';
import './StockManager.css';

const StockManager = () => {
    const { t } = useTranslation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [pharmacyId, setPharmacyId] = useState(null);
    const [token, setToken] = useState(null);
    const [pharmacyName, setPharmacyName] = useState('');
    
    const [newStock, setNewStock] = useState({
        medicine: '',
        quantity: '',
        price: '',
        is_available: true
    });

    // Calcul des statistiques
    const stats = useMemo(() => {
        const total = products.length;
        const available = products.filter(p => p.is_available).length;
        const lowStock = products.filter(p => p.quantity < 20).length;
        const totalValue = products.reduce((sum, p) => sum + (p.quantity * parseFloat(p.price || 0)), 0);
        
        return { total, available, lowStock, totalValue };
    }, [products]);

    // 1. Initialisation
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setPharmacyId(userData.pharmacy);
                setPharmacyName(userData.pharmacy_name || 'Ma Pharmacie');
                setToken(storedToken);
            } catch (err) {
                console.error('Erreur parsing user data:', err);
            }
        }
    }, []);

    // 2. Charger les stocks
    useEffect(() => {
        if (!pharmacyId || !token) return;
        
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchPharmacyStocks(pharmacyId, token);
                setProducts(data);
                console.log(`✅ ${data.length} stocks chargés`);
            } catch (err) {
                setError(`Erreur de chargement des stocks: ${err.message}`);
                console.error('❌ Erreur:', err);
            } finally {
                setLoading(false);
            }
        };
        
        loadProducts();
    }, [pharmacyId, token]);
    
    // 3. Charger la liste des médicaments
    useEffect(() => {
        const loadMedicines = async () => {
            try {
                const data = await fetchMedicines();
                setMedicines(data);
                console.log(`✅ ${data.length} médicaments disponibles`);
            } catch (err) {
                console.error('❌ Erreur chargement médicaments:', err);
            }
        };
        loadMedicines();
    }, []);

    const handleStockChange = async (stockId, field, value) => {
        if (!pharmacyId || !token) return;
        
        setProducts(products.map(p => 
            p.id === stockId ? { ...p, [field]: value } : p
        ));

        try {
            await updateStock(pharmacyId, stockId, { [field]: value }, token);
            showSuccess('Stock mis à jour avec succès');
        } catch (err) {
            setError(`Impossible de sauvegarder: ${err.message}`);
            const data = await fetchPharmacyStocks(pharmacyId, token);
            setProducts(data);
        }
    };

    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!pharmacyId || !token) return;
        
        if (!newStock.medicine || !newStock.quantity || !newStock.price) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        
        setLoading(true);
        try {
            const createdStock = await addStock(pharmacyId, {
                medicine: parseInt(newStock.medicine),
                quantity: parseInt(newStock.quantity),
                price: parseFloat(newStock.price),
                is_available: newStock.is_available
            }, token);
            
            setProducts([...products, createdStock]);
            setNewStock({ medicine: '', quantity: '', price: '', is_available: true });
            setShowAddForm(false);
            showSuccess('Stock ajouté avec succès !');
        } catch (err) {
            setError(`Erreur lors de l'ajout: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (stockId) => {
        if (!pharmacyId || !token) return;
        
        const confirmed = await showConfirmDialog({
            title: 'Supprimer le stock',
            message: 'Supprimer ce stock définitivement ?',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        });
        
        if (!confirmed) return;
        
        try {
            await deleteStock(pharmacyId, stockId, token);
            setProducts(products.filter(p => p.id !== stockId));
            showSuccess('Stock supprimé avec succès');
        } catch (err) {
            setError(`Impossible de supprimer: ${err.message}`);
        }
    };

    const handleToggleAvailability = async (stockId, currentStatus) => {
        if (!pharmacyId || !token) return;
        
        try {
            await toggleStockAvailability(pharmacyId, stockId, !currentStatus, token);
            setProducts(products.map(p => 
                p.id === stockId ? { ...p, is_available: !currentStatus } : p
            ));
            showSuccess(!currentStatus ? t('stocks.inStock') : t('stocks.outOfStock'));
        } catch (err) {
            setError(`${t('common.error')}: ${err.message}`);
        }
    };

    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    if (!pharmacyId || !token) {
        return (
            <div className="loading-container">
                <h2>🔒 {t('errors.unauthorized')}</h2>
                <p>{t('register.pharmacyHelp')}</p>
                <button className="btn-add-stock" onClick={() => window.location.href = '/login'}>
                    {t('auth.loginButton')}
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
                        <span>📊</span>
                        {t('stocks.title')}
                    </h1>
                    <p>{pharmacyName}</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className={`btn-add-stock ${showAddForm ? 'cancel' : ''}`}
                >
                    <span>{showAddForm ? '✖' : '➕'}</span>
                    {showAddForm ? t('common.cancel') : t('stocks.addStock')}
                </button>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid fade-in">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">💊</span>
                    </div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">{t('admin.stats.totalMedicines')}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">✅</span>
                    </div>
                    <div className="stat-value">{stats.available}</div>
                    <div className="stat-label">{t('search.available')}</div>
                    <div className="stat-change positive">
                        ↗ {((stats.available / stats.total) * 100).toFixed(0)}% {t('common.total')}
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">⚠️</span>
                    </div>
                    <div className="stat-value">{stats.lowStock}</div>
                    <div className="stat-label">{t('stocks.lowStock')}</div>
                    {stats.lowStock > 0 && (
                        <div className="stat-change negative">
                            ↘ {t('common.warning')}
                        </div>
                    )}
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <span className="stat-icon">💰</span>
                    </div>
                    <div className="stat-value">{stats.totalValue.toLocaleString('fr-FR', {maximumFractionDigits: 0})}</div>
                    <div className="stat-label">{t('common.total')} ({t('units.xaf')})</div>
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

            {/* Form */}
            {showAddForm && (
                <div className="add-form-container">
                    <h3>➕ {t('stocks.addStock')}</h3>
                    <form onSubmit={handleAddStock}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>💊 {t('stocks.medicine')}</label>
                                <select
                                    className="form-select"
                                    value={newStock.medicine}
                                    onChange={(e) => setNewStock({...newStock, medicine: e.target.value})}
                                    required
                                >
                                    <option value="">-- {t('stocks.selectMedicine')} --</option>
                                    {medicines.map(med => (
                                        <option key={med.id} value={med.id}>
                                            {med.name} - {med.dosage} ({med.form})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>📦 {t('stocks.quantity')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="0"
                                    value={newStock.quantity}
                                    onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                                    placeholder={t('stocks.quantityPlaceholder')}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>💵 {t('stocks.price')} ({t('units.xaf')})</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    min="0"
                                    step="0.01"
                                    value={newStock.price}
                                    onChange={(e) => setNewStock({...newStock, price: e.target.value})}
                                    placeholder={t('stocks.pricePlaceholder')}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>{t('stocks.status')}</label>
                                <div className="form-checkbox-group">
                                    <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={newStock.is_available}
                                        onChange={(e) => setNewStock({...newStock, is_available: e.target.checked})}
                                    />
                                    <span>{t('search.available')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                                {t('common.cancel')}
                            </button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? t('common.loading') : '✅ ' + t('common.add')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading && !showAddForm ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            ) : products.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">📭</div>
                    <h3>{t('stocks.noStocks')}</h3>
                    <p>{t('stocks.addFirst')}</p>
                </div>
            ) : (
                <div className="stocks-container fade-in">
                    <div className="stocks-header">
                        <h2>
                            <span>📦</span>
                            {t('stocks.title')}
                            <span className="stocks-count">{products.length}</span>
                        </h2>
                    </div>

                    <table className="stocks-table">
                        <thead>
                            <tr>
                                <th>💊 {t('stocks.medicine')}</th>
                                <th>📦 {t('stocks.quantity')}</th>
                                <th>💵 {t('stocks.price')} ({t('units.xaf')})</th>
                                <th>📊 {t('stocks.status')}</th>
                                <th>⚙️ {t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        <div className="medicine-info">
                                            <span className="medicine-name">{product.medicine?.name || t('stocks.medicine')}</span>
                                            <span className="medicine-details">
                                                {product.medicine?.dosage} • {product.medicine?.form}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            className="quantity-input"
                                            min="0"
                                            value={product.quantity}
                                            onChange={(e) => handleStockChange(product.id, 'quantity', parseInt(e.target.value))}
                                        />
                                    </td>
                                    <td>
                                        <span className="price-display">
                                            {parseFloat(product.price).toLocaleString('fr-FR')}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-badge ${product.is_available ? 'available' : 'unavailable'}`}
                                            onClick={() => handleToggleAvailability(product.id, product.is_available)}
                                        >
                                            <span>{product.is_available ? '✅' : '❌'}</span>
                                            {product.is_available ? t('stocks.inStock') : t('stocks.outOfStock')}
                                        </button>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <button
                                                className="btn-action btn-delete"
                                                onClick={() => handleDelete(product.id)}
                                                title={t('common.delete')}
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

export default StockManager;
