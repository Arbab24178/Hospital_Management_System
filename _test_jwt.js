const jwt = require('jsonwebtoken');
const secret = 'hms-super-secret-key-change-in-production-32chars';

// Get token from command line arg
const token = process.argv[2];
console.log('Token:', token.substring(0, 50) + '...');

try {
  const decoded = jwt.verify(token, secret);
  console.log('VERIFIED:', JSON.stringify(decoded));
} catch(e) {
  console.log('FAILED:', e.message);
}
