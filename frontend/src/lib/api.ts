// src/lib/api.ts
import axios from "axios";
import { getToken } from "./auth"; 

const API_URL = "http://localhost:4001";

type HttpMethod = "get" | "post" | "put" | "delete";

export async function apiRequest<T>(
  method: HttpMethod,
  endpoint: string,
  options: any = {}
): Promise<T> {
  try {
    const token = getToken();

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
      ...options,
    });

    return response.data as T;
  } catch (error: any) {
    throw error.response?.data || { message: "API request failed" };
  }
}
