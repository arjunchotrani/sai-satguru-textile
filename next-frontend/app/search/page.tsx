export const runtime = 'edge';
import React, { Suspense } from 'react';
import SearchArea from '@/components/SearchArea';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search',
    description: 'Search for premium wholesale textiles, sarees, and brands at Sai Satguru Textile.',
    robots: {
        index: false,
        follow: true,
    },
};

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="bg-black min-h-screen pt-36 text-center text-white/20">Loading Search...</div>}>
            <SearchArea />
        </Suspense>
    );
}

