// src/pages/admin/AdminLoginPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api/adminApi'; // Assurez-vous que le chemin est correct
import { FaLock } from 'react-icons/fa';

// CONVENTION : En production, les données de l'admin (restaurant_id, nom) seraient 
// stockées dans le contexte React (Context API) ou Redux après connexion.
// Pour la simplicité ici, nous allons juste naviguer vers le dashboard.

const AdminLoginPage = ({ onLoginSuccess }) => {
    const [matricule, setMatricule] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Appel à l'API de connexion
            const data = await adminLogin(matricule);
            
            // Stocker les données de l'Admin (simplement)
            // Dans une vraie application, on utiliserait un Context/Global State pour ça
            const { restaurant_id, restaurant_nom } = data;
            
            console.log(`Connexion réussie: Restaurant ${restaurant_nom} (ID: ${restaurant_id})`);

            // Optionnel: Appeler un callback parent pour stocker l'état de connexion
            if (onLoginSuccess) {
                onLoginSuccess(restaurant_id, restaurant_nom);
            }
            
            // Redirection vers le tableau de bord Admin (en passant l'ID si nécessaire)
            // Idéalement, le dashboard récupérerait l'ID du Context/localStorage
            navigate(`/admin/dashboard/${restaurant_id}`); 

        } catch (err) {
            setError(err.message || "Erreur de connexion inconnue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-8 mt-20">
            <div className="max-w-sm mx-auto bg-white p-8 rounded-xl shadow-2xl text-center">
                
                <FaLock className="mx-auto text-5xl text-indigo-600 mb-4" />
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Accès Administrateur
                </h1>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 text-left mb-1">
                            Matricule du Restaurant
                        </label>
                        <input 
                            type="text" 
                            id="matricule" 
                            value={matricule}
                            onChange={(e) => setMatricule(e.target.value)}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Ex: R-101"
                            disabled={loading}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
                        disabled={loading}
                    >
                        {loading ? 'Connexion en cours...' : 'Se Connecter'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;