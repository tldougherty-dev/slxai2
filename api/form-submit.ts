import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEmail, sendError, sendSuccess, logApiCall } from './utils';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed');
  }

  try {
    const { name, email, message, subject } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return sendError(res, 400, 'Missing required fields: name, email, and message are required');
    }

    // Email validation
    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Log the submission
    
    // Log the submission
    logApiCall('/api/form-submit', {
      name,
      email,
      subject: subject || 'No subject',
      message
    });

    // Return success response
    return sendSuccess(res, {
      name,
      email,
      subject: subject || 'No subject',
      message
    }, 'Form submitted successfully');

  } catch (error) {
    console.error('Error processing form submission:', error);
    return sendError(res, 500, 'Failed to process form submission', 'Internal server error');
  }
} 