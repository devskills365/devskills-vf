// src/api/menuApi.js
import axios from 'axios';
import API_BASE_URL from './config';

const API = axios.create({
    baseURL: API_BASE_URL,
});

// Étape 8: Appel à l'API pour récupérer le menu
export const fetchMenu = async (restaurantId) => {
    try {
        // Utilise la route définie en Phase 4: /client/restaurants/{restaurantId}/menu
        const response = await API.get(`/client/restaurants/${restaurantId}/menu`);
        // La réponse doit contenir uniquement les plats "disponibles" grâce au Backend.
        return response.data; 
    } catch (error) {
        console.error("Erreur lors de la récupération du menu:", error);
        // Retourne un tableau vide en cas d'erreur
        return [];
    }
};