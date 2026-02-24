import axios from "axios";

export const API_BASE_URL = "http://192.168.1.33:3000/api";

export function createApiClient() {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
  });
}
