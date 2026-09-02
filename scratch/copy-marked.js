const fs = require('fs');
const path = require('path');

// Try to find marked min in common global and local paths
const candidates = [
  path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'marked', 'marked.min.js'),
  path.join(process.env.APPDATA || '', 'Roaming', 'npm', 'node_modules', 'marked', 'marked.min.js'),
  'C:/Users/PROFESSOR/AppData/Roaming/npm/node_modules/marked/marked.min.js',
  'C:/Program Files/nodejs/node_modules/marked/marked.min.js',
];

for (const c of candidates) {
  if (fs.existsSync(c)) {
    const content = fs.readFileSync(c, 'utf8');
    fs.writeFileSync(path.join(__dirname, '../js/marked.local.js'), content);
    console.log('Copied from', c);
    process.exit(0);
  }
}

// Fetch fallback: download from CDN and write locally
const https = require('https');
const dest = path.join(__dirname, '../js/marked.local.js');
https.get('https://cdn.jsdelivr.net/npm/marked@14.1.4/marked.min.js', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync(dest, data);
    console.log('Downloaded marked.min.js from CDN ->', dest);
  });
}).on('error', err => console.error('Error downloading marked:', err));
