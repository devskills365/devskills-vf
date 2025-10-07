// src/components/PlatCard.jsx
import React from 'react';
import { useCart } from '../context/CartContext';

// ⚠️ À AJOUTER : Définissez l'URL de base de votre API Flask
// Si votre API Flask est sur http://localhost:5000
const API_BASE_URL = 'http://localhost:5000'; 
// Assurez-vous que cette URL correspond à l'endroit où votre serveur Flask écoute!

const PlatCard = ({ plat }) => {
    const { addItemToCart } = useCart();
    // La logique isAvailable semble inversée dans votre code, je suppose que c'est une erreur de copie
    // Normalement, vous voulez que le plat soit disponible si plat.disponible est VRAI.
    const isAvailable = !plat.disponible; 

    // Formater le prix pour l'affichage (ex: 12.50 €)
    const formattedPrice = new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CFA',
    }).format(plat.prix);

    const handleAddToCart = () => {
        addItemToCart(plat, 1);
    };

    const imageUrl = plat.photo_url ? `${API_BASE_URL}${plat.photo_url}` : null;
    // Exemple : http://localhost:5000/static/uploads/plats/sauce_gombo.jpg

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col justify-between h-full border-t-4 border-indigo-500">
            <div>
                {/* ✅ AJOUTEZ LE BLOC IMAGE ICI ✅ */}
                {imageUrl && (
                    <div className="mb-4 h-40 overflow-hidden rounded-md">
                        <img 
                            src={imageUrl} 
                            alt={plat.nom} 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                )}
                {/* ------------------------------------- */}
                
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