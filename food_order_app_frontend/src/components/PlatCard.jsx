// src/components/PlatCard.jsx
import React from 'react';
import { useCart } from '../context/CartContext';

const PlatCard = ({ plat }) => {
    const { addItemToCart } = useCart();
    const isAvailable = !plat.disponible; 

    // Formater le prix pour l'affichage (ex: 12.50 €)
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CFA',
    }).format(plat.prix);

    const handleAddToCart = () => {
        // Ajout du plat au panier avec une quantité de 1
        addItemToCart(plat, 1);
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between h-full border-t-4 border-indigo-500">
            <div>
                <h3 className="text-xl font-semibold text-gray-800">{plat.nom}</h3>
                <p className="mt-2 text-sm text-gray-500">{plat.description}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-600">{formattedPrice}</span>

             {isAvailable ? ( 
                    <button
                        onClick={handleAddToCart}
                        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-full hover:bg-indigo-700 transition duration-150 shadow-md"
                    >
                        Ajouter
                    </button>
                ) : (
                    <span className="px-4 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded-full cursor-not-allowed">
                        Indisponible
                    </span>
                )}
            </div>
        </div>
    );
};

export default PlatCard;