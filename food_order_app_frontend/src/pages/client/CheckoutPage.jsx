// src/pages/client/CheckoutPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { postCommande } from '../../api/commandeApi';

// Fonction de formatage du prix (réutilisée)
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'CFA',
    }).format(price);
};

const CheckoutPage = () => {
    const navigate = useNavigate();
    // Renommer restaurantId en contextRestaurantId pour éviter la confusion
    const { cartItems, total, restaurantId: contextRestaurantId, clearCart, totalItems } = useCart();

    // S'assurer d'avoir un restaurantId (3 est forcé pour le test/le débogage)
    const restaurantId = contextRestaurantId; 

    // États du formulaire
    const [formData, setFormData] = useState({
        client_nom: '',
        client_telephone: '',
        mode_recuperation: 'A_EMPORTER',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Redirection si le panier est vide
    if (totalItems === 0) {
        return (
            <div className="container mx-auto p-8 text-center mt-20">
                <h1 className="text-3xl font-semibold text-gray-700">Votre panier est vide.</h1>
                <button 
                    onClick={() => navigate(`/menu/${restaurantId}`)}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Retour au menu
                </button>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        // Sécurisation de l'ID du restaurant
        const numericRestaurantId = parseInt(restaurantId, 10);

        // Préparer les données du panier pour le Backend
        const panier = cartItems.map(item => ({
            plat_id: item.id,
            quantite: item.quantite
        }));

        const dataToSubmit = {
            restaurant_id: numericRestaurantId, // Utilisation de l'ID sécurisé
            ...formData,
            panier: panier
        };

        // Log des données avant soumission (pour la vérification)
        console.log('--- Données de la commande envoyées au Backend ---');
        console.log(JSON.stringify(dataToSubmit, null, 2));
        console.log('--------------------------------------------------');

        try {
            const response = await postCommande(dataToSubmit);
            
            // --- LOG CRITIQUE : Afficher la réponse réelle du Backend ---
            console.log('--- Réponse de Succès du Backend ---');
            console.log(response); 
            console.log('------------------------------------');
            // -----------------------------------------------------------

            clearCart(); 
            
            // Tentative d'extraction du code de commande en vérifiant les clés probables
            const code = response.code_commande || response.code || response.id; 
            
            if (code) {
                // Redirection réussie
                navigate('/suivi', { state: { code_commande: code } });
            } else {
                // Échec de l'extraction : on affiche l'erreur et on redirige pour éviter le plantage
                console.error("ÉCHEC DE REDIRECTION: Code de commande introuvable dans la réponse JSON du Backend. Vérifiez le log ci-dessus.");
                navigate('/suivi?code=ERREUR_CLE_MANQUANTE'); 
            }

        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Rendu du composant
    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">Finaliser la Commande</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Colonne Gauche : Détails Client & Formulaire */}
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Informations Client et Récupération
                    </h2>

                    {error && (
                        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="client_nom" className="block text-sm font-medium text-gray-700">Numéro de la table</label>
                            <input 
                                type="text" 
                                name="client_nom" 
                                id="client_nom" 
                                value={formData.client_nom}
                                onChange={handleChange}
                              
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label htmlFor="mode_recuperation" className="block text-sm font-medium text-gray-700">Mode de Récupération</label>
                            <select
                                name="mode_recuperation"
                                id="mode_recuperation"
                                value={formData.mode_recuperation}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            >
                                <option value="A_EMPORTER">À Emporter</option>
                                <option value="SUR_PLACE">Sur Place</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className={`w-full py-3 mt-6 text-white font-bold rounded-lg transition duration-150 ${
                                loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700'
                            }`}
                            disabled={loading}
                        >
                            {loading ? 'Traitement...' : `Confirmer & Payer ${formatPrice(total)}`}
                        </button>
                    </form>
                </div>

                {/* Colonne Droite : Récapitulatif du Panier */}
                <div className="lg:col-span-1 p-6 bg-white rounded-lg shadow-lg sticky top-4 h-fit">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-3">
                        Récapitulatif
                    </h2>

                    {cartItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div className="flex-grow pr-4">
                                <p className="font-semibold text-gray-700">{item.nom}</p>
                                <p className="text-sm text-gray-500">{item.quantite} x {formatPrice(item.prix)}</p>
                            </div>
                            <span className="font-bold text-indigo-600">
                                {formatPrice(item.prix * item.quantite)}
                            </span>
                        </div>
                    ))}

                    <div className="mt-6 pt-4 border-t-2 flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-800">Total Final :</span>
                        <span className="text-2xl font-extrabold text-indigo-700">
                            {formatPrice(total)}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;