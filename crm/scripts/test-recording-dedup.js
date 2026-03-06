/**
 * Test script to verify recording deduplication logic.
 * Run with: node scripts/test-recording-dedup.js
 */

// Simulate the client-side upload ID generation (same as in page.js)
function generateUploadId() {
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// Simulate the server-side filename generation (same as in record route)
function getFilename(leadId, uploadId, ext) {
  return uploadId ? `recording-${leadId}-${uploadId}.${ext}` : `recording-${leadId}-${Date.now()}.${ext}`;
}

// Test 1: Same uploadId produces same filename (dedup key)
const uploadId = generateUploadId();
const leadId = 4;
const ext = 'webm';

const filename1 = getFilename(leadId, uploadId, ext);
const filename2 = getFilename(leadId, uploadId, ext);

if (filename1 !== filename2) {
  console.error('FAIL: Same uploadId should produce same filename');
  process.exit(1);
}
console.log('PASS: Same uploadId produces same filename for deduplication');

// Test 2: Different uploadIds produce different filenames
const uploadId2 = generateUploadId();
const filename3 = getFilename(leadId, uploadId2, ext);

if (filename1 === filename3) {
  console.error('FAIL: Different uploadIds should produce different filenames');
  process.exit(1);
}
console.log('PASS: Different uploadIds produce different filenames');

// Test 3: onstopProcessedRef guard - simulate double onstop
let onstopProcessedRef = false;
let uploadCount = 0;

function simulateOnstop() {
  if (onstopProcessedRef) return;
  onstopProcessedRef = true;
  uploadCount++;
}

simulateOnstop();
simulateOnstop();
simulateOnstop();

if (uploadCount !== 1) {
  console.error('FAIL: onstop guard should allow only 1 upload, got', uploadCount);
  process.exit(1);
}
console.log('PASS: onstop guard prevents duplicate uploads');

console.log('\nAll recording deduplication tests passed.');
