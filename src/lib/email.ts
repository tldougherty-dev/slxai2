// Email via serverless API (Amazon SES); see api/send-email.ts
import { shouldSendEmailNotification, getUnsubscribeUrl } from './notificationPreferences';
import { getCurrentUser } from './auth';

// Default sender email (update with your verified domain)
const DEFAULT_FROM_EMAIL = 'SLxAI Portal <notifications@slxai.org>';

// API endpoint for sending emails (serverless function)
const EMAIL_API_ENDPOINT = '/api/send-email';

// Check if email service is configured
export function isEmailConfigured(): boolean {
  // Always return true - the API endpoint will handle configuration
  return true;
}

// Base email template
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  userId?: string;
}

// Send email with notification preference check
export async function sendEmail(
  options: EmailOptions,
  notificationType?: keyof Parameters<typeof shouldSendEmailNotification>[0]
): Promise<boolean> {
  // Check if email service is configured
  if (!isEmailConfigured()) {
    if (import.meta.env.DEV) {
      console.warn(
        'Email API failed or SES not configured on server (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).'
      );
      console.log('Would send email:', options);
    }
    return false;
  }

  // Check notification preferences if type is provided
  if (notificationType) {
    const user = getCurrentUser();
    const shouldSend = await shouldSendEmailNotification(
      notificationType,
      options.userId || user?.id,
      options.to
    );

    if (!shouldSend) {
      if (import.meta.env.DEV) {
        console.log(`Email not sent - user has disabled ${notificationType} notifications`);
      }
      return false;
    }
  }

  try {
    // Serverless API uses Amazon SES (see api/send-email.ts)
    const response = await fetch(EMAIL_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
        from: options.from || DEFAULT_FROM_EMAIL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (import.meta.env.DEV) {
        console.error('Email API error:', errorData);
      }
      return false;
    }

    const result = await response.json();
    if (import.meta.env.DEV) {
      console.log('Email sent successfully:', result);
    }

    return result.success === true;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Error sending email:', error);
    }
    return false;
  }
}

// Email template helper - creates HTML email with footer
export function createEmailTemplate(
  title: string,
  content: string,
  userId?: string,
  email?: string,
  actionButton?: { text: string; url: string }
): string {
  const unsubscribeUrl = userId && email 
    ? getUnsubscribeUrl(userId, email)
    : '#';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0080FF 0%, #0066CC 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">SLxAI</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #0080FF; margin-top: 0;">${title}</h2>
    
    <div style="color: #555; font-size: 16px;">
      ${content}
    </div>
    
    ${actionButton ? `
    <div style="margin: 30px 0; text-align: center;">
      <a href="${actionButton.url}" style="display: inline-block; background: #0080FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
        ${actionButton.text}
      </a>
    </div>
    ` : ''}
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="color: #888; font-size: 12px; margin: 0;">
      This email was sent by SLxAI Portal.<br>
      <a href="${unsubscribeUrl}" style="color: #0080FF; text-decoration: none;">Manage your notification preferences</a> or 
      <a href="${unsubscribeUrl}" style="color: #0080FF; text-decoration: none;">unsubscribe</a>.
    </p>
  </div>
</body>
</html>
  `.trim();
}

// Specific email functions for different notification types

// Send approval email (for interest submissions)
export async function sendApprovalEmail(
  email: string,
  name: string,
  signupUrl: string,
  passcode: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p>Dear ${name},</p>
    
    <p>Congratulations! Your interest in joining SLxAI has been approved.</p>
    
    <p><strong>Your signup passcode is: ${passcode}</strong></p>
    
    <p>Please use this code to create your account at the link below.</p>
    
    <p>We look forward to having you as part of our community!</p>
    
    <p>Best regards,<br>The SLxAI Team</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to SLxAI - Your Signup Code',
    html: createEmailTemplate(
      'Welcome to SLxAI!',
      content,
      userId,
      email,
      { text: 'Create Your Account', url: signupUrl }
    ),
    userId,
  });
}

// Send new post notification
export async function sendNewPostNotification(
  email: string,
  postAuthor: string,
  postContent: string,
  postUrl: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p><strong>${postAuthor}</strong> posted a new update on the global feed:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
      ${postContent.substring(0, 200)}${postContent.length > 200 ? '...' : ''}
    </div>
  `;

  return sendEmail(
    {
      to: email,
      subject: `New Post from ${postAuthor}`,
      html: createEmailTemplate(
        'New Post on Global Feed',
        content,
        userId,
        email,
        { text: 'View Post', url: postUrl }
      ),
      userId,
    },
    'feedNewPost'
  );
}

