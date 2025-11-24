// src/FilterControls.js
import React, { useState } from 'react';

// Accepte les filtres actuels et la fonction pour les mettre à jour
function FilterControls({ currentFilters, onApplyFilters, onClose }) {
  // Utilisez l'état local pour manipuler les valeurs avant l'application
  const [prixMax, setPrixMax] = useState(currentFilters.prixMax || 50000); // Valeur par défaut 50000 XAF
  
  // Note : Le filtre par distance est omis ici pour maintenir la simplicité 
  // car il nécessite une logique complexe de calcul GPS côté Django.

  const handleApply = () => {
    // Transmet les nouveaux filtres au composant parent (SearchSection)
    onApplyFilters({
      prixMax: prixMax,
    });
    onClose(); // Ferme le panneau après l'application
  };

  // Petite fonction utilitaire pour formater la valeur
  const formatXAF = (value) => value.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 });

  return (
    <div className="filter-controls-modal">
      <div className="filter-controls-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <h3>Filtres de Recherche</h3>
        
        {/* Filtre par Prix Max */}
        <div className="filter-group">
          <label>Prix Max : **{formatXAF(prixMax)}**</label>
          <input 
            type="range" 
            min="1000" 
            max="100000" 
            step="1000"
            value={prixMax} 
            onChange={(e) => setPrixMax(Number(e.target.value))} 
            className="price-slider"
          />
        </div>
        
        <button onClick={handleApply} className="apply-button">Appliquer les Filtres</button>
      </div>
    </div>
  );
}

export default FilterControls;