import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { fetchAuthSession } from "aws-amplify/auth";
import { globalLogout } from "./globalLogout";
import { handleError } from "./globalErrorHandler";

// =======================
// TYPES
// =======================

export type ApiError = {
  type: "NETWORK" | "AUTH" | "SERVER" | "CLIENT" | "UNKNOWN";
  message: string;
  status?: number;
};

// =======================
// AXIOS INSTANCE
// =======================

export const api = axios.create({
  baseURL: process.env.AWS_BASE_URL,
  timeout: 10000,
});

// =======================
// REQUEST INTERCEPTOR (🔥 Amplify token)
// =======================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      let fakeToken = "123";

      if (!token) throw new Error("No valid JWT token");

      config.headers.Authorization = `Bearer ${token}`;
    } catch (err) {
      // No session / not logged in
      console.log("Auth session error:", err);
    }

    return config;
  }
);

const normalizeError = (error: AxiosError): ApiError => {
  if (!error.response) {
    return {
      type: "NETWORK",
      message: "No internet connection",
    };
  }

  const status = error.response.status;

  if (status === 401) {
    return {
      type: "AUTH",
      message: "Unauthorized",
      status,
    };
  }

  if (status >= 500) {
    return {
      type: "SERVER",
      message: "Server error",
      status,
    };
  }

  if (status >= 400) {
    return {
      type: "CLIENT",
      message:
        (error.response.data as any)?.message || "Request error",
      status,
    };
  }

  return {
    type: "UNKNOWN",
    message: "Something went wrong",
  };
};

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const normalized = normalizeError(error);

    // 👇 DEV ONLY LOGGING
    if (__DEV__) {
      console.log("API ERROR:", {
        url: error.config?.url,
        method: error.config?.method,
        error: normalized,
      });
    }

    handleError(normalized);

    return Promise.reject(normalized);
  }
);