import {create} from "zustand";
import axios from "axios";
import Cookies from "js-cookie";



const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: `Bearer ${Cookies.get("token")}`,
    "Content-Type": "application/json",
  },
});

export const useTradeStore =
  create((set) => ({
    trades: [],
    weeklyMetrics: {},
    capital: 0,
    fetchTrades: async (date) => {
      try {
        const response = await api.get("/trades/by-date", {
          params: { date: date.toISOString() },
        });
        set({ trades: response.data.trades });
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    },
    fetchWeeklyMetrics: async (date) => {
      try {
        const formattedDate = date.toISOString().split("T")[0];
        const response = await api.get(`/metrics/weekly?date=${formattedDate}`);
        set({ weeklyMetrics: response.data });
      } catch (error) {
        console.error("Error fetching weekly metrics:", error);
      }
    },
    fetchCapital: async () => {
      try {
        const response = await api.get("/user/settings");
        set({ capital: response.data.capital });
      } catch (error) {
        console.error("Error fetching capital:", error);
      }
    },
    updateTrade: async (trade) => {
      try {
        await api.put(`/trades/${trade.id}`, trade);
        set((state) => ({
          trades: state.trades.map((t) => (t.id === trade.id ? trade : t)),
        }));
      } catch (error) {
        console.error("Error updating trade:", error);
      }
    },
    addTrade: async (trade) => {
      try {
        const response = await api.post("/trades", trade);
        set((state) => ({ trades: [...state.trades, response.data] }));
      } catch (error) {
        console.error("Error adding trade:", error);
      }
    },
    deleteTrade: async (tradeId) => {
      try {
        await api.delete(`/trades/${tradeId}`);
        set((state) => ({
          trades: state.trades.filter((t) => t.id !== tradeId),
        }));
      } catch (error) {
        console.error("Error deleting trade:", error);
      }
    },
  }));
