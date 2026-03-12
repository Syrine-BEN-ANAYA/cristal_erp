import axios from "axios";

// URL de l'API Gateway pour les achats (adaptez selon votre configuration)
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL_PURCHASES || "http://localhost:3104/purchases";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE PURCHASE ----------------
export const createPurchase = async (purchaseData, token) => {
  const res = await axios.post(API_GATEWAY_URL, purchaseData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL PURCHASES ----------------
export const getPurchases = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET PURCHASE BY ID ----------------
export const getPurchaseById = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE PURCHASE ----------------
export const updatePurchase = async (id, purchaseData, token) => {
  console.log('UPDATE URL:', `${API_GATEWAY_URL}/${id}`);
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, purchaseData, getConfig(token));
  return res.data;
};

// ---------------- DELETE PURCHASE ----------------
export const deletePurchase = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- GET TOTAL PURCHASE AMOUNT ----------------
export const getTotalPurchaseAmount = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/total`, getConfig(token));
  return res.data; // retourne { totalPurchaseAmount: number }
};