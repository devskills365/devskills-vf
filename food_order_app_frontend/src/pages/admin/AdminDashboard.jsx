// src/pages/admin/AdminDashboard.jsx (Version corrigée des imports)

import React, { useState, useEffect, useCallback } from 'react'; 
// --- CORRECTION DE L'IMPORTATION ---
// Nous importons les fonctions nécessaires (fetchCommandes et updateCommandeStatut)
import { fetchCommandes, updateCommandeStatut } from '../../api/adminApi'; 

import { FaTruckLoading, FaCheckCircle } from 'react-icons/fa'; 


const TEST_RESTAURANT_ID = 3; 


// Déplacer la logique de chargement dans le Dashboard pour pouvoir la réutiliser
const AdminDashboard = () => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);

    // Fonction de chargement des commandes, réutilisable pour le rafraîchissement
    const loadCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Utilise la fonction importée
            const data = await fetchCommandes(TEST_RESTAURANT_ID); 
            // S'assurer que les données sont toujours un tableau
            setCommandes(Array.isArray(data) ? data : []); 
        } catch (e) {
            setError(e.message);
            setCommandes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCommandes();
    }, [loadCommandes]); 
    
    // Logique de mise à jour du statut
    const handleStatutUpdate = async (commandeId, currentStatut, newStatut) => {
        setUpdateMessage(`Mise à jour de la commande ${commandeId} à ${newStatut}...`);
        try {
            // Utilise la fonction importée
            await updateCommandeStatut(commandeId, TEST_RESTAURANT_ID, newStatut);
            setUpdateMessage(`Commande ${commandeId} marquée comme ${newStatut.replace('_', ' ')}.`);
            
            // Rafraîchir la liste après la mise à jour
            loadCommandes(); 
            
        } catch (e) {
            setUpdateMessage(`Échec de la mise à jour : ${e.message}`);
        }
        // Le message disparaît après 3 secondes
        setTimeout(() => setUpdateMessage(null), 3000);
    };


    // Composant pour afficher une carte de commande (intégré ici pour accéder à handleStatutUpdate)
    const CommandeCard = ({ commande }) => {
        const getStatutClass = (statut) => {
            switch (statut) {
                case 'NOUVELLE': return 'bg-red-500';
                case 'EN_PREPARATION': return 'bg-yellow-500';
                case 'PRETE': return 'bg-green-500';
                default: return 'bg-gray-500';
            }
        };

        return (
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        Commande #{commande.code_commande}
                    </h3>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${getStatutClass(commande.statut)}`}>
                        {commande.statut.replace('_', ' ')}
                    </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                    Client: **{commande.client_nom}** | 
                    Tél: {commande.client_telephone} |
                    Récupération: **{commande.mode_recuperation.replace('_', ' ')}**
                </p>

                <ul className="space-y-1 text-gray-700 border-t pt-3">
                    {commande.articles.map((item, index) => (
                        <li key={index} className="flex justify-between text-sm">
                            <span>{item.quantite} x {item.plat_nom}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-lg font-extrabold text-indigo-700">
                        Total: {parseFloat(commande.total_estime).toFixed(2)} €
                    </span>
                    
                    {/* Boutons d'action pour le statut */}
                    <div className="flex space-x-2">
                        {commande.statut === 'NOUVELLE' && (
                            <button
                                onClick={() => handleStatutUpdate(commande.id, commande.statut, 'EN_PREPARATION')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded flex items-center"
                            >
                                <FaTruckLoading className="mr-1" size={12} /> Prép.
                            </button>
                        )}
                        {commande.statut === 'EN_PREPARATION' && (
                            <button
                                onClick={() => handleStatutUpdate(commande.id, commande.statut, 'PRETE')}
                                className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded flex items-center"
                            >
                                <FaCheckCircle className="mr-1" size={12} /> Prête
                            </button>
                        )}
                        {commande.statut === 'PRETE' && (
                            <button
                                onClick={() => handleStatutUpdate(commande.id, commande.statut, 'LIVREE')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-1 px-3 rounded"
                            >
                                Marquer Livrée
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };


    if (loading && commandes.length === 0) return <div className="text-center mt-20 text-xl">Chargement des commandes...</div>;
    if (error) return <div className="text-center mt-20 text-xl text-red-600">{error}</div>;
    
    // Groupement des commandes par statut pour l'affichage en colonnes
    const groupes = {
        NOUVELLE: commandes.filter(c => c.statut === 'NOUVELLE'),
        EN_PREPARATION: commandes.filter(c => c.statut === 'EN_PREPARATION'),
        PRETE: commandes.filter(c => c.statut === 'PRETE'),
    };
    
    // Définition des colonnes
    const colonnes = [
        { key: 'NOUVELLE', titre: 'Nouvelles Commandes', couleur: 'border-red-500' },
        { key: 'EN_PREPARATION', titre: 'En Préparation', couleur: 'border-yellow-500' },
        { key: 'PRETE', titre: 'Prêtes à Retirer', couleur: 'border-green-500' },
    ];


    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-4xl font-extrabold text-indigo-700 mb-8">
                Tableau de Bord du Restaurant #{TEST_RESTAURANT_ID}
            </h1>
            
            {updateMessage && (
                <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 p-3 rounded-lg shadow-xl z-50">
                    {updateMessage}
                </div>
            )}
            
            <button
                onClick={loadCommandes}
                className="mb-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Chargement...' : 'Actualiser la Liste'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {colonnes.map(colonne => (
                    <div key={colonne.key} className={`bg-white rounded-xl shadow-lg p-4 border-t-8 ${colonne.couleur}`}>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4 pb-2 border-b">
                            {colonne.titre} ({groupes[colonne.key].length})
                        </h2>
                        
                        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                            {groupes[colonne.key].length > 0 ? (
                                groupes[colonne.key].map(commande => (
                                    <CommandeCard key={commande.id} commande={commande} />
                                ))
                            ) : (
                                <p className="text-gray-500 italic">Aucune commande dans cette catégorie.</p>
                            )}
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default AdminDashboard;