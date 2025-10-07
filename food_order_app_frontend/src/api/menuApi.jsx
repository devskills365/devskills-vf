import axios from 'axios';
import API_BASE_URL from './config';

const API = axios.create({
    baseURL: API_BASE_URL,
});

// Récupérer le menu d'un restaurant
export const fetchMenu = async (restaurantId) => {
    try {
        const response = await API.get(`/client/restaurants/${restaurantId}/menu`);
        // La réponse doit contenir uniquement les plats "disponibles" grâce au Backend.
        return response.data; 
    } catch (error) {
        console.error("Erreur lors de la récupération du menu:", error);
        // Retourne un tableau vide en cas d'erreur
        return [];
    }
};

// Créer un nouveau plat
export const createPlat = async (platData) => {
    try {
        const formData = new FormData();
        formData.append('nom', platData.nom);
        formData.append('prix', platData.prix);
        formData.append('restaurant_id', platData.restaurant_id);
        if (platData.description) formData.append('description', platData.description);
        if (platData.photo_url) formData.append('photo_url', platData.photo_url);
        formData.append('disponible', platData.disponible.toString());

        const response = await API.post('/admin/plats', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.plat;
    } catch (error) {
        console.error("Erreur lors de la création du plat:", error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la création du plat');
    }
};

// Mettre à jour un plat existant
export const updatePlat = async (platId, platData) => {
    try {
        const response = await API.put(`/admin/plats/${platId}`, platData);
        return response.data.plat;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du plat:", error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du plat');
    }
};

// Supprimer un plat
export const deletePlat = async (platId) => {
    try {
        const response = await API.delete(`/admin/plats/${platId}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la suppression du plat:", error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la suppression du plat');
    }
};