// Send reply notification
export async function sendReplyNotification(
  email: string,
  replyAuthor: string,
  replyContent: string,
  postUrl: string,
  isCommentReply: boolean = false,
  userId?: string
): Promise<boolean> {
  const notificationType = isCommentReply ? 'commentReply' : 'postReply';
  const content = `
    <p><strong>${replyAuthor}</strong> ${isCommentReply ? 'replied to your comment' : 'replied to your post'}:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
      ${replyContent.substring(0, 200)}${replyContent.length > 200 ? '...' : ''}
    </div>
  `;

  return sendEmail(
    {
      to: email,
      subject: `${replyAuthor} ${isCommentReply ? 'replied to your comment' : 'replied to your post'}`,
      html: createEmailTemplate(
        isCommentReply ? 'New Comment Reply' : 'New Post Reply',
        content,
        userId,
        email,
        { text: 'View Reply', url: postUrl }
      ),
      userId,
    },
    notificationType
  );
}

// Send new vote notification
export async function sendNewVoteNotification(
  email: string,
  voteTitle: string,
  voteDescription: string,
  voteUrl: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p>A new vote has been created:</p>
    <h3 style="color: #0080FF; margin: 15px 0;">${voteTitle}</h3>
    <p>${voteDescription.substring(0, 200)}${voteDescription.length > 200 ? '...' : ''}</p>
  `;

  return sendEmail(
    {
      to: email,
      subject: `New Vote: ${voteTitle}`,
      html: createEmailTemplate(
        'New Vote Created',
        content,
        userId,
        email,
        { text: 'View Vote', url: voteUrl }
      ),
      userId,
    },
    'voteNew'
  );
}

// Send vote ending soon notification
export async function sendVoteEndingSoonNotification(
  email: string,
  voteTitle: string,
  hoursRemaining: number,
  voteUrl: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p>The vote "<strong>${voteTitle}</strong>" is ending soon!</p>
    <p><strong>Time remaining: ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}</strong></p>
    <p>Make sure to cast your vote before it closes.</p>
  `;

  return sendEmail(
    {
      to: email,
      subject: `Vote Ending Soon: ${voteTitle}`,
      html: createEmailTemplate(
        'Vote Ending Soon',
        content,
        userId,
        email,
        { text: 'Vote Now', url: voteUrl }
      ),
      userId,
    },
    'voteEndingSoon'
  );
}

// Send new file notification
export async function sendNewFileNotification(
  email: string,
  fileName: string,
  fileCategory: string,
  fileUrl: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p>A new file has been uploaded:</p>
    <h3 style="color: #0080FF; margin: 15px 0;">${fileName}</h3>
    <p><strong>Category:</strong> ${fileCategory}</p>
  `;

  return sendEmail(
    {
      to: email,
      subject: `New File: ${fileName}`,
      html: createEmailTemplate(
        'New File Uploaded',
        content,
        userId,
        email,
        { text: 'View File', url: fileUrl }
      ),
      userId,
    },
    'fileNewUpload'
  );
}

// Send discussion message notification
export async function sendDiscussionMessageNotification(
  email: string,
  channelName: string,
  authorName: string,
  messageContent: string,
  messageUrl: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <p><strong>${authorName}</strong> posted a new message in <strong>${channelName}</strong>:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
      ${messageContent.substring(0, 200)}${messageContent.length > 200 ? '...' : ''}
    </div>
  `;

  return sendEmail(
    {
      to: email,
      subject: `New Message in ${channelName}`,
      html: createEmailTemplate(
        'New Discussion Message',
        content,
        userId,
        email,
        { text: 'View Message', url: messageUrl }
      ),
      userId,
    },
    'discussionNewMessage'
  );
}

// Send mention notification
export async function sendMentionNotification(
  email: string,
  mentionerName: string,
  mentionContext: string,
  mentionUrl: string,
  isPostMention: boolean = true,
  userId?: string
): Promise<boolean> {
  const notificationType = isPostMention ? 'postMention' : 'discussionMention';
  const content = `
    <p><strong>${mentionerName}</strong> mentioned you in ${isPostMention ? 'a post' : 'a discussion'}:</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; margin: 15px 0;">
      ${mentionContext.substring(0, 200)}${mentionContext.length > 200 ? '...' : ''}
    </div>
  `;

  return sendEmail(
    {
      to: email,
      subject: `${mentionerName} mentioned you`,
      html: createEmailTemplate(
        'You Were Mentioned',
        content,
        userId,
        email,
        { text: 'View Mention', url: mentionUrl }
      ),
      userId,
    },
    notificationType
  );
}

// Send system announcement
export async function sendSystemAnnouncement(
  email: string,
  title: string,
  message: string,
  announcementUrl?: string,
  userId?: string
): Promise<boolean> {
  const content = `
    <h3 style="color: #0080FF; margin: 15px 0;">${title}</h3>
    <p>${message}</p>
  `;

  return sendEmail(
    {
      to: email,
      subject: title,
      html: createEmailTemplate(
        'System Announcement',
        content,
        userId,
        email,
        announcementUrl ? { text: 'Learn More', url: announcementUrl } : undefined
      ),
      userId,
    },
    'systemAnnouncement'
  );
}

