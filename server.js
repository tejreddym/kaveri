const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const https = require('https');

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
const OTP_PROVIDER = process.env.OTP_PROVIDER || 'dev';
const LEADS_FILE = path.join(__dirname, process.env.LEADS_STORE_PATH || 'leads.json');

// In-memory OTP store: mobile -> { otp, expiresAt }
const otpStore = new Map();

// Helper to ensure leads store exists
function getLeads() {
  try {
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, 'utf8');
      return JSON.parse(data || '[]');
    }
  } catch (err) {
    console.error('Error reading leads file:', err);
  }
  return [];
}

function saveLead(lead) {
  const leads = getLeads();
  leads.unshift(lead);
  fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
  return lead;
}

// MIME types for static files
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
  '.eot': 'application/vnd.ms-fontobject',
  '.webp': 'image/webp'
};

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 1e6) { // 1MB limit
        req.connection.destroy();
        reject(new Error('Payload too large'));
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

function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

// SMS Gateway dispatch function
async function dispatchSmsOtp(mobile, otp) {
  if (OTP_PROVIDER === 'dev') {
    console.log(`[DEV OTP] Mobile: ${mobile}, OTP: ${otp}`);
    return { success: true, devMode: true };
  }

  if (OTP_PROVIDER === 'msg91') {
    const authKey = process.env.OTP_API_KEY;
    const templateId = process.env.OTP_TEMPLATE_ID;
    if (!authKey) throw new Error('MSG91 OTP_API_KEY is not configured');
    
    // MSG91 OTP endpoint
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

  return { success: true, devMode: true };
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // --- API ENDPOINTS ---

  // 1. POST /api/send-otp
  if (pathname === '/api/send-otp' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const mobile = (body.mobile || '').toString().trim().replace(/\D/g, '');

      if (!mobile || mobile.length !== 10 || !/^[6-9]\d{9}$/.test(mobile)) {
        return sendJsonResponse(res, 400, { success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
      }

      // Generate 4-digit OTP
      const otp = process.env.NODE_ENV === 'test' ? '1234' : Math.floor(1000 + Math.random() * 9000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      otpStore.set(mobile, { otp, expiresAt });

      try {
        await dispatchSmsOtp(mobile, otp);
        const responseData = {
          success: true,
          message: 'OTP sent successfully to ' + mobile,
          mobile
        };
        if (OTP_PROVIDER === 'dev') {
          responseData.debugOtp = otp;
        }
        return sendJsonResponse(res, 200, responseData);
      } catch (smsErr) {
        console.error('SMS Provider Error:', smsErr);
        return sendJsonResponse(res, 500, { success: false, message: 'Failed to send OTP via SMS gateway. Please try again.' });
      }
    } catch (err) {
      return sendJsonResponse(res, 500, { success: false, message: 'Internal server error' });
    }
  }

  // 2. POST /api/verify-otp
  if (pathname === '/api/verify-otp' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const mobile = (body.mobile || '').toString().trim().replace(/\D/g, '');
      const otp = (body.otp || '').toString().trim();

      if (!mobile || !otp) {
        return sendJsonResponse(res, 400, { success: false, message: 'Mobile number and OTP are required.' });
      }

      const storedData = otpStore.get(mobile);

      if (!storedData) {
        return sendJsonResponse(res, 400, { success: false, message: 'No OTP request found for this mobile number. Please request a new OTP.' });
      }

      if (Date.now() > storedData.expiresAt) {
        otpStore.delete(mobile);
        return sendJsonResponse(res, 400, { success: false, message: 'OTP has expired. Please click Resend OTP.' });
      }

      if (storedData.otp !== otp) {
        return sendJsonResponse(res, 400, { success: false, message: 'Invalid OTP code. Please check and try again.' });
      }

      // Mark as verified
      otpStore.set(mobile, { ...storedData, verified: true });

      return sendJsonResponse(res, 200, {
        success: true,
        verified: true,
        message: 'Mobile number verified successfully!'
      });
    } catch (err) {
      return sendJsonResponse(res, 500, { success: false, message: 'Internal server error' });
    }
  }

  // 3. POST /api/submit-application
  if (pathname === '/api/submit-application' && req.method === 'POST') {
    try {
      const body = await parseRequestBody(req);
      const {
        name,
        mobile,
        email,
        course,
        state,
        city,
        source,
        utm_source,
        utm_medium,
        utm_campaign,
        landing_page_url
      } = body;

      const cleanMobile = (mobile || '').toString().trim().replace(/\D/g, '');

      if (!name || !cleanMobile || !course) {
        return sendJsonResponse(res, 400, {
          success: false,
          message: 'Name, mobile number, and course selection are required.'
        });
      }

      const storedData = otpStore.get(cleanMobile);
      // In dev mode or if OTP was verified
      if (OTP_PROVIDER !== 'dev' && (!storedData || !storedData.verified)) {
        return sendJsonResponse(res, 400, {
          success: false,
          message: 'Mobile number must be verified via OTP before submitting application.'
        });
      }

      const leadRecord = {
        id: 'KAV-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: name.trim(),
        mobile: cleanMobile,
        email: (email || '').trim().toLowerCase(),
        course: course.trim(),
        state: (state || '').trim(),
        city: (city || '').trim(),
        source: source || utm_source || 'Website Direct',
        utm_source: utm_source || '',
        utm_medium: utm_medium || '',
        utm_campaign: utm_campaign || '',
        landing_page_url: landing_page_url || '',
        created_at: new Date().toISOString()
      };

      saveLead(leadRecord);

      // Clean up OTP store after submission
      otpStore.delete(cleanMobile);

      console.log(`[NEW LEAD SUBMITTED] ID: ${leadRecord.id}, Name: ${leadRecord.name}, Course: ${leadRecord.course}, Source: ${leadRecord.utm_source || leadRecord.source}`);

      return sendJsonResponse(res, 200, {
        success: true,
        message: 'Application submitted successfully!',
        leadId: leadRecord.id,
        course: leadRecord.course
      });
    } catch (err) {
      console.error('Submit application error:', err);
      return sendJsonResponse(res, 500, { success: false, message: 'Failed to submit application. Please try again.' });
    }
  }

  // 4. GET /api/leads (Retrieve submitted leads)
  if (pathname === '/api/leads' && req.method === 'GET') {
    const leads = getLeads();
    return sendJsonResponse(res, 200, { success: true, count: leads.length, leads });
  }

  // --- STATIC FILE SERVING ---
  if (req.method === 'GET' || req.method === 'HEAD') {
    let filePath = path.join(__dirname, decodeURIComponent(pathname));

    // Handle root or directory requests
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
        'Cache-Control': 'no-cache'
      });

      if (req.method === 'HEAD') {
        return res.end();
      }

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
      stream.on('error', (err) => {
        res.writeHead(500);
        res.end('Server Error reading file');
      });
      return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'text/html' });
    return res.end('<h1>404 Page Not Found</h1><p>The requested URL was not found on Kaveri University website.</p>');
  }

  sendJsonResponse(res, 405, { success: false, message: 'Method Not Allowed' });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Kaveri University Web & API Server running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(` OTP Provider Mode: ${OTP_PROVIDER}`);
  console.log(` Storage Path: ${LEADS_FILE}`);
  console.log(`====================================================`);
});
