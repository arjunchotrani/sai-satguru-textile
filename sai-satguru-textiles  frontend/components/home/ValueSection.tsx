import React from 'react';
import { ShieldCheck, MessageCircle } from 'lucide-react';

export const ValueSection: React.FC = () => {
    return (
        <section className="py-12 md:py-24 bg-black border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl mx-auto px-6">
                <div className="text-center flex flex-col items-center">
                    <ShieldCheck className="mb-6 text-brand-gold" size={32} />
                    <h3 className="font-serif text-xl mb-4 text-white">Quality Assurance</h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                        Stringent quality control to ensure every piece meets our premium standards.
                    </p>
                </div>
                <div className="text-center flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-brand-gold text-brand-gold mb-6 font-bold text-xs italic">
                        SS
                    </div>
                    <h3 className="font-serif text-xl mb-4 text-white">Direct from Surat</h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                        Sourced directly from India's textile capital to offer unmatched value.
                    </p>
                </div>
                <div className="text-center flex flex-col items-center">
                    <MessageCircle className="mb-6 text-brand-gold" size={32} />
                    <h3 className="font-serif text-xl mb-4 text-white">Expert Support</h3>
                    <p className="text-white/40 text-sm leading-relaxed max-w-xs">
                        Dedicated wholesale support to help grow your business.
                    </p>
                </div>
            </div>
        </section>
    );
};
