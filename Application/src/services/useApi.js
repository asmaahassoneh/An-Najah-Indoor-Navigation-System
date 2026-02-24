import { useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../context/auth.context";
import { createApiClient } from "./api";

export default function useApi() {
  const { token } = useContext(AuthContext);

  const api = useMemo(() => createApiClient(), []);

  useEffect(() => {
    const id = api.interceptors.request.use((config) => {
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        if (config.headers?.Authorization) delete config.headers.Authorization;
      }
      return config;
    });

    return () => api.interceptors.request.eject(id);
  }, [api, token]);

  return api;
}
