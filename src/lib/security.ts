// Security utilities for input sanitization and validation

/**
 * Sanitize HTML to prevent XSS attacks
 * Uses textContent to safely escape all HTML entities
 * WARNING: This function strips all HTML tags. For rich text, use a proper sanitization library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary div element
  const div = document.createElement('div');
  div.textContent = html; // This automatically escapes HTML and prevents XSS
  // Return the escaped text (not innerHTML which could be dangerous)
  return div.textContent || '';
}

/**
 * Sanitize text for display (preserves line breaks and URLs)
 * URLs are preserved as-is to keep them clickable
 */
export function sanitizeText(text: string): string {
  // Detect URLs first to preserve them
  const urlRegex = /(https?:\/\/[^\s<>"']+)/g;
  const urlMap = new Map<string, string>();
  let placeholderIndex = 0;
  
  // Replace URLs with placeholders
  const textWithPlaceholders = text.replace(urlRegex, (match) => {
    const placeholder = `__URL_PLACEHOLDER_${placeholderIndex}__`;
    urlMap.set(placeholder, match);
    placeholderIndex++;
    return placeholder;
  });
  
  // Escape HTML entities (but not URLs which are now placeholders)
  // Note: We don't encode slashes (/) as they're safe in HTML text content
  // and encoding them breaks URLs even when using placeholders
  const sanitized = textWithPlaceholders
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  // Restore URLs (they're already safe and don't need encoding)
  let result = sanitized;
  urlMap.forEach((url, placeholder) => {
    result = result.replace(placeholder, url);
  });
  
  return result;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validate YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//,
  ];
  return patterns.some(pattern => pattern.test(url));
}

/**
 * Validate Vimeo URL
 */
export function isValidVimeoUrl(url: string): boolean {
  return /^https?:\/\/(www\.)?vimeo\.com\//.test(url);
}

/**
 * Validate file type by extension (more secure than MIME type)
 */
export function isValidVideoFile(file: File): boolean {
  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv'];
  const fileName = file.name.toLowerCase();
  return allowedExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Validate file size (in bytes)
 */
export function isValidFileSize(file: File, maxSizeMB: number = 100): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

/**
 * Check if user is authorized (DEPRECATED - Use auth.ts functions instead)
 * @deprecated Use getUserRole() and canAccessAdmin() from '@/lib/auth' and '@/lib/roles' instead
 * This function is kept for backward compatibility but always returns false for security
 */
export function isAuthorized(requiredRole: 'admin' | 'member' | 'public'): boolean {
  // SECURITY: This function is deprecated and always returns false
  // Use proper auth functions from '@/lib/auth' instead
  if (process.env.NODE_ENV === 'development') {
    console.warn('isAuthorized() is deprecated. Use getUserRole() and canAccessAdmin() instead.');
  }
  return false; // Always deny for security
}

/**
 * Check if user can access admin functions (DEPRECATED - Use auth.ts functions instead)
 * @deprecated Use isAdmin() from '@/lib/auth' instead
 * This function is kept for backward compatibility but always returns false for security
 */
export function isAdmin(): boolean {
  // SECURITY: This function is deprecated and always returns false
  // Use isAdmin() from '@/lib/auth' instead
  if (process.env.NODE_ENV === 'development') {
    console.warn('security.isAdmin() is deprecated. Use isAdmin() from "@/lib/auth" instead.');
  }
  return false; // Always deny for security
}

/**
 * Validate input length
 */
export function isValidLength(text: string, min: number = 0, max: number = 10000): boolean {
  return text.length >= min && text.length <= max;
}

/**
 * Sanitize filename to prevent path traversal
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, 255); // Limit length
}

