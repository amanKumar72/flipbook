"use client";

import React, { useState } from "react";
import { Plus, Trash2, Upload, Check, Loader, X } from "lucide-react";

interface SpreadInput {
  image: string; // The single wide panoramic image representing the whole spread
  title: string;
  subtitle: string;
  uploading: boolean;
  error: string;
}

interface BookCreatorProps {
  onSuccess: () => void;
}

export function BookCreator({ onSuccess }: BookCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [spreads, setSpreads] = useState<SpreadInput[]>([
    {
      image: "",
      title: "THE BEGINNING",
      subtitle: "Two hearts, one journey starting today.",
      uploading: false,
      error: "",
    },
  ]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const handleAddSpread = () => {
    setSpreads([
      ...spreads,
      {
        image: "",
        title: "",
        subtitle: "",
        uploading: false,
        error: "",
      },
    ]);
  };

  const handleRemoveSpread = (index: number) => {
    if (spreads.length === 1) return; // Keep at least one spread
    setSpreads(spreads.filter((_, idx) => idx !== index));
  };

  const handleTextChange = (index: number, field: "title" | "subtitle", value: string) => {
    const updated = [...spreads];
    updated[index][field] = value;
    setSpreads(updated);
  };

// Helper to compress images exceeding 8MB on the client side
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    if (file.size < 8 * 1024 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_SIZE = 2560;
        if (width > MAX_SIZE || height > MAX_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

  // Upload file buffer directly via Next.js backend to Cloudinary
  const handleUploadFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    let file = e.target.files?.[0];
    if (!file) return;

    // Local validation
    if (!file.type.startsWith("image/")) {
      updateUploadState(index, { error: "Please select an image file." });
      return;
    }

    // Reset slot upload state to loading
    updateUploadState(index, { uploading: true, error: "" });

    try {
      // Compress image if it exceeds 8MB
      file = await compressImage(file);

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        // Save uploaded URL to spreads state
        setSpreads((prevSpreads) => {
          const updated = [...prevSpreads];
          updated[index].image = data.url;
          updated[index].uploading = false;
          return updated;
        });
      } else {
        updateUploadState(index, {
          uploading: false,
          error: data.error || "Upload failed.",
        });
      }
    } catch (err) {
      console.error(err);
      updateUploadState(index, {
        uploading: false,
        error: "Network upload failed. Please try again.",
      });
    }
  };

  // Helper to quickly toggle uploading state per slot
  const updateUploadState = (
    index: number,
    values: { uploading?: boolean; error?: string }
  ) => {
    setSpreads((prevSpreads) => {
      const updated = [...prevSpreads];
      if (values.uploading !== undefined) {
        updated[index].uploading = values.uploading;
      }
      if (values.error !== undefined) {
        updated[index].error = values.error;
      }
      return updated;
    });
  };

  // Reset an uploaded image slot
  const handleRemoveImage = (index: number) => {
    setSpreads((prevSpreads) => {
      const updated = [...prevSpreads];
      updated[index].image = "";
      return updated;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title) {
      setFormError("Title is required.");
      return;
    }

    // Ensure all spreads have the panoramic image uploaded
    const incompleteIndex = spreads.findIndex((s) => !s.image);
    if (incompleteIndex !== -1) {
      setFormError(`Spread #${incompleteIndex + 1} is missing its image. Each spread must contain an uploaded panoramic photo.`);
      return;
    }

    setSaving(true);

    try {
      // Map form state to DB layout (save same image to leftImage and rightImage)
      const mappedSpreads = spreads.map((s) => ({
        leftImage: s.image,
        rightImage: s.image,
        title: s.title,
        subtitle: s.subtitle,
      }));

      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, spreads: mappedSpreads }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setFormError(data.error || "Failed to save album to database.");
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred. Please verify your connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8 text-stone-200">
      {/* 1. ALBUM METADATA CARD */}
      <div className="bg-[#16100d] border border-amber-500/10 rounded-xl p-6 space-y-4 shadow-lg">
        <h3 className="font-serif text-lg text-amber-100 uppercase tracking-wider font-semibold border-b border-amber-500/10 pb-2 flex items-center gap-2">
          <span>❦</span> Album Details
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/60 font-semibold">
              Album Title
            </label>
            <input
              type="text"
              placeholder="e.g. Rahul & Priya's Wedding Album"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-stone-200 text-sm bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-stone-600 font-serif"
              required
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/60 font-semibold">
              Description / Dedication
            </label>
            <textarea
              placeholder="e.g. A collection of memories from our special day..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-stone-200 text-sm bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/50 focus:outline-none transition-all placeholder:text-stone-600"
              disabled={saving}
            />
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PAGE SPREADS SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg text-amber-100 uppercase tracking-wider font-semibold">
            Page Spreads
          </h3>
          <button
            type="button"
            onClick={handleAddSpread}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-amber-500/20 hover:border-amber-500 hover:bg-amber-500 hover:text-black rounded text-amber-400 font-semibold text-xs tracking-wider uppercase active:scale-95 transition-all"
            disabled={saving}
          >
            <Plus size={14} />
            Add Spread
          </button>
        </div>

        <div className="space-y-6">
          {spreads.map((spread, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-[#1c1410] to-[#0c0908] border border-amber-500/10 rounded-xl p-6 space-y-6 relative shadow-lg"
            >
              {/* Index Badge & Remove Button */}
              <div className="flex justify-between items-center border-b border-amber-500/10 pb-3">
                <span className="font-serif text-amber-400 text-sm font-semibold uppercase tracking-wider">
                  ❦ Spread #{idx + 1} (Pages {idx + 1}a - {idx + 1}b)
                </span>
                {spreads.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSpread(idx)}
                    className="text-stone-500 hover:text-rose-400 p-1.5 hover:bg-white/5 rounded transition-all"
                    title="Remove Spread"
                    disabled={saving}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {/* Text Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/40">
                    Spread Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. THE VOWS"
                    value={spread.title}
                    onChange={(e) => handleTextChange(idx, "title", e.target.value)}
                    className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                    disabled={saving}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] uppercase font-mono tracking-wider text-amber-500/40">
                    Subtitle / Verse (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Under the canopy of stars, we promised forever..."
                    value={spread.subtitle}
                    onChange={(e) => handleTextChange(idx, "subtitle", e.target.value)}
                    className="w-full px-3 py-2 text-stone-200 text-xs bg-stone-900 border border-amber-500/10 rounded focus:border-amber-500/40 focus:outline-none transition-all placeholder:text-stone-700"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Panoramic Spread Image Uploader */}
              <div className="flex flex-col gap-2 pt-2">
                <label className="text-[10px] uppercase font-mono tracking-wider text-amber-500/50">
                  Spread Photo (Panoramic - spanning Left & Right Pages)
                </label>
                
                {spread.image ? (
                  <div className="relative aspect-[8/3] w-full rounded-lg border border-amber-500/25 overflow-hidden shadow-md group">
                    <img
                      src={spread.image}
                      alt="Panoramic Spread Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-black text-xs font-semibold uppercase tracking-wider rounded flex items-center gap-1 active:scale-95 transition-all"
                        disabled={saving}
                      >
                        <X size={12} /> Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative aspect-[8/3] w-full rounded-lg border border-dashed border-amber-500/20 hover:border-amber-500/50 bg-stone-900/30 hover:bg-stone-900/50 flex flex-col items-center justify-center p-4 cursor-pointer transition-all gap-2 group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadFile(e, idx)}
                      className="hidden"
                      disabled={spread.uploading || saving}
                    />
                    {spread.uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader className="animate-spin text-amber-500" size={24} />
                        <span className="text-[10px] text-stone-500 font-mono">Uploading to Cloudinary...</span>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-amber-500/40 group-hover:text-amber-500 transition-colors" />
                        <span className="text-stone-400 text-xs font-serif font-medium">Select Wide Panoramic Image</span>
                        <span className="text-[9px] text-stone-600 font-mono">PNG, JPG, WEBP (Supports wide landscape formats)</span>
                      </>
                    )}
                    {spread.error && (
                      <span className="text-[10px] text-rose-500 font-medium">{spread.error}</span>
                    )}
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. ERROR BANNER */}
      {formError && (
        <div className="text-xs text-rose-500 bg-rose-500/5 border border-rose-500/10 px-4 py-3 rounded-lg text-center font-serif leading-relaxed max-w-xl mx-auto animate-in shake duration-300">
          <strong>Validation Error:</strong> {formError}
        </div>
      )}

      {/* 4. FORM ACTION CONTROLS */}
      <div className="flex justify-end gap-4 border-t border-amber-500/10 pt-6">
        <button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2.5 border border-stone-800 hover:bg-stone-900 hover:text-white rounded text-stone-400 text-xs uppercase font-mono tracking-wider font-semibold active:scale-95 transition-all"
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-8 py-2.5 rounded bg-amber-600 hover:bg-amber-500 disabled:opacity-55 disabled:pointer-events-none text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-md shadow-amber-500/5"
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader className="animate-spin" size={14} />
              Saving Album...
            </>
          ) : (
            <>
              <Check size={14} />
              Save Album
            </>
          )}
        </button>
      </div>
    </form>
  );
}
