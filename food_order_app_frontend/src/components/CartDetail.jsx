// src/components/CartDetail.jsx (Mise à jour pour être responsive)
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

// Fonction de formatage du prix
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
};

// --- Composant Principal CartDetail ---
const CartDetail = () => {
    const { cartItems, total, totalItems } = useCart();
    const formattedTotal = formatPrice(total);

    // Ne rien afficher si le panier est vide
    if (totalItems === 0) {
        return null;
    }

    // 1. Affichage pour Mobile (Mode Résumé/Flottant)
    const MobileSummary = (
        <div className="fixed bottom-0 left-0 w-full bg-indigo-800 p-4 shadow-2xl z-50 lg:hidden">
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
                    Commander
                </Link>
            </div>
        </div>
    );

    // 2. Affichage pour Desktop (Mode Détail/Latéral)
    const DesktopDetail = (
        <div className="p-6 bg-white rounded-xl shadow-lg h-full sticky top-4">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">
                Votre Commande ({totalItems} articles)
            </h2>
            
            {/* Liste des Articles du Panier */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center border-b last:border-b-0 py-2">
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-700">{item.nom}</p>
                            <p className="text-sm text-gray-500">
                                {formatPrice(item.prix)} x {item.quantite}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {/* TODO: Boutons +/- pour ajuster la quantité (Étape future) */}
                            <span className="font-bold text-indigo-600">
                                {formatPrice(item.prix * item.quantite)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Séparateur et Total */}
            <div className="mt-6 pt-4 border-t-2">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-800">Total :</span>
                    <span className="text-2xl font-extrabold text-indigo-700">
                        {formattedTotal}
                    </span>
                </div>

                {/* Bouton de Commande */}
                <Link 
                    to="/checkout" 
                    className="w-full block text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150"
                >
                    Passer au Paiement
                </Link>
            </div>
        </div>
    );

    // Retourne les deux versions (l'une masquée, l'autre visible selon la taille de l'écran)
    return (
        <>
            {DesktopDetail}
            {MobileSummary}
        </>
    );
};

export default CartDetail;