const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, '../docs');
const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).sort();

const docs = files.map(file => {
  const filePath = path.join(docsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  return {
    filename: file,
    content: content
  };
});

fs.writeFileSync(path.join(dataDir, 'content.json'), JSON.stringify(docs, null, 2), 'utf8');
console.log(`Successfully compiled ${docs.length} documentation volumes into data/content.json`);
