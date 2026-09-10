const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');
const crypto = require('crypto');

// Load environment variables from .env file if available
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

const PORT = process.env.PORT || 8080;
const NODE_ENV = process.env.NODE_ENV || 'development';
const OTP_PROVIDER = process.env.OTP_PROVIDER || 'dev';
const LEADS_FILE = path.join(__dirname, process.env.LEADS_STORE_PATH || 'leads.json');
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
const LEAD_WEBHOOK_URL = process.env.LEAD_WEBHOOK_URL || '';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://kaveriuniv.online,http://localhost:8080,http://127.0.0.1:8080')
  .split(',')
  .map(o => o.trim());

const ALLOWED_COURSES = [
  'B.Sc. (Hons.) Agriculture',
  'B.Sc. (Hons.) AgriTech',
  'B.Sc. (Hons.) Horticulture',
  'M.Sc. Agriculture (Agronomy)',
  'M.Sc. Agriculture (Genetics & Plant Breeding)',
  'MBA in Agribusiness Management',
  'Other Programs'
];

// In-memory stores
const otpStore = new Map(); // mobile -> { otp, expiresAt, verified, attempts }
const sendRateLimitMap = new Map(); // mobile -> { count, resetAt }
const recentSubmissions = new Map(); // key `${mobile}_${course}` -> timestamp

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

function getLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    if (NODE_ENV !== 'production') {
      console.error('Error reading leads file:', err.message);
    }
  }
  return [];
}

function saveLead(lead) {
  const leads = getLeads();
  leads.unshift(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');

  // Async Webhook Integration for production CRM (LeadSquared / Google Sheets / Custom CRM)
  if (LEAD_WEBHOOK_URL) {
    try {
      const webhookUrl = url.parse(LEAD_WEBHOOK_URL);
      const postData = JSON.stringify(lead);
      const reqModule = webhookUrl.protocol === 'https:' ? https : http;
      const req = reqModule.request(LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      });
      req.on('error', err => {
        if (NODE_ENV !== 'production') console.error('Webhook Error:', err.message);
      });
      req.write(postData);
      req.end();
    } catch (e) {
      if (NODE_ENV !== 'production') console.error('Webhook Dispatch Exception:', e.message);
    }
  }
  return lead;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp'
};

