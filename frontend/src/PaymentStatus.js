import React from "react";
import { useSearchParams, Link } from "react-router-dom";
import Icon from "./components/Icons";

const PaymentStatus = ({ type }) => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const success = type === "success";

  return (
    <div className="container-content flex min-h-[60vh] items-center justify-center py-12">
      <div className="card-surface w-full max-w-md p-8 text-center sm:p-10">
        <span
          className={`mx-auto grid h-16 w-16 place-items-center rounded-full ${
            success ? "bg-bid-soft text-bid" : "bg-outbid-soft text-outbid"
          }`}
        >
          {success ? <Icon.Check size={32} /> : <Icon.Close size={32} />}
        </span>

        <h1 className="mt-6 font-display text-display-md text-ink">
          {success ? "Payment successful" : "Payment cancelled"}
        </h1>
        <p className="mt-3 text-ink-soft">
          {success
            ? "Thank you for your purchase. Your lot is now being finalized."
            : "It looks like you didn't complete the payment. You can try again from your profile."}
        </p>

        {success && sessionId && (
          <p className="mt-4 truncate text-xs text-ink-muted">Session ID: {sessionId}</p>
        )}

        <Link to="/profile" className="btn-dark mt-8 w-full">
          Go to my profile <Icon.ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};

export default PaymentStatus;
