import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";

export function useMonthlyProfitLoss(date, forceUpdate) {
  const [profitLossData, setProfitLossData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // Months are 0-indexed in JS, but API might expect 1-indexed

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/metrics/monthly`,
          {
            params: { year, month },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfitLossData(response.data || {});
      } catch (err) {
        setError("Failed to fetch profit/loss data");
        console.error("Error fetching profit/loss data:", err);
        setProfitLossData({}); // Reset to empty object on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfitLossData();
  }, [date, forceUpdate]); // Refetch when date or forceUpdate changes

  return { profitLossData, isLoading, error };
}