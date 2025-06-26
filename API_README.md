# SLXAI API Documentation

This project includes a thin Express API with two endpoints for form submissions and newsletter subscriptions, designed to be deployed on Vercel.

## API Endpoints

### POST /api/form-submit

Handles contact form submissions.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I'd like to learn more about your services.",
  "subject": "General Inquiry" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "General Inquiry",
    "message": "Hello, I'd like to learn more about your services."
  }
}
```

### POST /api/newsletter-submit

Handles newsletter subscriptions.

**Request Body:**
```json
{
  "email": "john@example.com",
  "firstName": "John", // optional
  "lastName": "Doe"    // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "data": {
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

## Error Responses

Both endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Error type"
}
```

Common error codes:
- `400` - Bad Request (missing fields, invalid email)
- `405` - Method Not Allowed (non-POST requests)
- `500` - Internal Server Error

## Development

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Test the API endpoints locally using tools like Postman or curl:

```bash
# Test form submission
curl -X POST http://localhost:3000/api/form-submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}'

# Test newsletter subscription
curl -X POST http://localhost:3000/api/newsletter-submit \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'
```

## Deployment on Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Follow the prompts to link your project to Vercel.

4. Your API will be available at:
   - `https://your-project.vercel.app/api/form-submit`
   - `https://your-project.vercel.app/api/newsletter-submit`

## Integration with Frontend

### Form Submission Example

```javascript
const submitForm = async (formData) => {
  try {
    const response = await fetch('/api/form-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Form submitted successfully:', result.data);
    } else {
      console.error('Form submission failed:', result.message);
    }
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};
```

### Newsletter Subscription Example

```javascript
const subscribeToNewsletter = async (email, firstName, lastName) => {
  try {
    const response = await fetch('/api/newsletter-submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, firstName, lastName }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Newsletter subscription successful:', result.data);
    } else {
      console.error('Newsletter subscription failed:', result.message);
    }
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
  }
};
```

## Customization

The API endpoints are currently set up to log submissions to the console. To integrate with external services:

1. **Database Integration**: Add your database connection and save submissions
2. **Email Services**: Integrate with services like SendGrid, Mailchimp, or AWS SES
3. **Validation**: Add more sophisticated validation rules
4. **Rate Limiting**: Implement rate limiting to prevent spam
5. **CORS**: Configure CORS settings if needed

## File Structure

```
api/
├── form-submit.ts      # Contact form endpoint
├── newsletter-submit.ts # Newsletter subscription endpoint
└── utils.ts           # Shared utility functions
vercel.json            # Vercel configuration
```

## Environment Variables

For production, consider adding environment variables for:
- Database connection strings
- Email service API keys
- Rate limiting configuration
- CORS origins 