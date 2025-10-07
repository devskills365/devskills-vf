import React, { createContext, useState, useContext } from 'react';

// 1. Création du Contexte
const CartContext = createContext();

// 2. Fonction pour calculer le total du panier
const calculateTotal = (items) => {
  return items.reduce((total, item) => total + (item.prix * item.quantite), 0);
};

// 3. Fournisseur du contexte
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null); // ID du restaurant actuel

  // Ajouter ou mettre à jour un plat
  const addItemToCart = (plat, quantite = 1) => {
    // Vérifier si le plat appartient à un restaurant différent
    if (cartItems.length > 0 && plat.restaurant_id !== restaurantId) {
      // Option : Vider le panier si restaurant différent
      setCartItems([]);
      setRestaurantId(plat.restaurant_id); // Mettre à jour l'ID du restaurant
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === plat.id);

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantite += quantite;
        return newItems;
      } else {
        return [...prevItems, { 
          ...plat, 
          quantite: quantite,
          prix: parseFloat(plat.prix), // S'assurer que le prix est un nombre
          restaurant_id: plat.restaurant_id || restaurantId // Inclure restaurant_id
        }];
      }
    });
  };

  // Mettre à jour la quantité
  const updateItemQuantity = (platId, newQuantity) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== platId);
      }

      return prevItems.map(item => {
        if (item.id === platId) {
          return { ...item, quantite: newQuantity };
        }
        return item;
      });
    });
  };

  // Retirer un plat
  const removeItemFromCart = (platId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== platId));
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
    // Optionnel : Réinitialiser restaurantId si nécessaire
    // setRestaurantId(null);
  };

  // Vérifier la cohérence du panier
  const checkCartConsistency = () => {
    if (cartItems.length > 0 && restaurantId) {
      const invalidItems = cartItems.filter(item => item.restaurant_id !== restaurantId);
      return invalidItems.length === 0;
    }
    return true; // Panier vide ou pas de restaurantId défini
  };

  const total = calculateTotal(cartItems);
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantite, 0);

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addItemToCart, 
        removeItemFromCart,
        updateItemQuantity, 
        clearCart, 
        total,
        totalItems,
        restaurantId,
        setRestaurantId,
        checkCartConsistency // Exposer la fonction pour vérifier la cohérence
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// 4. Hook personnalisé
export const useCart = () => {
  return useContext(CartContext);
};