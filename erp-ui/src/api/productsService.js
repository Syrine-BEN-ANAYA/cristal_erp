// src/api/productsService.js
import axios from "axios";

// URL de l'API Gateway pour les produits
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3004/products";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE PRODUCT ----------------
export const createProduct = async (productData, token) => {
  const res = await axios.post(API_GATEWAY_URL, productData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL PRODUCTS ----------------
export const getProducts = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET PRODUCT BY ID ----------------
export const getProductById = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE PRODUCT ----------------
export const updateProduct = async (id, productData, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, productData, getConfig(token));
  return res.data;
};

// ---------------- DELETE PRODUCT ----------------
export const deleteProduct = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};