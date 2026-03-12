import axios from "axios";

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:3104/products";

// Configuration axios
const api = axios.create({
  baseURL: API_GATEWAY_URL,
});

// Helper pour les headers d'authentification
const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Fonction générique pour toutes les requêtes
const request = async (method, url, token, data = null) => {
  try {
    const response = await api({
      method,
      url,
      data,
      ...getConfig(token),
    });
    return response.data;
  } catch (error) {
    // Extraction intelligente du message d'erreur
    const errorDetails = error.response?.data;
    let errorMessage = "Erreur inconnue";

    if (typeof errorDetails === "string") {
      errorMessage = errorDetails;
    } else if (errorDetails?.message) {
      errorMessage = errorDetails.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error(
      `API Products Error (${method.toUpperCase()} ${url}):`,
      errorMessage,
      errorDetails || ""
    );

    // On rejette l'erreur pour que le composant appelant puisse la traiter
    throw new Error(errorMessage);
  }
};

// ---------------- CREATE PRODUCT ----------------
export const createProduct = (productData, token) =>
  request("post", "/", token, productData);

// ---------------- GET ALL PRODUCTS ----------------
export const getProducts = (token) =>
  request("get", "/", token);

// ---------------- GET PRODUCT BY ID ----------------
export const getProductById = (id, token) =>
  request("get", `/${id}`, token);

// ---------------- UPDATE PRODUCT ----------------
export const updateProduct = (id, productData, token) =>
  request("put", `/${id}`, token, productData);

// ---------------- DELETE PRODUCT ----------------
export const deleteProduct = (id, token) =>
  request("delete", `/${id}`, token);

// ---------------- ADD STOCK ----------------
export const addStock = (id, quantity, token) =>
  request("patch", `/${id}/add-stock`, token, { quantity });

// ---------------- REMOVE STOCK ----------------
export const removeStock = (id, quantity, token) =>
  request("patch", `/${id}/remove-stock`, token, { quantity });

// ---------------- GET LOW STOCK PRODUCTS ----------------
export const getLowStockProducts = (token) =>
  request("get", "/low-stock", token);