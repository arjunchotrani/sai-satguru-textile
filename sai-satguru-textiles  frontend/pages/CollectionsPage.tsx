
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../services/categories';
import { Category } from '../types';
import { SEO } from '../components/SEO';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../constants'; // Fallback

export const CollectionsPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await fetchCategories();
                if (data && data.length > 0) {
                    // Filter active
                    const active = data.filter((c: any) => c.is_active !== false && c.is_active !== 0 && c.status !== 'inactive');
                    setCategories(active);
                } else {
                    setCategories(CATEGORIES as unknown as Category[]);
                }
            } catch (error) {
                console.error("Failed to load categories", error);
                setCategories(CATEGORIES as unknown as Category[]);
            } finally {
                setLoading(false);
            }
        };
        loadCategories();
    }, []);

    return (
        <div className="bg-black min-h-screen pt-24 md:pt-36 pb-12 text-white">
            <SEO
                title="Our Collections | Sai Satguru Textile"
                description="Explore our complete range of premium wholesale textiles. Sarees, Lehengas, Kurtis, and more."
            />
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-3xl md:text-5xl mb-4">Our Collections</h1>
                    <p className="text-white/60 max-w-2xl mx-auto">
                        Discover the finest range of traditional and contemporary textiles.
                    </p>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-white/40">
                        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        Loading collections...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.slug}`}
                                className="group relative aspect-[4/5] overflow-hidden rounded-sm block bg-neutral-900"
                            >
                                {category.image ? (
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-white/20">
                                        No Image
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                                    <h2 className="font-serif text-2xl md:text-3xl text-white mb-2">{category.name || category.label}</h2>
                                    <div className="flex items-center gap-2 text-brand-gold text-xs uppercase tracking-widest font-bold opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                        Explore Collection <ArrowRight size={14} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollectionsPage;
