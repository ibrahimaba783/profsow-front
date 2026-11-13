const BASE_URL = (import.meta.env.VITE_API_URL || 'https://profsow-back.onrender.com/api').replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 60000;
const MAX_GATEWAY_RETRIES = 4;
const MAX_NETWORK_RETRIES = 3;

// Déclenchement anticipé du réveil dès que le module API est chargé
try {
  fetch(`${BASE_URL}/health`, { mode: 'no-cors', cache: 'no-store' }).catch(() => {});
} catch {
  // Ignorer
}

const parseBodySafely = async (response) => {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return { _nonJson: true, raw };
  }
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = async (endpoint, options = {}, retryCount = 0) => {
  const token = localStorage.getItem('token');
  const method = (options.method || 'GET').toUpperCase();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si le corps est de type FormData (pour les uploads de fichiers),
  // on retire le Content-Type pour laisser le navigateur insérer le boundary correct
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });

    // Réessayer sur erreur de passerelle (démarrage à froid Render 502/503/504)
    if (
      (response.status === 502 || response.status === 503 || response.status === 504) &&
      retryCount < MAX_GATEWAY_RETRIES &&
      method === 'GET'
    ) {
      const delay = 2000 + retryCount * 1000;
      await wait(delay);
      return api(endpoint, options, retryCount + 1);
    }

    const data = await parseBodySafely(response);

    if (!response.ok) {
      if (data._nonJson) {
        if (response.status === 404) {
          throw new Error('Service temporairement indisponible sur le serveur distant.');
        }
        throw new Error('Le serveur est en cours de démarrage. Veuillez patienter quelques instants.');
      }
      throw new Error(data.message || 'Une erreur est survenue');
    }

    if (data._nonJson) {
      throw new Error('Réponse inattendue du serveur.');
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps à répondre. Veuillez réessayer.');
    }
    if (err instanceof TypeError) {
      if (retryCount < MAX_NETWORK_RETRIES && method === 'GET') {
        const delay = 2000 + retryCount * 1000;
        await wait(delay);
        return api(endpoint, options, retryCount + 1);
      }
      throw new Error('Impossible de joindre le serveur. Vérifiez votre connexion internet et réessayez.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

export default api;
