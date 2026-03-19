import axios from "axios";

const API_GATEWAY_URL = process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104/orders";

const getConfig = (token) => ({
  headers: { Authorization: token ? `Bearer ${token}` : "" },
});

export const createOrder = async (orderData, token) => {
  const res = await axios.post(API_GATEWAY_URL, orderData, getConfig(token));
  return res.data;
};
export const getTotalOrderAmount = async (token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/total`, getConfig(token));
  return res.data; // { totalOrderAmount: number }
};
export const getOrders = async (token) => {
  const res = await axios.get(API_GATEWAY_URL, getConfig(token));
  return res.data;
};

export const getOrder = async (id, token) => {
  const res = await axios.get(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

export const updateOrder = async (id, orderData, token) => {
  // ⚠️ utiliser PUT et pas PATCH
  const res = await axios.put(`${API_GATEWAY_URL}/${id}`, orderData, getConfig(token));
  return res.data;
};

export const deleteOrder = async (id, token) => {
  const res = await axios.delete(`${API_GATEWAY_URL}/${id}`, getConfig(token));
  return res.data;
};

