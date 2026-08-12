import { API_BASE } from "../config";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import axios from "axios";
import { currency } from "../components/AuctionCard";
import Icon from "../components/Icons";

const CheckoutPage = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchPaymentInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/stripe/${paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentDetails(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching payment details", err);
      setError("Could not load payment information.");
      setLoading(false);
    }
  }, [paymentId, token]);

  useEffect(() => {
    if (!token) {
      navigate("/", { state: { from: location.pathname } });
      return;
    }
    fetchPaymentInfo();
  }, [token, navigate, location.pathname, fetchPaymentInfo]);

  const handleStripeRedirect = async () => {
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE}/api/stripe/create-checkout-session/${paymentId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.url) window.location.href = response.data.url;
    } catch (err) {
      console.error("Stripe session error", err);
      setError("Failed to connect to Stripe. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <CenteredCard>
        <div className="skeleton mx-auto h-6 w-48" />
        <p className="mt-4 text-ink-soft">Loading payment details…</p>
      </CenteredCard>
    );

  if (error)
    return (
      <CenteredCard>
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-outbid-soft text-outbid">
          <Icon.Close size={26} />
        </span>
        <h1 className="mt-5 font-display text-2xl font-medium text-ink">{error}</h1>
        <Link to="/profile" className="btn-outline mt-6">Back to profile</Link>
      </CenteredCard>
    );

  return (
    <CenteredCard>
      <span className="eyebrow justify-center">Secure checkout</span>
      {paymentDetails && (
        <div className="mt-4">
          <h1 className="font-display text-2xl font-medium text-ink">
            {paymentDetails.auctionTitle}
          </h1>
          <p className="mt-6 text-xs uppercase tracking-wide text-ink-muted">Final bid amount</p>
          <p className="mt-1 font-display text-5xl font-semibold text-ink tnum">
            {currency(paymentDetails.amount)}
          </p>
        </div>
      )}

      <p className="mt-6 text-sm text-ink-soft">
        You'll be redirected to Stripe's secure portal to complete your transaction.
      </p>

      <button onClick={handleStripeRedirect} disabled={submitting} className="btn-dark btn-lg mt-6 w-full">
        {submitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" />
            Redirecting…
          </>
        ) : (
          <>
            <Icon.ShieldCheck size={18} /> Pay securely with Stripe
          </>
        )}
      </button>
      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-ink-muted">
        <Icon.ShieldCheck size={14} /> PCI-compliant · SSL encrypted
      </p>
    </CenteredCard>
  );
};

const CenteredCard = ({ children }) => (
  <div className="container-content flex min-h-[60vh] items-center justify-center py-12">
    <div className="card-surface w-full max-w-md p-8 text-center sm:p-10">{children}</div>
  </div>
);

export default CheckoutPage;
