import React from 'react';
import { MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../../constants';

export const CommunityCTA: React.FC = () => (
    <div className="mt-20 reveal bg-gradient-to-r from-brand-dark to-neutral-900 border border-white/5 p-8 md:p-12 text-center rounded-sm">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-full mb-6 border border-[#25D366]/20">
            <MessageCircle size={32} />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl mb-4">
            Join Our WhatsApp Community Group
        </h3>
        <p className="text-white/50 text-sm md:text-base max-w-xl mx-auto mb-8 font-light">
            Get instant updates on the latest textile arrivals and catalogs.
        </p>
        <a
            href={CONTACT_INFO.whatsappCommunity}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#1eb355] text-white px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all"
        >
            <MessageCircle size={18} /> Join Now
        </a>
    </div>
);
