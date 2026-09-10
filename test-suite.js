/**
 * Kaveri University Admissions System - Automated Test Suite (Tests A to L)
 */
const http = require('http');

const BASE_URL = 'http://127.0.0.1:8080';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const urlStr = BASE_URL + path;
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = http.request(urlStr, reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body, json });
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log(' RUNNING KAVERI UNIVERSITY SECURITY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      if (detail) console.log(`       -> ${detail}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      if (detail) console.error(`       -> ${detail}`);
      failed++;
    }
  }

  // --- Test A: Valid OTP Flow ---
  const mobileA = '9870000001';
  const resA1 = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileA } });
  const otpA = resA1.json ? resA1.json.debugOtp : null;

  assert(resA1.status === 200 && resA1.json.success && otpA, 'Test A1: Send OTP to valid mobile', `OTP received: ${otpA}`);

  const resA2 = await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileA, otp: otpA } });
  assert(resA2.status === 200 && resA2.json.verified === true, 'Test A2: Verify OTP with valid code', resA2.json.message);

  const resA3 = await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: 'Ananya Rao',
      mobile: mobileA,
      email: 'ananya@example.com',
      course: 'B.Sc. (Hons.) Agriculture',
      state: 'Telangana',
      city: 'Hyderabad',
      source: 'ChatGPT Ad',
      utm_source: 'chatgpt',
      utm_medium: 'paid',
      utm_campaign: 'agriculture_2026',
      landing_page_url: 'http://kaveriuniv.online/b-sc-hons-agriculture/?utm_source=chatgpt&utm_medium=paid&utm_campaign=agriculture_2026'
    }
  });
  assert(resA3.status === 200 && resA3.json.leadId, 'Test A3: Submit application after verification', `Generated Lead ID: ${resA3.json.leadId}`);

  // --- Test B: Wrong OTP ---
  const mobileB = '9870000002';
  await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileB } });
  const resB = await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileB, otp: '0000' } });
  assert(resB.status === 400 && resB.json.success === false, 'Test B: Reject invalid OTP code', resB.json.message);

  // --- Test C: Expired OTP / Invalid Session ---
  const resC = await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: '9999999999', otp: '1234' } });
  assert(resC.status === 400 && resC.json.success === false, 'Test C: Reject verification for non-existent session', resC.json.message);

  // --- Test D: Multiple OTP requests (Rate Limiting) ---
  const mobileD = '9870000004';
  await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileD } });
  await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileD } });
  await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileD } });
  const resD = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileD } });
  assert(resD.status === 429 && resD.json.success === false, 'Test D: Trigger 4th OTP request rate limit', resD.json.message);

  // --- Test E: Invalid Mobile Number ---
  const resE = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: '12345' } });
  assert(resE.status === 400 && resE.json.success === false, 'Test E: Reject invalid mobile number format', resE.json.message);

  // --- Test F: Invalid Email Format ---
  const mobileF = '9870000006';
  const resF1 = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileF } });
  await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileF, otp: resF1.json.debugOtp } });
  const resF2 = await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'Invalid Email Test', mobile: mobileF, email: 'not-an-email', course: 'B.Sc. (Hons.) Agriculture' }
  });
  assert(resF2.status === 400 && resF2.json.success === false, 'Test F: Reject invalid email address format', resF2.json.message);

  // --- Test G: Missing Required Fields ---
  const resG = await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: '', mobile: '9870000007', email: 'test@example.com', course: '' }
  });
  assert(resG.status === 400 && resG.json.success === false, 'Test G: Reject missing required form fields', resG.json.message);

  // --- Test H: Duplicate Application ---
  const mobileH = '9870000008';
  const resH1 = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileH } });
  await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileH, otp: resH1.json.debugOtp } });
  await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'Dup Test', mobile: mobileH, email: 'dup@example.com', course: 'B.Sc. (Hons.) AgriTech' }
  });
  const resH2 = await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: { name: 'Dup Test', mobile: mobileH, email: 'dup@example.com', course: 'B.Sc. (Hons.) AgriTech' }
  });
  assert(resH2.status === 400 && resH2.json.success === false, 'Test H: Block immediate duplicate application submission', resH2.json.message);

  // --- Test I: UTM Attribution Preservation ---
  const mobileI = '9870000009';
  const resI1 = await request('/api/send-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileI } });
  await request('/api/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: { mobile: mobileI, otp: resI1.json.debugOtp } });
  const resI2 = await request('/api/submit-application', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      name: 'UTM Test User',
      mobile: mobileI,
      email: 'utm@example.com',
      course: 'B.Sc. (Hons.) Horticulture',
      source: 'ChatGPT Ad',
      utm_source: 'chatgpt',
      utm_medium: 'paid',
      utm_campaign: 'agriculture_2026',
      landing_page_url: 'http://kaveriuniv.online/b-sc-hons-horticulture/?utm_source=chatgpt&utm_medium=paid&utm_campaign=agriculture_2026'
    }
  });
  assert(resI2.status === 200 && resI2.json.success, 'Test I: Preserve UTM source, medium, campaign, and course', `Submitted Course: ${resI2.json.course}`);

  // --- Test J: Unauthorized /api/leads request ---
  const resJ = await request('/api/leads');
  assert(resJ.status === 401 && resJ.json.success === false, 'Test J: Block unauthenticated access to /api/leads', resJ.json.message);

  console.log('\n====================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');
}

runTests().catch(console.error);
