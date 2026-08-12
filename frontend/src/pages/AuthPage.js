import { API_BASE } from "../config";
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { useAuth } from "../AuthContext";
import Logo from "../components/Logo";
import Icon from "../components/Icons";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // --- OAuth fallback handler ---
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token);
      navigate("/auctions");
    }
  }, [searchParams, login, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        const res = await api.post("/auth/login", {
          username: formData.username,
          password: formData.password,
        });
        const token =
          res.data.token ||
          res.data.accessToken ||
          (typeof res.data === "string" ? res.data : null);
        if (!token) throw new Error("Login successful, but no token returned.");
        login(token);
        navigate("/auctions");
      } else {
        await api.post("/auth/register", {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          name: formData.name,
        });
        setSuccessMsg(
          "Registration successful! Please check your email to verify your account."
        );
        setIsLogin(true);
        setFormData({ username: "", password: "", email: "", name: "" });
      }
    } catch (err) {
      console.error("Auth Error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "An error occurred";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/oauth2/authorization/google`;
  };

  return (
    <div className="grid min-h-[calc(100dvh-64px)] lg:min-h-[calc(100dvh-72px)] lg:grid-cols-2">
      {/* Branding side */}
      <aside className="relative hidden overflow-hidden bg-ink lg:flex lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 50% at 20% 10%, rgba(154,111,52,0.20), transparent 60%), radial-gradient(50% 50% at 100% 100%, rgba(47,122,85,0.12), transparent 55%)",
          }}
        />
        <Logo size={44} tone="canvas" className="relative" />

        <div className="relative">
          <h2 className="max-w-md font-display text-4xl font-medium leading-tight text-canvas">
            Discover, bid, and win exceptional pieces.
          </h2>
          <p className="mt-4 max-w-sm text-canvas/60">
            Join a refined saleroom where every lot is curated and every bid is
            protected end to end.
          </p>
          <div className="mt-10 flex items-center gap-6 text-canvas/70">
            <span className="flex items-center gap-2 text-sm">
              <Icon.ShieldCheck size={18} className="text-brand" /> Secure payments
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Icon.Bolt size={18} className="text-brand" /> Real-time bidding
            </span>
          </div>
        </div>

        <p className="relative text-xs text-canvas/40">
          © {new Date().getFullYear()} AUREUM Auction House
        </p>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <Logo size={40} />
          </div>

          <div className="mt-8 lg:mt-0">
            <span className="eyebrow">{isLogin ? "Welcome back" : "Join the house"}</span>
            <h1 className="mt-3 font-display text-display-md text-ink">
              {isLogin ? "Sign in to bid" : "Create your account"}
            </h1>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl bg-outbid-soft px-4 py-3 text-sm text-outbid"
            >
              <Icon.Close size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div
              role="status"
              className="mt-6 flex items-start gap-2 rounded-xl bg-bid-soft px-4 py-3 text-sm text-bid"
            >
              <Icon.Check size={16} className="mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="btn-outline mt-6 w-full"
            type="button"
          >
            <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <span className="rule" />
            <span className="text-xs uppercase tracking-wide text-ink-muted">or</span>
            <span className="rule" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="field-label">Full name</label>
                  <input
                    id="name"
                    type="text"
                    className="field"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="field-label">Email address</label>
                  <input
                    id="email"
                    type="email"
                    className="field"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="username" className="field-label">Username</label>
              <input
                id="username"
                type="text"
                className="field"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="field-label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="field pr-12"
                  name="password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-surface-2 hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Icon.Close size={16} /> : <Icon.User size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-dark w-full" disabled={loading}>
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" />
                  Processing…
                </>
              ) : isLogin ? (
                "Log in"
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              className="font-semibold text-brand hover:underline"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setSuccessMsg("");
              }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
