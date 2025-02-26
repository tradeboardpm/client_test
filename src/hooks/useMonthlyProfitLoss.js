import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { format } from "date-fns";



export function useMonthlyProfitLoss(date) {
    const [profitLossData, setProfitLossData] = useState({ });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        setIsLoading(true);
        const token = Cookies.get("token");
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/metrics/monthly`,
          {
            params: { year, month },
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfitLossData(response.data);
      } catch (err) {
        setError("Failed to fetch profit/loss data");
        console.error("Error fetching profit/loss data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfitLossData();
  }, [date]);

  return { profitLossData, isLoading, error };
}
