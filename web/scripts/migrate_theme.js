const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../src');

// Map of Dark -> Light classes
const REPLACEMENTS = [
  // Backgrounds
  { regex: /bg-\[\#050505\]/g, replacement: 'bg-[#FDFBF7]' },
  { regex: /bg-\[\#111111\]/g, replacement: 'bg-[#FDFBF7]' },
  { regex: /bg-black\/50/g, replacement: 'bg-white/60' },
  { regex: /bg-black\/80/g, replacement: 'bg-white/80' },
  { regex: /bg-black\/90/g, replacement: 'bg-white/90' },
  { regex: /bg-black\/95/g, replacement: 'bg-white/95' },
  { regex: /bg-black/g, replacement: 'bg-white' },
  { regex: /bg-white\/5/g, replacement: 'bg-black/5' },
  { regex: /bg-white\/10/g, replacement: 'bg-black/10' },
  { regex: /bg-white\/20/g, replacement: 'bg-black/20' },
  // Text colors
  { regex: /text-white\/50/g, replacement: 'text-black/50' },
  { regex: /text-white\/60/g, replacement: 'text-black/60' },
  { regex: /text-white\/80/g, replacement: 'text-black/80' },
  { regex: /text-white/g, replacement: 'text-gray-900' },
  { regex: /text-gray-400/g, replacement: 'text-gray-600' },
  { regex: /text-gray-300/g, replacement: 'text-gray-700' },
  // Borders
  { regex: /border-white\/5/g, replacement: 'border-black/5' },
  { regex: /border-white\/10/g, replacement: 'border-black/10' },
  { regex: /border-white\/20/g, replacement: 'border-black/20' },
  // Hovers
  { regex: /hover\:bg-white\/10/g, replacement: 'hover:bg-black/10' },
  { regex: /hover\:bg-white\/20/g, replacement: 'hover:bg-black/20' },
  { regex: /hover\:text-white/g, replacement: 'hover:text-gray-900' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replacement } of REPLACEMENTS) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting light theme migration...');
processDirectory(SRC_DIR);
console.log('Migration complete!');
