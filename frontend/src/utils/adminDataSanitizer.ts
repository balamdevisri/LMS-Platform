/**
 * Admin Data Sanitization and Formatting Utility
 * Prevents raw unformatted JSON strings, un-sanitized script/HTML tags, and raw object outputs in the Admin Panel.
 */

/**
 * Sanitizes input text by removing executable HTML tags (<script>, <iframe>, event handlers) and trimming.
 */
export function sanitizeAdminInput(input: string | null | undefined): string {
  if (!input) return '';
  let sanitized = String(input);
  
  // Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '');
  // Remove inline event handlers like onerror=, onload=, onclick=
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:[^\s"']+/gi, '');

  return sanitized.trim();
}

/**
 * Formats any raw data (string, object, array) into clean human-readable structured display format.
 * Prevents rendering "[object Object]" or unformatted JSON strings directly in UI.
 */
export function formatRawDataDisplay(data: any, fallback = 'N/A'): string {
  if (data === null || data === undefined) return fallback;

  if (typeof data === 'string') {
    const trimmed = data.trim();
    // If it looks like a JSON string, try parsing it into clean text
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      try {
        const parsed = JSON.parse(trimmed);
        return formatRawDataDisplay(parsed, fallback);
      } catch {
        return sanitizeAdminInput(trimmed);
      }
    }
    return sanitizeAdminInput(trimmed);
  }

  if (Array.isArray(data)) {
    if (data.length === 0) return fallback;
    return data.map((item) => formatRawDataDisplay(item, '')).filter(Boolean).join(', ');
  }

  if (typeof data === 'object') {
    const entries = Object.entries(data)
      .filter(([_, val]) => val !== null && val !== undefined && val !== '')
      .map(([key, val]) => `${formatFieldLabel(key)}: ${typeof val === 'object' ? formatRawDataDisplay(val) : String(val)}`);
    return entries.length > 0 ? entries.join(' • ') : fallback;
  }

  return String(data);
}

/**
 * Converts camelCase or snake_case field names into readable Title Case labels.
 */
export function formatFieldLabel(key: string): string {
  if (!key) return '';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/**
 * Sanitizes markdown string before parsing to HTML in Admin panels.
 */
export function sanitizeMarkdownContent(markdownText: string | null | undefined): string {
  if (!markdownText) return '';
  let clean = String(markdownText);
  // Strip malicious scripts/iframes before markdown conversion
  clean = clean.replace(/<script\b[^<]*>([\s\S]*?)<\/script>/gi, '');
  clean = clean.replace(/<iframe\b[^<]*>([\s\S]*?)<\/iframe>/gi, '');
  clean = clean.replace(/javascript:/gi, '');
  return clean;
}
