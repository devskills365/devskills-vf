// src/pages/client/MenuPage.jsx (Mise à jour Finale de la structure)
import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import PlatCard from '../../components/PlatCard';
import { fetchMenu } from '../../api/menuApi';
import { FaTruckFast } from 'react-icons/fa6';
import CartDetail from '../../components/CartDetail'; 
import { useCart } from '../../context/CartContext'; 

const MenuPage = () => {
    const { restaurantId } = useParams();
     const navigate = useNavigate();
    const [plats, setPlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // On utilise le panier pour savoir s'il faut afficher la colonne latérale
    const { totalItems } = useCart(); 

    useEffect(() => {
         const loadMenu = async () => {
             setLoading(true);
             setError(null);
             try {
                 const id = parseInt(restaurantId, 10); 
                 const data = await fetchMenu(id);
                 setPlats(data);
             } catch (e) {
                 setError("Impossible de charger le menu. Vérifiez la connexion à l'API.");
             } finally {
                 setLoading(false);
             }
         };
         loadMenu();
    }, [restaurantId]);

    if (loading) return <div className="text-center mt-20 text-xl">Chargement du menu...</div>;
    if (error) return <div className="text-center mt-20 text-xl text-red-600">{error}</div>;

    const menuColumns = totalItems > 0 ? 'lg:col-span-2' : 'lg:col-span-3';
    
    return (
        <div className="bg-gray-50 min-h-screen pb-20 lg:pb-6"> {/* pb-20 pour laisser de la place au panier flottant mobile */}
            <h1 className="text-4xl font-extrabold text-indigo-700 p-6 container mx-auto">
                Menu du Restaurant #{restaurantId}
            </h1>

            {/* Conteneur principal Menu + Panier */}
            <div className="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"> 
                
                {/* 1. Colonne du Menu (2/3 de la largeur) */}
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

                {/* 2. Colonne du Panier (Contient CartDetail en mode Desktop) */}
                {totalItems > 0 && (
                    <div className="lg:col-span-1 col-span-1 hidden lg:block"> {/* Seulement visible sur grand écran */}
                        {/* CartDetail affiche la version Desktop ici et la version Mobile en bas de page */}
                        <CartDetail />
                    </div>
                )}
            </div>

            {/* CartDetail (la version Mobile est injectée par le composant lui-même) */}
            {totalItems > 0 && (
                <div className="lg:hidden">
                    <CartDetail />
                </div>
            )}
             <button
                onClick={() => navigate('/suivi')}
                className="fixed bottom-4 right-4 bg-orange-500 hover:bg-orange-600 text-white font-bold p-4 rounded-full shadow-lg flex items-center space-x-2 z-50 transition duration-300 transform hover:scale-105"
                title="Suivre ma commande"
            >
                <FaTruckFast size={24} /> 
                <span className="hidden sm:inline">Suivre ma commande</span> {/* Afficher le texte sur les écrans plus grands */}
            </button>
        </div>
    );
};

export default MenuPage;