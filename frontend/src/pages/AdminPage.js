import React, { useEffect, useState } from "react";
import api from "../api";
import { currency, PLACEHOLDER } from "../components/AuctionCard";
import Icon from "../components/Icons";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [isLoading, setIsLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [report, setReport] = useState(null);

  // User modal
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: "",
    password: "",
    email: "",
    name: "",
    roles: [],
  });

  // Category modal
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: "", description: "" });

  // Auction modal
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [auctionFormData, setAuctionFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    startTime: "",
    endTime: "",
    mainImageUrl: "",
    status: "UPCOMING",
    categoryNames: [],
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, catsRes, auctionsRes, reportRes] = await Promise.all([
        api.get("/users"),
        api.get("/categories"),
        api.get("/auctions"),
        api.get("/bids/reports/summary"),
      ]);
      setUsers(usersRes.data);
      setCategories(catsRes.data);
      setAuctions(auctionsRes.data);
      setReport(reportRes.data);
    } catch (err) {
      console.error("Admin Access Failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ---- User handlers ----
  const handleOpenUserModal = (user = null) => {
    setEditingUser(user);
    setUserFormData(
      user
        ? {
            username: user.username,
            email: user.email,
            name: user.name || "",
            password: "",
            roles: user.roles || [],
          }
        : { username: "", password: "", email: "", name: "", roles: ["ROLE_USER"] }
    );
    setShowUserModal(true);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          username: userFormData.username,
          email: userFormData.email,
          name: userFormData.name,
          roles: userFormData.roles,
        });
      } else {
        await api.post("/auth/register", userFormData);
      }
      setShowUserModal(false);
      fetchData();
    } catch (err) {
      alert("Error saving user: " + (err.response?.data || err.message));
    }
  };

  const handleUserRoleChange = (roleName) => {
    const currentRoles = userFormData.roles;
    setUserFormData({
      ...userFormData,
      roles: currentRoles.includes(roleName)
        ? currentRoles.filter((r) => r !== roleName)
        : [...currentRoles, roleName],
    });
  };

  // ---- Category handlers ----
  const handleOpenCategoryModal = (category = null) => {
    setEditingCategory(category);
    setCategoryFormData(
      category
        ? { name: category.name, description: category.description }
        : { name: "", description: "" }
    );
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Delete this category? Associated auctions may lose their tag.")) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, categoryFormData);
      } else {
        await api.post("/categories", categoryFormData);
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      alert("Error saving category");
    }
  };

  // ---- Auction handlers ----
  const handleOpenAuctionModal = (auction = null) => {
    setEditingAuction(auction);
    if (auction) {
      const formatForInput = (dateStr) =>
        dateStr ? new Date(dateStr).toISOString().slice(0, 16) : "";
      setAuctionFormData({
        title: auction.title,
        description: auction.description,
        startingPrice: auction.startingPrice || auction.currentBid || 0,
        startTime: formatForInput(auction.startTime),
        endTime: formatForInput(auction.endTime),
        mainImageUrl: auction.mainImageUrl || "",
        status: auction.status,
        categoryNames: auction.categoryNames || [],
      });
    } else {
      setAuctionFormData({
        title: "",
        description: "",
        startingPrice: "",
        startTime: "",
        endTime: "",
        mainImageUrl: "",
        status: "UPCOMING",
        categoryNames: [],
      });
    }
    setShowAuctionModal(true);
  };

  const handleDeleteAuction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this auction?")) return;
    try {
      await api.delete(`/auctions/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data || err.message));
    }
  };

  const handleSaveAuction = async () => {
    try {
      const payload = {
        ...auctionFormData,
        startingPrice: parseFloat(auctionFormData.startingPrice),
        startTime: auctionFormData.startTime
          ? new Date(auctionFormData.startTime).toISOString()
          : null,
        endTime: auctionFormData.endTime
          ? new Date(auctionFormData.endTime).toISOString()
          : null,
      };
      if (editingAuction) {
        await api.put(`/auctions/${editingAuction.id}`, payload);
      } else {
        await api.post("/auctions", payload);
      }
      setShowAuctionModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving auction: " + (err.response?.data?.message || err.message));
    }
  };

  const setAuction = (key) => (e) =>
    setAuctionFormData({ ...auctionFormData, [key]: e.target.value });
  const setUser = (key) => (e) => setUserFormData({ ...userFormData, [key]: e.target.value });
  const setCategory = (key) => (e) =>
    setCategoryFormData({ ...categoryFormData, [key]: e.target.value });

  if (isLoading) {
    return (
      <div className="container-content py-10">
        <div className="skeleton h-8 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-card" />
          ))}
        </div>
        <div className="skeleton mt-6 h-96 rounded-card" />
      </div>
    );
  }

  const statusBadge = (status) =>
    status === "ACTIVE" ? "badge-bid" : status === "CLOSED" ? "badge-neutral" : "badge-outbid";

  const stats = [
    { label: "Total users", value: users.length, tone: "ink" },
    { label: "Active auctions", value: auctions.filter((a) => a.status === "ACTIVE").length, tone: "bid" },
    { label: "Weekly bids", value: report?.bidsLast7Days || 0, tone: "brand" },
    { label: "Monthly revenue", value: currency(report?.moneyPledgedThisMonth || 0), tone: "bid" },
  ];

  const tabs = [
    { key: "users", label: "Users" },
    { key: "auctions", label: "Auctions" },
    { key: "categories", label: "Categories" },
  ];

  return (
    <div className="container-content py-10 lg:py-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Control room</span>
          <h1 className="mt-2 font-display text-display-md text-ink">Admin dashboard</h1>
        </div>
        <button className="btn-outline btn-sm" onClick={fetchData}>
          <Icon.Bolt size={16} /> Refresh data
        </button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface p-5">
            <div className="text-xs uppercase tracking-wide text-ink-muted">{s.label}</div>
            <div
              className={`mt-2 font-display text-3xl font-semibold tnum ${
                s.tone === "bid" ? "text-bid" : "text-ink"
              }`}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-line">
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors ${
                active ? "text-ink" : "text-ink-soft hover:text-ink"
              }`}
            >
              {tab.label}
              {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-brand" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="mt-6 overflow-hidden rounded-card border border-line bg-surface shadow-subtle">
        {/* Users */}
        {activeTab === "users" && (
          <div>
            <TableHeader title="User management" action={<button className="btn-dark btn-sm" onClick={() => handleOpenUserModal(null)}>+ Add user</button>} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3 font-medium">Username</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Roles</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-line last:border-0 hover:bg-surface-2/60">
                      <td className="px-5 py-3">
                        <div className="font-medium text-ink">{u.username}</div>
                        <div className="text-xs text-ink-muted">{u.name}</div>
                      </td>
                      <td className="px-5 py-3 text-ink-soft">{u.email}</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-1">
                          {u.roles?.map((r) => (
                            <span key={r} className="badge-neutral !py-0.5 !text-[11px]">{r}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="btn-outline btn-sm" onClick={() => handleOpenUserModal(u)}>Edit</button>
                          <button className="btn-sm rounded-pill border border-outbid/30 px-3 text-outbid transition-colors hover:bg-outbid-soft" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Auctions */}
        {activeTab === "auctions" && (
          <div>
            <TableHeader title="Auction management" action={<button className="btn-dark btn-sm" onClick={() => handleOpenAuctionModal(null)}>+ Create auction</button>} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-line bg-surface-2 text-left text-xs uppercase tracking-wide text-ink-muted">
                    <th className="px-5 py-3 font-medium">Lot</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Timeframe</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr key={auction.id} className="border-b border-line last:border-0 hover:bg-surface-2/60">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={auction.mainImageUrl || PLACEHOLDER}
                            alt=""
                            className="h-11 w-11 rounded-lg object-cover"
                            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
                          />
                          <div className="min-w-0">
                            <div className="max-w-[220px] truncate font-medium text-ink">{auction.title}</div>
                            <span className={`${statusBadge(auction.status)} mt-1`}>{auction.status}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-ink tnum">
                        {currency(auction.currentBid || auction.startingPrice)}
                      </td>
                      <td className="px-5 py-3 text-xs text-ink-muted">
                        <div>Start: {new Date(auction.startTime).toLocaleDateString()}</div>
                        <div>End: {new Date(auction.endTime).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-2">
                          <button className="btn-outline btn-sm" onClick={() => handleOpenAuctionModal(auction)}>Edit</button>
                          <button className="btn-sm rounded-pill border border-outbid/30 px-3 text-outbid transition-colors hover:bg-outbid-soft" onClick={() => handleDeleteAuction(auction.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {auctions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-5 py-10 text-center text-ink-muted">No auctions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories */}
        {activeTab === "categories" && (
          <div>
            <TableHeader title="Categories" action={<button className="btn-dark btn-sm" onClick={() => handleOpenCategoryModal(null)}>+ Add category</button>} />
            <div>
              {categories.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 last:border-0">
                  <div>
                    <div className="font-medium text-ink">{c.name}</div>
                    <div className="text-sm text-ink-muted">{c.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline btn-sm" onClick={() => handleOpenCategoryModal(c)}>Edit</button>
                    <button className="btn-sm rounded-pill border border-outbid/30 px-3 text-outbid transition-colors hover:bg-outbid-soft" onClick={() => handleDeleteCategory(c.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="px-5 py-10 text-center text-ink-muted">No categories yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ---- Modals ---- */}
      <AdminModal
        open={showUserModal}
        title={editingUser ? "Edit user" : "Create user"}
        onClose={() => setShowUserModal(false)}
        onSave={handleSaveUser}
      >
        <Field label="Username"><input className="field" value={userFormData.username} onChange={setUser("username")} /></Field>
        <Field label="Name"><input className="field" value={userFormData.name} onChange={setUser("name")} /></Field>
        <Field label="Email"><input className="field" value={userFormData.email} onChange={setUser("email")} /></Field>
        {!editingUser && (
          <Field label="Password"><input type="password" className="field" value={userFormData.password} onChange={setUser("password")} /></Field>
        )}
        {editingUser && (
          <Field label="Roles">
            <div className="flex gap-2">
              {[["ROLE_USER", "User"], ["ROLE_ADMIN", "Admin"]].map(([role, label]) => {
                const on = userFormData.roles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleUserRoleChange(role)}
                    className={`inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition-all ${
                      on ? "border-ink bg-ink text-canvas" : "border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink"
                    }`}
                  >
                    {on && <Icon.Check size={14} />} {label}
                  </button>
                );
              })}
            </div>
          </Field>
        )}
      </AdminModal>

      <AdminModal
        open={showCategoryModal}
        title={editingCategory ? "Edit category" : "New category"}
        onClose={() => setShowCategoryModal(false)}
        onSave={handleSaveCategory}
      >
        <Field label="Name"><input className="field" value={categoryFormData.name} onChange={setCategory("name")} /></Field>
        <Field label="Description"><textarea rows="3" className="field min-h-[90px] py-3" value={categoryFormData.description} onChange={setCategory("description")} /></Field>
      </AdminModal>

      <AdminModal
        open={showAuctionModal}
        title={editingAuction ? "Edit auction" : "New auction"}
        onClose={() => setShowAuctionModal(false)}
        onSave={handleSaveAuction}
        wide
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title"><input className="field" value={auctionFormData.title} onChange={setAuction("title")} /></Field>
          <Field label="Status">
            <select className="field" value={auctionFormData.status} onChange={setAuction("status")}>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="CLOSED">Closed</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Description"><textarea rows="3" className="field min-h-[90px] py-3" value={auctionFormData.description} onChange={setAuction("description")} /></Field>
          </div>
          <Field label="Start time"><input type="datetime-local" className="field" value={auctionFormData.startTime} onChange={setAuction("startTime")} /></Field>
          <Field label="End time"><input type="datetime-local" className="field" value={auctionFormData.endTime} onChange={setAuction("endTime")} /></Field>
          <Field label="Starting price ($)"><input type="number" className="field tnum" value={auctionFormData.startingPrice} onChange={setAuction("startingPrice")} /></Field>
          <Field label="Image URL"><input type="text" className="field" value={auctionFormData.mainImageUrl} onChange={setAuction("mainImageUrl")} /></Field>
        </div>
      </AdminModal>
    </div>
  );
};

const TableHeader = ({ title, action }) => (
  <div className="flex items-center justify-between gap-4 px-5 py-4">
    <h2 className="font-display text-lg font-medium text-ink">{title}</h2>
    {action}
  </div>
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="field-label">{label}</span>
    {children}
  </label>
);

const AdminModal = ({ open, title, onClose, onSave, wide, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`max-h-[92dvh] w-full overflow-y-auto rounded-t-card bg-surface shadow-lift sm:rounded-card ${
          wide ? "max-w-2xl" : "max-w-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-ink-muted hover:bg-surface-2">
            <Icon.Close size={20} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-6">{children}</div>
        <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-dark" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
