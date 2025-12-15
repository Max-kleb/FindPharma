/**
 * MedicineDetailPage.js
 * Page de détail d'un médicament avec toutes les informations documentaires
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './MedicineDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const MedicineDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pharmaciesWithStock, setPharmaciesWithStock] = useState([]);

  useEffect(() => {
    fetchMedicineDetails();
  }, [id]);

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/medicines/${id}/`);
      
      if (!response.ok) {
        throw new Error('Médicament non trouvé');
      }
      
      const data = await response.json();
      setMedicine(data);
      
      // Charger les pharmacies qui ont ce médicament en stock
      await fetchPharmaciesWithStock(data.name);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPharmaciesWithStock = async (medicineName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pharmacies/search_by_medicine/?medicine_name=${encodeURIComponent(medicineName)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setPharmaciesWithStock(data.results || data || []);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des pharmacies:', err);
    }
  };

  // Mapping des catégories vers des labels lisibles
  const categoryLabels = {
    analgesique: { label: 'Analgésique', icon: '💊', color: '#e74c3c' },
    antibiotique: { label: 'Antibiotique', icon: '🦠', color: '#3498db' },
    antipaludeen: { label: 'Antipaludéen', icon: '🦟', color: '#27ae60' },
    antiviral: { label: 'Antiviral', icon: '🔬', color: '#9b59b6' },
    anti_inflammatoire: { label: 'Anti-inflammatoire', icon: '🔥', color: '#e67e22' },
    antihistaminique: { label: 'Antihistaminique', icon: '🌸', color: '#f1c40f' },
    antidiabetique: { label: 'Antidiabétique', icon: '🩸', color: '#1abc9c' },
    antihypertenseur: { label: 'Antihypertenseur', icon: '❤️', color: '#c0392b' },
    cardiovasculaire: { label: 'Cardiovasculaire', icon: '💓', color: '#d35400' },
    digestif: { label: 'Digestif', icon: '🫁', color: '#16a085' },
    respiratoire: { label: 'Respiratoire', icon: '💨', color: '#2980b9' },
    dermatologique: { label: 'Dermatologique', icon: '🧴', color: '#8e44ad' },
    ophtalmologique: { label: 'Ophtalmologique', icon: '👁️', color: '#2c3e50' },
    vitamine: { label: 'Vitamine', icon: '🍊', color: '#f39c12' },
    contraceptif: { label: 'Contraceptif', icon: '💜', color: '#9b59b6' },
    antiparasitaire: { label: 'Antiparasitaire', icon: '🐛', color: '#27ae60' },
    psychotrope: { label: 'Psychotrope', icon: '🧠', color: '#34495e' },
    autre: { label: 'Autre', icon: '💊', color: '#95a5a6' },
  };

  if (loading) {
    return (
      <div className="medicine-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medicine-detail-page">
        <div className="error-container">
          <h2>❌ Erreur</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Retour
          </button>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return null;
  }

  const categoryInfo = categoryLabels[medicine.category] || categoryLabels.autre;

  return (
    <div className="medicine-detail-page">
      <div className="medicine-detail-container">
        {/* Header avec bouton retour */}
        <div className="medicine-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Retour
          </button>
          
          <div className="medicine-title-section">
            <span 
              className="category-badge"
              style={{ backgroundColor: categoryInfo.color }}
            >
              {categoryInfo.icon} {categoryInfo.label}
            </span>
            <h1>{medicine.name}</h1>
            <p className="medicine-subtitle">
              {medicine.dosage} - {medicine.form}
            </p>
          </div>

          {medicine.requires_prescription && (
            <div className="prescription-badge">
              <span>📋</span> Ordonnance requise
            </div>
          )}
        </div>

        {/* Description principale */}
        <section className="medicine-section description-section">
          <h2>📝 Description</h2>
          <p>{medicine.description || 'Aucune description disponible.'}</p>
        </section>

        {/* Grille d'informations */}
        <div className="info-grid">
          {/* Indications */}
          <section className="medicine-section">
            <h2>✅ Indications</h2>
            <p>{medicine.indications || 'Non renseigné'}</p>
          </section>

          {/* Contre-indications */}
          <section className="medicine-section warning-section">
            <h2>⚠️ Contre-indications</h2>
            <p>{medicine.contraindications || 'Non renseigné'}</p>
          </section>

          {/* Posologie */}
          <section className="medicine-section">
            <h2>💊 Posologie</h2>
            <p>{medicine.posology || 'Non renseigné'}</p>
          </section>

          {/* Effets secondaires */}
          <section className="medicine-section warning-section">
            <h2>⚡ Effets secondaires</h2>
            <p>{medicine.side_effects || 'Non renseigné'}</p>
          </section>
        </div>

        {/* Lien Wikipedia */}
        {medicine.wikipedia_url && (
          <section className="medicine-section">
            <h2>📚 En savoir plus</h2>
            <a 
              href={medicine.wikipedia_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="wikipedia-link"
            >
              🔗 Voir sur Wikipedia
            </a>
          </section>
        )}

        {/* Pharmacies avec stock */}
        <section className="medicine-section pharmacies-section">
          <h2>🏥 Pharmacies disposant de ce médicament</h2>
          
          {pharmaciesWithStock.length > 0 ? (
            <div className="pharmacies-list">
              {pharmaciesWithStock.slice(0, 5).map((pharmacy) => (
                <div key={pharmacy.id} className="pharmacy-card">
                  <div className="pharmacy-info">
                    <h3>{pharmacy.name}</h3>
                    <p>{pharmacy.address}</p>
                    {pharmacy.phone && <p>📞 {pharmacy.phone}</p>}
                  </div>
                  <div className="pharmacy-stock">
                    {pharmacy.stock_quantity && (
                      <span className="stock-badge">
                        {pharmacy.stock_quantity} en stock
                      </span>
                    )}
                    {pharmacy.price && (
                      <span className="price-badge">
                        {pharmacy.price.toLocaleString()} FCFA
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {pharmaciesWithStock.length > 5 && (
                <p className="more-pharmacies">
                  +{pharmaciesWithStock.length - 5} autres pharmacies...
                </p>
              )}
            </div>
          ) : (
            <p className="no-pharmacies">
              Aucune pharmacie n'a ce médicament en stock actuellement.
            </p>
          )}
        </section>

        {/* Disclaimer médical */}
        <div className="medical-disclaimer">
          <p>
            ⚕️ <strong>Avertissement :</strong> Ces informations sont fournies à titre 
            indicatif et ne remplacent pas l'avis d'un professionnel de santé. 
            Consultez toujours un médecin ou un pharmacien avant de prendre un médicament.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
