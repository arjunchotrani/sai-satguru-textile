import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { CONTACT_INFO, CATEGORIES } from '../constants';
import { Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-dark border-t border-brand-border text-white">
      <div className="grid grid-cols-1 lg:grid-cols-4 border-b border-brand-border">

        {/* Brand Area */}
        <div className="lg:col-span-1 p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-brand-border">
          <Logo className="mb-8" />
          <p className="text-[10px] text-brand-muted/40 uppercase tracking-widest mb-8">
            © 2015 Sai Satguru Textiles
          </p>

          <div className="flex gap-6 text-white/40 mb-10">
            <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Instagram size={20} />
            </a>
            <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-brand-gold transition-colors">
              <Facebook size={20} />
            </a>
          </div>

          <div className="pt-6 border-t border-brand-border/30">
            <p className="text-[10px] text-brand-gold uppercase tracking-[0.2em] mb-2 opacity-100 font-bold">
              Developed By
            </p>
            <div className="flex flex-col gap-1">
              <span className="text-white font-medium tracking-wider text-sm">Arjun Chotrani</span>
              <a href="tel:+919316178452" className="text-xs md:text-sm text-white hover:text-brand-gold transition-colors block font-semibold tracking-wider">
                +91 9316178452
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3">

          {/* Philosophy (Formerly Categories) */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-brand-border">
            <h4 className="font-serif text-lg text-white mb-8">Philosophy</h4>
            <p className="text-xs text-brand-muted leading-relaxed text-justify font-light">
              We curate textiles that define spaces and occasions. A synthesis of heritage craftsmanship and modern distribution for the global retailer.
            </p>
          </div>

          {/* Legal/Company */}
          <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-brand-border">
            <h4 className="font-serif text-lg text-white mb-8">About Us</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-xs uppercase tracking-widest text-brand-muted hover:text-brand-gold transition-colors block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs uppercase tracking-widest text-brand-muted hover:text-brand-gold transition-colors block">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="p-8 md:p-12">
            <h4 className="font-serif text-lg text-white mb-8">Enquiries</h4>
            <div className="space-y-6">
              <div>
                <span className="block text-[10px] text-white uppercase tracking-[0.2em] mb-2 font-bold">Showroom</span>
                <p className="text-sm font-light text-brand-muted leading-relaxed">{CONTACT_INFO.address}</p>
              </div>
              <div>
                <span className="block text-[10px] text-white uppercase tracking-[0.2em] mb-2 font-bold">Contact Us</span>
                <p className="text-sm font-light text-brand-muted hover:text-white transition-colors cursor-pointer">{CONTACT_INFO.phone}</p>
                <p className="text-sm font-light text-brand-muted hover:text-white transition-colors cursor-pointer">{CONTACT_INFO.phone2}</p>
              </div>
              <div>
                <span className="block text-[10px] text-white uppercase tracking-[0.2em] mb-2 font-bold">E-Mail</span>
                <p className="text-sm font-light text-brand-muted hover:text-white transition-colors cursor-pointer">{CONTACT_INFO.email}</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};