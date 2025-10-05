// src/context/CartContext.jsx (Ajouter/Modifier ceci)
import React, { createContext, useState, useContext } from 'react';

// 1. Création du Contexte
const CartContext = createContext();

// Fonction pour calculer le total du panier (prix * quantité)
const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.prix * item.quantite), 0);
};

// 2. Création du Fournisseur (Provider)
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Fonction pour ajouter ou mettre à jour un plat dans le panier (celle-ci est déjà bonne)
    const addItemToCart = (plat, quantite = 1) => {
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
                    prix: parseFloat(plat.prix) 
                }];
            }
        });
    };

    // NOUVELLE FONCTION : Mettre à jour la quantité
    const updateItemQuantity = (platId, newQuantity) => {
        setCartItems(prevItems => {
            if (newQuantity <= 0) {
                // Si la nouvelle quantité est <= 0, retire l'article
                return prevItems.filter(item => item.id !== platId);
            }

            return prevItems.map(item => {
                if (item.id === platId) {
                    // Sinon, met à jour la quantité
                    return { ...item, quantite: newQuantity };
                }
                return item;
            });
        });
    };

    // Fonction pour retirer complètement un plat
    const removeItemFromCart = (platId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== platId));
    };

    // Fonction pour vider le panier
    const clearCart = () => {
        setCartItems([]);
    };

    const total = calculateTotal(cartItems);
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantite, 0);

    return (
        <CartContext.Provider 
            value={{ 
                cartItems, 
                addItemToCart, 
                removeItemFromCart,
                updateItemQuantity, // <--- Exportez la nouvelle fonction
                clearCart, 
                total,
                totalItems,
                restaurantId: cartItems.length > 0 ? cartItems[0].restaurant_id : null 
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// 3. Hook personnalisé pour utiliser le contexte facilement
export const useCart = () => {
    return useContext(CartContext);
};