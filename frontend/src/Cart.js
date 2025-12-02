// src/Cart.js
import React from 'react';
import { useTranslation } from 'react-i18next';

function Cart({ cartItems, onRemoveItem, onClearCart, onProceedToReservation }) {
  const { t } = useTranslation();
    
  if (cartItems.length === 0) {
    return (
      <div className="cart-container empty-cart">
        <h3>🛒 {t('cart.title')}</h3>
        <p>{t('cart.empty')}</p>
        <p>{t('cart.continueShopping')}</p>
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
      <h3>🛒 {t('cart.title')} ({cartItems.length} {t('reservations.items')})</h3>
      
      {cartItems.map((item, index) => (
        <div key={item.id + '-' + index} className="cart-item">
          <div className="item-info">
            <p className="item-medicine-name">
                <i className="fas fa-pills"></i> **{item.medicineName}**
            </p>
            <p className="item-pharmacy-name">
                <i className="fas fa-clinic-medical"></i> {item.pharmacyName}
            </p>
            <p className="item-price-quantity">
                {item.price} x {item.quantity}
            </p>
          </div>
          <button 
            className="remove-button"
            onClick={() => onRemoveItem(item.id, index)}
            title={t('cart.remove')}
          >
            &times;
          </button>
        </div>
      ))}

      <div className="cart-summary">
        <h4>{t('cart.total')} : {total.toLocaleString('fr-CM', { style: 'currency', currency: 'XAF', minimumFractionDigits: 0 })}</h4>
      </div>

      <div className="cart-actions">
        {/* Prépare la transition vers US 6: Réservation */}
        <button 
          className="proceed-button"
          onClick={onProceedToReservation} 
          title={t('cart.proceedReservation')}
        >
          <i className="fas fa-shopping-cart"></i> {t('search.reserve')} ({cartItems.length})
        </button>

        <button 
          className="clear-button"
          onClick={onClearCart}
          title={t('cart.clear')}
        >
          <i className="fas fa-trash"></i> {t('cart.clear')}
        </button>
      </div>
    </div>
  );
}

export default Cart;