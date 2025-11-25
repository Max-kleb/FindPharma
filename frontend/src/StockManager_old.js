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

    // 1. Chargement des données au montage du composant
    useEffect(() => {
        // Récupérer l'ID de la pharmacie et le token depuis localStorage
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setPharmacyId(userData.pharmacy);
            setPharmacyName(userData.pharmacy_name || 'Ma Pharmacie');
        }
        
        if (storedToken) {
            setToken(storedToken);
        }
        
        const loadProducts = async () => {
            if (!pharmacyId || !storedToken) {
                setError("Vous devez être connecté en tant que pharmacie");
                setLoading(false);
                return;
            }
            
            setLoading(true);
            try {
                const data = await fetchPharmacyStocks(pharmacyId, storedToken);
                setProducts(data);
            } catch (err) {
                setError("Erreur de chargement des produits. Le Back-end est-il lancé ?");
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    // 2. Fonction pour mettre à jour le stock
    const handleStockChange = async (productId, newStock) => {
        if (newStock < 0 || isNaN(newStock)) return;
        
        // 🛠️ Mettre à jour l'état local immédiatement pour une meilleure UX
        setProducts(products.map(p => 
            p.id === productId ? { ...p, stock: newStock } : p
        ));

        try {
            // 💡 Appel API pour informer Franck (le Back-end) de la nouvelle valeur
            // await updateStock(productId, newStock);
            console.log(`Stock du produit ${productId} mis à jour à ${newStock} (API appelée)`);
        } catch (err) {
            console.error("Échec de la mise à jour du stock via l'API", err);
            setError("Impossible de sauvegarder la modification.");
            // ⚠️ En cas d'erreur, il faudrait idéalement revenir à l'ancien stock
        }
    };

    if (loading) return <div className="loading-message">Chargement des stocks...</div>;
    if (error) return <div className="error-message">Erreur : {error}</div>;

    // 3. Rendu du Tableau
    return (
        <div className="stock-manager-container">
            <h2>Gestion de mes produits et stocks</h2>
            <p>Mettez à jour le stock pour que les utilisateurs voient la disponibilité en temps réel.</p>
            
            <table className="products-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom du produit</th>
                        <th>Prix (€)</th>
                        <th>Stock Actuel</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.price.toFixed(2)}</td>
                            <td>
                                {/* Champ de saisie pour modifier le stock */}
                                <input
                                    type="number"
                                    min="0"
                                    value={product.stock}
                                    onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                                    className="stock-input"
                                />
                            </td>
                            <td>
                                {/* Bouton non nécessaire si la mise à jour est automatique (onChange) */}
                                <button disabled className="save-button">Enregistré (Auto)</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StockManager;