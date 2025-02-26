import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

export const verifyToken = async (token) => {
  try {
    const response = await api.post("/accountability-partner/verify", { token });
    return response.data;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw error;
  }
};

export const fetchApData = async (token) => {
  try {
    const response = await api.get("/accountability-partner/shared-data", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching AP data:", error);
    throw error;
  }
};
