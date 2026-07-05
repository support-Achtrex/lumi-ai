const fs = require('fs');
const path = require('path');

const root = 'c:\\Users\\hp\\Desktop\\Achtrex LLC\\aaia';

const includeExts = ['.js', '.jsx', '.html', '.css', '.md', '.json', '.sql', '.example', '.env'];

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        if (['node_modules', '.git', 'build', 'logs', 'package-lock.json', 'pg', 'frontend_old'].includes(file)) return;
        
        let fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else {
            let ext = path.extname(fullPath);
            if (includeExts.includes(ext) || file === '.env.example' || file === '.env') {
                results.push(fullPath);
            }
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
    if (fs.existsSync(path.join(root, 'services', 'AAIAService.js'))) {
        fs.renameSync(
            path.join(root, 'services', 'AAIAService.js'),
            path.join(root, 'services', 'AAIAService.js')
        );
        console.log('Renamed AAIAService.js to AAIAService.js');
    }
} catch(e) {
    console.error(e.message);
}

console.log(`Updated ${count} files.`);
