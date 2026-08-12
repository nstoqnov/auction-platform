import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo, { BRAND_NAME } from "./Logo";
import Icon from "./Icons";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const year = new Date().getFullYear();

  const columns = [
    {
      title: "Explore",
      links: [
        { label: "Live Auctions", to: "/auctions" },
        { label: "Sell an Item", to: "/create-auction" },
        { label: "My Account", to: "/profile" },
        { label: "Ending Soon", to: "/auctions" },
      ],
    },
    {
      title: "House",
      links: [
        { label: "How it Works", to: "/#how" },
        { label: "About", to: "/#about" },
        { label: "Trust & Safety", to: "/#trust" },
        { label: "Press", to: "/#press" },
      ],
    },
  ];

  return (
    <footer className="mt-auto bg-ink text-canvas">
      <div className="container-content py-16">
        {/* Newsletter */}
        <div className="flex flex-col gap-8 rounded-card border border-white/10 bg-white/[0.03] p-8 lg:flex-row lg:items-center lg:justify-between lg:p-10">
          <div className="max-w-md">
            <h3 className="font-display text-2xl font-medium">Join the collectors' circle</h3>
            <p className="mt-2 text-sm text-canvas/60">
              Early access to curated lots, private sales and previews — delivered before they go live.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              className="min-h-[48px] flex-1 rounded-pill border border-white/15 bg-white/5 px-5 text-sm text-canvas placeholder:text-canvas/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address"
            />
            <button
              type="submit"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill bg-brand px-6 text-sm font-semibold text-brand-ink transition-all hover:brightness-110"
            >
              {subscribed ? (
                <>
                  <Icon.Check size={18} /> Subscribed
                </>
              ) : (
                <>
                  Subscribe <Icon.ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Grid */}
        <div className="mt-14 grid grid-cols-2 gap-10 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo size={40} tone="canvas" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-canvas/55">
              A modern auction house for exceptional pieces. Bid confidently, win beautifully.
            </p>
            <div className="mt-6 flex gap-2">
              {["Twitter", "Instagram", "LinkedIn"].map((s) => (
                <a
                  key={s}
                  href={`#${s.toLowerCase()}`}
                  aria-label={s}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-canvas/70 transition-colors hover:border-brand hover:text-brand"
                >
                  <span className="text-xs font-semibold">{s[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-brand text-canvas/40">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-canvas/70 transition-colors hover:text-brand"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-brand text-canvas/40">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-canvas/70">
              <li>Sofia Tech Park, Bulgaria</li>
              <li>
                <a href="mailto:hello@aureum.house" className="transition-colors hover:text-brand">
                  hello@aureum.house
                </a>
              </li>
              <li>
                <a href="tel:+35921234567" className="transition-colors hover:text-brand">
                  +359 2 123 4567
                </a>
              </li>
              <li className="flex items-center gap-2 pt-1 text-canvas/50">
                <Icon.ShieldCheck size={16} className="text-brand" /> Secured by Stripe · SSL
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-canvas/50 sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {year} <span className="font-display text-canvas">{BRAND_NAME}</span>. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6">
            {["Privacy", "Terms", "Cookies"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="transition-colors hover:text-canvas">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
