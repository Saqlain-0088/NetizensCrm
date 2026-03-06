/**
 * Test the record API endpoint.
 * Run with: node scripts/test-record-api.js
 * Requires: npm run start (or dev) to be running on port 3000
 */

const http = require('http');

// Test 1: Record API exists and responds (expect 400 - no audio, or 503 - no Supabase)
function testRecordAPI() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({}); // Wrong format - we need form-data, so we'll get 400
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads/1/record',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        // 400 = no audio file, 503 = no Supabase, 307 = redirect to login (auth required)
        const ok = [400, 307, 503].includes(res.statusCode);
        console.log('Record API status:', res.statusCode, ok ? '(OK)' : '');
        if (!ok && res.statusCode === 500) {
          console.log('Response:', data.slice(0, 300));
        }
        resolve(ok);
      });
    });
    req.on('error', (e) => {
      console.error('Record API error:', e.message);
      resolve(false);
    });
    req.end(postData);
  });
}

// Test 2: Debug env endpoint
function testDebugEnv() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000/api/debug-env', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const ok = res.statusCode === 200;
        console.log('Debug-env status:', res.statusCode, ok ? '(OK)' : '');
        resolve(ok);
      });
    }).on('error', (e) => {
      console.error('Debug-env error:', e.message);
      resolve(false);
    });
  });
}

async function run() {
  console.log('Testing API endpoints...\n');
  const r1 = await testRecordAPI();
  const r2 = await testDebugEnv();
  console.log('\n' + (r1 && r2 ? 'All API tests passed.' : 'Some tests failed.'));
  process.exit(r1 && r2 ? 0 : 1);
}

run();
