
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Globe, Truck, Info, ShoppingBag } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

// Fixed: Made children optional to prevent TypeScript errors at JSX call sites
const Section = ({ icon: Icon, title, children }: { icon: any, title: string, children?: React.ReactNode }) => (
  <div className="mb-12 reveal border-l border-brand-gold/20 pl-8 relative">
    <div className="absolute -left-[13px] top-0 w-6 h-6 bg-black border border-brand-gold/50 rounded-full flex items-center justify-center text-brand-gold shadow-[0_0_8px_rgba(255,215,0,0.2)]">
      <Icon size={12} />
    </div>
    <h2 className="font-serif text-xl text-white mb-4 uppercase tracking-widest">{title}</h2>
    <div className="text-white/50 text-sm leading-relaxed font-light space-y-3">
      {children}
    </div>
  </div>
);

export const Terms: React.FC = () => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-black min-h-screen pt-24 pb-24 text-white">
      {/* Header */}
      <div className="relative py-16 border-b border-white/5">
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] block mb-3">Legal & Policy</span>
          <h1 className="font-serif text-4xl md:text-6xl mb-4">Terms of Service</h1>
          <p className="text-white/30 max-w-xl mx-auto italic text-sm">
            Please read these terms carefully before using our digital catalog.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-20">
        <div className="max-w-3xl mx-auto">
          
          <Section icon={ShoppingBag} title="Service Scope">
            <p>• <strong>Catalog Only:</strong> This website is for display purposes. We do not process online payments.</p>
            <p>• <strong>Direct Contact:</strong> All orders and enquiries are handled exclusively via WhatsApp, Phone, or direct showroom visits.</p>
          </Section>

          <Section icon={Info} title="Product & Pricing">
            <p>• <strong>Visuals:</strong> Images are for reference. Actual color, texture, or design may vary slightly due to artisanal craftsmanship.</p>
            <p>• <strong>Quotes:</strong> Prices shown are indicative. Final pricing is confirmed personally during order confirmation based on current market rates.</p>
            <p>• <strong>Availability:</strong> All items are subject to stock availability at the time of your enquiry.</p>
          </Section>

          <Section icon={Truck} title="Orders & Logistics">
            <p>• <strong>Confirmation:</strong> Orders are finalized only after mutual agreement on quantity and payment terms.</p>
            <p>• <strong>Shipping:</strong> Timelines are estimates. We are not liable for courier delays or unforeseen logistical issues.</p>
            <p>• <strong>Returns:</strong> No returns or cancellations are accepted once an order is confirmed, except for pre-agreed manufacturing defects.</p>
          </Section>

          <Section icon={ShieldCheck} title="Legal & Ownership">
            <p>• <strong>Property:</strong> All catalog imagery, logos, and text are the intellectual property of <strong>Sai Satguru Textile</strong>.</p>
            <p>• <strong>Liability:</strong> We are not responsible for temporary website downtime or third-party service interruptions.</p>
            <p>• <strong>Jurisdiction:</strong> These terms are governed by Indian Law, with jurisdiction strictly in <strong>Surat, Gujarat</strong>.</p>
          </Section>

          {/* Footer Contact Info */}
          <div className="mt-20 p-10 border border-white/10 bg-neutral-900/50 rounded-sm">
            <h3 className="font-serif text-lg mb-6 text-brand-gold">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs uppercase tracking-widest text-white/60">
              <div className="space-y-2">
                <p className="text-white font-bold">Showroom Address</p>
                <p className="normal-case leading-loose">{CONTACT_INFO.address}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-white font-bold mb-1">Phone / WhatsApp</p>
                  <p>{CONTACT_INFO.phone}</p>
                  <p>{CONTACT_INFO.phone2}</p>
                </div>
                <div>
                  <p className="text-white font-bold mb-1">Email</p>
                  <p className="lowercase">{CONTACT_INFO.email}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white text-black px-8 py-3 hover:bg-brand-gold transition-colors">
                Back to Home
              </Link>
              <Link to="/contact" className="text-[10px] font-bold uppercase tracking-[0.2em] border border-white/20 px-8 py-3 hover:bg-white/10 transition-colors">
                Contact Support
              </Link>
            </div>
          </div>

          <p className="mt-12 text-center text-[10px] text-white/20 uppercase tracking-[0.5em]">
            © 2015 Sai Satguru Textile • All Rights Reserved
          </p>

        </div>
      </div>
    </div>
  );
};
