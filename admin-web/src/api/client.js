import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach access token from memory on every request
client.interceptors.request.use((config) => {
  const token = window.__accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = [];

function processQueue(error, token) {
  queue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const code = error.response?.data?.code;

    if (error.response?.status === 401 && code === 'ACCESS_TOKEN_EXPIRED' && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token) => {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(client(original));
            },
            reject,
          });
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');

      try {
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          refreshToken,
        });
        window.__accessToken = data.accessToken;
        localStorage.setItem('refreshToken', data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (err) {
        processQueue(err, null);
        window.__accessToken = null;
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
