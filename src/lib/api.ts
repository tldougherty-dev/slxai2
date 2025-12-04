// API service layer - 100% Supabase, no localStorage fallback
// This file is kept for compatibility but all operations should use Supabase directly

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Generic API call wrapper (for future external API calls)
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL not configured. Use Supabase directly instead.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// Note: All data operations should use Supabase directly
// These functions are kept for compatibility but should not be used

export { apiCall };
