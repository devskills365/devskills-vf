// src/api/config.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  console.error("VITE_API_BASE_URL n'est pas défini dans .env.development");
}

// Exportez la base URL pour qu'elle soit utilisée par Axios.
export default API_BASE_URL;