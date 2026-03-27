interface Env {
  VITE_API_BASE_URL?: string;
  ASSETS: { fetch: typeof fetch };
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Let Cloudflare Pages handle standard static assets normally
  // If the path looks like an asset request (.css, .png, etc.), let it pass through.
  if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|json|woff|woff2|ttf|eot)$/)) {
    return next();
  }

  // Configuration
  let API_BASE = env.VITE_API_BASE_URL || "https://sai-satguru-backend.arjunchotrani0.workers.dev";
  if (API_BASE.startsWith("/")) {
    API_BASE = "https://sai-satguru-backend.arjunchotrani0.workers.dev";
  }
  const SITE_URL = "https://saisatgurutextile.com";

  let title = "Sai Satguru Textile";
  let description = "Premium Wholesale Textile Supplier in Surat.";
  let canonical = `${SITE_URL}${path}`;
  let ogTags = "";
  let schemaJson = "";
  let notFound = false;
  let isTargetRoute = false;

  let debugOutput = "";
  try {
    // 1. HOMEPAGE
    if (path === "/") {
      isTargetRoute = true;
      title = "Wholesale Textile Supplier in Surat | Sai Satguru Textile";
      description = "Discover Sai Satguru Textile, Surat's premier wholesale textile supplier. Explore our premium collection of branded ethnic wear, suits, sarees, and boutique fabrics.";
    } 
    // 2. PRODUCT DETAIL PAGE
    else if (path.startsWith("/product/")) {
      isTargetRoute = true;
      const slug = path.split("/")[2];
      if (slug) {
        const res = await fetch(`${API_BASE}/products/by-slug/${slug}`);
        if (!res.ok || res.status === 404) {
          notFound = true;
        } else {
          const json: any = await res.json();
          if (!json.success || !json.data) {
            notFound = true;
          } else {
            const product = json.data;
            const brandText = product.brandName && product.brandName !== "Generic" ? product.brandName : "Premium Collection";
            title = `${product.name} | Wholesale Suits | Sai Satguru Textile`;
            
            let cleanDesc = product.description ? product.description.replace(/\n/g, " ").replace(/[*_~]/g, "").trim() : "";
            description = `${product.name} by ${brandText} - ${cleanDesc.substring(0, 100)}... Wholesale prices available. Contact Sai Satguru Textile Surat.`;

            const image = (product.images && product.images.length > 0) ? product.images[0] : `${SITE_URL}/logo-512.png`;

            ogTags = `
              <meta property="og:type" content="product">
              <meta property="og:title" content="${title}">
              <meta property="og:description" content="${description}">
              <meta property="og:url" content="${canonical}">
              <meta property="og:image" content="${image}">
              <meta property="og:site_name" content="Sai Satguru Textile">
              <meta name="twitter:card" content="summary_large_image">
              <meta name="twitter:title" content="${title}">
              <meta name="twitter:description" content="${description}">
              <meta name="twitter:image" content="${image}">
            `;

            schemaJson = JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "Product",
              "name": product.name,
              "image": product.images || [],
              "description": description,
              "brand": {
                "@type": "Brand",
                "name": product.brandName || "Sai Satguru Textile"
              },
              "url": canonical,
              "offers": {
                "@type": "Offer",
                "url": canonical,
                "priceCurrency": "INR",
                "price": product.price || product.basePriceINR || 0,
                "availability": "https://schema.org/InStock",
                "seller": {
                  "@type": "Organization",
                  "name": "Sai Satguru Textile"
                }
              }
            });
          }
        }
      } else {
        notFound = true;
      }
    }
    // 3. CATEGORY AND SUBCATEGORY PAGES
    else if (path.startsWith("/category/")) {
      isTargetRoute = true;
      const parts = path.split("/").filter(Boolean);
      if (parts.length === 2) {
        const slug = parts[1];
        const res = await fetch(`${API_BASE}/categories`);
        if (res.ok) {
          const json: any = await res.json();
          const categories = json.data || [];
          const category = categories.find((c: any) => c.slug === slug);
          if (category) {
            title = `${category.name || category.label || "Collection"} | Wholesale Textile Supplier | Sai Satguru Textile`;
            description = `Explore our premium ${category.name || category.label || "Collection"} for wholesale and retail at Sai Satguru Textile Surat.`;
            schemaJson = JSON.stringify({
              "@context": "https://schema.org/",
              "@type": "CollectionPage",
              "name": category.name || category.label || "Collection",
              "description": description,
              "url": canonical
            });
          } else {
            notFound = true;
          }
        }
      } else if (parts.length === 3) {
        const catSlug = parts[1];
        const subSlug = parts[2];
        const [resCat, resSub] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/subcategories`)
        ]);
        
        let catFound = false;
        let subFound = false;

        if (resCat.ok && resSub.ok) {
          const catJson: any = await resCat.json();
          const subJson: any = await resSub.json();
          const categories = catJson.data || [];
          const subcategories = subJson.data || [];

          const category = categories.find((c: any) => c.slug === catSlug);
          if (category) {
            catFound = true;
            const subCategory = subcategories.find((s: any) => s.slug === subSlug && String(s.category_id) === String(category.id));
            if (subCategory) {
              subFound = true;
              title = `${subCategory.name || subCategory.label} | ${category.name || category.label} | Sai Satguru Textile`;
              description = `Shop wholesale ${subCategory.name || subCategory.label} from the ${category.name || category.label} collection at Sai Satguru Textile, Surat.`;
              schemaJson = JSON.stringify({
                "@context": "https://schema.org/",
                "@type": "CollectionPage",
                "name": subCategory.name || subCategory.label,
                "description": description,
                "url": canonical
              });
            }
          }
        }
        if (!catFound || !subFound) {
          notFound = true;
        }
      } else {
        notFound = true;
      }
    }
    // 4. BRANDS DIRECTORY
    else if (path === "/brands") {
      isTargetRoute = true;
      title = "Our Brands | Premium Textile Brands | Sai Satguru Textile";
      description = "Explore our directory of premium textile and ethnic wear brands. Partner with Sai Satguru Textile for wholesale branded collections.";
      schemaJson = JSON.stringify({
        "@context": "https://schema.org/",
        "@type": "CollectionPage",
        "name": "Our Brands",
        "description": description,
        "url": canonical
      });
    }
    // 5. BRAND SINGLE PAGE
    else if (path.startsWith("/brand/")) {
      isTargetRoute = true;
      const slug = path.split("/")[2];
      if (slug) {
        const res = await fetch(`${API_BASE}/brands`);
        if (res.ok) {
          const json: any = await res.json();
          const brands = json.data || [];
          
          const brand = brands.find((b: any) => {
             const bSlug = b.slug || b.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
             return bSlug === slug;
          });
          
          if (brand) {
            title = `${brand.name} | Brand Collection | Sai Satguru Textile`;
            description = `Explore the ${brand.name} collection at Sai Satguru Textile. Premium branded ethnic wear, designer suits, and boutique-ready styles.`;
            schemaJson = JSON.stringify({
                "@context": "https://schema.org/",
                "@type": "CollectionPage",
                "name": brand.name,
                "description": description,
                "url": canonical
            });
          } else {
            notFound = true;
          }
        }
      } else {
        notFound = true;
      }
    }

  } catch (error: any) {
    console.error("Edge SEO Injection Error:", error);
    debugOutput = `Error: ${error.message}`;
  }

  // If we decided this is not an SPA routing path (e.g., API), just fall through normally to next()
  if (!isTargetRoute) {
    return next();
  }

  // Explicitly fetch index.html because next() will 404 on dynamic SPA client-side routes.
  // env.ASSETS points to the static file hosting.
  const indexUrl = new URL(url);
  indexUrl.pathname = "/index.html";
  let response = await env.ASSETS.fetch(new Request(indexUrl, request));

  if (!response.ok) {
     response = await next();
  }

  // Removed content-type check here because local env.ASSETS.fetch('/index.html') headers might be empty in dev

  if (notFound) {
    title = "Not Found | Sai Satguru Textile";
    canonical = ""; // Remove canonical
    ogTags = `<meta name="robots" content="noindex, nofollow">`;
    response = new Response(response.body, {
      status: 404, // Correctly set to 404
      statusText: "Not Found",
      headers: response.headers
    });
  } else {
    // We want to serve a 200, so copy response in case it had an internal cache status
    response = new Response(response.body, {
      status: 200,
      headers: response.headers
    });
  }

  // Use HTMLRewriter to inject the crafted tags
  return new HTMLRewriter()
    .on("title", {
      element(element) {
        if (title) element.setInnerContent(title);
      }
    })
    .on("head", {
      element(element) {
        if (description) {
          element.append(`\n  <meta name="description" content="${description}">`, { html: true });
        }
        if (canonical && !notFound) {
          element.append(`\n  <link rel="canonical" href="${canonical}">`, { html: true });
        }
        if (ogTags) {
          element.append(`\n  ${ogTags}`, { html: true });
        }
        if (schemaJson && !notFound) {
          element.append(`\n  <script type="application/ld+json">\n${schemaJson}\n  </script>`, { html: true });
        }
        
        if (!ogTags && !notFound && title && !path.startsWith("/product/")) {
          element.append(`
            <meta property="og:title" content="${title}">
            <meta property="og:description" content="${description}">
            <meta property="og:url" content="${canonical}">
            <meta property="og:site_name" content="Sai Satguru Textile">
            <meta name="twitter:card" content="summary">
            <meta name="twitter:title" content="${title}">
            <meta name="twitter:description" content="${description}">
          `, { html: true });
        }
        
        // Debug output
        element.append(`\n  <!-- SEO Workers Debug: notFound=${notFound}, path=${path}, debugOutput=${debugOutput} API_BASE=${API_BASE} -->`, { html: true });
      }
    })
    .transform(response);
};
