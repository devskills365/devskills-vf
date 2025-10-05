// src/api/adminApi.js (Version avec logs de débogage)

import axios from 'axios';
import API_BASE_URL from './config'; 

const API = axios.create({
    baseURL: API_BASE_URL,
});

export const adminLogin = async (matricule) => {
    try {
        const response = await API.post(`/admin/login`, { matricule });
        return response.data; 
    } catch (error) {
        console.error("Erreur de connexion Admin:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Échec de l'authentification.");
    }
};


/**
 * Endpoint : GET /api/v1/admin/restaurants/{restaurantId}/commandes
 * Récupère la liste des commandes en cours pour un restaurant.
 * @param {number} restaurantId - L'ID du restaurant.
 */
export const fetchCommandes = async (restaurantId) => {
    const endpoint = `/admin/restaurants/${restaurantId}/commandes`;
    // --- NOUVEAUX LOGS DE DÉBOGAGE ---
    console.log("---------------------------------------");
    console.log(`[ADMIN API] Appel à fetchCommandes pour Restaurant ID: ${restaurantId}`);
    // Affiche l'URL de base (pour vérifier si elle contient le /api/v1)
    console.log(`[ADMIN API] Base URL: ${API_BASE_URL}`); 
    // Affiche l'endpoint relatif
    console.log(`[ADMIN API] Endpoint relatif: ${endpoint}`); 
    console.log(`[ADMIN API] URL complète attendue par Axios: ${API_BASE_URL}${endpoint}`);
    console.log("---------------------------------------");
    // ------------------------------------

    try {
        const response = await API.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Erreur LORS DE LA RÉCUPÉRATION DES COMMANDES (404 PROBABLE) :", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Impossible de charger la liste des commandes.");
    }
};

// ... updateCommandeStatut function (inchangée) ...
export const updateCommandeStatut = async (commandeId, restaurantId, newStatut) => {
    try {
        const response = await API.put(`/admin/commandes/${commandeId}/statut`, {
            restaurant_id: restaurantId,
            statut: newStatut
        });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Échec de la mise à jour du statut.");
    }
};


export const fetchMonthlyStats = async (restaurantId, annee, mois) => {
    try {
        const response = await API.get(`/admin/restaurants/${restaurantId}/stats/${annee}/${mois}`);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Impossible de charger les statistiques.");
    }
}