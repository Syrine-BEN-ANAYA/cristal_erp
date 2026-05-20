import axios from "axios";

const API_GATEWAY_URL =
  process.env.REACT_APP_API_GATEWAY_URL ||
  "http://localhost:3104";

// ================= ASK AI =================
export const askAI = async (question, token) => {

  try {

    const response = await axios.post(
      `${API_GATEWAY_URL}/ai/ask`,
      { question },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;

  } catch (error) {

    console.error(
      "AI SERVICE ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};