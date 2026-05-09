export const revalidate = 86400;
import React from 'react';
import Link from 'next/link';
import { Gem, Handshake, Truck, ChevronRight } from 'lucide-react';
import { CONTACT_INFO } from '../../lib/constants';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Your trusted textile sourcing partner in Surat. We connect global retailers with premium wholesale fabrics, sarees, and ethnic wear since 2015.',
  alternates: {
    canonical: 'https://saisatgurutextile.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-28 md:pt-36 pb-12 text-white overflow-x-hidden">
      
      {/* HERO SECTION */}
      <div className="container mx-auto px-4 lg:px-8 mb-24 relative">
        <div className="text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="text-[#d4af37] text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-6 block">
            Global Textile Sourcing Partner
          </span>
          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight">
            Curating Excellence From <br />
            <span className="text-[#d4af37] italic">The Heart of Surat</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
            We are the bridge between Surat&apos;s finest textile craftsmanship and the global fashion market.
            A premier vendor partner for boutiques, retailers, and high-street fashion labels.
          </p>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp1}`} target="_blank" rel="noopener noreferrer" className="bg-[#d4af37] text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Get Wholesale Access
            </a>
            <Link href="/contact" className="border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-[#d4af37] hover:text-[#d4af37] transition-colors">
              Request Catalogue
            </Link>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      </div>

      {/* TRUST INDICATORS */}
      <div className="border-y border-white/5 bg-neutral-900/30 mb-24 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Established', bold: '2015' },
              { label: 'Global Partners', bold: '500+' },
              { label: 'Premium Designs', bold: '10k+' },
              { label: 'Quality Check', bold: '100%' }
            ].map((stat, i) => (
              <div key={i}>
                <h3 className="text-3xl md:text-4xl font-serif text-[#d4af37] mb-2">{stat.bold}</h3>
                <p className="text-[10px] uppercase tracking-widest text-white/40">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BRAND STORY */}
      <div className="container mx-auto px-4 lg:px-8 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 md:order-1">
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Our Journey
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-8 leading-tight">
              Redefining Wholesale <br /> Textile Sourcing
            </h2>
            <div className="space-y-6 text-white/60 font-light leading-relaxed text-justify">
              <p>
                Founded in 2015 in Surat, the textile capital of India, Sai Satguru Textile began with a singular vision: to organize and elevate the wholesale sourcing experience for retailers worldwide.
              </p>
              <p>
                We recognized that while Surat produced world-class fabrics, international buyers often struggled with consistency, communication, and curated selection. We stepped in to fill that gap.
              </p>
              <p>
                Today, we are not just a supplier; we are a strategic partner. We leverage deep-rooted relationships with the city&apos;s top manufacturers to bring you exclusive, high-quality collections that define market trends.
              </p>
            </div>
          </div>

          <div className="order-1 md:order-2 relative aspect-[4/5] bg-neutral-900 rounded-sm border border-white/10 p-2 group">
            <div className="w-full h-full bg-neutral-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border border-white/5 m-4">
                <Gem size={48} className="text-[#d4af37] mb-6 opacity-80" />
                <h4 className="font-serif text-2xl mb-2">The Gold Standard</h4>
                <p className="text-xs text-white/40 max-w-[200px]">In Wholesale Sourcing</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CAPABILITIES */}
      <div className="bg-neutral-950 py-24 border-y border-white/5 mb-32">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-[#d4af37] text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
              Our Capabilities
            </span>
            <h2 className="font-serif text-3xl md:text-5xl mb-6">What We Offer</h2>
            <p className="text-white/50 font-light">
              Comprehensive sourcing solutions tailored for modern fashion businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Gem size={32} />,
                title: "Premium Sourcing",
                desc: "Access to exclusive, high-GSM fabrics and intricate designs from top-tier manufacturers."
              },
              {
                icon: <Truck size={32} />,
                title: "Global Logistics",
                desc: "Streamlined shipping and export documentation for hassle-free delivery to 20+ countries."
              },
              {
                icon: <Handshake size={32} />,
                title: "Boutique Support",
                desc: "Flexible MOQs (Minimum Order Quantities) designed to support growing fashion boutiques and startups."
              }
            ].map((item, i) => (
              <div key={i} className="bg-black border border-white/10 p-10 hover:border-[#d4af37]/50 transition-all group">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:bg-[#d4af37]/10 text-[#d4af37] transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-serif text-xl mb-4 text-white group-hover:text-[#d4af37] transition-colors">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="container mx-auto px-4 lg:px-8 mb-24">
        <div className="bg-gradient-to-br from-[#d4af37]/20 to-neutral-900 border border-[#d4af37]/30 p-12 md:p-24 text-center rounded-sm relative overflow-hidden">
          <h2 className="font-serif text-3xl md:text-5xl mb-6 relative z-10">Partner With Industry Leaders</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-10 font-light relative z-10">
            Ready to elevate your inventory? Connect with our catalogue team today for exclusive wholesale access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/contact" className="bg-[#d4af37] text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
              Contact Sales
            </Link>
            <a href={`https://wa.me/${CONTACT_INFO.whatsapp2}`} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-white/30 text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
              <span>WhatsApp Us</span> <ChevronRight size={14} />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
