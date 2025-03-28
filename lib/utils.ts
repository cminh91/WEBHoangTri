import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString("vi-VN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  })
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPrice(price: number | null | undefined) {
  if (price === null || price === undefined) return "Liên hệ"
  
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price)
}

export function truncate(str: string, length: number) {
  if (!str) return ""
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
}

