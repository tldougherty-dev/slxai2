import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const DEFAULT_AWS_REGION = 'us-east-1';
export const DEFAULT_FROM_EMAIL = 'SLxAI Portal <notifications@slxai.org>';

function getSesClient(): SESClient | null {
  const region = (process.env.AWS_REGION?.trim() || DEFAULT_AWS_REGION) as string;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  return new SESClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<{ messageId: string }> {
  const client = getSesClient();
  if (!client) {
    throw new Error(
      'Email service not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY on the server.',
    );
  }

  const fromHeader = (input.from || process.env.SES_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL).trim();

  const result = await client.send(
    new SendEmailCommand({
      Source: fromHeader,
      Destination: { ToAddresses: [input.to] },
      Message: {
        Subject: { Data: input.subject, Charset: 'UTF-8' },
        Body: { Html: { Data: input.html, Charset: 'UTF-8' } },
      },
    }),
  );

  if (!result.MessageId) {
    throw new Error('SES did not return a message id.');
  }

  return { messageId: result.MessageId };
}
