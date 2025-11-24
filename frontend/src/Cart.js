// src/Cart.js
import React from 'react';

function Cart({ cartItems, onRemoveItem, onClearCart, onProceedToReservation }) {
    
  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h3>🛒 Mon Panier</h3>
        <p>Votre panier est vide pour l'instant.</p>
        <p>Recherchez un médicament et cliquez sur "Ajouter au panier".</p>
      </div>
    );
  }

  // Calcul du prix total pour la simulation d'achat
  const total = cartItems.reduce((sum, item) => {
    // Supposons que le prix est stocké sous forme de chaîne "1500 XAF"
    const priceValue = parseFloat(item.price.replace(' XAF', '').replace(/\s/g, ''));
    return sum + (priceValue * item.quantity);
  }, 0);

  return (
    <div className="cart-container">
      <h3>🛒 Mon Panier ({cartItems.length} articles)</h3>
      
      {cartItems.map((item, index) => (
        <div key={item.id + '-' + index} className="cart-item">
          <div className="item-info">
            <p className="item-medicine-name">
                <i className="fas fa-pills"></i> **{item.medicineName}**
            </p>
            <p className="item-pharmacy-name">
                <i className="fas fa-clinic-medical"></i> Chez {item.pharmacyName}
            </p>
            <p className="item-price-quantity">
                {item.price} x {item.quantity}
            </p>
          </div>
          <button 
            className="remove-button"
            onClick={() => onRemoveItem(item.id, index)}
            title="Retirer cet article du panier"
          >
            &times;
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <h4>Total estimé : {total.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 })}</h4>
      </div>

      <div className="cart-actions">
        {/* Prépare la transition vers US 6: Réservation */}
        <button 
          className="proceed-button"
          onClick={onProceedToReservation} 
          title="Passer à la réservation"
        >
          <i className="fas fa-shopping-cart"></i> Réserver ({cartItems.length})
        </button>

        <button 
          className="clear-button"
          onClick={onClearCart}
          title="Vider tout le panier"
        >
          <i className="fas fa-trash"></i> Vider le Panier
        </button>
      </div>
    </div>
  );
}

export default Cart;