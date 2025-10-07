// src/hooks/useRestaurantSession.jsx
import { useEffect, useState } from "react";

export default function useRestaurantSession() {
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL; 
    const sessionUrl = `${baseUrl}/session`;

    fetch(sessionUrl, {
      credentials: "include", // très important pour que Flask gère la session
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur lors de la récupération de la session");
        }
        return res.json();
      })
      .then((data) => {
        setRestaurantId(data.restaurant_id || null);
      })
      .catch((err) => {
        console.error("Erreur session :", err);
      });
  }, []);

  return restaurantId;
}
