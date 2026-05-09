'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Menu, X, ChevronRight, Globe, Instagram, Facebook, ChevronLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useCurrency } from './CurrencyContext';
import { SmartLink } from './SmartLink';
import { Category, SubCategory } from '../lib/types';
import { CONTACT_INFO } from '../lib/constants';

interface NavbarProps {
  categories: Category[];
  groupedSubCategories: Record<string, SubCategory[]>;
}

export const Navbar: React.FC<NavbarProps> = ({ categories, groupedSubCategories }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'main' | 'collections'>('main'); // For mobile nav
  const [hoveredLink, setHoveredLink] = useState<string | null>(null); // For desktop split view
  const [currencySearch, setCurrencySearch] = useState(''); // Currency Dropdown Search
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const router = useRouter();
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const pathname = usePathname();

  const toggleMobileCategory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMobileCategory(prev => prev === id ? null : id);
  };

  // Scroll Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock Body Scroll
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
  }, [isMenuOpen]);

  // Close Menu on Route Change
  useEffect(() => {
    // Defer state updates to avoid synchronous setState warnings during render
    const t = setTimeout(() => {
      setIsMenuOpen(false);
      setActivePanel('main');
      setHoveredLink(null);
      setSelectedCategoryId(null);
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  const toggleMenu = () => {
    const nextState = !isMenuOpen;
    setIsMenuOpen(nextState);

    if (nextState) {
      window.history.pushState({ menuOpen: true }, '');
    } else {
      if (window.history.state?.menuOpen) {
        window.history.back();
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const shouldBeOpen = !!window.history.state?.menuOpen;
      setIsMenuOpen(shouldBeOpen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled || isMenuOpen ? 'py-4 bg-black/50 backdrop-blur-md border-b border-white/5' : 'py-6 bg-transparent'
          }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">

          <div className="flex items-center gap-4 z-[110]">
            {pathname !== '/' && (
              <button
                onClick={() => {
                  if (window.history.length > 2) {
                    router.back();
                  } else {
                    router.push('/');
                  }
                }}
                className="p-1 -ml-2 md:ml-0 text-white/70 hover:text-[#d4af37] transition-colors flex items-center gap-1 group"
                aria-label="Go Back"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
                <span className="hidden md:block text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Back</span>
              </button>
            )}

            <Link href="/" className="relative">
              <Logo variant="default" compact={scrolled || isMenuOpen} />
            </Link>
          </div>

          <div className="flex items-center gap-6 z-[110]">
            <div className="relative group block">
              <button className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-[#d4af37]'}`}>
                <Globe size={18} strokeWidth={1.5} />
                <span className="font-bold">{currentCurrency?.code || 'INR'}</span>
              </button>
              <div className="absolute top-full right-0 mt-4 w-64 max-h-80 overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-xl border border-white/10 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl shadow-black/50 p-2">
                <div className="sticky top-0 bg-black/95 z-10 pb-2 border-b border-white/10 mb-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Currency..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#d4af37]/50 transition-colors uppercase tracking-wider"
                      onClick={(e) => e.stopPropagation()} 
                      autoFocus
                    />
                    <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                {currencies
                  ?.filter(c =>
                    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                    (c.label && c.label.toLowerCase().includes(currencySearch.toLowerCase()))
                  )
                  .map(cur => (
                    <button
                      key={cur.code}
                      onClick={() => {
                        setCurrency(cur.code);
                        setCurrencySearch('');
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 rounded-sm ${currentCurrency?.code === cur.code ? 'text-[#d4af37] bg-white/5' : 'text-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{cur.code}</span>
                        <span className="text-white/50">{cur.symbol}</span>
                      </div>
                      {cur.label && <div className="text-[9px] text-white/40 normal-case mt-0.5 truncate">{cur.label.split('(')[0]}</div>}
                    </button>
                  ))}

                {currencies?.filter(c => c.code.toLowerCase().includes(currencySearch.toLowerCase()) || (c.label && c.label.toLowerCase().includes(currencySearch.toLowerCase()))).length === 0 && (
                  <div className="text-center py-4 text-white/30 text-[10px] italic">No currency found</div>
                )}
              </div>
            </div>

            <SmartLink
              href="/search"
              className={`transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-[#d4af37]'}`}
            >
              <Search size={22} strokeWidth={1.5} />
            </SmartLink>

            <button
              onClick={toggleMenu}
              className={`flex items-center gap-3 transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-[#d4af37]'}`}
            >
              <span className="hidden md:block text-xs uppercase tracking-[0.2em] font-medium">
                {isMenuOpen ? 'Close' : 'Menu'}
              </span>
              {isMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 bg-black z-[90] transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50"></div>

        <div className="container mx-auto h-full px-6 md:px-12 pt-32 pb-[120px] md:pb-12 flex flex-col md:flex-row">

          <div className={`w-full md:w-[32%] lg:w-[28%] flex flex-col justify-between h-full transition-all duration-500 md:border-r border-white/5 absolute md:relative top-0 left-0 pt-32 md:pt-0 px-6 md:px-0 bg-black md:bg-transparent z-0 ${activePanel === 'collections' ? '-translate-x-full opacity-0 invisible md:visible md:translate-x-0 md:opacity-100' : 'translate-x-0 opacity-100 visible'
            }`}>
            <nav className="flex flex-col items-start gap-4 md:gap-6 mb-8">
              {[
                { label: 'Home', path: '/' },
                { label: 'Our Collections', id: 'collections', hasArrow: true },
                { label: 'Brands', path: '/brands' },
                { label: 'About Us', path: '/about' },
                { label: 'Contact Showroom', path: '/contact' },
              ].map((item) => (
                item.path ? (
                  <SmartLink
                    key={item.label}
                    href={item.path}
                    onMouseEnter={() => {
                      setHoveredLink(null);
                      setSelectedCategoryId(null);
                    }}
                    className="text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-sans uppercase tracking-[0.1em] font-light text-white/70 md:hover:text-[#d4af37] transition-all duration-300 cursor-pointer text-left p-0 w-full"
                  >
                    {item.label}
                  </SmartLink>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => setActivePanel('collections')}
                    onMouseEnter={() => setHoveredLink('collections')}
                    className={`text-2xl md:text-2xl lg:text-3xl xl:text-4xl font-sans uppercase tracking-[0.1em] font-light transition-all duration-300 flex items-center gap-4 cursor-pointer text-left p-0 w-full ${(hoveredLink === 'collections' || activePanel === 'collections') ? 'md:text-[#d4af37] text-white' : 'text-white/70 md:hover:text-[#d4af37]'
                      }`}
                  >
                    {item.label}
                    <ChevronRight className="md:hidden" size={24} />
                  </button>
                )
              ))}
            </nav>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-6 z-50">
                <a href={CONTACT_INFO.instagram} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Instagram size={20} /></a>
                <a href={CONTACT_INFO.facebook} target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors"><Facebook size={20} /></a>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/20">
                © 2015 Sai Satguru Textile.
              </p>
            </div>
          </div>

          <div className={`w-full md:w-[32%] lg:w-[28%] h-full md:border-r border-white/5 md:pl-8 lg:pl-12 flex flex-col justify-start pt-32 md:pt-4 px-6 md:px-0 bg-black md:bg-transparent absolute md:relative top-0 left-0 transition-all duration-500 z-50 ${(activePanel === 'collections' || hoveredLink === 'collections') ? 'translate-x-0 opacity-100 visible pointer-events-auto md:pointer-events-auto' : 'md:opacity-0 md:translate-x-full opacity-0 translate-x-10 pointer-events-none md:pointer-events-none invisible md:invisible'
            }`}>
            <button
              onClick={() => {
                setActivePanel('main');
                setHoveredLink(null);
              }}
              className="md:hidden flex items-center gap-2 text-white/40 mb-8 uppercase tracking-widest text-xs py-2 px-1 -ml-1 active:text-white relative z-50"
            >
              <ChevronRight className="rotate-180" size={14} /> Back to Menu
            </button>

            <div className="mb-4 hidden md:block md:pl-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold block mb-6">Catalog</span>
              <h3 className="font-display text-2xl tracking-[0.1em] uppercase text-white mb-2 border-b border-[#d4af37]/30 pb-2 w-fit">Categories</h3>
            </div>

            <div className="space-y-4 md:space-y-1 overflow-y-auto max-md:flex-1 max-md:min-h-0 md:max-h-[60vh] pr-2 custom-scrollbar">
              {categories.map((cat) => (
                <div key={cat.id}
                  onMouseEnter={() => setSelectedCategoryId(cat.id)}
                  className={`group/cat flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer md:py-3 md:pr-4 transition-all duration-300 ${selectedCategoryId === cat.id ? 'md:border-l-2 md:border-[#d4af37] md:pl-4' : 'md:border-l-2 md:border-transparent md:pl-4'}`}
                >
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <SmartLink
                      href={`/category/${cat.slug}`}
                      className={`text-2xl md:text-sm uppercase tracking-widest font-bold transition-all duration-300 ${selectedCategoryId === cat.id ? 'md:text-[#d4af37] text-white' : 'text-white/80 group-hover/cat:text-white'}`}
                    >
                      {cat.name || cat.label}
                    </SmartLink>
                    {groupedSubCategories[cat.id]?.length > 0 && (
                      <button
                        onClick={(e) => toggleMobileCategory(e, cat.id)}
                        className="md:hidden px-4 py-2 -mr-2 text-white/50 hover:text-white"
                        aria-label={`Toggle ${cat.name} subcategories`}
                      >
                        <ChevronRight size={24} className={`transition-transform duration-300 ${expandedMobileCategory === cat.id ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>

                  <div className={`md:hidden w-full overflow-hidden transition-all duration-300 ${expandedMobileCategory === cat.id ? 'max-h-[1500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="border-l border-white/10 pl-4 space-y-2 pb-2">
                      {groupedSubCategories[cat.id]?.map(sub => (
                        <SmartLink
                          key={sub.id}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          className="block text-lg font-serif text-white/80 hover:text-white transition-colors py-1"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name || sub.label}
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div className="h-40 md:h-12 w-full flex-shrink-0"></div>
            </div>
          </div>

          <div className={`w-full md:flex-1 h-full md:pl-8 lg:pl-16 flex flex-col justify-start pt-4 transition-all duration-500 ${(selectedCategoryId && hoveredLink === 'collections') ? 'opacity-100 translate-x-0 hidden md:flex' : 'opacity-0 translate-x-10 hidden md:flex'
            }`}>
            {selectedCategoryId && (
              <div className="animate-fade-in w-full">
                <div className="mb-8 border-b border-white/5 pb-8 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37] font-bold block mb-3">Showing: {categories.find(c => c.id === selectedCategoryId)?.name || categories.find(c => c.id === selectedCategoryId)?.label}</span>
                    <h3 className="font-display text-3xl uppercase tracking-widest text-white">Refinement</h3>
                  </div>
                  <Link
                    href={`/category/${categories.find(c => c.id === selectedCategoryId)?.slug}`}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/20 px-4 py-2 hover:border-[#d4af37] transition-all"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {groupedSubCategories[selectedCategoryId]?.map((sub, idx) => (
                    <SmartLink
                      key={sub.id}
                      href={`/category/${categories.find(c => c.id === selectedCategoryId)?.slug}/${sub.slug}`}
                      className="text-white/60 hover:text-[#d4af37] text-sm uppercase tracking-wider transition-colors py-2 border-b border-white/5 hover:border-[#d4af37]/30 block"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {sub.name || sub.label}
                    </SmartLink>
                  ))}
                  {(!groupedSubCategories[selectedCategoryId] || groupedSubCategories[selectedCategoryId].length === 0) && (
                    <p className="text-white/20 text-sm italic col-span-2">No sub-categories available.</p>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
};
