// src/components/CartDetail.jsx (Mise à jour)
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

// Fonction de formatage du prix (inchangée)
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CFA',
    }).format(price);
};

// --- Composant Principal CartDetail ---
const CartDetail = () => {
    // 1. Importer la fonction updateItemQuantity
    const { cartItems, total, totalItems, removeItemFromCart, updateItemQuantity } = useCart();
    const formattedTotal = formatPrice(total);

    // Handler pour retirer complètement un article
    const handleRemoveItem = (itemId) => {
        removeItemFromCart(itemId);
    };

    // Handler pour augmenter la quantité
    const handleIncrease = (itemId, currentQuantity) => {
        updateItemQuantity(itemId, currentQuantity + 1);
    };

    // Handler pour diminuer la quantité (retire l'article si la quantité atteint 0)
    const handleDecrease = (itemId, currentQuantity) => {
        updateItemQuantity(itemId, currentQuantity - 1);
    };

    // Ne rien afficher si le panier est vide (inchangé)
    if (totalItems === 0) {
        return null;
    }

    // ... (MobileSummary reste inchangé) ...
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
                            
                            {/* NOUVEAU: Contrôles de quantité */}
                            <div className="flex items-center space-x-2 mt-1">
                                <button
                                    onClick={() => handleDecrease(item.id, item.quantite)}
                                    className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
                                    aria-label={`Diminuer la quantité de ${item.nom}`}
                                >
                                    {/* Si quantité > 1, affiche "-", sinon la poubelle pour supprimer à 1 */}
                                    {item.quantite > 1 ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                                    ) : (
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    )}
                                </button>
                                
                                <span className="text-md font-medium text-gray-700 w-5 text-center">{item.quantite}</span>
                                
                                <button
                                    onClick={() => handleIncrease(item.id, item.quantite)}
                                    className="p-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition"
                                    aria-label={`Augmenter la quantité de ${item.nom}`}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                </button>
                            </div>
                            {/* FIN Contrôles de quantité */}

                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-indigo-600">
                                {formatPrice(item.prix * item.quantite)}
                            </span>
                            
                            {/* REMPLACEMENT: Le bouton de suppression complet est maintenant géré par le bouton '-' lorsque quantite = 1 */}
                            {/* Le bouton de suppression initial a été retiré ici pour éviter la redondance. */}
                            
                        </div>
                    </div>
                ))}
            </div>

            {/* Séparateur et Total (inchangé) */}
            <div className="mt-6 pt-4 border-t-2">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-xl font-bold text-gray-800">Total :</span>
                    <span className="text-2xl font-extrabold text-indigo-700">
                        {formattedTotal}
                    </span>
                </div>

                {/* Bouton de Commande (inchangé) */}
                <Link 
                    to="/checkout" 
                    className="w-full block text-center px-4 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-150"
                >
                    Valider la commande
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