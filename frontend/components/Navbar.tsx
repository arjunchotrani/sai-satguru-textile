
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ChevronRight, Globe, Instagram, Facebook, ChevronLeft } from 'lucide-react';
import { Logo } from './Logo';
import { useCurrency } from './CurrencyContext';
import { useCategories, useAllSubCategories } from '../hooks/useProducts';
import { SmartLink } from './SmartLink';
import { Category, SubCategory } from '../types';

export const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<'main' | 'collections'>('main'); // For mobile nav
  const [hoveredLink, setHoveredLink] = useState<string | null>(null); // For desktop split view
  const [currencySearch, setCurrencySearch] = useState(''); // Currency Dropdown Search
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  const navigate = useNavigate();
  const { currentCurrency, setCurrency, currencies } = useCurrency();
  const location = useLocation();

  const toggleMobileCategory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedMobileCategory(prev => prev === id ? null : id);
  };

  const { data: categoryData } = useCategories();
  const { data: subCategoryData } = useAllSubCategories();

  const categories = React.useMemo(() => {
    return (categoryData || []).filter((c: any) => c.is_active !== false && c.is_active !== 0 && c.status !== 'inactive');
  }, [categoryData]);

  const groupedSubCategories = React.useMemo(() => {
    const groups: Record<string, SubCategory[]> = {};
    (subCategoryData || []).forEach((sub: any) => {
      const catId = sub.category_id || sub.categoryId;
      if (catId) {
        if (!groups[catId]) groups[catId] = [];
        groups[catId].push(sub);
      }
    });
    return groups;
  }, [subCategoryData]);

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
    setIsMenuOpen(false);
    setActivePanel('main');
    setHoveredLink(null);
    setSelectedCategoryId(null);
  }, [location]);

  // Toggle Menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* MINIMAL TOP BAR */}
      <header
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled || isMenuOpen ? 'py-4 bg-black/50 backdrop-blur-md border-b border-white/5' : 'py-6 bg-transparent'
          }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">

          <div className="flex items-center gap-4 z-[110]">
            {/* Back Button (Global) */}
            {location.pathname !== '/' && (
              <button
                onClick={() => navigate(-1)}
                className="p-1 -ml-2 md:ml-0 text-white/70 hover:text-brand-gold transition-colors"
                aria-label="Go Back"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Logo (Left, always visible) */}
            <Link to="/" className="relative">
              <Logo variant="default" className="h-6 md:h-8" />
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6 z-[110]">
            {/* Currency Selector - Visible on Mobile too */}
            <div className="relative group block">
              <button className={`flex items-center gap-2 text-xs uppercase tracking-widest transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-brand-gold'}`}>
                <Globe size={18} strokeWidth={1.5} />
                <span className="font-bold">{currentCurrency.code}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute top-full right-0 mt-4 w-64 max-h-80 overflow-y-auto custom-scrollbar bg-black/95 backdrop-blur-xl border border-white/10 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-2xl shadow-black/50 p-2">
                {/* Search Input */}
                <div className="sticky top-0 bg-black/95 z-10 pb-2 border-b border-white/10 mb-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Currency..."
                      value={currencySearch}
                      onChange={(e) => setCurrencySearch(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-brand-gold/50 transition-colors uppercase tracking-wider"
                      onClick={(e) => e.stopPropagation()} // Prevent closing on click
                      autoFocus
                    />
                    <Search size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30" />
                  </div>
                </div>

                {currencies
                  .filter(c =>
                    c.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
                    (c.label && c.label.toLowerCase().includes(currencySearch.toLowerCase()))
                  )
                  .map(cur => (
                    <button
                      key={cur.code}
                      onClick={() => {
                        setCurrency(cur.code);
                        setCurrencySearch(''); // Reset search on selection
                      }}
                      className={`w-full text-left px-3 py-2 text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 rounded-sm ${currentCurrency.code === cur.code ? 'text-brand-gold bg-white/5' : 'text-white'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{cur.code}</span>
                        <span className="text-white/50">{cur.symbol}</span>
                      </div>
                      {cur.label && <div className="text-[9px] text-white/40 normal-case mt-0.5 truncate">{cur.label.split('(')[0]}</div>}
                    </button>
                  ))}

                {currencies.filter(c => c.code.toLowerCase().includes(currencySearch.toLowerCase()) || (c.label && c.label.toLowerCase().includes(currencySearch.toLowerCase()))).length === 0 && (
                  <div className="text-center py-4 text-white/30 text-[10px] italic">No currency found</div>
                )}
              </div>
            </div>

            {/* Search Icon */}
            <SmartLink
              to="/search"
              targetComponent={() => import("../pages/SearchPage")}
              className={`transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-brand-gold'}`}
            >
              <Search size={22} strokeWidth={1.5} />
            </SmartLink>

            {/* Menu Trigger */}
            <button
              onClick={toggleMenu}
              className={`flex items-center gap-3 transition-colors duration-300 ${isMenuOpen ? 'text-white' : 'text-white hover:text-brand-gold'}`}
            >
              <span className="hidden md:block text-xs uppercase tracking-[0.2em] font-medium">
                {isMenuOpen ? 'Close' : 'Menu'}
              </span>
              {isMenuOpen ? <X size={28} strokeWidth={1} /> : <Menu size={28} strokeWidth={1} />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL SCREEN OVERLAY */}
      <div
        className={`fixed inset-0 bg-black z-[90] transition-all duration-700 ease-in-out ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
          }`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-50"></div>

        <div className="container mx-auto h-full px-6 md:px-12 pt-32 pb-12 flex flex-col md:flex-row">

          {/* LEFT PANEL: MAIN NAVIGATION */}
          <div className={`w-full md:w-1/4 flex flex-col justify-between h-full transition-all duration-500 md:border-r border-white/5 ${activePanel === 'collections' ? '-translate-x-full opacity-0 md:translate-x-0 md:opacity-100 hidden md:flex' : 'translate-x-0 opacity-100 flex'
            }`}>
            <nav className="flex flex-col items-start gap-4 md:gap-6">
              {[
                { label: 'Home', path: '/', component: () => import("../pages/Home") },
                { label: 'Our Collections', id: 'collections', hasArrow: true },
                { label: 'Brands', path: '/brands', component: () => import("../pages/BrandsPage") },
                { label: 'About Us', path: '/about', component: () => import("../pages/About") },
                { label: 'Contact Showroom', path: '/contact', component: () => import("../pages/Contact") },
              ].map((item) => (
                item.path ? (
                  <SmartLink
                    key={item.label}
                    to={item.path}
                    targetComponent={item.component}
                    onMouseEnter={() => {
                      setHoveredLink(null);
                      setSelectedCategoryId(null);
                    }}
                    className="text-3xl md:text-4xl lg:text-5xl font-serif text-white/80 hover:text-white transition-colors duration-300 cursor-pointer"
                  >
                    {item.label}
                  </SmartLink>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => setActivePanel('collections')}
                    onMouseEnter={() => setHoveredLink('collections')}
                    className={`text-3xl md:text-4xl lg:text-5xl font-serif transition-colors duration-300 flex items-center gap-4 cursor-pointer ${(hoveredLink === 'collections' || activePanel === 'collections') ? 'text-white' : 'text-white/80 hover:text-white'
                      }`}
                  >
                    {item.label}
                    <ChevronRight className="md:hidden" size={24} />
                  </button>
                )
              ))}
            </nav>

            <div className="mt-auto space-y-6">
              <div className="flex items-center gap-6">
                <a href="#" className="text-white/40 hover:text-white transition-colors"><Instagram size={20} /></a>
                <a href="#" className="text-white/40 hover:text-white transition-colors"><Facebook size={20} /></a>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/20">
                © 2026 Sai Satguru Textile.
              </p>
            </div>
          </div>

          {/* MIDDLE PANEL: CATEGORIES (Col 2) */}
          <div className={`w-full md:w-1/4 h-full md:border-r border-white/5 md:pl-12 flex flex-col justify-start pt-4 transition-all duration-500 ${(activePanel === 'collections' || hoveredLink === 'collections') ? 'translate-x-0 opacity-100 flex' : 'md:opacity-0 md:translate-x-full hidden md:flex'
            }`}>
            <button
              onClick={() => setActivePanel('main')}
              className="md:hidden flex items-center gap-2 text-white/40 mb-8 uppercase tracking-widest text-xs"
            >
              <ChevronRight className="rotate-180" size={14} /> Back to Menu
            </button>

            <div className="mb-4 hidden md:block">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold block mb-8">Catalog</span>
              <h3 className="font-serif text-3xl text-white mb-2">Categories</h3>
            </div>

            <div className="space-y-4 md:space-y-1 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {categories.map((cat, idx) => (
                <div key={cat.id}
                  onMouseEnter={() => setSelectedCategoryId(cat.id)}
                  className={`group/cat flex flex-col md:flex-row md:items-center md:justify-between cursor-pointer md:py-3 md:pr-4 transition-all duration-300 ${selectedCategoryId === cat.id ? 'md:border-l-2 md:border-brand-gold md:pl-4' : 'md:border-l-2 md:border-transparent md:pl-4'}`}
                >
                  <div className="flex items-center justify-between w-full md:w-auto">
                    <SmartLink
                      to={`/category/${cat.slug}`}
                      prefetchType="category"
                      prefetchId={cat.id}
                      targetComponent={() => import("../pages/CategoryPage")}
                      className={`text-2xl md:text-sm uppercase tracking-widest font-bold transition-all duration-300 ${selectedCategoryId === cat.id ? 'text-brand-gold' : 'text-white/40 group-hover/cat:text-white'}`}
                    >
                      {cat.name}
                    </SmartLink>
                    {/* Mobile Toggle Button */}
                    {groupedSubCategories[cat.id]?.length > 0 && (
                      <button
                        onClick={(e) => toggleMobileCategory(e, cat.id)}
                        className="md:hidden p-2 text-white/50 hover:text-white"
                      >
                        <ChevronRight size={20} className={`transition-transform duration-300 ${expandedMobileCategory === cat.id ? 'rotate-90' : ''}`} />
                      </button>
                    )}
                  </div>

                  {/* Mobile Sub-Categories (Accordion Style) */}
                  <div className={`md:hidden w-full overflow-hidden transition-all duration-300 ${expandedMobileCategory === cat.id ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                    <div className="border-l border-white/10 pl-4 space-y-2 pb-2">
                      {groupedSubCategories[cat.id]?.map(sub => (
                        <SmartLink
                          key={sub.id}
                          to={`/category/${cat.slug}/${sub.slug}`}
                          prefetchType="category"
                          prefetchId={cat.id}
                          targetComponent={() => import("../pages/SubCategoryPage").then(m => ({ default: m.SubCategoryPage }))}
                          className="block text-lg font-serif text-white/60 hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.name}
                        </SmartLink>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: REFINEMENT (Col 3) - Desktop Only mostly */}
          <div className={`w-full md:w-1/2 h-full md:pl-16 flex flex-col justify-start pt-4 transition-all duration-500 ${(selectedCategoryId && hoveredLink === 'collections') ? 'opacity-100 translate-x-0 hidden md:flex' : 'opacity-0 translate-x-10 hidden md:flex'
            }`}>
            {selectedCategoryId && (
              <div className="animate-fade-in w-full">
                <div className="mb-8 border-b border-white/5 pb-8 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-brand-gold font-bold block mb-4">Showing: {categories.find(c => c.id === selectedCategoryId)?.name}</span>
                    <h3 className="font-serif text-4xl text-white">Refinement</h3>
                  </div>
                  <Link
                    to={`/category/${categories.find(c => c.id === selectedCategoryId)?.slug}`}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white border border-white/20 px-4 py-2 hover:border-brand-gold transition-all"
                  >
                    View All
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                  {groupedSubCategories[selectedCategoryId]?.map((sub, idx) => (
                    <SmartLink
                      key={sub.id}
                      to={`/category/${categories.find(c => c.id === selectedCategoryId)?.slug}/${sub.slug}`}
                      prefetchType="category"
                      prefetchId={selectedCategoryId}
                      targetComponent={() => import("../pages/SubCategoryPage").then(m => ({ default: m.SubCategoryPage }))}
                      className="text-white/60 hover:text-brand-gold text-sm uppercase tracking-wider transition-colors py-2 border-b border-white/5 hover:border-brand-gold/30 block"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {sub.name}
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