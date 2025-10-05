// src/context/CartContext.jsx
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

    // Fonction pour ajouter ou mettre à jour un plat dans le panier
    const addItemToCart = (plat, quantite = 1) => {
        setCartItems(prevItems => {
            // Chercher si le plat existe déjà
            const existingItemIndex = prevItems.findIndex(item => item.id === plat.id);

            if (existingItemIndex > -1) {
                // Si le plat existe, mise à jour de la quantité
                const newItems = [...prevItems];
                newItems[existingItemIndex].quantite += quantite;
                return newItems;
            } else {
                // Sinon, ajout du nouveau plat
                return [...prevItems, { 
                    ...plat, 
                    quantite: quantite,
                    // Assurez-vous que le prix est un nombre flottant
                    prix: parseFloat(plat.prix) 
                }];
            }
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
                clearCart, 
                total,
                totalItems,
                // Note: Nous stockons le restaurantId du premier plat ajouté 
    
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