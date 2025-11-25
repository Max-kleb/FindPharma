import React, { useState, useEffect } from 'react';
import { 
  fetchPharmacyStocks, 
  addStock, 
  updateStock, 
  deleteStock,
  toggleStockAvailability,
  fetchMedicines
} from './services/api';

const StockManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [medicines, setMedicines] = useState([]);
    const [pharmacyId, setPharmacyId] = useState(null);
    const [token, setToken] = useState(null);
    const [pharmacyName, setPharmacyName] = useState('');
    
    // Nouveau stock à ajouter
    const [newStock, setNewStock] = useState({
        medicine: '',
        quantity: '',
        price: '',
        is_available: true
    });

    // 1. Initialisation : Récupérer les infos de la pharmacie connectée
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

    // 2. Charger les stocks quand pharmacyId est disponible
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
    
    // 3. Charger la liste des médicaments pour le formulaire d'ajout
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

    // 4. Mettre à jour la quantité d'un stock
    const handleStockChange = async (stockId, field, value) => {
        if (!pharmacyId || !token) return;
        
        // Mise à jour optimiste (UI)
        setProducts(products.map(p => 
            p.id === stockId ? { ...p, [field]: value } : p
        ));

        try {
            await updateStock(pharmacyId, stockId, { [field]: value }, token);
            showSuccess('Stock mis à jour avec succès');
        } catch (err) {
            setError(`Impossible de sauvegarder: ${err.message}`);
            // Recharger les données en cas d'erreur
            const data = await fetchPharmacyStocks(pharmacyId, token);
            setProducts(data);
        }
    };

    // 5. Ajouter un nouveau stock
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

    // 6. Supprimer un stock
    const handleDelete = async (stockId) => {
        if (!pharmacyId || !token) return;
        
        if (!window.confirm('Supprimer ce stock définitivement ?')) return;
        
        try {
            await deleteStock(pharmacyId, stockId, token);
            setProducts(products.filter(p => p.id !== stockId));
            showSuccess('Stock supprimé avec succès');
        } catch (err) {
            setError(`Impossible de supprimer: ${err.message}`);
        }
    };

    // 7. Toggle disponibilité
    const handleToggleAvailability = async (stockId, currentStatus) => {
        if (!pharmacyId || !token) return;
        
        try {
            await toggleStockAvailability(pharmacyId, stockId, !currentStatus, token);
            setProducts(products.map(p => 
                p.id === stockId ? { ...p, is_available: !currentStatus } : p
            ));
            showSuccess(`Stock ${!currentStatus ? 'disponible' : 'indisponible'}`);
        } catch (err) {
            setError(`Erreur changement disponibilité: ${err.message}`);
        }
    };

    // Helpers pour les messages
    const showSuccess = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(null), 3000);
    };

    // Si pas de pharmacyId, afficher message de connexion
    if (!pharmacyId || !token) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h2>🔒 Accès restreint</h2>
                <p>Vous devez être connecté en tant que pharmacie pour accéder à cette page.</p>
                <button onClick={() => window.location.href = '/login'}>
                    Se connecter
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1>📦 Gestion des Stocks</h1>
                    <p style={{ color: '#666' }}>{pharmacyName}</p>
                </div>
                <button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    {showAddForm ? '✖ Annuler' : '➕ Ajouter un médicament'}
                </button>
            </div>

            {/* Messages de succès/erreur */}
            {success && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px'
                }}>
                    ✅ {success}
                </div>
            )}

            {error && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px'
                }}>
                    ❌ {error}
                    <button 
                        onClick={() => setError(null)} 
                        style={{ 
                            float: 'right', 
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            fontSize: '1.2rem'
                        }}
                    >
                        ✖
                    </button>
                </div>
            )}

            {/* Formulaire d'ajout */}
            {showAddForm && (
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    marginBottom: '2rem'
                }}>
                    <h3>Ajouter un nouveau stock</h3>
                    <form onSubmit={handleAddStock}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>Médicament *</label>
                                <select
                                    value={newStock.medicine}
                                    onChange={(e) => setNewStock({...newStock, medicine: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {medicines.map(med => (
                                        <option key={med.id} value={med.id}>
                                            {med.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Quantité *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={newStock.quantity}
                                    onChange={(e) => setNewStock({...newStock, quantity: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                                />
                            </div>
                            <div>
                                <label>Prix (FCFA) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={newStock.price}
                                    onChange={(e) => setNewStock({...newStock, price: e.target.value})}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'flex', alignItems: 'center', marginTop: '2rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={newStock.is_available}
                                        onChange={(e) => setNewStock({...newStock, is_available: e.target.checked})}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    Disponible à la vente
                                </label>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '0.75rem 2rem',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '1rem'
                            }}
                        >
                            {loading ? 'Ajout en cours...' : '✅ Ajouter'}
                        </button>
                    </form>
                </div>
            )}

            {/* Tableau des stocks */}
            {loading && !showAddForm ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p>Chargement des stocks...</p>
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>
                        📭 Aucun stock enregistré
                    </p>
                    <p>Cliquez sur "Ajouter un médicament" pour commencer</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Médicament</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Quantité</th>
                                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Prix (FCFA)</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Disponibilité</th>
                                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product) => (
                                <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <strong>{product.medicine?.name || 'Médicament'}</strong>
                                        {product.medicine?.description && (
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                                {product.medicine.description}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={product.quantity}
                                            onChange={(e) => handleStockChange(product.id, 'quantity', parseInt(e.target.value))}
                                            style={{
                                                width: '80px',
                                                padding: '0.5rem',
                                                textAlign: 'center',
                                                border: '1px solid #ddd',
                                                borderRadius: '3px'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={product.price}
                                            onChange={(e) => handleStockChange(product.id, 'price', parseFloat(e.target.value))}
                                            style={{
                                                width: '120px',
                                                padding: '0.5rem',
                                                textAlign: 'right',
                                                border: '1px solid #ddd',
                                                borderRadius: '3px'
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleToggleAvailability(product.id, product.is_available)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: product.is_available ? '#28a745' : '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '20px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                        >
                                            {product.is_available ? '✅ Disponible' : '❌ Indisponible'}
                                        </button>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '3px',
                                                cursor: 'pointer',
                                                fontSize: '0.85rem'
                                            }}
                                            title="Supprimer ce stock"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '1rem', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        Total : {products.length} médicament{products.length > 1 ? 's' : ''} en stock
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockManager;
