// Gestion dynamique et résiliente de l'URL de l'API Backend
const isBrowser = typeof window !== 'undefined';
const isLocalhost = isBrowser && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.startsWith('192.168.')
);

// URL de production officielle déployée sur Render
const PROD_API_URL = 'https://profsow-back.onrender.com/api';

const resolveBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  // Si le site est ouvert par un utilisateur distant (sur Vercel ou tout autre domaine non-local),
  // on utilise TOUJOURS le backend en ligne sur Render pour éviter l'erreur de connexion refusée.
  if (isBrowser && !isLocalhost) {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl;
    }
    return PROD_API_URL;
  }
  return envUrl || 'http://localhost:5000/api';
};

const BASE_URL = resolveBaseUrl();

const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si le corps est de type FormData (pour les uploads d'images/PDFs),
  // on retire le Content-Type pour laisser le navigateur insérer le boundary correct
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Si la session est expirée (401), on nettoie le token si nécessaire
      if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        localStorage.removeItem('token');
      }
      throw new Error(data.message || `Erreur serveur (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error("Impossible de joindre le serveur. Vérifiez votre connexion internet.");
    }
    throw error;
  }
};

export default api;
