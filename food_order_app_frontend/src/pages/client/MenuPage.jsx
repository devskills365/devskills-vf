import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PlatCard from '../../components/PlatCard';
import { fetchMenu } from '../../api/menuApi';
import { FaTruckFast } from 'react-icons/fa6';
import CartDetail from '../../components/CartDetail';
import { useCart } from '../../context/CartContext';

const MenuPage = () => {
    const { restaurantId } = useParams(); // Récupérer restaurantId depuis l'URL
    const { setRestaurantId, cartItems, totalItems, clearCart } = useCart();
    const navigate = useNavigate();
    const [plats, setPlats] = useState([]);
    const [restaurantName, setRestaurantName] = useState(''); // Ajouter pour le nom du restaurant
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMenu = async () => {
            setLoading(true);
            setError(null);
            try {
                const id = parseInt(restaurantId, 10);
                if (isNaN(id)) {
                    throw new Error('ID du restaurant invalide.');
                }
                const data = await fetchMenu(id);
                // Supposons que l'API retourne { restaurant_id, restaurant_name, plats }
                setRestaurantId(data.restaurant_id); // Mettre à jour le contexte
                setPlats(data.plats);
                setRestaurantName(data.restaurant_name || `Restaurant #${id}`); // Nom par défaut si non fourni
            } catch (e) {
                setError(e.message || 'Impossible de charger le menu. Vérifiez la connexion à l\'API.');
            } finally {
                setLoading(false);
            }
        };
        loadMenu();
    }, [restaurantId, setRestaurantId]);

    // Vérifier la cohérence du panier
    useEffect(() => {
        const invalidItems = cartItems.filter(item => item.restaurant_id !== parseInt(restaurantId, 10));
        if (invalidItems.length > 0) {
            setError('Votre panier contient des plats d\'un autre restaurant. Veuillez vider votre panier.');
            // Optionnel : Vider le panier automatiquement
            // clearCart();
        }
    }, [cartItems, restaurantId, clearCart]);

    if (loading) return <div className="text-center mt-20 text-xl">Chargement du menu...</div>;
    if (error) {
        return (
            <div className="container mx-auto p-8 text-center mt-20">
                <h1 className="text-3xl font-semibold text-red-600">{error}</h1>
                <button
                    onClick={() => navigate('/restaurants')}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Retour à la liste des restaurants
                </button>
            </div>
        );
    }

    const menuColumns = totalItems > 0 ? 'lg:col-span-2' : 'lg:col-span-3';

    return (
        <div className="bg-gray-50 min-h-screen pb-20 lg:pb-6">
            <h1 className="text-4xl font-extrabold text-indigo-700 p-6 container mx-auto">
                Menu de {restaurantName}
            </h1>

            {/* Conteneur principal Menu + Panier */}
            <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Colonne du Menu */}
                <div className={`${menuColumns} col-span-1`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plats.length > 0 ? (
                            plats.map(plat => (
                                <PlatCard key={plat.id} plat={plat} />
                            ))
                        ) : (
                            <p className="col-span-full text-center text-gray-500">
                                Aucun plat disponible pour le moment.
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. Colonne du Panier (Desktop) */}
                {totalItems > 0 && (
                    <div className="lg:col-span-1 col-span-1 hidden lg:block">
                        <CartDetail />
                    </div>
                )}
            </div>

            {/* CartDetail (Mobile) */}
            {totalItems > 0 && (
                <div className="lg:hidden">
                    <CartDetail />
                </div>
            )}

            {/* Bouton de suivi de commande */}
            <button
                onClick={() => navigate('/suivi')}
                className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-full shadow-lg flex items-center space-x-2 z-50 transition duration-300 transform hover:scale-105"
                title="Suivre ma commande"
            >
                <FaTruckFast size={24} />
                <span className="hidden sm:inline">Suivre ma commande</span>
            </button>
        </div>
    );
};

export default MenuPage;