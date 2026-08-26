const fs = require('fs');
const path = require('path');
const lu = require('react-icons/lu');
const fa6 = require('react-icons/fa6');

// We will test the catalogs dynamically by loading the files, 
// but since we haven't built them yet, we just provide the validation function logic here.
// When testing the real files later, we can use Babel or esbuild to parse them, 
// or just regex to extract the icon names.

async function validate() {
  const iconsPath = path.join(__dirname, 'src', 'constants', 'biblicalIcons.js');
  
  if (!fs.existsSync(iconsPath)) {
    console.error(`File not found: ${iconsPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(iconsPath, 'utf-8');

  // Regex to match: { id: "...", name: "...", group: "...", keywords: [...], icon: IconName, iconName: "..." }
  const regex = /{\s*id:\s*['"]([^'"]+)['"],\s*name:\s*['"]([^'"]+)['"],\s*group:\s*['"]([^'"]+)['"],\s*keywords:\s*\[([^\]]*)\],\s*icon:\s*([A-Za-z0-9_]+),\s*iconName:\s*['"]([^'"]+)['"]\s*}/g;
  
  const usedIcons = new Map();
  const duplicateIcons = [];
  const invalidIcons = [];
  let count = 0;

  let match;
  while ((match = regex.exec(content)) !== null) {
    count++;
    const [_, id, name, group, keywordsStr, iconValue, iconName] = match;

    // Check valid export
    if (iconName.startsWith('Lu') && !lu[iconName]) {
      invalidIcons.push(iconName);
    } else if (iconName.startsWith('Fa') && !fa6[iconName]) {
      invalidIcons.push(iconName);
    } else if (!iconName.startsWith('Lu') && !iconName.startsWith('Fa')) {
      // Just flag if it doesn't match our expected prefixes
      invalidIcons.push(iconName);
    }

    // Check duplicates
    if (usedIcons.has(iconName)) {
      duplicateIcons.push({ iconName, item1: usedIcons.get(iconName), item2: id });
    } else {
      usedIcons.set(iconName, id);
    }
  }

  console.log(`Total icons processed: ${count}`);
  
  let failed = false;

  if (invalidIcons.length > 0) {
    console.error('\nINVALID ICONS (Not exported by react-icons):');
    invalidIcons.forEach(i => console.error(`- ${i}`));
    failed = true;
  }

  if (duplicateIcons.length > 0) {
    console.error('\nDUPLICATE ICONS DETECTED:');
    duplicateIcons.forEach(d => console.error(`- ${d.iconName} used by "${d.item1}" and "${d.item2}"`));
    // The user requested MINIMAL duplication, preferably none. 
    // We will fail if any duplicate is found to enforce strictly 200+ unique icons.
    failed = true;
  }

  if (count < 200) {
    console.error(`\nNOT ENOUGH ICONS: Expected 200+, got ${count}`);
    failed = true;
  }

  if (failed) {
    process.exit(1);
  } else {
    console.log('\n✅ Validation passed: 200+ unique icons successfully matched and verified.');
  }
}

validate().catch(console.error);
