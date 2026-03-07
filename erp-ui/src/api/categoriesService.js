// src/api/categoriesService.js
import axios from "axios";

// ← URL vers l’API Gateway
const API_GATEWAY_URL = "http://localhost:3004/categories";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE CATEGORY ----------------
export const createCategory = async (categoryData, token) => {
  const res = await axios.post(API_GATEWAY_URL, categoryData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL CATEGORIES ----------------
export const getCategories = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET CATEGORY BY ID ----------------
export const getCategoryById = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE CATEGORY ----------------
export const updateCategory = async (id, categoryData, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, categoryData, getConfig(token));
  return res.data;
};

// ---------------- DELETE CATEGORY ----------------
export const deleteCategory = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};