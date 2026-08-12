import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api";
import Icon from "../components/Icons";

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        setMessage("No verification token found.");
        return;
      }
      if (hasFetched.current) return;
      hasFetched.current = true;

      try {
        const res = await api.get(`/auth/verify?token=${token}`);
        setStatus("success");
        setMessage(res.data || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data || "Verification failed. The link may be expired or invalid."
        );
      }
    };
    verifyToken();
  }, [searchParams]);

  return (
    <div className="container-content flex min-h-[60vh] items-center justify-center py-12">
      <div className="card-surface w-full max-w-md p-8 text-center sm:p-10">
        {status === "loading" && (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-2">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
            </span>
            <h1 className="mt-5 font-display text-2xl font-medium text-ink">Verifying your email…</h1>
            <p className="mt-2 text-ink-soft">Please wait a moment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-bid-soft text-bid">
              <Icon.Check size={28} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-medium text-ink">You're verified</h1>
            <p className="mt-2 text-ink-soft">{message}</p>
            <Link to="/login" className="btn-dark mt-6 w-full">Go to login</Link>
          </>
        )}

        {status === "error" && (
          <>
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-outbid-soft text-outbid">
              <Icon.Close size={28} />
            </span>
            <h1 className="mt-5 font-display text-2xl font-medium text-ink">Verification failed</h1>
            <p className="mt-2 text-ink-soft">{message}</p>
            <Link to="/login" className="btn-outline mt-6 w-full">Back to login</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
