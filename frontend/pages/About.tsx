import React, { useEffect } from 'react';
import { ShieldCheck, Globe, Star, Gem, Handshake, Truck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { CONTACT_INFO } from '../constants';

export const About: React.FC = () => {

    // Reveal animation on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (e) => e.isIntersecting && e.target.classList.add("active")
                ),
            { threshold: 0.1 }
        );

        document
            .querySelectorAll(".reveal")
            .forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-black min-h-screen pt-28 md:pt-36 pb-12 text-white overflow-x-hidden">
            <SEO
                title="Sai Satguru Textile | Premier Wholesale Textile Vendor Surat"
                description="Your trusted textile sourcing partner in Surat. We connect global retailers with premium wholesale fabrics, sarees, and ethnic wear since 2015."
                url={window.location.href}
            />

            {/* HERO SECTION */}
            <div className="container mx-auto px-4 lg:px-8 mb-24 relative">
                <div className="text-center max-w-5xl mx-auto reveal">
                    <span className="text-brand-gold text-[10px] md:text-xs uppercase tracking-[0.4em] font-bold mb-6 block animate-fade-in">
                        Global Textile Sourcing Partner
                    </span>
                    <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight">
                        Curating Excellence From <br />
                        <span className="text-brand-gold italic">The Heart of Surat</span>
                    </h1>
                    <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-12">
                        We are the bridge between Surat's finest textile craftsmanship and the global fashion market.
                        A premier vendor partner for boutiques, retailers, and high-street fashion labels.
                    </p>
                    <div className="flex flex-col md:flex-row gap-6 justify-center">
                        <a href={`https://wa.me/${CONTACT_INFO.whatsapp1}`} target="_blank" rel="noopener noreferrer" className="bg-brand-gold text-black px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                            Get Wholesale Access
                        </a>
                        <Link to="/contact" className="border border-white/20 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:border-brand-gold hover:text-brand-gold transition-colors">
                            Request Catalogue
                        </Link>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            </div>

            {/* TRUST INDICATORS */}
            <div className="border-y border-white/5 bg-neutral-900/30 mb-24 reveal">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-serif text-brand-gold mb-2">2015</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Established</p>
                        </div>
                        <div>
                            <h3 className="text-3xl md:text-4xl font-serif text-brand-gold mb-2">500+</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Global Partners</p>
                        </div>
                        <div>
                            <h3 className="text-3xl md:text-4xl font-serif text-brand-gold mb-2">10k+</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Premium Designs</p>
                        </div>
                        <div>
                            <h3 className="text-3xl md:text-4xl font-serif text-brand-gold mb-2">100%</h3>
                            <p className="text-[10px] uppercase tracking-widest text-white/40">Quality Check</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* BRAND STORY */}
            <div className="container mx-auto px-4 lg:px-8 mb-32 reveal">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 items-center">
                    <div className="order-2 md:order-1">
                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
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
                                Today, we are not just a supplier; we are a strategic partner. We leverage deep-rooted relationships with the city's top manufacturers to bring you exclusive, high-quality collections that define market trends.
                            </p>
                        </div>
                    </div>

                    <div className="order-1 md:order-2 relative aspect-[4/5] bg-neutral-900 rounded-sm border border-white/10 p-2 group">
                        <div className="w-full h-full bg-neutral-800 relative overflow-hidden">
                            {/* Abstract Decorative Element */}
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-gold/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center border border-white/5 m-4">
                                <Gem size={48} className="text-brand-gold mb-6 opacity-80" />
                                <h4 className="font-serif text-2xl mb-2">The Gold Standard</h4>
                                <p className="text-xs text-white/40 max-w-[200px]">In Wholesale Sourcing</p>
                            </div>
                        </div>
                        {/* Decorative corner accents */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-brand-gold/50 -translate-x-1 -translate-y-1"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-brand-gold/50 translate-x-1 translate-y-1"></div>
                    </div>
                </div>
            </div>

            {/* CAPABILITIES (WHAT WE OFFER) */}
            <div className="bg-neutral-950 py-24 border-y border-white/5 mb-32 reveal">
                <div className="container mx-auto px-4 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
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
                            <div key={i} className="bg-black border border-white/10 p-10 hover:border-brand-gold/50 transition-all group">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:bg-brand-gold/10 text-brand-gold transition-colors">
                                    {item.icon}
                                </div>
                                <h3 className="font-serif text-xl mb-4 text-white group-hover:text-brand-gold transition-colors">{item.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed font-light">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* VALUE PROP (WHY CHOOSE US) */}
            <div className="container mx-auto px-4 lg:px-8 mb-32 reveal">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        <div>
                            <span className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-bold mb-4 block">
                                value proposition
                            </span>
                            <h2 className="font-serif text-3xl md:text-5xl mb-8">Why Retailers <br /> Choose Us</h2>
                            <p className="text-white/60 font-light mb-12 max-w-md">
                                In a crowded market, reliability is luxury. We provide the assurance and quality your business needs to thrive.
                            </p>

                            <div className="space-y-8">
                                {[
                                    { title: "Curated Selection", desc: "We filter through thousands of designs to present only the most commercially viable and trend-setting pieces." },
                                    { title: "Rigorous Quality Control", desc: "Every shipment undergoes a 3-point physical inspection before it leaves our facility." },
                                    { title: "Vendor Coordination", desc: "Single point of contact for multiple manufacturing units, saving you time and complexity." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <div className="w-12 h-12 shrink-0 border border-white/10 flex items-center justify-center text-white/30 font-serif text-xl group-hover:border-brand-gold group-hover:text-brand-gold transition-colors">
                                            0{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-2 text-white group-hover:text-brand-gold transition-colors">{item.title}</h4>
                                            <p className="text-white/40 text-sm font-light leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative h-full min-h-[500px] border border-white/10 p-2">
                            <div className="w-full h-full bg-neutral-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                                {/* Map Graphic or Global abstract */}
                                <Globe size={200} className="text-white/5 absolute -right-10 -bottom-10" />
                                <div className="relative z-10 text-center p-8 bg-black/50 backdrop-blur-md border border-white/10 max-w-xs">
                                    <Star className="text-brand-gold mx-auto mb-4" fill="currentColor" size={24} />
                                    <p className="font-serif text-xl italic text-white mb-4">"Our vision is to empower retailers with fabrics that tell a story of longevity and luxury."</p>
                                    <div className="h-px w-12 bg-brand-gold mx-auto mb-4"></div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/60 mb-2">Managed By</p>
                                    <p className="text-xs font-bold uppercase tracking-widest text-white">Karan Chotrani & Lata Chotrani</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA SECTION */}
            <div className="container mx-auto px-4 lg:px-8 mb-24 reveal">
                <div className="bg-gradient-to-br from-brand-gold/20 to-neutral-900 border border-brand-gold/30 p-12 md:p-24 text-center rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-gold/50"></div>

                    <h2 className="font-serif text-3xl md:text-5xl mb-6 relative z-10">Partner With Industry Leaders</h2>
                    <p className="text-white/70 max-w-2xl mx-auto mb-10 font-light relative z-10">
                        Ready to elevate your inventory? Connect with our catalogue team today for exclusive wholesale access.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <Link to="/contact" className="bg-brand-gold text-black px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors">
                            Contact Sales
                        </Link>
                        <a href={`https://wa.me/${CONTACT_INFO.whatsapp2}`} target="_blank" rel="noopener noreferrer" className="bg-transparent border border-white/30 text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                            <span>WhatsApp Us</span> <ChevronRight size={14} />
                        </a>
                    </div>

                    {/* Background glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-gold/10 blur-[100px] rounded-full pointer-events-none"></div>
                </div>
            </div>

        </div>
    );
};
