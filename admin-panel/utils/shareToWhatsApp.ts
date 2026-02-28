export const shareToWhatsApp = (text: string) => {
  const encodedText = encodeURIComponent(text);
  const url = `https://wa.me/?text=${encodedText}`;
  window.open(url, "_blank", "noopener,noreferrer");
};
