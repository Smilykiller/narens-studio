const fs = require('fs');
const path = require('path');

function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const original = content;

      // 1. Backgrounds
      content = content.replace(/bg-\[\#FDFBF7\]/g, 'bg-sand-bg');
      content = content.replace(/(?<!selection:|focus:|group-hover:|hover:)bg-white(?![\/\w])/g, 'bg-sand-surface');
      content = content.replace(/bg-gray-900/g, 'bg-sand-text'); 
      
      // 2. Texts
      content = content.replace(/text-gray-900/g, 'text-sand-text');
      content = content.replace(/text-neutral-900/g, 'text-sand-text');
      content = content.replace(/text-black/g, 'text-sand-text');
      
      content = content.replace(/text-gray-600/g, 'text-sand-muted');
      content = content.replace(/text-gray-500/g, 'text-sand-muted');
      content = content.replace(/text-neutral-600/g, 'text-sand-muted');
      content = content.replace(/text-neutral-500/g, 'text-sand-muted');

      content = content.replace(/text-white/g, 'text-sand-bg');

      // 3. Borders
      content = content.replace(/border-black\/[0-9]+/g, 'border-sand-border');
      content = content.replace(/border-gray-200/g, 'border-sand-border');
      content = content.replace(/border-neutral-200/g, 'border-sand-border');

      // 4. Image theme injection
      content = content.replace(/<img([^>]*)className="([^"]*)"/g, '<img$1className="img-theme $2"');
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

const targetDir = path.join(__dirname, '../src');
console.log(`Scanning directory: ${targetDir}`);
processDirectory(targetDir);
console.log('Done replacing sandstone classes!');
