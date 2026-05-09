export const revalidate = 86400;
import React from 'react';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { CONTACT_INFO } from '../../lib/constants';
import { ContactForm } from '../../components/ContactForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with Sai Satguru Textile for wholesale inquiries, catalogue requests, and bulk textile sourcing from Surat.',
  alternates: {
    canonical: 'https://saisatgurutextile.com/contact',
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="py-20 text-center text-white mb-16 border-b border-white/10 animate-in fade-in duration-700">
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Contact Our Showroom</h1>
        <p className="text-white/40 max-w-xl mx-auto italic font-light">
          Visit our collection in person or get in touch for bulk wholesale inquiries.
        </p>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mb-24">
        <div className="bg-neutral-950 border border-white/10 p-8 md:p-12 lg:p-16 -mt-32 relative z-10 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">

            {/* Info Section */}
            <div className="text-white">
              <h2 className="font-serif text-3xl mb-8">Reach Us Directly</h2>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#d4af37] shrink-0 border border-white/10">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Visit Showroom</h4>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/50 leading-relaxed text-sm hover:text-[#d4af37] transition-colors block group"
                    >
                      {CONTACT_INFO.address}
                      <span className="block text-[10px] text-[#d4af37] mt-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Open in Maps →</span>
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#d4af37] shrink-0 border border-white/10">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Phone Support</h4>
                    <div className="space-y-2 mt-2">
                       <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-4 py-2 text-sm hover:bg-white/10 hover:text-white transition-all w-fit rounded-sm">
                        <Phone size={14} className="text-[#d4af37]" /> {CONTACT_INFO.phone}
                      </a>
                      <a href={`tel:${CONTACT_INFO.phone2.replace(/\s+/g, '')}`} className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/50 px-4 py-2 text-sm hover:bg-white/10 hover:text-white transition-all w-fit rounded-sm">
                        <Phone size={14} className="text-[#d4af37]" /> {CONTACT_INFO.phone2}
                      </a>
                    </div>
                    <p className="text-white/20 text-[10px] uppercase tracking-widest mt-3">Mon - Sat, 10am - 8pm</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-[#d4af37] shrink-0 border border-white/10">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1 uppercase tracking-widest text-xs">Email</h4>
                    <p className="text-white/50 text-sm">{CONTACT_INFO.email}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-4">Direct WhatsApp Support</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp1}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-[#1eb355] transition-all"
                  >
                    <MessageCircle size={16} /> Sales Department
                  </a>
                  <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp2}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-3 border border-white/20 text-white px-6 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white/10 transition-all"
                  >
                    <MessageCircle size={16} /> Wholesale Help
                  </a>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="bg-black/40 p-8 border border-white/10">
              <h3 className="font-serif text-2xl text-white mb-6">Send a Digital Inquiry</h3>
              <ContactForm />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
