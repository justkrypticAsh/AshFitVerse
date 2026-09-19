// src/config/affiliateConfig.js — Centralized Amazon Associate Affiliate Engine

export const DEFAULT_AMAZON_TAG = "ashfitverse-21";
export const STORAGE_KEY_AFFILIATE_TAG = "ashfitverse_amazon_associate_tag";

/**
 * Returns current active Amazon Associate Tag
 */
export function getAffiliateTag() {
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY_AFFILIATE_TAG);
      if (stored && stored.trim()) return stored.trim();
    }
  } catch {}
  return DEFAULT_AMAZON_TAG;
}

/**
 * Updates active Amazon Associate Tag in localStorage
 */
export function setAffiliateTag(tag) {
  try {
    if (typeof localStorage !== "undefined" && tag) {
      localStorage.setItem(STORAGE_KEY_AFFILIATE_TAG, tag.trim());
    }
  } catch {}
}

/**
 * Extracts 10-character Amazon ASIN from any Amazon product link
 */
export function extractAsin(urlOrAsin) {
  if (!urlOrAsin) return null;
  const str = String(urlOrAsin).trim();

  // If already an ASIN (10 alphanumeric characters)
  if (/^[A-Z0-9]{10}$/i.test(str)) {
    return str.toUpperCase();
  }

  // Common Amazon URL patterns
  const dpMatch = str.match(/(?:dp|gp\/product|exec\/obidos\/asin)\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1].toUpperCase();

  const genericMatch = str.match(/\/([A-Z0-9]{10})(?:[/?]|$)/i);
  if (genericMatch) return genericMatch[1].toUpperCase();

  return null;
}

/**
 * Formats a clean, high-converting Amazon India Affiliate link
 * with your official Amazon Associate Tag attached.
 */
export function buildAmazonAffiliateUrl(urlOrAsin, customTag = null) {
  const tag = customTag || getAffiliateTag() || DEFAULT_AMAZON_TAG;
  if (!urlOrAsin) return `https://www.amazon.in/?tag=${tag}`;

  const str = String(urlOrAsin).trim();
  const asin = extractAsin(str);

  if (asin) {
    // Official direct Amazon product deep-link with associate tag
    return `https://www.amazon.in/dp/${asin}?tag=${tag}&linkCode=ogi&th=1`;
  }

  // If standard Amazon URL without clean ASIN match
  if (str.includes("amazon.in") || str.includes("amzn.to") || str.includes("amazon.com")) {
    try {
      const parsed = new URL(str);
      parsed.searchParams.set("tag", tag);
      return parsed.toString();
    } catch {
      const separator = str.includes("?") ? "&" : "?";
      return `${str}${separator}tag=${tag}`;
    }
  }

  // Fallback: Amazon search with affiliate tag
  return `https://www.amazon.in/s?k=${encodeURIComponent(str)}&tag=${tag}`;
}
