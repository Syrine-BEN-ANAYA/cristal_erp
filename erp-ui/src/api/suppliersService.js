// src/api/suppliersService.js
import axios from "axios";

// URL de l'API Gateway pour les fournisseurs
const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104/suppliers";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE SUPPLIER ----------------
export const createSupplier = async (supplierData, token) => {
  const res = await axios.post(API_GATEWAY_URL, supplierData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL SUPPLIERS ----------------
export const getSuppliers = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

// ---------------- GET SUPPLIER BY ID ----------------
export const getSupplierById = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE SUPPLIER ----------------
export const updateSupplier = async (id, supplierData, token) => {
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, supplierData, getConfig(token));
  return res.data;
};

// ---------------- DELETE SUPPLIER ----------------
export const deleteSupplier = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};