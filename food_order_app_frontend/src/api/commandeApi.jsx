// src/api/commandeApi.jsx
import axios from 'axios';
import API_BASE_URL from './config';

const API = axios.create({
    baseURL: API_BASE_URL,
});

/**
 * Envoie la commande au Backend.
 * @param {object} data 
 */
export const postCommande = async (data) => {
    try {
        // Utilise la route définie en Phase 4: /client/commander
        const response = await API.post(`/client/commander`, data);
        return response.data; 
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error.response?.data || error.message);
        // Propage l'erreur avec les détails pour le Frontend
        throw new Error(error.response?.data?.message || "Impossible de passer la commande.");
    }
};