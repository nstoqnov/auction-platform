import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useLocation, useNavigate } from "react-router-dom"; // Added useNavigate

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { state } = useLocation();
  const navigate = useNavigate(); // Initialize navigate hook

  // 1. Check if user is already logged in when app loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          // Typically JWT stores roles as 'role' or 'roles'
          // Ensure your backend JWT matches these keys
          setUser({
            ...decoded,
            username: decoded.sub,
            role: decoded.role || decoded.roles, // Standardize role access
          });
        }
      } catch (error) {
        console.error("Token decoding failed", error);
        localStorage.removeItem("token");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Login function
  const login = (token) => {
    localStorage.setItem("token", token);
    const decoded = jwtDecode(token);

    setUser({
      ...decoded,
      username: decoded.sub,
      role: decoded.role || decoded.roles,
    });

    localStorage.setItem("username", decoded.sub);
    // Handle redirection back to where they came from (e.g., Checkout)
    const redirectTo = state?.from || "/auctions";
    navigate(redirectTo);
  };

  // 3. Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
