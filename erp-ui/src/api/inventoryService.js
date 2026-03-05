import axios from "axios";

const API_URL = "http://localhost:3002/inventory";

// --- Helper pour config avec token ---
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- GET ALL INVENTORY ----------------
export const getAllInventory = async (token) => {
  const res = await axios.get(API_URL, getConfig(token));
  return res.data;
};

// ---------------- CHECK STOCK OF A PRODUCT ----------------
export const checkStock = async (productId, token) => {
  const res = await axios.get(`${API_URL}/${productId}`, getConfig(token));
  return res.data;
};

// ---------------- STOCK IN ----------------
export const stockIn = async (productId, quantity, token) => {
  const res = await axios.post(
    `${API_URL}/in`,
    { productId, quantity },
    getConfig(token)
  );
  return res.data;
};

// ---------------- STOCK OUT ----------------
export const stockOut = async (productId, quantity, token) => {
  const res = await axios.post(
    `${API_URL}/out`,
    { productId, quantity },
    getConfig(token)
  );
  return res.data;
};

// ---------------- REBUILD INVENTORY ----------------
export const rebuildInventory = async (token) => {
  const res = await axios.post(`${API_URL}/rebuild`, {}, getConfig(token));
  return res.data;
};