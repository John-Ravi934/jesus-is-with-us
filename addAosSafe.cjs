const fs = require('fs');
const path = require('path');

const pagesToUpdate = [
  'Home.jsx', 'AboutUs.jsx', 'Ministries.jsx', 'Fellowship.jsx',
  'RhemaWords.jsx', 'Gallery.jsx', 'Resources.jsx', 'Contact.jsx', 'Donate.jsx'
];

pagesToUpdate.forEach(page => {
  const filePath = path.join(__dirname, 'src', 'pages', page);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${page}, not found.`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Simple string replacements for opening tags
  const tags = [
    { start: '<section ', repl: '<section data-aos="fade-up" ' },
    { start: '<section>', repl: '<section data-aos="fade-up">' },
    { start: '<section\\n', repl: '<section data-aos="fade-up"\\n' },
    
    { start: '<button ', repl: '<button data-aos="fade-up" ' },
    { start: '<button>', repl: '<button data-aos="fade-up">' },
    { start: '<button\\n', repl: '<button data-aos="fade-up"\\n' },
    
    { start: '<Link ', repl: '<Link data-aos="fade-up" ' },
    { start: '<Link>', repl: '<Link data-aos="fade-up">' },
    { start: '<Link\\n', repl: '<Link data-aos="fade-up"\\n' },
    
    { start: '<a ', repl: '<a data-aos="fade-up" ' },
    { start: '<a>', repl: '<a data-aos="fade-up">' },
    { start: '<a\\n', repl: '<a data-aos="fade-up"\\n' },
  ];

  // Also catch 'className="btn"' and 'className="card"' if it's a div
  const divRegex = /<div\s+([^>]*className=(?:\{[^}]*\}|"[^"]*")[^>]*)>/g;
  content = content.replace(divRegex, (match, p1) => {
    if (match.includes('data-aos=')) return match;
    const classMatch = match.match(/className=(?:\{([^}]+)\}|"([^"]+)")/);
    if (classMatch) {
      const cls = classMatch[1] || classMatch[2] || '';
      if (cls.toLowerCase().includes('card') || cls.toLowerCase().includes('btn') || cls.toLowerCase().includes('section')) {
         return `<div data-aos="fade-up" ${p1}>`;
      }
    }
    return match;
  });

  tags.forEach(t => {
    // Only replace if it doesn't already have data-aos close by. 
    // This simple split/join doesn't check if data-aos is in the same tag, but it's safe enough since we only target specific tag starts
    // Wait, what if we just use a regex that matches `<tag ` and asserts it's not followed by data-aos before the end of the tag?
    // Actually, splitting by the start string is easy, but what if data-aos is already there?
    // Let's use a simple regex for the tag name:
  });
  
  // Safe Regex for tags
  ['section', 'button', 'Link', 'a'].forEach(tag => {
     // Match <tag followed by space or >, but don't capture the rest.
     // Just check if the full tag contains data-aos
     const regex = new RegExp(`<${tag}(?:\\s+[^>]*|)>`, 'g');
     content = content.replace(regex, (match) => {
        if (match.includes('data-aos=')) return match;
        // Insert data-aos="fade-up" after the tag name
        if (match === `<${tag}>`) return `<${tag} data-aos="fade-up">`;
        return match.replace(`<${tag} `, `<${tag} data-aos="fade-up" `);
     });
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${page}`);
  }
});
