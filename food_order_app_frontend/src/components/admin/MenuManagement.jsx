import React, { useState, useEffect } from 'react';
import { fetchMenu, createPlat, updatePlat, deletePlat } from '../../api/menuApi';

const MenuManagement = ({ restaurantId }) => {
    const [plats, setPlats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newPlat, setNewPlat] = useState({
        nom: '',
        description: '',
        prix: '',
        disponible: true,
        image: null // Changé de photo_url à image pour stocker le fichier
    });
    const [editingPlat, setEditingPlat] = useState(null);

    // Charger les plats au montage du composant
    useEffect(() => {
        const loadPlats = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchMenu(restaurantId);
                setPlats(data.plats || []);
            } catch (e) {
                setError(e.message || 'Impossible de charger les plats.');
            } finally {
                setLoading(false);
            }
        };
        loadPlats();
    }, [restaurantId]);

    // Gérer l'ajout d'un plat
    const handleAddPlat = async (e) => {
        e.preventDefault();
        try {
            const platData = {
                ...newPlat,
                restaurant_id: restaurantId,
                prix: parseFloat(newPlat.prix)
            };
            const createdPlat = await createPlat(platData);
            setPlats([...plats, createdPlat]);
            setNewPlat({ nom: '', description: '', prix: '', disponible: true, image: null });
        } catch (e) {
            setError(e.message || 'Erreur lors de l\'ajout du plat.');
        }
    };

    // Gérer la modification d'un plat
    const handleUpdatePlat = async (e) => {
        e.preventDefault();
        try {
            const platData = {
                ...editingPlat,
                prix: parseFloat(editingPlat.prix)
            };
            const updatedPlat = await updatePlat(editingPlat.id, platData);
            setPlats(plats.map(plat => (plat.id === updatedPlat.id ? updatedPlat : plat)));
            setEditingPlat(null);
        } catch (e) {
            setError(e.message || 'Erreur lors de la modification du plat.');
        }
    };

    // Gérer la suppression d'un plat
    const handleDeletePlat = async (platId) => {
        if (window.confirm('Voulez-vous vraiment supprimer ce plat ?')) {
            try {
                await deletePlat(platId);
                setPlats(plats.filter(plat => plat.id !== platId));
            } catch (e) {
                setError(e.message || 'Erreur lors de la suppression du plat.');
            }
        }
    };

    // Gérer les changements dans le formulaire
    const handleInputChange = (e, isEditing = false) => {
        const { name, value, type, checked, files } = e.target;
        const val = type === 'checkbox' ? checked : type === 'file' ? files[0] : value;
        if (isEditing) {
            setEditingPlat({ ...editingPlat, [name]: val });
        } else {
            setNewPlat({ ...newPlat, [name]: val });
        }
    };

    if (loading) return <div className="text-center mt-6 text-xl">Chargement des plats...</div>;
    if (error) return <div className="text-center mt-6 text-red-600 text-xl">{error}</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-indigo-700">Gestion des Plats</h2>

            {/* Formulaire d'ajout */}
            <form onSubmit={handleAddPlat} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Ajouter un nouveau plat</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <input
                            type="text"
                            name="nom"
                            value={newPlat.nom}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                        <input
                            type="number"
                            name="prix"
                            value={newPlat.prix}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={newPlat.description}
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            rows="3"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Photo</label>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleInputChange}
                            className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {newPlat.image && (
                            <p className="mt-2 text-sm text-gray-600">Fichier sélectionné : {newPlat.image.name}</p>
                        )}
                    </div>
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="disponible"
                            checked={newPlat.disponible}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm font-medium text-gray-700">Disponible</label>
                    </div>
                </div>
                <button
                    type="submit"
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Ajouter le plat
                </button>
            </form>

            {/* Liste des plats */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Liste des plats</h3>
                {plats.length === 0 ? (
                    <p className="text-gray-500">Aucun plat disponible.</p>
                ) : (
                    <div className="space-y-4">
                        {plats.map(plat => (
                            <div key={plat.id} className="border-b py-4">
                                {editingPlat && editingPlat.id === plat.id ? (
                                    <form onSubmit={handleUpdatePlat} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    value={editingPlat.nom}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Prix (€)</label>
                                                <input
                                                    type="number"
                                                    name="prix"
                                                    value={editingPlat.prix}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    step="0.01"
                                                    min="0"
                                                    className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                                <textarea
                                                    name="description"
                                                    value={editingPlat.description || ''}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                    rows="3"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Photo</label>
                                                <input
                                                    type="file"
                                                    name="image"
                                                    accept="image/*"
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="mt-1 block w-full p-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                                {editingPlat.image && (
                                                    <p className="mt-2 text-sm text-gray-600">Fichier sélectionné : {editingPlat.image.name}</p>
                                                )}
                                                {editingPlat.photo_url && !editingPlat.image && (
                                                    <p className="mt-2 text-sm text-gray-600">Photo actuelle : <a href={editingPlat.photo_url} target="_blank" rel="noopener noreferrer">Voir</a></p>
                                                )}
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="disponible"
                                                    checked={editingPlat.disponible}
                                                    onChange={(e) => handleInputChange(e, true)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                />
                                                <label className="ml-2 text-sm font-medium text-gray-700">Disponible</label>
                                            </div>
                                        </div>
                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                            >
                                                Enregistrer
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingPlat(null)}
                                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h4 className="text-lg font-medium">{plat.nom}</h4>
                                            <p className="text-gray-600">{plat.description || 'Aucune description'}</p>
                                            <p className="text-gray-800 font-semibold">{plat.prix} €</p>
                                            <p className="text-sm">{plat.disponible ? 'Disponible' : 'Indisponible'}</p>
                                            {plat.photo_url && (
                                                <img src={plat.photo_url} alt={plat.nom} className="w-20 h-20 object-cover mt-2 rounded" />
                                            )}
                                        </div>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => setEditingPlat(plat)}
                                                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                                            >
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlat(plat.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                                            >
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MenuManagement;