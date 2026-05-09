'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { ParsedProductDetails } from '../lib/product';

interface ProductTabsProps {
  details: ParsedProductDetails;
}

export const ProductTabs: React.FC<ProductTabsProps> = ({ details }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'shipping'>('overview');

  return (
    <div className="max-w-4xl mx-auto my-4 space-y-10">
      {/* Tab Navigation */}
      <div className="flex justify-start md:justify-center border-b border-white/10 gap-2 md:gap-8">
        {[
          { id: 'overview' as const, label: 'Overview' },
          { id: 'shipping' as const, label: 'Shipping & Terms' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 md:px-6 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap cursor-pointer ${activeTab === tab.id
              ? 'text-[#d4af37]'
              : 'text-white/30 hover:text-white'
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#d4af37]"></div>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {details.overviewItems.map((item, idx) => {
                if (item.type === 'badge') {
                  return (
                    <div key={idx} className="inline-block bg-white/[0.04] border border-white/10 px-5 py-2.5 rounded-full mr-3 mb-6 backdrop-blur-sm">
                      <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#d4af37]">{item.content}</span>
                    </div>
                  );
                }
                if (item.type === 'header') {
                  return (
                    <div key={idx} className="pt-10 pb-6 relative group">
                      <h4 className="flex items-center gap-4 text-xl md:text-2xl font-serif text-white uppercase">
                        <span className="w-8 h-[1px] bg-[#d4af37]/40 group-hover:w-16 transition-all duration-500"></span>
                        {item.content}
                      </h4>
                    </div>
                  );
                }

                const rawContent = item.content.trim();
                const isBullet = rawContent.startsWith('-');
                const textContent = isBullet ? rawContent.substring(1).trim() : rawContent;
                const firstColonIdx = textContent.indexOf(':');

                if (firstColonIdx > 0 && firstColonIdx < 35 && textContent.length < 150) {
                  const key = textContent.substring(0, firstColonIdx).trim();
                  const val = textContent.substring(firstColonIdx + 1).trim();

                  return (
                    <div key={idx} className="group grid grid-cols-1 md:grid-cols-[130px_1fr] gap-1 md:gap-4 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors rounded-sm px-4 md:-mx-4">
                      <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-[#d4af37]/80 transition-colors pt-1">
                        {key}
                      </span>
                      <span className="text-[15px] md:text-base text-white/90 font-light leading-relaxed">
                        {val}
                      </span>
                    </div>
                  );
                }

                return (
                  <p key={idx} className="text-[15px] md:text-lg text-neutral-300 font-light leading-[1.8] flex items-start gap-4 mb-6">
                    {isBullet && <span className="text-[#d4af37] text-lg mt-0.5 shrink-0">•</span>}
                    <span>{textContent}</span>
                  </p>
                );
              })}
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-700">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d4af37] mb-8 flex items-center gap-3">
                  <span className="w-6 h-[1px] bg-[#d4af37]/30"></span>
                  Product Summary
                </h4>
                <ul className="space-y-6">
                  {[
                    { label: "Material", text: "Premium Quality" },
                    { label: "Origin", text: "Heritage Craft" },
                    { label: "Shipping", text: "Global Reach" },
                    { label: "Pricing", text: "Wholesale Ready" }
                  ].map((stat, i) => (
                    <li key={i} className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">{stat.label}</span>
                      <span className="text-xs text-white font-bold tracking-widest uppercase">{stat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-[#d4af37]/[0.03] border border-[#d4af37]/10 p-8 rounded-3xl flex flex-col items-center text-center gap-4">
                <CheckCircle className="w-12 h-12 text-[#d4af37]" />
                <p className="text-[10px] text-[#d4af37] font-black uppercase tracking-[0.3em] leading-relaxed">
                  Verified Quality<br />
                  <span className="text-white/40">3-Step Check Complete</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="space-y-12 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Pricing Status', value: 'Wholesale Standard' },
                { label: 'Domestic/Global', value: details.shipping || 'Shipping Extra' },
                { label: 'Taxation Policy', value: details.gst || 'GST 5% Extra' }
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.03] border border-white/10 p-10 rounded-[2rem] text-center hover:bg-white/[0.06] transition-all group">
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 block mb-4 group-hover:text-[#d4af37]">{item.label}</span>
                  <span className="text-sm font-bold text-white uppercase tracking-widest">{item.value}</span>
                </div>
              ))}
            </div>

            {details.notes.length > 0 && (
              <div className="bg-white/[0.01] border border-white/5 p-12 rounded-[3rem] relative overflow-hidden">
                <h4 className="text-xs font-black uppercase tracking-[0.5em] text-white/30 mb-8 flex items-center gap-4">
                  <div className="w-8 h-[1px] bg-white/10"></div>
                  Terms & Guidelines
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {details.notes.map((note, i) => (
                    <li key={i} className="text-[11px] text-white/50 flex items-start gap-5 leading-relaxed group">
                      <span className="w-1.5 h-1.5 bg-[#d4af37]/30 rounded-full mt-1.5 shrink-0 group-hover:bg-[#d4af37]"></span>
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
