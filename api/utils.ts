import type { VercelRequest, VercelResponse } from '@vercel/node';

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function sendResponse(
  res: VercelResponse,
  statusCode: number,
  response: ApiResponse
): void {
  res.status(statusCode).json(response);
}

export function sendError(
  res: VercelResponse,
  statusCode: number,
  message: string,
  error?: string
): void {
  sendResponse(res, statusCode, {
    success: false,
    message,
    error
  });
}

export function sendSuccess(
  res: VercelResponse,
  data?: any,
  message: string = 'Success'
): void {
  sendResponse(res, 200, {
    success: true,
    message,
    data
  });
}

export function logApiCall(endpoint: string, data: any): void {
  console.log(`API Call to ${endpoint}:`, {
    ...data,
    timestamp: new Date().toISOString()
  });
} 