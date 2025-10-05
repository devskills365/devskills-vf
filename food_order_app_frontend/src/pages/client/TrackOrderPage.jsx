// src/pages/client/TrackOrderPage.jsx (Mise à jour Finale)

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaRedoAlt, FaSpinner, FaClock, FaMapMarkerAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { trackCommande } from '../../api/clientApi'; // ⬅️ Assurez-vous d'avoir bien importé la fonction d'API

// --- UTILITAIRES ---
// Fonction de formatage du prix
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR', // Vérifiez votre devise
    }).format(price);
};

// Définition des étapes et des icônes pour la progression
const statutSteps = [
    { name: 'NOUVELLE', label: 'Commande Reçue', icon: FaClock },
    { name: 'EN_PREPARATION', label: 'En Préparation', icon: FaSpinner, isSpinning: true },
    { name: 'PRETE', label: 'Prête à Récupérer', icon: FaMapMarkerAlt },
    { name: 'LIVREE', label: 'Livrée/Terminée', icon: FaCheck, final: true },
];

// --- COMPOSANT PRINCIPAL ---
const TrackOrderPage = () => {
    // Hooks de routage: codeCommande vient de l'URL (/suivi/:codeCommande)
    const { codeCommande } = useParams();
    const navigate = useNavigate();

    // États locaux
    const [localCode, setLocalCode] = useState(codeCommande || ''); 
    const [commande, setCommande] = useState(null); // Contient les données complètes de la commande
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // ID du restaurant pour le retour au menu
    // NOTE : Idéalement, cet ID serait récupéré de la commande ou du contexte
    const RESTAURANT_ID = 3; 

    // Fonction de chargement de la commande via l'API
    const loadCommande = useCallback(async (code) => {
        if (!code) {
            setError("Veuillez entrer un code de commande.");
            setCommande(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await trackCommande(code.toUpperCase());
            setCommande(data);
            setLocalCode(data.code_commande); // Assure que l'input affiche le code trouvé
        } catch (e) {
            setCommande(null);
            setError("Code de commande invalide ou commande introuvable.");
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Charger la commande automatiquement si le code est dans l'URL (au montage)
    useEffect(() => {
        if (codeCommande) {
            loadCommande(codeCommande);
        }
    }, [codeCommande, loadCommande]);


    // Logique de soumission du formulaire de suivi
    const handleFormSubmit = (e) => {
        e.preventDefault();
        loadCommande(localCode);
        // Mettre à jour l'URL pour la recherche manuelle si le code change
        if (localCode !== codeCommande) {
             navigate(`/suivi/${localCode.toUpperCase()}`, { replace: true });
        }
    };
    
    // Fonction de retour au menu
    const handleGoBackToMenu = () => {
        navigate(`/menu/${RESTAURANT_ID}`); 
    };

    // Composant de la Timeline (Progression)
    const StatutTimeline = ({ currentStatut }) => {
        const statutIndex = statutSteps.findIndex(s => s.name === currentStatut);
        const isCancelled = currentStatut === 'ANNULEE';
        
        return (
            <div className={`flex justify-between items-start my-8 relative ${isCancelled ? 'opacity-50' : ''}`}>
                
                {/* Ligne de progression */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                    <div className="h-1 bg-indigo-500 transition-all duration-700" style={{
                        width: isCancelled ? '0%' : `${(statutIndex) / (statutSteps.length - 1) * 100}%`
                    }}></div>
                </div>

                {statutSteps.map((step, index) => {
                    const isActive = index <= statutIndex;
                    const Icon = step.icon;
                    
                    return (
                        <div key={step.name} className="flex flex-col items-center z-10 w-1/4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                isActive ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white border-2 border-gray-300 text-gray-500'
                            }`}>
                                <Icon size={16} className={step.isSpinning && isActive ? 'animate-spin' : ''} />
                            </div>
                            <span className={`mt-2 text-center text-sm font-medium ${isActive ? 'text-indigo-700 font-bold' : 'text-gray-500'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- Rendu Principal ---
    return (
        <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-extrabold text-indigo-700 mb-6">
                    Suivre votre Commande
                </h1>

                {/* Champ de recherche de commande (toujours affiché pour la flexibilité) */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                    <form onSubmit={handleFormSubmit} className="flex w-full space-x-3">
                        <input
                            type="text"
                            placeholder="Entrez votre code de commande (Ex: ABC123XYZ)"
                            value={localCode}
                            onChange={(e) => setLocalCode(e.target.value.toUpperCase())}
                            required
                            className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-lg uppercase"
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || localCode.length < 5}
                            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <FaSpinner className="animate-spin" /> : <FaRedoAlt />}
                        </button>
                    </form>
                </div>
                
                {/* Affichage des Messages */}
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                        <p>{error}</p>
                    </div>
                )}
                
                {/* Affichage des Détails de la Commande */}
                {commande && (
                    <div className="bg-white p-8 rounded-xl shadow-2xl border-t-8 border-indigo-600">
                        
                        <div className="flex justify-between items-center border-b pb-4 mb-6">
                            <h2 className="text-3xl font-bold text-gray-800">
                                Commande #{commande.code_commande}
                            </h2>
                            <span className={`text-lg font-extrabold px-4 py-2 rounded-full text-white ${
                                commande.statut === 'ANNULEE' ? 'bg-red-500' : commande.statut === 'LIVREE' ? 'bg-green-600' : 'bg-indigo-500'
                            }`}>
                                {commande.statut.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Timeline d'État */}
                        {commande.statut !== 'ANNULEE' ? (
                            <StatutTimeline currentStatut={commande.statut} />
                        ) : (
                            <div className="text-center text-red-600 my-8 text-xl font-bold flex items-center justify-center">
                                <FaTimes className="mr-3" /> Cette commande a été annulée par le restaurant.
                            </div>
                        )}
                        
                        {/* Détails Commande */}
                        <div className="mt-8 grid grid-cols-2 gap-4 text-gray-700 border-b pb-4">
                            <div>
                                <p className="font-semibold">Client :</p>
                                <p>{commande.client_nom}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Téléphone :</p>
                                <p>{commande.client_telephone}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Mode de Récupération :</p>
                                <p className="font-bold text-indigo-600">{commande.mode_recuperation.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Total :</p>
                                <p className="text-2xl font-extrabold text-green-600">{formatPrice(commande.total_estime)}</p>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-6 pt-4">Articles Commandés :</h3>
                        <ul className="space-y-2 mt-2">
                            {commande.articles.map((item, index) => (
                                <li key={index} className="flex justify-between text-sm border-b pb-1 last:border-b-0">
                                    <span>{item.quantite} x {item.plat_nom}</span>
                                    <span className="font-semibold">{formatPrice(item.prix_unitaire * item.quantite)}</span>
                                </li>
                            ))}
                        </ul>
                        
                        <button
                            onClick={handleGoBackToMenu}
                            className="w-full py-3 mt-8 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold flex items-center justify-center space-x-2"
                        >
                            <FaArrowLeft />
                            <span>Retour au Menu</span>
                        </button>
                    </div>
                )}

                {/* Si pas de commande et pas d'erreur, afficher le formulaire de recherche (géré par le bloc de recherche ci-dessus) */}
                {!commande && !error && !loading && (
                    <div className="text-center mt-10 p-6">
                         <p className="text-lg text-gray-600">Entrez un code pour suivre votre commande.</p>
                         <button
                            onClick={handleGoBackToMenu}
                            className="mt-6 py-3 px-6 text-gray-800 rounded-lg hover:bg-gray-100 font-semibold border border-gray-300 flex items-center mx-auto space-x-2"
                        >
                            <FaArrowLeft />
                            <span>Continuer les achats</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;