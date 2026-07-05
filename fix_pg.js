const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\hp\\Desktop\\Achtrex LLC\\aaia\\pg';

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            results.push(file);
        }
    });
    return results;
}

const files = walk(root);
let count = 0;
files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;
        
        content = content.replace(/aaia/g, 'aaia');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/Aaia/g, 'AAIA');

        if (original !== content) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Restored ${file}`);
            count++;
        }
    } catch (e) {
    }
});

console.log(`Restored ${count} files in pg dir.`);
