import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { google } from 'googleapis';

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_AWS_REGION = 'us-east-1';
const DEFAULT_FROM_EMAIL = 'contact@slxai.org>';

function getTransporter() {
  const region = process.env.AWS_REGION?.trim() || DEFAULT_AWS_REGION;
  const smtpUser = process.env.AWS_SES_SMTP_USER?.trim();
  const smtpPass = process.env.AWS_SES_SMTP_PASSWORD?.trim();
  if (!smtpUser || !smtpPass) return null;
  return nodemailer.createTransport({
    host: `email-smtp.${region}.amazonaws.com`,
    port: 587,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

async function sendTransactionalEmail({ to, subject, html, from }) {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error('Email service not configured. Set AWS_SES_SMTP_USER and AWS_SES_SMTP_PASSWORD.');
  }
  const fromHeader = (from || process.env.SES_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL).trim();
  const info = await transporter.sendMail({
    from: fromHeader,
    to,
    subject,
    html,
  });
  if (!info.messageId) throw new Error('SES SMTP did not return a message id.');
  return { messageId: info.messageId };
}
