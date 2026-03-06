// utils/storage.js
export function storageUrl(path) {
  const API_URL = import.meta.env.VITE_API_URL;

  if (!path) {
    return '/images/image.png'; // fallback image
  }

  return `${API_URL}/storage/${path}`;
}
