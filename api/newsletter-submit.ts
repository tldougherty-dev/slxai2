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
    const { email, firstName, lastName } = req.body;

    // Basic validation
    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Email validation
    if (!validateEmail(email)) {
      return sendError(res, 400, 'Invalid email format');
    }

    // Here you would typically:
    // 1. Save to newsletter database/list
    // 2. Send welcome email
    // 3. Integrate with email service (Mailchimp, SendGrid, etc.)
    // 4. Log the subscription
    
    // Log the subscription
    logApiCall('/api/newsletter-submit', {
      email,
      firstName: firstName || 'Not provided',
      lastName: lastName || 'Not provided'
    });

    // Return success response
    return sendSuccess(res, {
      email,
      firstName: firstName || null,
      lastName: lastName || null
    }, 'Successfully subscribed to newsletter');

  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return sendError(res, 500, 'Failed to process newsletter subscription', 'Internal server error');
  }
} 