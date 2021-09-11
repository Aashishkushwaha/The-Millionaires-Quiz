import { useState } from "react";
import axios from "axios";

export const useAxios = () => {
  const [data, setData] = useState<any>(undefined);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (params: any) => {
    setLoading(true);
    try {
      const result = await axios.request(params);
      setData(result.data.results);
    } catch (error: any) {
      setError("Error: " + error.message);
    } finally {
      setLoading(false);
      return { data, error, loading };
    }
  };

  return { data, error, loading, fetchData };
};
