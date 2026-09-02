const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, '../data/encyclopedia-db.json');
const jsPath = path.join(__dirname, '../js/db-data.js');

const dbData = fs.readFileSync(jsonPath, 'utf8');

const jsContent = `// Embedded Database for Pessoa Cega: Análise Profunda
window.ENCYCLOPEDIA_DB = ${dbData};
console.log("Database loaded successfully into window.ENCYCLOPEDIA_DB with", window.ENCYCLOPEDIA_DB.modules.length, "modules.");
`;

fs.writeFileSync(jsPath, jsContent, 'utf8');
console.log("Successfully bundled data/encyclopedia-db.json into js/db-data.js!");
