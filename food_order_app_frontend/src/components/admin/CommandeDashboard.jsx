// src/components/admin/CommandeDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { fetchCommandes, updateCommandeStatut } from '../../api/adminApi';
import { FaTruckLoading, FaCheckCircle, FaSpinner } from 'react-icons/fa'; // Ajout de FaSpinner

// Déplacer le composant CommandeCard ici
const CommandeCard = ({ commande, handleStatutUpdate }) => {
    const getStatutClass = (statut) => {
        switch (statut) {
            case 'NOUVELLE': return 'bg-red-500 border-red-500';
            case 'EN_PREPARATION': return 'bg-yellow-500 border-yellow-500';
            case 'PRETE': return 'bg-green-500 border-green-500';
            case 'LIVREE': return 'bg-gray-400 border-gray-400';
            default: return 'bg-gray-500 border-gray-500';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-600">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    Commande #{commande.code_commande}
                </h3>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${getStatutClass(commande.statut).split(' ')[0]}`}>
                    {commande.statut.replace('_', ' ')}
                </span>
            </div>

            <p className="text-sm text-gray-600 mb-3">
                                    <div>
                    Numéro de table: <strong>{commande.client_nom}</strong>
                    </div>
                    <div>
                    Récupération: <strong>{commande.mode_recuperation.replace('_', ' ')}</strong>
                    </div>
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

// Composant principal du tableau de bord des commandes
const CommandeDashboard = ({ restaurantId }) => {
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);

    // Fonction de chargement des commandes
    const loadCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Utilise l'ID du restaurant passé en prop
            const data = await fetchCommandes(restaurantId);
            setCommandes(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
            setCommandes([]);
        } finally {
            setLoading(false);
        }
    }, [restaurantId]); // Dépend de restaurantId

    useEffect(() => {
        loadCommandes();
    }, [loadCommandes]);

    // Logique de mise à jour du statut
    const handleStatutUpdate = async (commandeId, currentStatut, newStatut) => {
        setUpdateMessage(`Mise à jour de la commande ${commandeId} à ${newStatut}...`);
        try {
            await updateCommandeStatut(commandeId, restaurantId, newStatut);
            setUpdateMessage(`Commande ${commandeId} marquée comme ${newStatut.replace('_', ' ')}.`);

            // Rafraîchir la liste après la mise à jour
            loadCommandes();

        } catch (e) {
            setUpdateMessage(`Échec de la mise à jour : ${e.message}`);
        }
        // Le message disparaît après 3 secondes
        setTimeout(() => setUpdateMessage(null), 3000);
    };

    if (loading && commandes.length === 0) return (
        <div className="text-center mt-8 text-xl text-indigo-600 flex items-center justify-center">
            <FaSpinner className="animate-spin mr-3" size={24} /> Chargement des commandes...
        </div>
    );
    if (error) return <div className="text-center mt-8 text-xl text-red-600 p-4 bg-red-100 rounded-lg">Erreur de chargement: {error}</div>;

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
        <div className="p-4">
            {updateMessage && (
                <div className="fixed top-4 right-4 bg-blue-100 text-blue-700 p-3 rounded-lg shadow-xl z-50">
                    {updateMessage}
                </div>
            )}

            <button
                onClick={loadCommandes}
                className="mb-6 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 flex items-center"
                disabled={loading}
            >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : 'Actualiser la Liste'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {colonnes.map(colonne => (
                    <div key={colonne.key} className={`bg-gray-50 rounded-xl shadow-inner p-4 border-t-4 ${colonne.couleur}`}>
                        <h2 className="text-2xl font-bold text-gray-700 mb-4 pb-2 border-b">
                            {colonne.titre} ({groupes[colonne.key].length})
                        </h2>

                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                            {groupes[colonne.key].length > 0 ? (
                                groupes[colonne.key].map(commande => (
                                    <CommandeCard
                                        key={commande.id}
                                        commande={commande}
                                        handleStatutUpdate={handleStatutUpdate} // Passer la fonction de mise à jour
                                    />
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

export default CommandeDashboard;