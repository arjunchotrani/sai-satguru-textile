import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CurrencyProvider } from './components/CurrencyContext';
import { HelmetProvider } from 'react-helmet-async';
import { MessageCircle, X } from 'lucide-react';
import { CONTACT_INFO } from './constants';
import { PageTransition } from './components/PageTransition';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Optimal QueryClient for high-traffic commerce
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes (Safe for dev & prod balance)
            gcTime: 1000 * 60 * 60 * 24, // 24 hour garbage collection
            refetchOnWindowFocus: false,
            retry: 1, // Fail fast to prevent spinner fatigue
            placeholderData: (prev: any) => prev, // Smooth background updates
        },
    },
});

import { Home } from './pages/Home';
import { SplashGate } from './components/SplashGate';

// Lazy Load Pages for Performance
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const SubCategoryPage = React.lazy(() => import('./pages/SubCategoryPage').then(module => ({ default: module.SubCategoryPage })));
const ProductDetail = React.lazy(() => import('./pages/ProductDetail').then(module => ({ default: module.ProductDetail })));
const Contact = React.lazy(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const NewArrivals = React.lazy(() => import('./pages/NewArrivals').then(module => ({ default: module.NewArrivals })));
const Terms = React.lazy(() => import('./pages/Terms').then(module => ({ default: module.Terms })));

const About = React.lazy(() => import('./pages/About').then(module => ({ default: module.About })));
const SearchPage = React.lazy(() => import('./pages/SearchPage').then(module => ({ default: module.SearchPage })));
const BrandsPage = React.lazy(() => import('./pages/BrandsPage').then(module => ({ default: module.BrandsPage })));
const BrandLandingPage = React.lazy(() => import('./pages/BrandLandingPage').then(module => ({ default: module.BrandLandingPage })));
const CollectionsPage = React.lazy(() => import('./pages/CollectionsPage').then(module => ({ default: module.CollectionsPage })));

/**
 * Ensures page scrolls to top on every route change.
 */
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

/**
 * Premium WhatsApp Support Widget with dual support channels.
 */
const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end">
            <div
                className={`mb-4 flex flex-col items-end gap-3 transition-all duration-500 origin-bottom ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp1}?text=Hi, I am enquiring about products.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-white hover:bg-white/10 transition-all shadow-xl group"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Sales Enquiry</span>
                    <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle size={16} />
                    </div>
                </a>
                <a
                    href={`https://wa.me/${CONTACT_INFO.whatsapp2}?text=Hi, I am enquiring about wholesale deals.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 text-white hover:bg-white/10 transition-all shadow-xl group"
                >
                    <span className="text-[10px] uppercase tracking-widest font-bold">Wholesale Support</span>
                    <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center">
                        <MessageCircle size={16} />
                    </div>
                </a>
            </div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${isOpen ? 'bg-white text-black rotate-90' : 'bg-[#25D366] text-white hover:scale-110'
                    }`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} className="animate-pulse" />}
            </button>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <CurrencyProvider>
                <HelmetProvider>
                    <Router>
                        <SplashGate>
                            <ScrollToTop />
                            <Navbar />
                            <WhatsAppWidget />

                            <React.Suspense fallback={
                                <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
                                    <div className="relative w-14 h-14 mb-6">
                                        <div className="absolute inset-0 border border-brand-gold/20 rounded-full animate-[spin_2s_linear_infinite]"></div>
                                        <div className="absolute inset-1 border border-transparent border-t-brand-gold/60 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-brand-gold/50 rounded-full animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-white/20 text-[8px] uppercase tracking-[0.3em]">Loading</p>
                                </div>
                            }>
                                <Routes>
                                    <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                                    <Route path="/category/:categorySlug" element={<PageTransition><CategoryPage /></PageTransition>} />
                                    <Route path="/category/:categorySlug/:subCategorySlug" element={<PageTransition><SubCategoryPage /></PageTransition>} />
                                    <Route path="/product/:slug" element={<PageTransition><ProductDetail /></PageTransition>} />
                                    <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
                                    <Route path="/new-arrivals" element={<PageTransition><NewArrivals /></PageTransition>} />
                                    <Route path="/about" element={<PageTransition><About /></PageTransition>} />
                                    <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
                                    <Route path="/brands" element={<PageTransition><BrandsPage /></PageTransition>} />
                                    <Route path="/brand/:slug" element={<PageTransition><BrandLandingPage /></PageTransition>} />
                                    <Route path="/collections" element={<PageTransition><CollectionsPage /></PageTransition>} />
                                    <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
                                    {/* Fallback to Home */}
                                    <Route path="*" element={<Home />} />
                                </Routes>
                            </React.Suspense>
                            <Footer />
                        </SplashGate>
                    </Router>
                </HelmetProvider>
            </CurrencyProvider>
        </QueryClientProvider>
    );
};

export default App;
