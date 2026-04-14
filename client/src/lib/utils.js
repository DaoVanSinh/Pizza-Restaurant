import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getImg(path) {
  if (!path) return "";
  if (path.startsWith('http')) return path;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
  return `${API_URL}/images/${path}`;
}
