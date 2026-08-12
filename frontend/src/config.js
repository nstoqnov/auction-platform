// Single source of truth for the backend URL. Override at build time with
// REACT_APP_API_URL (see .env.example); defaults to local dev.
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";
