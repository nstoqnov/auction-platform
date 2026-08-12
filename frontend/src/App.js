import React, { useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

// Context
import { useAuth } from "./AuthContext";

// Pages
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import AuctionsPage from "./pages/AuctionsPage";
import CreateAuctionPage from "./pages/CreateAuctionPage";
import AdminPage from "./pages/AdminPage";
import AuctionDetailPage from "./pages/AuctionDetailPage";
import ProfilePage from "./pages/ProfilePage";
import MessagesPage from "./pages/MessagesPage";
import CheckoutPage from "./pages/CheckoutPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

// Components
import PaymentStatus from "./PaymentStatus";
import ChatBox from "./components/ChatBox";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Icon from "./components/Icons";

function App() {
  const { user } = useAuth();

  // --- GLOBAL CHAT STATE ---
  const [chatRecipient, setChatRecipient] = useState(null);

  const openChat = (recipientName) => {
    if (user && recipientName && recipientName !== user.username) {
      setChatRecipient(recipientName);
    }
  };

  const closeChat = () => setChatRecipient(null);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <NavBar onOpenChat={openChat} chatRecipient={chatRecipient} />

      <main className="flex flex-1 flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route
            path="/auctions/:id"
            element={<AuctionDetailPage onOpenChat={openChat} />}
          />
          <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/checkout/:paymentId" element={<CheckoutPage />} />
          <Route path="/payment-success" element={<PaymentStatus type="success" />} />
          <Route path="/payment-cancelled" element={<PaymentStatus type="cancel" />} />
          <Route path="/create-auction" element={<CreateAuctionPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/messages" element={<MessagesPage />} />

          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="container-content flex flex-1 flex-col items-center justify-center py-28 text-center">
                <span className="eyebrow">Error 404</span>
                <h1 className="mt-4 font-display text-display-md text-ink">
                  This lot could not be found
                </h1>
                <p className="mt-3 max-w-prose text-ink-soft">
                  The page you're looking for may have been sold or moved.
                </p>
                <Link to="/auctions" className="btn-dark mt-8">
                  Browse auctions <Icon.ArrowRight size={18} />
                </Link>
              </div>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* --- GLOBAL FLOATING CHATBOX --- */}
      {chatRecipient && user && (
        <ChatBox
          currentUser={user.username || user.sub}
          recipientUser={chatRecipient}
          onClose={closeChat}
        />
      )}
    </div>
  );
}

export default App;
