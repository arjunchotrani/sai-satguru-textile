import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: string;
}

export const SEO: React.FC<SEOProps> = ({
    title = 'Sai Satguru Textile | Wholesale Surat Sarees & Kurtis',
    description = 'Sai Satguru Textile is a leading wholesale textile trader in Surat, sourcing premium sarees, kurtis, lehengas, and gowns for retailers worldwide.',
    image = '/og-image.jpg',
    url = 'https://saisatgurutextile.com',
    type = 'website'
}) => {
    const siteTitle = title === 'Sai Satguru Textile | Wholesale Surat Sarees & Kurtis' ? title : `${title} | Sai Satguru Textile`;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{siteTitle}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={siteTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />
        </Helmet>
    );
};
