'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { CONTACT_INFO } from '../lib/constants';

export const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end pointer-events-none">
            <div
                className={`mb-4 flex flex-col items-end gap-3 transition-all duration-500 origin-bottom ${isOpen ? 'scale-100 opacity-100 translate-y-0 pointer-events-auto' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp1}?text=Hi, I am enquiring about products.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-white hover:bg-white/10 transition-all shadow-xl group"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Sales Enquiry</span>
                    <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle size={16} />
                    </div>
                </a>
                <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp2}?text=Hi, I am enquiring about wholesale deals.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-white hover:bg-white/10 transition-all shadow-xl group"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Wholesale Support</span>
                    <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle size={16} />
                    </div>
                </a>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isOpen ? 'bg-white text-black rotate-90' : 'bg-[#25D366] text-white hover:scale-110'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} className="animate-pulse" />}
            </button>
        </div>
    );
};
