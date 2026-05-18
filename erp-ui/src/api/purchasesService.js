import axios from "axios";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL_PURCHASES ||
  "http://localhost:3104/purchases";

/* -------------------------------------------------------------------------- */
/*                              AXIOS CONFIG                                  */
/* -------------------------------------------------------------------------- */

const getConfig = (token) => {

  if (!token) {
    throw new Error("Authentication token missing");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },

    timeout: 10000,
  };
};

/* -------------------------------------------------------------------------- */
/*                              HANDLE ERRORS                                 */
/* -------------------------------------------------------------------------- */

const handleError = (error, fallbackMessage) => {

  console.error("Purchase API Error:", error);

  if (error.response) {

    throw new Error(
      error.response.data?.message ||
      error.response.data ||
      fallbackMessage
    );
  }

  if (error.request) {
    throw new Error("Server not responding");
  }

  throw new Error(fallbackMessage);
};

/* -------------------------------------------------------------------------- */
/*                            CREATE PURCHASE                                 */
/* -------------------------------------------------------------------------- */

export const createPurchase = async (
  purchaseData,
  token
) => {

  try {

    const res = await axios.post(
      API_GATEWAY_URL,
      purchaseData,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur création achat"
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                            GET ALL PURCHASES                               */
/* -------------------------------------------------------------------------- */

export const getPurchases = async (
  token
) => {

  try {

    const res = await axios.get(
      API_GATEWAY_URL,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur récupération achats"
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                           GET PURCHASE BY ID                               */
/* -------------------------------------------------------------------------- */

export const getPurchaseById = async (
  id,
  token
) => {

  try {

    const res = await axios.get(
      `${API_GATEWAY_URL}/${id}`,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur récupération achat"
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE PURCHASE                               */
/* -------------------------------------------------------------------------- */

export const updatePurchase = async (
  id,
  purchaseData,
  token
) => {

  try {

    const res = await axios.put(
      `${API_GATEWAY_URL}/${id}`,
      purchaseData,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur mise à jour achat"
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                              DELETE PURCHASE                               */
/* -------------------------------------------------------------------------- */

export const deletePurchase = async (
  id,
  token
) => {

  try {

    const res = await axios.delete(
      `${API_GATEWAY_URL}/${id}`,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur suppression achat"
    );
  }
};

/* -------------------------------------------------------------------------- */
/*                       GET TOTAL PURCHASE AMOUNT                            */
/* -------------------------------------------------------------------------- */

export const getTotalPurchaseAmount = async (
  token
) => {

  try {

    const res = await axios.get(
      `${API_GATEWAY_URL}/total`,
      getConfig(token)
    );

    return res.data;

  } catch (error) {

    handleError(
      error,
      "Erreur récupération total achats"
    );
  }
};