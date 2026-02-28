import React from "react";
import { useParams } from "react-router-dom";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import ProductImages from "../components/ProductImages";

const MediaUpload: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();

  return (
    <div className="space-y-8">
      {/* -------- UPLOAD ZONE (INFO ONLY) -------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload Info */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
            <UploadCloud size={32} />
          </div>

          <h3 className="text-xl font-bold text-slate-800 mb-2">
            Upload Product Media
          </h3>

          <p className="text-slate-500 mb-6 max-w-sm">
            Upload product images below. Images are stored securely and will
            automatically appear on your website and WhatsApp shares.
          </p>

          <p className="text-xs text-slate-400">
            Supported formats: JPG, PNG • Max size: 10MB
          </p>
        </div>

        {/* Guidelines */}
        <div className="bg-slate-800 p-8 rounded-2xl text-white">
          <h3 className="text-lg font-bold mb-6">Image Guidelines</h3>
          <ul className="space-y-4">
            <li className="flex items-start">
              <CheckCircle2
                className="text-emerald-400 mr-3 shrink-0"
                size={20}
              />
              <p className="text-slate-300 text-sm">
                Use clear images with plain background for better conversion.
              </p>
            </li>

            <li className="flex items-start">
              <CheckCircle2
                className="text-emerald-400 mr-3 shrink-0"
                size={20}
              />
              <p className="text-slate-300 text-sm">
                Upload multiple angles to improve buyer confidence.
              </p>
            </li>

            <li className="flex items-start">
              <AlertCircle
                className="text-amber-400 mr-3 shrink-0"
                size={20}
              />
              <p className="text-slate-300 text-sm">
                Avoid watermarks and low-resolution images.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* -------- REAL PRODUCT IMAGES SECTION -------- */}
      {productId ? (
        <ProductImages productId={productId} />
      ) : (
        <div className="bg-white border border-red-200 rounded-xl p-6 text-center text-red-600 font-semibold">
          Product ID missing. Please open Media Upload from a product.
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
