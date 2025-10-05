// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import des pages
// Import du CartProvider
import { CartProvider } from './context/CartContext'; 
import MenuPage from './pages/client/MenuPage';
import CheckoutPage from './pages/client/CheckoutPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import SuiviCommandePage from './pages/common/SuiviCommandePage';

function App() {
  return (
        <CartProvider> 
    <Router>
      <Routes>
        {/* 1. Route Client : Affichage du Menu (l'ID '1' correspond à notre restaurant de test) */}
        <Route path="/menu/:restaurantId" element={<MenuPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />

        {/* 2. Route Publique : Suivi de Commande */}
        <Route path="/suivi" element={<SuiviCommandePage />} />

        {/* 3. Route Admin : Connexion */}
        <Route path="/admin" element={<AdminLoginPage />} />

        {/* 4. Redirection par défaut (vers le menu du restaurant de test ID 1) */}
        <Route path="/" element={<Navigate to="/menu/1" replace />} />
      </Routes>
    </Router>
        </CartProvider> 
  );
}

export default App;