function getCorsHeaders(req) {
  const origin = req.headers.origin;
  let allowOrigin = '*';

  if (NODE_ENV === 'production') {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = ALLOWED_ORIGINS[0];
    }
  }

  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-API-Key, Authorization',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN'
  };
}

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5e5) { // 500KB limit
        req.connection.destroy();
        reject(new Error('Payload size limit exceeded'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJsonResponse(req, res, statusCode, data) {
  res.writeHead(statusCode, getCorsHeaders(req));
  res.end(JSON.stringify(data));
}

// Check Send OTP Rate Limits (Max 3 per 15 minutes)
function checkSendOtpRateLimit(mobile) {
  const now = Date.now();
  const record = sendRateLimitMap.get(mobile);

  if (!record || now > record.resetAt) {
    sendRateLimitMap.set(mobile, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return { allowed: true };
  }

  if (record.count >= 3) {
    const waitMins = Math.ceil((record.resetAt - now) / 60000);
    return { allowed: false, waitMins };
  }

  record.count++;
  return { allowed: true };
}

// Dispatch SMS OTP via provider
async function dispatchSmsOtp(mobile, otp) {
  if (OTP_PROVIDER === 'dev') {
    if (NODE_ENV !== 'production') {
      console.log(`[DEV MODE SMS DISPATCH] Mobile: ${mobile}, OTP: ${otp}`);
    }
    return { success: true, devMode: true };
  }

  if (OTP_PROVIDER === 'msg91') {
    const authKey = process.env.OTP_API_KEY;
    const templateId = process.env.OTP_TEMPLATE_ID;
    if (!authKey) throw new Error('MSG91 OTP_API_KEY is not configured');

    const postData = JSON.stringify({
      template_id: templateId,
      mobile: '91' + mobile,
      otp: otp
    });

    return new Promise((resolve, reject) => {
      const req = https.request('https://control.msg91.com/api/v5/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authkey': authKey
        }
      }, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve(JSON.parse(resBody || '{}')));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  if (OTP_PROVIDER === '2factor') {
    const apiKey = process.env.OTP_API_KEY;
    if (!apiKey) throw new Error('2Factor OTP_API_KEY is not configured');

    const urlStr = `https://2factor.in/API/V1/${apiKey}/SMS/${mobile}/${otp}/AUTOGEN`;
    return new Promise((resolve, reject) => {
      https.get(urlStr, (res) => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => resolve(JSON.parse(resBody || '{}')));
      }).on('error', reject);
    });
  }

  return { success: true };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, getCorsHeaders(req));
    return res.end();
  }

  // --- API ENDPOINTS ---

  // 1. POST /api/send-otp
  if (pathname === '/api/send-otp' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const mobile = sanitizeInput(body.mobile).replace(/\D/g, '');

      if (!mobile || !validateMobile(mobile)) {
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'Please enter a valid 10-digit Indian mobile number.'
        });
      }

      // Rate limit check
      const rateCheck = checkSendOtpRateLimit(mobile);
      if (!rateCheck.allowed) {
        return sendJsonResponse(req, res, 429, {
          success: false,
          message: `Too many OTP requests. Please wait ${rateCheck.waitMins} minute(s) before requesting again.`
        });
      }

      // Generate 4-digit OTP
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins validity

      otpStore.set(mobile, { otp, expiresAt, verified: false, attempts: 0 });

      try {
        await dispatchSmsOtp(mobile, otp);

        const responseData = {
          success: true,
          message: `OTP code sent successfully to +91 ${mobile}`,
          mobile
        };

        // NEVER expose debug OTP in production mode
        if (NODE_ENV !== 'production' && OTP_PROVIDER === 'dev') {
          responseData.debugOtp = otp;
        }

        return sendJsonResponse(req, res, 200, responseData);
      } catch (smsErr) {
        if (NODE_ENV !== 'production') console.error('SMS Gateway Error:', smsErr.message);
        return sendJsonResponse(req, res, 500, {
          success: false,
          message: 'Failed to dispatch SMS OTP. Please check mobile number or try again later.'
        });
      }
    } catch (err) {
      return sendJsonResponse(req, res, 500, { success: false, message: 'Internal server processing error.' });
    }
  }

  // 2. POST /api/verify-otp
  if (pathname === '/api/verify-otp' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const mobile = sanitizeInput(body.mobile).replace(/\D/g, '');
      const otp = sanitizeInput(body.otp);

      if (!mobile || !otp) {
        return sendJsonResponse(req, res, 400, { success: false, message: 'Mobile number and OTP code are required.' });
      }

      const storedData = otpStore.get(mobile);

      if (!storedData) {
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'No OTP session found for this mobile number. Please click Send OTP.'
        });
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(mobile);
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'OTP code has expired. Please request a new OTP.'
        });
      }

      // Max 5 attempts protection
      if (storedData.attempts >= 5) {
        otpStore.delete(mobile);
        return sendJsonResponse(req, res, 429, {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        });
      }

      if (storedData.otp !== otp) {
        storedData.attempts++;
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: `Invalid OTP code. ${5 - storedData.attempts} attempt(s) remaining.`
        });
      }

      // Successful verification
      otpStore.set(mobile, { ...storedData, verified: true });

      return sendJsonResponse(req, res, 200, {
        success: true,
        verified: true,
        message: 'Mobile number verified successfully!'
      });
    } catch (err) {
      return sendJsonResponse(req, res, 500, { success: false, message: 'Internal server processing error.' });
    }
  }

  // 3. POST /api/submit-application
  if (pathname === '/api/submit-application' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);

      const name = sanitizeInput(body.name);
      const mobile = sanitizeInput(body.mobile).replace(/\D/g, '');
      const email = sanitizeInput(body.email).toLowerCase();
      const course = sanitizeInput(body.course);
      const state = sanitizeInput(body.state);
      const city = sanitizeInput(body.city);
      const source = sanitizeInput(body.source);
      const utm_source = sanitizeInput(body.utm_source);
      const utm_medium = sanitizeInput(body.utm_medium);
      const utm_campaign = sanitizeInput(body.utm_campaign);
      const landing_page_url = sanitizeInput(body.landing_page_url);

      // Validation
      if (!name || name.length < 2) {
        return sendJsonResponse(req, res, 400, { success: false, message: 'Please enter a valid full name.' });
      }

      if (!mobile || !validateMobile(mobile)) {
        return sendJsonResponse(req, res, 400, { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
      }

      if (!email || !validateEmail(email)) {
        return sendJsonResponse(req, res, 400, { success: false, message: 'Please enter a valid email address.' });
      }

      if (!course || !ALLOWED_COURSES.includes(course)) {
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'Invalid programme selected. Please select a valid Agriculture programme.'
        });
      }

      // Verification check
      const storedData = otpStore.get(mobile);
      const isVerified = (storedData && storedData.verified) || (NODE_ENV !== 'production' && body.bypassOtp === true);

      if (!isVerified) {
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'Mobile number must be verified via OTP before submitting application.'
        });
      }

      // Duplicate submission prevention (same mobile + course within 5 minutes)
      const subKey = `${mobile}_${course}`;
      const lastSubTime = recentSubmissions.get(subKey);
      if (lastSubTime && (Date.now() - lastSubTime < 5 * 60 * 1000)) {
        return sendJsonResponse(req, res, 400, {
          success: false,
          message: 'An application for this programme has already been submitted recently from this mobile number.'
        });
      }

      recentSubmissions.set(subKey, Date.now());

      // Cryptographically secure application ID
      const refSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
      const leadRecord = {
        id: `KAV-2026-${refSuffix}`,
        name,
        mobile,
        email,
        course,
        state,
        city,
        source: source || utm_source || 'Website Direct',
        utm_source,
        utm_medium,
        utm_campaign,
        landing_page_url,
        created_at: new Date().toISOString()
      };

      saveLead(leadRecord);

      // Clean up OTP store after submission
      otpStore.delete(mobile);

      if (NODE_ENV !== 'production') {
        console.log(`[NEW LEAD CREATED] ID: ${leadRecord.id}, Name: ${leadRecord.name}, Course: ${leadRecord.course}, Source: ${leadRecord.utm_source || leadRecord.source}`);
      }

      return sendJsonResponse(req, res, 200, {
        success: true,
        message: 'Application submitted successfully!',
        leadId: leadRecord.id,
        course: leadRecord.course
      });
    } catch (err) {
      return sendJsonResponse(req, res, 500, { success: false, message: 'Failed to process application. Please try again.' });
    }
  }

  // 4. GET /api/leads (PROTECTED ENDPOINT - Admin Key Required)
  if (pathname === '/api/leads' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] || '';
    const reqAdminKey = req.headers['x-admin-api-key'] || (parsedUrl.query && parsedUrl.query.admin_key) || authHeader.replace(/^Bearer\s+/i, '');

    if (!ADMIN_API_KEY || reqAdminKey !== ADMIN_API_KEY) {
      return sendJsonResponse(req, res, 401, {
        success: false,
        message: 'Unauthorized. Admin API key is required to access lead records.'
      });
    }

    const leads = getLeads();
    return sendJsonResponse(req, res, 200, { success: true, count: leads.length, leads });
  }

  // --- STATIC FILE SERVING ---
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(__dirname, decodeURIComponent(pathname));

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
      filePath = filePath + '.html';
    } else if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) {
      filePath = path.join(filePath, 'index.html');
    }

    if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      });

      if (req.method === 'HEAD') {
        return res.end();
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', () => {
        res.writeHead(500);
        res.end('Server File Error');
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end('<h1>404 Page Not Found</h1><p>The requested page was not found on Kaveri University website.</p>');
  }

  sendJsonResponse(req, res, 405, { success: false, message: 'Method Not Allowed' });
});

server.listen(PORT, () => {
  if (NODE_ENV !== 'production') {
    console.log(`====================================================`);
    console.log(` Kaveri University Web & API Server running on port ${PORT}`);
    console.log(` Mode: ${NODE_ENV}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(` OTP Provider Mode: ${OTP_PROVIDER}`);
    console.log(` Storage Path: ${LEADS_FILE}`);
    console.log(`====================================================`);
  }
});
