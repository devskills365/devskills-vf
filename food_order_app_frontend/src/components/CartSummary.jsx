// src/components/CartSummary.jsx
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartSummary = () => {
    const { totalItems, total } = useCart();

    // Formater le total
    const formattedTotal = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(total);

    // N'afficher le composant que si le panier n'est pas vide
    if (totalItems === 0) {
        return null; 
    }

    return (
        // Utiliser une barre flottante fixe en bas de l'écran pour une bonne UX mobile/desktop
        <div className="fixed bottom-0 left-0 w-full bg-indigo-800 p-4 shadow-2xl z-50">
            <div className="container mx-auto flex justify-between items-center">

                {/* Infos Résumé */}
                <div>
                    <span className="text-white text-sm font-semibold">
                        {totalItems} article{totalItems > 1 ? 's' : ''} dans le panier
                    </span>
                    <p className="text-2xl font-bold text-white mt-1">
                        {formattedTotal}
                    </p>
                </div>

                {/* Bouton de Paiement */}
                <Link to="/checkout" className="px-6 py-3 bg-green-500 text-white font-bold rounded-full text-lg hover:bg-green-600 transition duration-150 shadow-lg">
                    Passer à la commande
                </Link>
            </div>
        </div>
    );
};

export default CartSummary;