const fs = require('fs');
let code = fs.readFileSync('services/AAIAService.js', 'utf8');
code = code.replace(/'grok-2-latest'/g, "'grok-4.3'");
code = code.replace(/'grok-2-1212'/g, "'grok-4.3'");
fs.writeFileSync('services/AAIAService.js', code);
console.log('Fixed AAIAService');
