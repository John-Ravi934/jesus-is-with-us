const fs = require('fs');
const lucide = require('lucide-react');

let code = fs.readFileSync('src/pages/admin/Categories.jsx', 'utf8');

// Get all valid icon keys
let allKeys = Object.keys(lucide).filter(k => /^[A-Z]/.test(k) && !k.endsWith('Icon') && k !== 'LucideProps' && k !== 'Icon' && k !== 'createLucideIcon');

// Prioritize spiritual and essential icons
const spiritual = ['Church', 'Cross', 'Heart', 'Flame', 'Sun', 'BookOpen', 'Users', 'Crown', 'Star', 'Dove', 'Bird', 'HandHeart', 'Baby', 'Bell', 'Music', 'Cloud'];
const validSpiritual = spiritual.filter(k => allKeys.includes(k));

const standard = ['Plus', 'Trash2', 'Edit2', 'X', 'Save', 'Search', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'Lightbulb', 'MoreHorizontal', 'Trophy'];

let remaining = allKeys.filter(k => !validSpiritual.includes(k) && !standard.includes(k));
let selected = [...new Set([...standard, ...validSpiritual, ...remaining.slice(0, 550)])];

let importStr = 'import {\n  ' + selected.join(',\n  ') + '\n} from \'lucide-react\';';
let mapStr = 'const iconMap = {\n  ' + selected.filter(k => !['ChevronDown', 'ChevronLeft', 'ChevronRight'].includes(k)).join(',\n  ') + '\n};';

// VERY CAREFUL REPLACEMENT: only replace the lucide-react import
code = code.replace(/import\s+\{[^}]*\}\s+from\s+'lucide-react';/, importStr);

// add iconMap before export default function Categories()
if(!code.includes('const iconMap')) {
    code = code.replace('export default function Categories', mapStr + '\n\nconst iconNames = Object.keys(iconMap);\nconst mainIconNames = iconNames.slice(0, 9);\nconst colorPresets = [\'#10b981\', \'#eab308\', \'#f97316\', \'#ec4899\', \'#a855f7\', \'#3b82f6\', \'#06b6d4\'];\n\nexport default function Categories');
}

// Add state for search, filter, sort
code = code.replace(
  'const [loading, setLoading] = useState(true);',
  'const [loading, setLoading] = useState(true);\n  const [submitting, setSubmitting] = useState(false);\n  const [newCat, setNewCat] = useState({ name: \'\', color: \'#10b981\', icon: \'Tag\' });\n  const [deleteId, setDeleteId] = useState(null);\n  const [editingId, setEditingId] = useState(null);\n  const [searchQuery, setSearchQuery] = useState(\'\');\n  const [filter, setFilter] = useState(\'All\');\n  const [sortBy, setSortBy] = useState(\'A-Z\');\n  const [categoryCounts, setCategoryCounts] = useState({});\n  const [iconSearch, setIconSearch] = useState(\'\');'
);

// We'll write this and then apply the rest of the changes via replace_file_content.
fs.writeFileSync('src/pages/admin/Categories.jsx', code);
console.log('Fixed base file');
