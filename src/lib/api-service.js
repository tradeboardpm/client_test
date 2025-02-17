import axios from "axios";
import Cookies from "js-cookie";

const API_URL = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${Cookies.get("token")}`,
  },
});

const apiService = {
  getJournal: async (date) => {
    const response = await axiosInstance.get("/journals", {
      params: { date: date.toISOString() },
    });
    return response.data;
  },

  createOrUpdateJournal: async (date, journalData) => {
    const response = await axiosInstance.post("/journals", {
      ...journalData,
      date: date.toISOString(),
    });
    return response.data;
  },

  uploadFiles: async (date, files) => {
    const formData = new FormData();
    formData.append("date", date.toISOString());
    Array.from(files).forEach((file) => formData.append("attachedFiles", file));
    const response = await axiosInstance.post("/journals/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  deleteFile: async (date, fileKey) => {
    const response = await axiosInstance.delete(
      `/journals/${date.toISOString()}/file/${fileKey}`
    );
    return response.data;
  },

  getRules: async (date) => {
    const response = await axiosInstance.get("/rules", {
      params: { date: date.toISOString() },
    });
    return response.data;
  },

  followUnfollowRule: async (
    date,
    journalId,
    ruleId,
    follow
  ) => {
    const response = await axiosInstance.post(
      "/journals/follow-unfollow-rule",
      {
        date: date.toISOString(),
        journalId,
        ruleId,
        follow,
      }
    );
    return response.data;
  },

  addRule: async (date, description) => {
    const response = await axiosInstance.post("/journals/add-rule", {
      date: date.toISOString(),
      description,
    });
    return response.data;
  },

  editRule: async (
    date,
    journalId,
    ruleId,
    newDescription,
    isFollowed
  ) => {
    const response = await axiosInstance.patch("/journals/edit-rule", {
      date: date.toISOString(),
      journalId,
      ruleId,
      newDescription,
      isFollowed,
    });
    return response.data;
  },

  deleteRule: async (
    date,
    journalId,
    ruleId,
    isFollowed
  ) => {
    const response = await axiosInstance.delete("/journals/delete-rule", {
      data: {
        date: date.toISOString(),
        journalId,
        ruleId,
        isFollowed,
      },
    });
    return response.data;
  },

  getTrades: async (date) => {
    const response = await axiosInstance.get("/trades", {
      params: { date: date.toISOString() },
    });
    return response.data;
  },

  createTrade: async (date, tradeData) => {
    const response = await axiosInstance.post("/trades", {
      ...tradeData,
      date: date.toISOString(),
    });
    return response.data;
  },

  updateTrade: async (tradeId, tradeData) => {
    const response = await axiosInstance.patch(`/trades/${tradeId}`, tradeData);
    return response.data;
  },

  deleteTrade: async (tradeId) => {
    const response = await axiosInstance.delete(`/trades/${tradeId}`);
    return response.data;
  },
};

export { apiService };
