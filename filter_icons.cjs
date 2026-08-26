const fs = require('fs');
const lucide = require('lucide-react');

const allKeys = Object.keys(lucide).filter(k => /^[A-Z]/.test(k) && !k.endsWith('Icon') && !k.startsWith('Lucide') && k !== 'Icon');

const keywords = [
  'Church', 'Cross', 'Pray', 'Hand', 'Heart', 'Dove', 'Bird', 'Book', 'Candle', 'Flame', 'Fire', 'Star', 'Sun', 'Moon', 'Cloud', 
  'Leaf', 'Tree', 'Flower', 'Lotus', 'Sprout', 'Plant', 'Seed', 'Wheat', 'Grape', 'Wine', 'Cup', 'Glass', 'Bread', 'Shield', 
  'Sword', 'Anchor', 'Crown', 'King', 'Light', 'Lamp', 'Bulb', 'Bell', 'Music', 'Song', 'Mic', 'Speaker', 'User', 'People', 
  'Person', 'Child', 'Baby', 'Family', 'Home', 'House', 'Building', 'Castle', 'Tent', 'Mountain', 'Water', 'Drop', 'Ocean', 
  'Sea', 'Wind', 'Eye', 'Smile', 'Face', 'Joy', 'Peace', 'Love', 'Hope', 'Faith', 'Grace', 'Mercy', 'Holy', 'Spirit', 'Angel', 
  'Heaven', 'Earth', 'Globe', 'Map', 'Compass', 'Infinity', 'Circle', 'Sparkle', 'Magic', 'Gift', 'Box', 'Ribbon', 
  'Feather', 'Activity', 'Award', 'Camera', 'Flag', 'Key', 'Lock', 'Unlock', 'Umbrella', 'Check', 'Smile', 'Laugh', 
  'Ear', 'Voice', 'Volume', 'Palette', 'Brush', 'Pen', 'Pencil', 'Calendar', 'Clock', 'Watch', 'Timer', 'Hourglass',
  'Sun', 'Snow', 'Cloud', 'Umbrella', 'Trophy', 'Medal', 'Badge', 'Shield', 'Target', 'Compass'
];

let selected = new Set();
// Add basic UI icons
const basics = ['Plus', 'Trash2', 'Edit2', 'X', 'Save', 'Search', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Lightbulb', 'MoreHorizontal', 'Trophy', 'Tag'];
basics.forEach(b => selected.add(b));

// Match keywords
allKeys.forEach(k => {
  if (keywords.some(kw => k.toLowerCase().includes(kw.toLowerCase()))) {
    selected.add(k);
  }
});

let remaining = allKeys.filter(k => !selected.has(k) && !k.includes('Arrow') && !k.includes('Align') && !k.includes('File') && !k.includes('Folder') && !k.includes('Chart') && !k.includes('Square') && !k.includes('Rectangle'));

let arr = Array.from(selected);

// Fill up to 550 if needed
if (arr.length < 550) {
  const needed = 550 - arr.length;
  arr = arr.concat(remaining.slice(0, needed));
}

console.log('Selected ' + arr.length + ' icons');
console.log(arr.slice(0, 100).join(', '));

// Generate import string
let importStr = 'import {\n  ' + arr.join(',\n  ') + '\n} from \'lucide-react\';';
let mapStr = 'const iconMap = {\n  ' + arr.filter(k => !['ChevronDown', 'ChevronLeft', 'ChevronRight'].includes(k)).join(',\n  ') + '\n};';

let code = fs.readFileSync('src/pages/admin/Categories.jsx', 'utf8');

// Replace imports
code = code.replace(/import\s+\{[^}]*\}\s+from\s+'lucide-react';/, importStr);
// Replace iconMap
code = code.replace(/const iconMap = \{[\s\S]*?\};/, mapStr);

fs.writeFileSync('src/pages/admin/Categories.jsx', code);
console.log('Categories updated with new icon list!');
