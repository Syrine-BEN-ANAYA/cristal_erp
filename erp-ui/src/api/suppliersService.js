import axios from "axios";

const API_URL = "http://localhost:3003/suppliers";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE SUPPLIER ----------------
export const createSupplier = async (supplierData, token) => {
  const res = await axios.post(API_URL, supplierData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL SUPPLIERS ----------------
export const getSuppliers = async (token) => {
  const res = await axios.get(API_URL, getConfig(token));
  return res.data;
};

// ---------------- GET SUPPLIER BY ID ----------------
export const getSupplierById = async (id, token) => {
  const res = await axios.get(`${API_URL}/${id}`, getConfig(token));
  return res.data;
};

// ---------------- UPDATE SUPPLIER ----------------
export const updateSupplier = async (id, supplierData, token) => {
  const res = await axios.put(`${API_URL}/${id}`, supplierData, getConfig(token));
  return res.data;
};

// ---------------- DELETE SUPPLIER ----------------
export const deleteSupplier = async (id, token) => {
  const res = await axios.delete(`${API_URL}/${id}`, getConfig(token));
  return res.data;
};