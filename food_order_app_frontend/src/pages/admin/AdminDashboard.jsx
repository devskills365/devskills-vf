// src/pages/admin/AdminDashboard.jsx (Version finale intégrant les deux codes)

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import CommandeDashboard from '../../components/admin/CommandeDashboard';
import RestaurantStats from '../../components/admin/RestaurantStats'; // ⬅️ Composant pour l'onglet 'stats'

// Définissez un nouvel ID de test ou utilisez useParams
const TEST_RESTAURANT_ID = 3; 


const AdminDashboard = () => {
    // ⬇️ RÉCUPÉRATION DYNAMIQUE DE L'ID DU RESTAURANT (Code 1)
    const { restaurantId } = useParams();
    const currentRestaurantId = restaurantId ? parseInt(restaurantId, 10) : TEST_RESTAURANT_ID;

    // État pour gérer les onglets (Code 1)
    const [activeTab, setActiveTab] = useState('commandes'); // 'commandes' ou 'stats'

  return (
    <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">
            Administration Restaurant #{currentRestaurantId}
        </h1>

        {/* CONTROLES D'ONGLETS SIMPLIFIÉS ET CORRIGÉS */}
        <div className="flex -mb-px"> {/* Utiliser -mb-px pour chevaucher légèrement la bordure du contenu */}
            <button
                onClick={() => setActiveTab('commandes')}
                className={`px-6 py-3 font-semibold transition duration-150 ease-in-out border-b-2 
                    ${activeTab === 'commandes'
                        ? 'bg-white text-indigo-600 border-indigo-600'
                        : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-100'
                    }
                `}
            >
                Tableau de Bord des Commandes
            </button>
            <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-semibold transition duration-150 ease-in-out border-b-2 
                    ${activeTab === 'stats'
                        ? 'bg-white text-indigo-600 border-indigo-600'
                        : 'bg-gray-200 text-gray-600 border-gray-300 hover:bg-gray-100'
                    }
                `}
            >
                Statistiques Mensuelles
            </button>
        </div>

        {/* Contenu Actif */}
        <div className="bg-white p-6 shadow-xl border-t border-indigo-600">
            {activeTab === 'commandes' && (
                <CommandeDashboard restaurantId={currentRestaurantId} />
            )}
            {activeTab === 'stats' && (
                <RestaurantStats restaurantId={currentRestaurantId} />
            )}
        </div>
    </div>
);
};

export default AdminDashboard;