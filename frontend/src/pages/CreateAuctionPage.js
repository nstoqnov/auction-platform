import { getErrorMessage } from "../utils/errorMessage";
import { API_BASE } from "../config";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import axios from "axios";
import { useAuth } from "../AuthContext";
import Icon from "../components/Icons";

const CreateAuctionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [mainImageFile, setMainImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    currentBid: "",
    startTime: "",
    endTime: "",
    categoryNames: [],
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  const uploadFileToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    const response = await axios.post(
      `${API_BASE}/api/images/upload`,
      uploadData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let mainImageUrl = "";
      if (mainImageFile) {
        const result = await uploadFileToCloudinary(mainImageFile);
        mainImageUrl = result.url;
      }

      let galleryImagesDTO = [];
      if (galleryFiles.length > 0) {
        const uploadPromises = Array.from(galleryFiles).map((file) =>
          uploadFileToCloudinary(file)
        );
        const results = await Promise.all(uploadPromises);
        galleryImagesDTO = results.map((res) => ({
          url: res.url,
          publicId: res.publicId,
        }));
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        currentBid: Number(formData.currentBid),
        startTime: formData.startTime,
        endTime: formData.endTime,
        categoryNames: formData.categoryNames,
        ownerName: user?.username || "Unknown",
        mainImageUrl: mainImageUrl,
        images: galleryImagesDTO,
      };

      await api.post("/auctions", payload);
      alert("Auction Created Successfully!");
      navigate("/auctions");
    } catch (err) {
      console.error(err);
      alert("Error creating auction: " + (getErrorMessage(err)));
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (name) => {
    setFormData((prev) => ({
      ...prev,
      categoryNames: prev.categoryNames.includes(name)
        ? prev.categoryNames.filter((c) => c !== name)
        : [...prev.categoryNames, name],
    }));
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="container-content max-w-3xl py-10 lg:py-14">
      <span className="eyebrow">Consign a lot</span>
      <h1 className="mt-3 font-display text-display-md text-ink">List an item for auction</h1>
      <p className="mt-3 text-ink-soft">Add the details, set your window, and open it to the room.</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        {/* Details */}
        <section className="card-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-medium text-ink">Details</h2>
          <div className="mt-5 space-y-4">
            <div>
              <label htmlFor="title" className="field-label">Title</label>
              <input id="title" className="field" value={formData.title} onChange={set("title")} required />
            </div>
            <div>
              <label htmlFor="desc" className="field-label">Description</label>
              <textarea
                id="desc"
                className="field min-h-[120px] resize-y py-3"
                rows="4"
                value={formData.description}
                onChange={set("description")}
                placeholder="Provenance, condition, dimensions…"
              />
            </div>
          </div>
        </section>

        {/* Pricing & schedule */}
        <section className="card-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-medium text-ink">Pricing & schedule</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="price" className="field-label">Start price ($)</label>
              <input
                id="price"
                type="number"
                inputMode="decimal"
                className="field tnum"
                value={formData.currentBid}
                onChange={set("currentBid")}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="start" className="field-label">Start time</label>
              <input id="start" type="datetime-local" className="field" value={formData.startTime} onChange={set("startTime")} required />
            </div>
            <div>
              <label htmlFor="end" className="field-label">End time</label>
              <input id="end" type="datetime-local" className="field" value={formData.endTime} onChange={set("endTime")} required />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="mt-6">
              <span className="field-label">Departments</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const active = formData.categoryNames.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition-all ${
                        active
                          ? "border-ink bg-ink text-canvas"
                          : "border-line-strong bg-surface text-ink-soft hover:border-ink hover:text-ink"
                      }`}
                    >
                      {active && <Icon.Check size={14} />}
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Images */}
        <section className="card-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-medium text-ink">Images</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FileField
              label="Main cover image"
              hint="Shown on the auction card."
              file={mainImageFile}
              onChange={(e) => setMainImageFile(e.target.files[0])}
            />
            <FileField
              label="Gallery images (optional)"
              hint="Extra views for the detail page."
              multiple
              file={galleryFiles.length ? { name: `${galleryFiles.length} file(s) selected` } : null}
              onChange={(e) => setGalleryFiles(e.target.files)}
            />
          </div>
        </section>

        <button className="btn-dark btn-lg w-full" disabled={uploading}>
          {uploading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-canvas/40 border-t-canvas" />
              Uploading images…
            </>
          ) : (
            <>
              <Icon.Gavel size={18} /> Create auction
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const FileField = ({ label, hint, file, multiple, onChange }) => (
  <div>
    <span className="field-label">{label}</span>
    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong bg-surface-2 px-4 py-8 text-center transition-colors hover:border-brand">
      <Icon.Tag size={22} className="text-ink-muted" />
      <span className="text-sm font-medium text-ink">
        {file ? file.name : "Click to upload"}
      </span>
      <span className="text-xs text-ink-muted">{hint}</span>
      <input type="file" accept="image/*" multiple={multiple} onChange={onChange} className="hidden" />
    </label>
  </div>
);

export default CreateAuctionPage;
