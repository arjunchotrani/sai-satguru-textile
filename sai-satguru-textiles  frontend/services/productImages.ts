const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchProductImages(productId: string) {
  const res = await fetch(
    `${API_BASE}/product-images?product_id=${productId}`
  );

  if (!res.ok) throw new Error("Failed to fetch product images");

  const json = await res.json();

  return json.data as {
    id: string;
    image_url: string;
    is_primary: boolean;
    media_type: "image" | "pdf";
  }[];
}
