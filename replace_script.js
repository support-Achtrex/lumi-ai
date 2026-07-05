const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\hp\\Desktop\\Achtrex LLC\\aaia';

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (['node_modules', '.git', 'build', 'logs', 'package-lock.json', 'database', 'frontend_old'].includes(file)) {
            // Keep database folder but skip others. Wait, database/migrations needs update.
            if (file !== 'database') return;
        }
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            // Do not recurse into logs folder inside database
            if (file.endsWith(path.join('database', 'logs'))) return;
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
    if (file.endsWith('.png') || file.endsWith('.ico') || file.endsWith('.map') || file.endsWith('.lock') || file.endsWith('.mp4')) return;
    try {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;
        
        // Replacements
        content = content.replace(/AAIAService/g, 'AAIAService');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/AAIA/g, 'AAIA');
        content = content.replace(/aaia/g, 'aaia');
        content = content.replace(/aaia/g, 'aaia');
        content = content.replace(/aaia/g, 'aaia');
        content = content.replace(/aaia/g, 'aaia');

        if (original !== content) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Updated ${file}`);
            count++;
        }
    } catch (e) {
        console.error(`Error processing ${file}: ${e.message}`);
    }
});

// Rename file
try {
    fs.renameSync(
        path.join(root, 'services', 'AAIAService.js'),
        path.join(root, 'services', 'AAIAService.js')
    );
    console.log('Renamed AAIAService.js to AAIAService.js');
} catch(e) {}

console.log(`Updated ${count} files.`);
