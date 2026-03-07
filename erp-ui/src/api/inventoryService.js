// src/api/inventoryService.js
import axios from 'axios';

// URL de l'API Gateway pour l’inventaire
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3004/inventory';

// --- Fonction pour récupérer le token depuis localStorage ---
const getAuthToken = () => localStorage.getItem('token');

// --- Instance axios avec JWT ---
const axiosInstance = axios.create({
  baseURL: API_GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(config => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- Ajouter du stock ---
export const stockIn = async (productId, quantity) => {
  const response = await axiosInstance.post('/in', { productId, quantity });
  return response.data;
};

// --- Retirer du stock ---
export const stockOut = async (productId, quantity) => {
  const response = await axiosInstance.post('/out', { productId, quantity });
  return response.data;
};

// --- Vérifier le stock d’un produit ---
export const checkStock = async (productId) => {
  const response = await axiosInstance.get(`/${productId}`);
  return response.data;
};

// --- Lister tout le stock ---
export const getAllInventory = async () => {
  const response = await axiosInstance.get('/');
  return response.data;
};

// --- Rebuild inventory ---
export const rebuildInventory = async () => {
  const response = await axiosInstance.post('/rebuild');
  return response.data;
};