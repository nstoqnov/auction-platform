import React, { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import Logo from "../components/Logo";

const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processLogin = async () => {
      const token = searchParams.get("token");
      if (token) {
        login(token);
        try {
          localStorage.setItem("token", token);
        } catch (err) {
          console.error("Login failed during OAuth callback:", err);
          navigate("/login?error=oauth_failed");
        }
      } else {
        console.error("No token found. Redirecting.");
        navigate("/login");
      }
    };
    processLogin();
  }, [searchParams, login, navigate]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Logo size={44} showText={false} />
      <span className="mt-6 h-7 w-7 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
      <h1 className="mt-5 font-display text-2xl font-medium text-ink">Finalizing login…</h1>
      <p className="mt-2 text-ink-soft">Redirecting you to the auction house.</p>
    </div>
  );
};

export default OAuthCallbackPage;
