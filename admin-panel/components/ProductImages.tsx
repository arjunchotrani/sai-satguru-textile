import React, { useEffect, useState } from "react";
import { Trash2, Star, UploadCloud, ExternalLink, ArrowLeft, ArrowRight } from "lucide-react";
import { api, reorderProductMedia } from "../services/api";
import imageCompression from "browser-image-compression";

type ProductMedia = {
  id: string;
  image_url: string;
  is_primary: boolean;
  media_type?: "image" | "pdf" | null;
};

interface Props {
  productId: string;
}

const ProductImages: React.FC<Props> = ({ productId }) => {
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ================= FETCH ================= */
  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/admin/product-images/${productId}`);

      if (!res?.data || !Array.isArray(res.data.data)) {
        throw new Error("Invalid media response");
      }

      // ✅ NORMALIZE media_type (CRITICAL FIX)
      const safeMedia = res.data.data.map((item: ProductMedia) => ({
        ...item,
        media_type: item.media_type ?? "image",
      }));

      setMedia(safeMedia);
    } catch (err) {
      console.error("MEDIA FETCH ERROR:", err);
      setError("Failed to load product media");
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) fetchMedia();
  }, [productId]);

  /* ================= UPLOAD ================= */
  /* ================= UPLOAD ================= */
  const uploadFile = async (file: File) => {
    // Compress if image (skip PDF)
    let fileToUpload = file;
    if (file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 0.8, // Compress to ~800KB
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        fileToUpload = await imageCompression(file, options);
      } catch (err) {
        console.warn("Compression failed, using original file", err);
      }
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("product_id", productId);
    // We can't easily know if it's primary in parallel upload without race conditions
    // So we rely on backend or user to set primary later, or send "false"
    formData.append("is_primary", "false");

    return api.post("/admin/product-images", formData);
  };

  /* ================= SET PRIMARY ================= */
  const setPrimary = async (id: string) => {
    try {
      await api.put(`/admin/product-images/${id}/set-primary`);
      fetchMedia();
    } catch {
      alert("Failed to set primary image");
    }
  };

  /* ================= DELETE ================= */
  const deleteMedia = async (id: string) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.delete(`/admin/product-images/${id}`);
      setMedia((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Delete failed");
    }
  };

  /* ================= REORDER ================= */
  const handleManualReorder = async (currentIndex: number, newPositionStr: string) => {
    const newPosition = parseInt(newPositionStr, 10);

    // Validate bounds
    if (isNaN(newPosition) || newPosition < 1 || newPosition > media.length) {
      // Force reset input value to current index + 1
      const input = document.getElementById(`order-input-${media[currentIndex].id}`) as HTMLInputElement;
      if (input) input.value = (currentIndex + 1).toString();
      return;
    }

    const targetIndex = newPosition - 1; // 0-based

    if (targetIndex === currentIndex) return; // No change

    const newMedia = [...media];
    const [movedItem] = newMedia.splice(currentIndex, 1);
    newMedia.splice(targetIndex, 0, movedItem);

    // Optimistic Update
    setMedia(newMedia);

    try {
      const imageIds = newMedia.map(m => m.id);
      await reorderProductMedia(productId, imageIds);
    } catch (err) {
      console.error("Reorder failed", err);
      // Revert on failure
      fetchMedia();
    }
  };

  /* ================= UI ================= */

  if (loading) {
    return <p className="text-slate-500 text-sm">Loading product media…</p>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold">Product Media</h3>

        <label className={`flex items-center gap-2 px-4 py-2 ${uploading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'} text-white rounded-lg transition-colors`}>
          <UploadCloud size={16} />
          {uploading ? "Uploading..." : "Upload Images / PDF"}
          <input
            type="file"
            accept="image/*,application/pdf"
            multiple // ✅ Enable multiple files
            hidden
            disabled={uploading}
            onChange={async (e) => {
              if (e.target.files && e.target.files.length > 0) {
                const files: File[] = Array.from(e.target.files);
                setUploading(true);

                try {
                  // Parallel Uploads
                  await Promise.all(files.map((file) => uploadFile(file)));

                  // Refresh list ONCE after all are done
                  await fetchMedia();
                } catch (err) {
                  console.error("Batch upload failed", err);
                  alert("Some files failed to upload");
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }
            }}
          />
        </label>
      </div>

      {media.length === 0 ? (
        <p className="text-slate-400 text-sm">No images or PDFs uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {media.map((item, index) => {
            const typeLabel = (item.media_type ?? "image").toUpperCase();

            return (
              <div
                key={item.id}
                className="relative border rounded-xl overflow-hidden bg-white"
              >
                {item.media_type === "pdf" ? (
                  <iframe
                    src={item.image_url}
                    className="w-full h-48"
                    title="PDF Preview"
                  />
                ) : (
                  <img
                    src={item.image_url}
                    alt="product"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-48 object-contain bg-slate-100"
                  />
                )}

                {item.is_primary && (
                  <span className="absolute top-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </span>
                )}

                <div className="flex items-center justify-between p-3 border-t">
                  {item.media_type === "image" && !item.is_primary ? (
                    <button
                      onClick={() => setPrimary(item.id)}
                      className="text-yellow-600 flex items-center gap-1 text-sm"
                    >
                      <Star size={14} /> Set Primary
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">
                      {typeLabel}
                    </span>
                  )}

                  {/* REORDER CONTROLS - NUMERIC */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400 font-mono">Pos:</span>
                    <input
                      key={`${item.id}-${index}`} // ✅ Force re-render when index changes
                      id={`order-input-${item.id}`}
                      type="number"
                      min="1"
                      max={media.length}
                      defaultValue={index + 1}
                      className="w-12 h-7 text-center text-sm border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      onBlur={(e) => handleManualReorder(index, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  </div>

                  <div className="flex gap-2">
                    {item.media_type === "pdf" && (
                      <a
                        href={item.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductImages;
