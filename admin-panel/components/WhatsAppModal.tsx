
import React, { useState } from 'react';
import { X, Send, Copy, ExternalLink, Image as ImageIcon, MessageCircle } from 'lucide-react';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ isOpen, onClose, product }) => {
  const [caption, setCaption] = useState(
    `✨ *NEW ARRIVAL* ✨\n\n*${product.name}*\n\n💎 Category: ${product.category}\n💰 Price: ₹${product.price.toLocaleString()} (Excl. GST)\n\n📦 *Wholesale Only* - MOQ Applies\n_Note: Prices subject to change upon final confirmation._\n\n📞 For details, please reply here or call us at +91 82001 03821.`
  );

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    alert('Caption copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: Preview Section */}
        <div className="flex-1 bg-slate-100 p-8 flex flex-col items-center justify-center border-r border-slate-200 overflow-y-auto">
          <div className="w-full max-w-xs bg-[#e5ddd5] rounded-2xl shadow-xl overflow-hidden flex flex-col aspect-[9/16] relative">
            <div className="bg-[#075e54] p-3 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/20"></div>
              <div className="flex-1">
                <p className="text-white text-[10px] font-bold">Sai Satguru Community</p>
                <p className="text-white/60 text-[8px]">online</p>
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col space-y-3 overflow-y-auto">
              <div className="bg-white p-1 rounded-lg self-end max-w-[85%] shadow-sm">
                <img src={product.img} className="rounded-md w-full aspect-square object-cover mb-1" />
                <div className="p-1">
                  <p className="text-[10px] whitespace-pre-wrap text-slate-800 leading-tight">
                    {caption}
                  </p>
                  <p className="text-[8px] text-slate-400 text-right mt-1">10:45 AM</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white/40 backdrop-blur-md flex items-center space-x-2">
              <div className="flex-1 h-8 bg-white rounded-full"></div>
              <div className="w-8 h-8 bg-[#128c7e] rounded-full flex items-center justify-center text-white">
                <Send size={14} />
              </div>
            </div>
          </div>
          <p className="mt-4 text-slate-400 text-xs font-medium flex items-center">
            <MessageCircle size={14} className="mr-2" /> WhatsApp Community Preview
          </p>
        </div>

        {/* Right: Actions Section */}
        <div className="w-full md:w-[400px] p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Post to WhatsApp</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Share Image</label>
              <div className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                  <img src={product.img} className="w-full h-full object-cover" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{product.name}</p>
                  <p className="text-[10px] text-slate-400">Primary Product Image</p>
                </div>
                <button className="text-indigo-600 text-xs font-bold">Change</button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message Caption</label>
                <button onClick={handleCopy} className="text-indigo-600 text-[10px] font-bold flex items-center">
                  <Copy size={12} className="mr-1" /> Copy Text
                </button>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={8}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-slate-100">
            <button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-3"
              onClick={() => {
                const encodedText = encodeURIComponent(caption);
                window.open(`https://wa.me/?text=${encodedText}`, "_blank", "noopener,noreferrer");
              }}
            >
              <ExternalLink size={18} />
              <span>Open WhatsApp Desktop</span>
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium">
              Post directly to your community or broadcast list
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppModal;
