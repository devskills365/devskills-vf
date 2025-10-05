// src/components/admin/RestaurantStats.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa'; 
import { fetchMonthlyStats } from '../../api/adminApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaShoppingBasket, FaUtensils, FaTimesCircle } from 'react-icons/fa';

// Array des noms de mois (en Français)
const MOIS_NOMS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const RestaurantStats = () => {
    const { restaurantId } = useParams();
    const restaurantIdNum = parseInt(restaurantId, 10);
    
    // État pour l'année et le mois sélectionné (par défaut: mois et année actuels)
    const [currentDate] = useState(new Date());
    const [annee, setAnnee] = useState(currentDate.getFullYear());
    const [mois, setMois] = useState(currentDate.getMonth() + 1); // 1-12
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Mappage des mois passés pour l'affichage (12 derniers mois)
    const moisAnnee = useMemo(() => {
        const list = [];
        let a = currentDate.getFullYear();
        let m = currentDate.getMonth() + 1;

        // Créer une liste pour les 12 derniers mois (ou 12 mois complets de l'année en cours)
        for (let i = 0; i < 12; i++) {
            list.push({ annee: a, mois: m, nom: `${MOIS_NOMS[m - 1]} ${a}` });
            m--;
            if (m === 0) {
                m = 12;
                a--;
            }
        }
        return list.reverse(); // Pour avoir Janvier -> Décembre si on est en Décembre
    }, [currentDate]);


    const loadStats = useCallback(async (a, m) => {
        if (isNaN(restaurantIdNum)) return;

        setLoading(true);
        setError(null);
        setStats(null); // Vider les anciennes stats
        
        try {
            const data = await fetchMonthlyStats(restaurantIdNum, a, m);
            setStats(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [restaurantIdNum]);

    // Chargement initial ou changement de mois/année
    useEffect(() => {
        loadStats(annee, mois);
    }, [annee, mois, loadStats]);
    
    
    const handleMoisChange = (a, m) => {
        setAnnee(a);
        setMois(m);
    };
    
    const statsData = stats?.compteurs || { total_commandes: 0, commandes_validees: 0, commandes_annulees: 0 };
    const chartData = stats?.ventes_par_jour || [];
    const topPlatsData = stats?.top_plats || [];


    return (
        <div className="p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center">
                <FaChartLine className="mr-3" /> Statistiques Mensuelles du Restaurant #{restaurantId}
            </h2>

            {/* Onglets des Mois */}
            <div className="flex flex-wrap border-b border-gray-200 mb-6">
                {moisAnnee.map(item => (
                    <button
                        key={`${item.annee}-${item.mois}`}
                        onClick={() => handleMoisChange(item.annee, item.mois)}
                        className={`px-4 py-2 text-sm font-medium ${
                            item.annee === annee && item.mois === mois
                                ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {item.nom}
                    </button>
                ))}
            </div>

            {loading && <div className="text-center py-10 text-lg">Chargement des données...</div>}
            {error && !loading && <div className="text-center py-10 text-lg text-red-600">Erreur: {error}</div>}
            
            {!loading && !error && (
                <div className="space-y-8">
                    {/* Cartes des Compteurs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                            icon={<FaShoppingBasket />} 
                            title="Commandes Totales" 
                            value={statsData.total_commandes} 
                            color="text-indigo-600" 
                        />
                        <StatCard 
                            icon={<FaCheckCircle />} 
                            title="Commandes Validées/Liv." 
                            value={statsData.commandes_validees} 
                            color="text-green-600" 
                        />
                        <StatCard 
                            icon={<FaTimesCircle />} 
                            title="Commandes Annulées" 
                            value={statsData.commandes_annulees} 
                            color="text-red-600" 
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Graphe des Ventes (2/3 de la largeur) */}
                        <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg shadow-inner">
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Chiffre d'Affaires par Jour (Total des commandes livrées)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="jour" tickFormatter={(tick) => tick.substring(5)} /> 
                                        <YAxis label={{ value: 'Montant (€)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                        <Legend />
                                        <Bar dataKey="montant" fill="#4f46e5" name="Ventes Jour" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Plats (1/3 de la largeur) */}
                        <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg shadow-inner">
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2 flex items-center">
                                <FaUtensils className="mr-2" /> Top 5 Plats (Quantité)
                            </h3>
                            <ul className="space-y-3">
                                {topPlatsData.length > 0 ? (
                                    topPlatsData.map((plat, index) => (
                                        <li key={index} className="flex justify-between items-center text-gray-700 p-2 bg-white rounded-md border-l-4 border-yellow-500">
                                            <span className="font-medium">{plat.nom}</span>
                                            <span className="font-bold text-lg text-indigo-600">{plat.quantite}</span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Aucune donnée de vente pour le top plats.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// Composant Card pour les chiffres clés
const StatCard = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-b-4 border-indigo-500">
        <div className={`text-4xl ${color} mb-3`}>{icon}</div>
        <p className="text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-extrabold text-gray-800 mt-1">{value}</p>
    </div>
);


export default RestaurantStats;