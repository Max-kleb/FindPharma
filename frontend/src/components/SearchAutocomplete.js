/**
 * SearchAutocomplete.js
 * Composant de recherche avec auto-complétion intelligente
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './SearchAutocomplete.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Icônes par catégorie
const categoryIcons = {
  analgesique: '💊',
  antibiotique: '🦠',
  antipaludeen: '🦟',
  antiviral: '🔬',
  anti_inflammatoire: '🔥',
  antihistaminique: '🌸',
  antidiabetique: '🩸',
  antihypertenseur: '❤️',
  cardiovasculaire: '💓',
  digestif: '🫁',
  respiratoire: '💨',
  dermatologique: '🧴',
  ophtalmologique: '👁️',
  vitamine: '🍊',
  contraceptif: '💜',
  antiparasitaire: '🐛',
  psychotrope: '🧠',
  autre: '💊',
};

const SearchAutocomplete = ({ 
  onSearch, 
  onSelect, 
  placeholder = "Rechercher un médicament...",
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [popularMeds, setPopularMeds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Charger les recherches récentes depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentMedicineSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 5));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
    
    // Charger les médicaments populaires
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/medicines/popular/`);
      if (response.ok) {
        const data = await response.json();
        setPopularMeds(data.popular || []);
      }
    } catch (err) {
      console.error('Error fetching popular medicines:', err);
    }
  };

  // Auto-complétion avec debounce
  const fetchSuggestions = useCallback(async (searchQuery) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/medicines/autocomplete/?q=${encodeURIComponent(searchQuery)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Autocomplete error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce de la recherche
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchSuggestions]);

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sauvegarder une recherche récente
  const saveRecentSearch = (searchTerm) => {
    const updated = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(updated);
    localStorage.setItem('recentMedicineSearches', JSON.stringify(updated));
  };

  // Gérer la sélection
  const handleSelect = (value) => {
    setQuery(value);
    setIsOpen(false);
    saveRecentSearch(value);
    
    if (onSelect) {
      onSelect(value);
    }
    if (onSearch) {
      onSearch(value);
    }
  };

  // Gérer la soumission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  // Navigation au clavier
  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : 
                  (query.length === 0 ? [...recentSearches.map(s => ({value: s})), ...popularMeds.map(p => ({value: p.name}))] : []);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleSelect(items[selectedIndex].value || items[selectedIndex].name);
        } else if (query.trim()) {
          handleSelect(query.trim());
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Effacer la recherche
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Effacer les recherches récentes
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentMedicineSearches');
  };

  return (
    <div className={`search-autocomplete ${className}`}>
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          {/* Loupe visible seulement quand le champ est vide et pas en chargement */}
          {!query && !isLoading && (
            <i className="fas fa-search search-icon"></i>
          )}
          {/* Spinner pendant le chargement */}
          {isLoading && (
            <i className="fas fa-spinner fa-spin search-icon"></i>
          )}
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`search-input ${query ? 'has-text' : ''}`}
            autoComplete="off"
          />
          
          {query && (
            <button 
              type="button" 
              className="clear-btn"
              onClick={clearSearch}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          
          <button type="submit" className="search-btn">
            <i className="fas fa-arrow-right"></i>
          </button>
        </div>
      </form>

      {/* Dropdown */}
      {isOpen && (
        <div ref={dropdownRef} className="autocomplete-dropdown">
          {/* Suggestions de recherche */}
          {suggestions.length > 0 && (
            <div className="dropdown-section">
              <div className="section-title">
                <i className="fas fa-lightbulb"></i> Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={`${suggestion.value}-${index}`}
                  className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelect(suggestion.value)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="item-icon">
                    {categoryIcons[suggestion.category] || '💊'}
                  </span>
                  <span className="item-text">{suggestion.display}</span>
                  {suggestion.type === 'name' && (
                    <span className="item-badge">Nom</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Recherches récentes */}
          {query.length === 0 && recentSearches.length > 0 && (
            <div className="dropdown-section">
              <div className="section-title">
                <i className="fas fa-history"></i> Recherches récentes
                <button 
                  className="clear-history-btn"
                  onClick={clearRecentSearches}
                >
                  Effacer
                </button>
              </div>
              {recentSearches.map((search, index) => (
                <div
                  key={`recent-${index}`}
                  className={`dropdown-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSelect(search)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span className="item-icon">🕐</span>
                  <span className="item-text">{search}</span>
                </div>
              ))}
            </div>
          )}

          {/* Médicaments populaires */}
          {query.length === 0 && popularMeds.length > 0 && (
            <div className="dropdown-section">
              <div className="section-title">
                <i className="fas fa-fire"></i> Recherches populaires
              </div>
              {popularMeds.slice(0, 6).map((med, index) => (
                <div
                  key={`popular-${index}`}
                  className={`dropdown-item ${selectedIndex === recentSearches.length + index ? 'selected' : ''}`}
                  onClick={() => handleSelect(med.name)}
                  onMouseEnter={() => setSelectedIndex(recentSearches.length + index)}
                >
                  <span className="item-icon">
                    {categoryIcons[med.category] || '💊'}
                  </span>
                  <span className="item-text">{med.name}</span>
                  <span className="item-badge popular">Populaire</span>
                </div>
              ))}
            </div>
          )}

          {/* Message vide */}
          {query.length >= 2 && suggestions.length === 0 && !isLoading && (
            <div className="dropdown-empty">
              <i className="fas fa-search"></i>
              <p>Aucun résultat pour "{query}"</p>
              <span>Appuyez sur Entrée pour rechercher</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
