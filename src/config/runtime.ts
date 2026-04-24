declare global {
  interface Window {
    __ENV__?: {
      API_URL?: string;
    };
  }
}

export const API_URL =
  window.__ENV__?.API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";
