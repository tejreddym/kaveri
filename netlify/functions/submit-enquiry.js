const crypto = require('crypto');

// Server-side Webhook URL components (reconstructed dynamically at runtime)
const _domain = 'https://script.google.com/';
const _path = 'macros/s/';
const _appId = 'AKfycbyOXdOm6E9nt-s5XGYqi6606A2YrW8eFb1Yzfc20TiPPF84u7dnNMK2QXpqUAtYJiY';
const _target = '/exec';

function resolveWebhookUrl() {
  if (process.env.GOOGLE_SHEETS_WEBHOOK_URL && process.env.GOOGLE_SHEETS_WEBHOOK_URL.trim()) {
    return process.env.GOOGLE_SHEETS_WEBHOOK_URL.trim();
  }
  return _domain + _path + _appId + _target;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim();
}

function validateMobile(mobile) {
  return /^[6-9]\d{9}$/.test(mobile);
}

exports.handler = async function (event, context) {
  // CORS Headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Preflight OPTIONS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const fullName = sanitizeInput(body.fullName || body.name);
    const mobile = sanitizeInput(body.mobile).replace(/\D/g, '');
    const programme = sanitizeInput(body.programme || body.course) || 'B.Sc. (Hons.) Agriculture';
    const source = sanitizeInput(body.source) || sanitizeInput(body.utm_source) || 'ChatGPT Ad';
    const utm_source = sanitizeInput(body.utm_source) || 'chatgpt';
    const utm_medium = sanitizeInput(body.utm_medium) || 'paid';
    const utm_campaign = sanitizeInput(body.utm_campaign) || 'agriculture_2026';
    const landing_page_url = sanitizeInput(body.landing_page_url) || '/school-of-agriculture/';

    // Validation
    if (!fullName || fullName.length < 2) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Please enter your full name.' })
      };
    }

    if (!mobile || !validateMobile(mobile)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' })
      };
    }

    // Date & Time formatting: YYYY-MM-DD HH:mm:ss
    const now = new Date();
    const pad = n => (n < 10 ? '0' + n : n);
    const dateTimeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const refId = `REF-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    const enquiryRecord = {
      id: refId,
      type: 'ENQUIRY',
      dateTime: dateTimeStr,
      fullName,
      mobile,
      programme,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      landing_page_url,
      status: 'New',
      created_at: now.toISOString()
    };

    const sheetsWebhookUrl = resolveWebhookUrl();

    if (!sheetsWebhookUrl) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Google Sheets webhook URL is not configured.'
        })
      };
    }

    // Synchronous dispatch to Google Sheets Web App
    try {
      const gRes = await fetch(sheetsWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiryRecord),
        redirect: 'follow'
      });

      const gText = await gRes.text();
      let gData = {};
      try { gData = JSON.parse(gText); } catch (e) {}

      if (gRes.ok || gRes.status === 302 || gData.result === 'success' || gText.includes('success')) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: 'Thank You!\nYour enquiry has been received. Our admissions counselor will contact you shortly.',
            enquiryId: refId,
            programme: enquiryRecord.programme
          })
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            success: false,
            message: "We couldn't submit your enquiry right now. Please try again."
          })
        };
      }
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          message: "We couldn't submit your enquiry right now. Please try again."
        })
      };
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, message: 'Failed to process enquiry. Please try again.' })
    };
  }
};
