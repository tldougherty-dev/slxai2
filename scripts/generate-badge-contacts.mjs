/**
 * Generates static contact pages and vCards from the badge list CSV.
 *
 * Usage:
 *   node scripts/generate-badge-contacts.mjs [path-to.csv]
 *
 * Default input: data/badge-list-slxai-2026.csv
 * Outputs:
 *   public/contacts/{slug}/index.html
 *   public/vcf/{slug}.vcf
 *   public/badge-qr-links.csv (name, title, company, slug, contact + vCard URLs)
 *
 * Env:
 *   BASE_URL=https://slxai.org  (used in badge-qr-links.csv)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_CSV = path.join(ROOT, 'data', 'badge-list-slxai-2026.csv');
const OUT_CONTACTS = path.join(ROOT, 'public', 'contacts');
const OUT_VCF = path.join(ROOT, 'public', 'vcf');
const OUT_QR_CSV = path.join(ROOT, 'public', 'badge-qr-links.csv');

const BASE_URL = (process.env.BASE_URL || 'https://slxai.org').replace(/\/$/, '');

/** vCard NOTE: base line always; attendee LinkedIn profile URL(s) appended here only — never as `URL:`. */
const NOTE_BASE = 'Met at SLxAI Summit 2026 — https://slxai.org';

const SLXAI_SOCIAL = {
  linkedin: 'https://www.linkedin.com/company/slxai/',
  facebook: 'https://www.facebook.com/profile.php?id=61577817126798',
  instagram: 'https://www.instagram.com/slxaisummit/',
};

/** Same asset as landing hero (`src/pages/Index.tsx`). */
const HERO_LOGO_SRC = '/lovable-uploads/0941509f-be4a-49e7-b472-735a4942f89a.png';

/** Expected header names (normalized match) */
const COL = {
  fullName: 'full name',
  title: 'current job title',
  company: 'company/organization name',
  location: 'country, or city of residence',
  email: 'email address',
  phone: 'phone number',
  website: 'website url',
  linkedin: 'linkedin profile url',
};

function normalizeHeader(h) {
  return h.replace(/^\uFEFF/, '').trim().toLowerCase();
}

/** Parse CSV with support for quoted fields and CRLF */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let i = 0;
  let inQuotes = false;
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',' || c === '\t') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }
  row.push(field);
  if (row.some((cell) => cell !== '')) rows.push(row);
  return rows;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** vCard 3.0 text escaping */
