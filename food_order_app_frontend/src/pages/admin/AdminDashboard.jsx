import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommandeDashboard from '../../components/admin/CommandeDashboard';
import RestaurantStats from '../../components/admin/RestaurantStats';
import MenuManagement from '../../components/admin/MenuManagement';

const AdminDashboard = () => {
    const { restaurantId: paramRestaurantId } = useParams(); // Récupérer restaurantId depuis l'URL
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('commandes'); // Onglet actif : 'commandes', 'stats' ou 'plats'

    // Valider restaurantId
    const currentRestaurantId = parseInt(paramRestaurantId, 10);
    if (isNaN(currentRestaurantId)) {
        return (
            <div className="min-h-screen bg-gray-100 p-8 text-center">
                <h1 className="text-3xl font-semibold text-red-600">
                    Erreur : ID du restaurant invalide.
                </h1>
                <button
                    onClick={() => navigate('/restaurants')}
                    className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Choisir un restaurant
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">
                Administration Restaurant #{currentRestaurantId}
            </h1>

            {/* Contrôles des onglets */}
            <div className="flex -mb-px">
                <button
                    onClick={() => setActiveTab('commandes')}
                    className={`px-6 py-3 font-semibold transition duration-150 ease-in-out border-b-2 
                        ${activeTab === 'commandes'
                            ? 'bg-white text-indigo-600 border-indigo-600'
                            : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    Tableau de Bord des Commandes
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 font-semibold transition duration-150 ease-in-out border-b-2 
                        ${activeTab === 'stats'
                            ? 'bg-white text-indigo-600 border-indigo-600'
                            : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    Statistiques Mensuelles
                </button>
                <button
                    onClick={() => setActiveTab('plats')}
                    className={`px-6 py-3 font-semibold transition duration-150 ease-in-out border-b-2 
                        ${activeTab === 'plats'
                            ? 'bg-white text-indigo-600 border-indigo-600'
                            : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                >
                    Gestion des Plats
                </button>
            </div>

            {/* Contenu actif */}
            <div className="bg-white p-6 shadow-xl border-t border-indigo-600">
                {activeTab === 'commandes' && (
                    <CommandeDashboard restaurantId={currentRestaurantId} />
                )}
                {activeTab === 'stats' && (
                    <RestaurantStats restaurantId={currentRestaurantId} />
                )}
                {activeTab === 'plats' && (
                    <MenuManagement restaurantId={currentRestaurantId} />
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;