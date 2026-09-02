const db = require('../data/encyclopedia-db.json');
const m = db.modules[0];
const re = /id="topico-1-\d+"/g;
const matches = m.markdown.match(re);
console.log('Anchor IDs found:', matches);
console.log('Markdown first 500 chars:', m.markdown.slice(0, 500));