function escapeVcardValue(s) {
  if (s == null) return '';
  return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/** Ensure http(s) URL for web and LinkedIn fields from CSV (often missing scheme). */
function withHttps(url) {
  if (!url || !String(url).trim()) return '';
  const u = String(url).trim();
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

/** True if URL points at LinkedIn (profile/company); used so `URL:` stays org website only. */
function isLinkedInUrl(url) {
  if (!url || !String(url).trim()) return false;
  const u = withHttps(url);
  try {
    const h = new URL(u).hostname.replace(/^www\./i, '').toLowerCase();
    return h === 'linkedin.com' || h.endsWith('.linkedin.com');
  } catch {
    return /linkedin\.com/i.test(String(url));
  }
}

function parseNameN(fullName) {
  const t = fullName.trim();
  if (!t) return { first: '', last: '' };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts.slice(0, -1).join(' '), last: parts[parts.length - 1] };
}

function mapHeaders(headerRow) {
  const idx = {};
  headerRow.forEach((h, i) => {
    const key = normalizeHeader(h);
    idx[key] = i;
  });
  const get = (label) => {
    const k = COL[label];
    return idx[k] !== undefined ? idx[k] : -1;
  };
  return {
    fullName: get('fullName'),
    title: get('title'),
    company: get('company'),
    location: get('location'),
    email: get('email'),
    phone: get('phone'),
    website: get('website'),
    linkedin: get('linkedin'),
  };
}

function rowToRecord(cols, row) {
  const cell = (i) => (i >= 0 && i < row.length ? row[i].trim() : '');
  return {
    fullName: cell(cols.fullName),
    title: cell(cols.title),
    company: cell(cols.company),
    location: cell(cols.location),
    email: cell(cols.email),
    phone: cell(cols.phone),
    website: cell(cols.website),
    linkedin: cell(cols.linkedin),
  };
}

function linkedInUrlsForNote(rec) {
  const out = [];
  const push = (u) => {
    const n = withHttps(u);
    if (n && !out.includes(n)) out.push(n);
  };
  if (rec.linkedin?.trim()) push(rec.linkedin);
  if (rec.website?.trim() && isLinkedInUrl(rec.website)) push(rec.website);
  return out;
}

function organizationWebsiteUrl(rec) {
  if (!rec.website?.trim()) return '';
  const w = withHttps(rec.website);
  if (isLinkedInUrl(w)) return '';
  return w;
}

function buildNote(rec) {
  let note = NOTE_BASE;
  const li = linkedInUrlsForNote(rec);
  if (li.length) note += `\n\n${li.join('\n')}`;
  return note;
}

function buildVcard(rec) {
  const { first, last } = parseNameN(rec.fullName);
  const lines = ['BEGIN:VCARD', 'VERSION:3.0'];
  if (rec.fullName) lines.push(`FN:${escapeVcardValue(rec.fullName)}`);
  lines.push(`N:${escapeVcardValue(last)};${escapeVcardValue(first)};;;`);
  if (rec.company) lines.push(`ORG:${escapeVcardValue(rec.company)}`);
  if (rec.title) lines.push(`TITLE:${escapeVcardValue(rec.title)}`);
  if (rec.email) lines.push(`EMAIL:${escapeVcardValue(rec.email)}`);
  if (rec.phone) lines.push(`TEL:${escapeVcardValue(rec.phone)}`);
  const orgUrl = organizationWebsiteUrl(rec);
  if (orgUrl) lines.push(`URL:${escapeVcardValue(orgUrl)}`);
  lines.push(`NOTE:${escapeVcardValue(buildNote(rec))}`);
  lines.push('END:VCARD');
  return lines.join('\r\n') + '\r\n';
}

/** Inline SVG icons + links for “Follow SLxAI” (matches summit program book URLs). */
function slxaiSocialFollowHtml() {
  const icon = {
    linkedin: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 7 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
  };
  return `<div class="follow-slxai">
    <span class="follow-label">Follow SLxAI</span>
    <div class="social-row" role="list">
      <a class="social-btn" href="${SLXAI_SOCIAL.linkedin}" target="_blank" rel="noopener noreferrer" aria-label="SLxAI on LinkedIn" role="listitem">${icon.linkedin}</a>
      <a class="social-btn" href="${SLXAI_SOCIAL.facebook}" target="_blank" rel="noopener noreferrer" aria-label="SLxAI on Facebook" role="listitem">${icon.facebook}</a>
      <a class="social-btn" href="${SLXAI_SOCIAL.instagram}" target="_blank" rel="noopener noreferrer" aria-label="SLxAI on Instagram" role="listitem">${icon.instagram}</a>
    </div>
  </div>`;
}

function contactHtml(rec, slug) {
  const vcfPath = `/vcf/${slug}.vcf`;
  const rows = [];
  rows.push(`<p class="name">${escapeHtml(rec.fullName)}</p>`);
  if (rec.title) rows.push(`<p class="meta">${escapeHtml(rec.title)}</p>`);
  if (rec.company) rows.push(`<p class="meta company">${escapeHtml(rec.company)}</p>`);
  if (rec.location) rows.push(`<p class="meta">${escapeHtml(rec.location)}</p>`);
  const links = [];
  if (rec.email) {
    links.push(
      `<a class="link" href="mailto:${escapeHtml(rec.email)}">${escapeHtml(rec.email)}</a>`,
    );
  }
  if (rec.phone) {
    const tel = rec.phone.replace(/\s/g, '');
    links.push(`<a class="link" href="tel:${escapeHtml(tel)}">${escapeHtml(rec.phone)}</a>`);
  }
  if (rec.linkedin) {
    const li = withHttps(rec.linkedin);
    links.push(
      `<a class="link" href="${escapeHtml(li)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>`,
    );
  }
  if (rec.website) {
    const w = withHttps(rec.website);
    links.push(
      `<a class="link" href="${escapeHtml(w)}" target="_blank" rel="noopener noreferrer">Website</a>`,
    );
  }
  const linksBlock = links.length ? `<div class="links">${links.join('')}</div>` : '';
  const socialBlock = slxaiSocialFollowHtml();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(rec.fullName)} | SLxAI 2026</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: #ffffff; display: flex; align-items: center; justify-content: center; padding: 1.25rem; }
    .page { width: 100%; max-width: 28rem; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    .site-header { text-align: center; width: 100%; }
    .logo-wrap {
      display: inline-block;
      background: #fff;
      border-radius: 0.5rem;
      line-height: 0;
      box-shadow: 0 0 40px 20px rgba(255, 255, 255, 0.8), 0 0 80px 40px rgba(255, 255, 255, 0.4);
    }
    .hero-logo { height: 6rem; width: auto; display: block; margin: 0 auto; }
    .card { width: 100%; background: #1e293b; color: #f8fafc; border-radius: 1rem; padding: 1.75rem 1.5rem;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,.45); text-align: center; }
    .name { font-size: 1.375rem; font-weight: 700; margin: 0 0 0.75rem; line-height: 1.25; }
    .meta { margin: 0.35rem 0; font-size: 1rem; color: #cbd5e1; line-height: 1.4; }
    .company { color: #e2e8f0; font-weight: 600; }
    .links { margin-top: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; align-items: center; }
    .link { color: #38bdf8; text-decoration: none; font-size: 1.05rem; word-break: break-word; max-width: 100%; }
    .link:hover { text-decoration: underline; }
    .site-header .follow-slxai { margin-top: 1rem; }
    .follow-label { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #94a3b8; margin-bottom: 0.75rem; display: block; }
    .social-row { display: flex; gap: 0.75rem; justify-content: center; align-items: center; flex-wrap: wrap; }
    .social-btn { display: inline-flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; border-radius: 0.65rem;
      background: #334155; color: #f8fafc; text-decoration: none; transition: background 0.2s, transform 0.15s; }
    .social-btn:hover { background: #475569; }
    .social-btn:active { transform: scale(0.96); }
    .social-btn svg { display: block; }
    .btn-wrap { margin-top: 1.5rem; }
    .btn { display: inline-block; width: 100%; max-width: 20rem; padding: 1rem 1.25rem; font-size: 1.125rem; font-weight: 700;
      color: #0f172a; background: #38bdf8; border-radius: 0.75rem; text-decoration: none; text-align: center;
      box-shadow: 0 4px 14px rgba(56, 189, 248, 0.4); }
    .btn:active { transform: scale(0.98); }
    footer { margin-top: 1.5rem; font-size: 1.5rem; color: #ffffff; text-align: center; line-height: 1.25; }
  </style>
</head>
<body>
  <div class="page">
    <header class="site-header">
      <div class="logo-wrap">
        <img class="hero-logo" src="${HERO_LOGO_SRC}" alt="SLxAI Logo" width="240" height="96" />
      </div>
      ${socialBlock}
    </header>
    <main class="card">
    ${rows.join('\n    ')}
    ${linksBlock}
    <div class="btn-wrap">
      <a class="btn" href="${vcfPath}" download="${slug}.vcf">Add to Contacts</a>
    </div>
    <footer>SLxAI Summit 2026</footer>
    </main>
  </div>
</body>
</html>
`;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function main() {
  const csvPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_CSV;
  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    console.error('Copy "Badge List SLxAI 2026 - Badge List.csv" to data/badge-list-slxai-2026.csv or pass the path as the first argument.');
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, 'utf8');
  const rows = parseCSV(raw);
  if (rows.length < 2) {
    console.error('CSV has no data rows.');
    process.exit(1);
  }

  const cols = mapHeaders(rows[0]);
  if (cols.fullName < 0) {
    console.error('Missing "Full Name" column. Headers:', rows[0]);
    process.exit(1);
  }

  ensureDir(OUT_CONTACTS);
  ensureDir(OUT_VCF);

  const slugCounts = new Map();
  const qrRows = [['Full Name', 'Title', 'Company', 'Slug', 'Contact URL', 'VCF URL']];

  for (let r = 1; r < rows.length; r++) {
    const rec = rowToRecord(cols, rows[r]);
    if (!rec.fullName) continue;

    let slug = slugify(rec.fullName);
    if (!slug) {
      console.warn('Skip row (no slug):', rec.fullName);
      continue;
    }
    const n = (slugCounts.get(slug) || 0) + 1;
    slugCounts.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;

    const contactDir = path.join(OUT_CONTACTS, slug);
    ensureDir(contactDir);
    fs.writeFileSync(path.join(contactDir, 'index.html'), contactHtml(rec, slug), 'utf8');
    fs.writeFileSync(path.join(OUT_VCF, `${slug}.vcf`), buildVcard(rec), 'utf8');

    const company = rec.company || '';
    qrRows.push([
      rec.fullName,
      rec.title || '',
      company,
      slug,
      `${BASE_URL}/contacts/${slug}`,
      `${BASE_URL}/vcf/${slug}.vcf`,
    ]);
  }

  const qrCsv = qrRows.map((line) => line.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  fs.writeFileSync(OUT_QR_CSV, qrCsv + '\r\n', 'utf8');

  console.log('Wrote', qrRows.length - 1, 'contacts to', path.relative(ROOT, OUT_CONTACTS));
  console.log('Wrote vCards to', path.relative(ROOT, OUT_VCF));
  console.log('Wrote', path.relative(ROOT, OUT_QR_CSV));
}

main();
