// src/pages/client/SuiviCommandePage.jsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa6'; // <-- Import de l'icône de retour

const SuiviCommandePage = () => {
    // ... (déclaration des états et des hooks) ...
    const location = useLocation();
    const initialCode = location.state?.code_commande;
    
    const [code, setCode] = useState(initialCode || '');
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    
    const navigate = useNavigate();

    // ID du restaurant pour le retour au menu. 
    // IMPORTANT : Remplacer 3 par l'ID réel si stocké, ou par '/' pour l'accueil.
    const RESTAURANT_ID = 3; 

    // Logique de soumission du formulaire de suivi
    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFetchError(null);
        setLoading(true);
        
        // Simuler l'appel API de suivi
        if (inputCode) {
            // Ici, vous feriez l'appel API pour charger les détails de la commande
            // Une fois réussi, mettez à jour le code et le statut
            setCode(inputCode); 
            setLoading(false);
        } else {
            setFetchError("Veuillez saisir un code de commande valide.");
            setLoading(false);
        }
    };
    
    // Fonction de retour au menu
    const handleGoBackToMenu = () => {
        // Redirige vers la page du menu avec l'ID du restaurant
        navigate(`/menu/${RESTAURANT_ID}`); 
    };

    // SCÉNARIO 1 : AFFICHAGE DU CODE DE SUIVI LORS DE LA REDIRECTION (POST-COMMANDE)
    if (code && !fetchError) {
        return (
            <div className="container mx-auto p-8 mt-10">
                <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                    
                    <h1 className="text-4xl font-extrabold text-green-600 mb-4">
                        🎉 Commande Confirmée !
                    </h1>
                    
                    {/* ... (Affichage du code de suivi et du statut) ... */}
                    <p className="text-gray-700 text-lg mb-6">
                        Votre commande a été enregistrée avec succès.
                    </p>

                    <div className="bg-indigo-100 p-4 rounded-lg border-2 border-indigo-300">
                        <p className="text-sm font-semibold text-indigo-700 uppercase">Votre Code de Suivi :</p>
                        <p className="text-xl md:text-3xl font-mono text-indigo-900 mt-1 break-all select-all">
                            {code}
                        </p>
                    </div>

                    {/* Placeholder pour les détails de la commande */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 font-semibold">Statut : <span className="text-yellow-600">En attente</span></p>
                        <p className="text-gray-600">Heure de récupération estimée : ...</p>
                    </div>
                    
                    <div className="flex justify-center space-x-4 mt-6">
                        {/* Bouton pour rafraîchir le statut */}
                        <button
                            onClick={() => { /* Logique de rafraîchissement */ }}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
                            disabled={loading}
                        >
                            {loading ? 'Chargement...' : 'Rafraîchir le Statut'}
                        </button>
                        
                        {/* BOUTON AJOUTÉ : Retour au menu */}
                        <button
                            onClick={handleGoBackToMenu}
                            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold flex items-center space-x-2"
                        >
                            <FaArrowLeft />
                            <span>Retour au Menu</span>
                        </button>
                    </div>
                    
                </div>
            </div>
        );
    }
    
    // SCÉNARIO 2 : FORMULAIRE DE SAISIE MANUELLE (si l'utilisateur arrive sans code)
    return (
        <div className="container mx-auto p-8 mt-20">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl text-center">
                
                <h1 className="text-3xl font-semibold text-gray-700 mb-6">
                    Suivre votre Commande
                </h1>

                {/* ... (Affichage de l'erreur et du formulaire) ... */}
                {fetchError && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                        {fetchError}
                    </div>
                )}
                
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="codeInput" className="block text-sm font-medium text-gray-700 text-left mb-1">
                            Saisissez votre code de suivi
                        </label>
                        <input 
                            type="text" 
                            id="codeInput" 
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value)}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={loading}
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
                        disabled={loading}
                    >
                        {loading ? 'Recherche...' : 'Consulter le Statut'}
                    </button>
                </form>
                
                <p className="mt-6 text-sm text-gray-500">
                    Vous avez reçu ce code lors de la confirmation de votre commande.
                </p>
                
                {/* BOUTON AJOUTÉ : Retour au menu sous le formulaire */}
                <button
                    onClick={handleGoBackToMenu}
                    className="w-full py-3 mt-4 text-gray-800 rounded-lg hover:bg-gray-100 font-semibold border border-gray-300 flex items-center justify-center space-x-2"
                >
                    <FaArrowLeft />
                    <span>Continuer les achats</span>
                </button>
                
            </div>
        </div>
    );
};

export default SuiviCommandePage;