export const revalidate = 86400;
import React from 'react';
import type { Metadata } from 'next';
import { ShieldCheck, FileText, Globe, Truck, Info, ShoppingBag, Percent } from 'lucide-react';
import { CONTACT_INFO } from '../../lib/constants';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Sai Satguru Textile',
  description: 'Read the terms and conditions of sourcing textiles and wholesale products from Sai Satguru Textile, Surat.',
};

const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children?: React.ReactNode }) => (
  <div className="mb-12 border-l border-[#d4af37]/20 pl-8 relative animate-fade-in-up">
    <div className="absolute -left-[13px] top-0 w-6 h-6 bg-black border border-[#d4af37]/50 rounded-full flex items-center justify-center text-[#d4af37] shadow-[0_0_8px_rgba(212,175,55,0.2)]">
      <Icon size={12} />
    </div>
    <h2 className="font-serif text-xl text-white mb-4 uppercase tracking-widest">{title}</h2>
    <div className="text-white/50 text-sm leading-relaxed font-light space-y-3">
      {children}
    </div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="bg-black min-h-screen pt-24 pb-24 text-white">
      {/* Header */}
      <div className="relative py-16 border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.4em] block mb-3 animate-fade-in">Legal & Policy</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-4 text-white animate-fade-in-up">Terms & Conditions</h1>
          <p className="text-white/30 max-w-xl mx-auto italic text-sm animate-fade-in-up">
            Please read these terms carefully before using our digital catalog.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-20">
        <div className="max-w-3xl mx-auto">
          
          <Section icon={ShoppingBag} title="1. Wholesale & Inquiries">
            <p>• Sai Satguru Textile is a wholesale vendor platform. All product interactions are intended for wholesale inquiries.</p>
            <p>• Submitting an inquiry via WhatsApp or our digital forms does not constitute a confirmed order until verified by our sales team.</p>
          </Section>

          <Section icon={Info} title="2. Pricing & Availability">
            <p>• Listed prices (where applicable) are base rates. Prices are subject to change based on market fabric costs, order volume, and destination taxes.</p>
            <p>• Since the textile industry moves fast, availability is only confirmed at the moment of inquiry response.</p>
          </Section>

          <Section icon={Percent} title="3. GST & Taxes">
            <p>• All prices shown on the website are exclusive of Goods and Services Tax (GST) unless explicitly stated otherwise.</p>
            <p>• Applicable GST (typically 5% for textiles) will be calculated and added to the final invoice.</p>
          </Section>

          <Section icon={Truck} title="4. Shipping & Logistics">
            <p>• We ship globally from Surat, Gujarat. Shipping charges are billed extra based on actual weight, volume, and destination.</p>
            <p>• Delivery timelines provided are estimates and subject to carrier conditions.</p>
          </Section>

          <Section icon={ShieldCheck} title="5. Returns & Quality Assurance">
            <p>• As a wholesale entity, we follow a strict quality-check protocol. Every product is physically inspected before dispatch.</p>
            <p>• Returns are generally not accepted unless a manufacturing defect is proven and documented upon receipt.</p>
          </Section>

          <Section icon={Globe} title="6. Intellectual Property">
            <p>• All images, logos, and product descriptions are the property of Sai Satguru Textile or our respective manufacturing partners.</p>
            <p>• Unauthorized use for retail marketing by non-partners is strictly prohibited.</p>
          </Section>

          {/* Footer Contact Info */}
          <div className="mt-20 p-10 border border-white/10 bg-neutral-900/50 rounded-sm animate-fade-in-up">
            <h3 className="font-serif text-lg mb-6 text-[#d4af37]">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs uppercase tracking-widest text-white/60">
              <div className="space-y-2">
                <p className="text-white font-bold">Showroom Address</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_INFO.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="normal-case leading-loose block hover:text-[#d4af37] py-1 transition-colors"
                >
                  {CONTACT_INFO.address}
                </a>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-bold mb-1">Phone / WhatsApp</p>
                  <a href={`tel:${CONTACT_INFO.phone.replace(/\s+/g, '')}`} className="block hover:text-[#d4af37] py-0.5 transition-colors">{CONTACT_INFO.phone}</a>
                  <a href={`tel:${CONTACT_INFO.phone2.replace(/\s+/g, '')}`} className="block hover:text-[#d4af37] py-0.5 transition-colors">{CONTACT_INFO.phone2}</a>
                </div>
                <div>
                  <p className="text-white font-bold mb-1">Email</p>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="lowercase block hover:text-[#d4af37] py-0.5 transition-colors">{CONTACT_INFO.email}</a>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-3 hover:bg-[#d4af37] transition-colors text-center inline-block">
                Back to Home
              </Link>
              <Link href="/contact" className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 px-8 py-3 hover:bg-white/10 transition-colors text-center inline-block">
                Contact Support
              </Link>
            </div>
          </div>

          <p className="mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.5em] animate-fade-in-up">
            © 2015 Sai Satguru Textile • All Rights Reserved
          </p>

        </div>
      </div>
    </div>
  );
}
