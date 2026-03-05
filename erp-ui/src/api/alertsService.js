import axios from "axios";

const API_URL = "http://localhost:3002/alerts";

// Helper pour config avec token
const getConfig = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// ---------------- CREATE OR UPDATE ALERT ----------------
export const setAlert = async (alertData, token) => {
  const res = await axios.post(API_URL, alertData, getConfig(token));
  return res.data;
};

// ---------------- GET ALL ALERTS ----------------
export const getAlerts = async (token) => {
  const res = await axios.get(API_URL, getConfig(token));
  return res.data;
};

// ---------------- GET ALERT BY PRODUCT ----------------
export const getAlertByProduct = async (productId, token) => {
  const res = await axios.get(`${API_URL}/${productId}`, getConfig(token));
  return res.data;
};

// ---------------- DELETE ALERT ----------------
export const deleteAlert = async (productId, token) => {
  const res = await axios.delete(`${API_URL}/${productId}`, getConfig(token));
  return res.data;
};