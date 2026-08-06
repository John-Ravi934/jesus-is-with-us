const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const layoutsDir = path.join(__dirname, 'src', 'layouts');
const componentsDir = path.join(__dirname, 'src', 'components');

const targetDirs = [pagesDir, layoutsDir, componentsDir];
const targetFiles = [];

targetDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    files.forEach(file => {
      if (file.isFile() && (file.name.endsWith('.jsx') || file.name.endsWith('.js'))) {
        targetFiles.push(path.join(dir, file.name));
      } else if (file.isDirectory()) {
         // Read subdirectories like admin
         const subDir = path.join(dir, file.name);
         const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
         subFiles.forEach(subFile => {
           if (subFile.isFile() && (subFile.name.endsWith('.jsx') || subFile.name.endsWith('.js'))) {
             targetFiles.push(path.join(subDir, subFile.name));
           }
         });
      }
    });
  }
});

let updatedCount = 0;

targetFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add data-aos="fade-up" to relevant tags if they don't already have it
  // Using a replacer function to avoid matching closing tags or tags that already have data-aos
  const tagsToAnimate = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'img', 'section', 'button', 'a', 'Link'];
  
  tagsToAnimate.forEach(tag => {
    // Regex explanation:
    // <tag\b      : Match the opening tag name with word boundary
    // [^>]*      : Match any attributes before data-aos (if any)
    // (?<!data-aos="[^"]*") : Make sure we haven't already seen data-aos
    // Wait, regex lookbehinds might be tricky with variable length.
    // Simpler regex: Match opening tag, check in the replacer function if it contains data-aos.
    
    const tagRegex = new RegExp(`<${tag}\\b([^>]*)>`, 'g');
    content = content.replace(tagRegex, (match, p1) => {
      // If it's a self-closing tag or already has data-aos, skip
      if (p1.includes('data-aos=')) {
        return match;
      }
      
      // If it ends with /> (self-closing), insert before />
      if (p1.endsWith('/')) {
        const attrs = p1.slice(0, -1);
        return `<${tag}${attrs} data-aos="fade-up" />`;
      } else {
        return `<${tag}${p1} data-aos="fade-up">`;
      }
    });
  });

  // Specifically animate elements with 'card', 'btn', 'section' in their className
  // To avoid matching everything, we look for className={...} or className="..." containing specific words
  const classRegex = /<div\b([^>]*)className=(?:\{[^}]*\}|"[^"]*")([^>]*)>/g;
  content = content.replace(classRegex, (match, p1, p2) => {
     if (match.includes('data-aos=')) {
        return match;
     }
     
     // Check if class name contains card, btn, wrapper, container, grid etc but we don't want to animate EVERY div.
     // Let's stick to card and btn
     const classMatch = match.match(/className=(?:\{([^}]+)\}|"([^"]+)")/);
     if (classMatch) {
        const classStr = classMatch[1] || classMatch[2] || '';
        if (classStr.toLowerCase().includes('card') || classStr.toLowerCase().includes('btn') || classStr.toLowerCase().includes('grid') || classStr.toLowerCase().includes('wrapper')) {
            if (match.endsWith('/>')) {
               return match.replace(/\/>$/, ' data-aos="fade-up" />');
            } else {
               return match.replace(/>$/, ' data-aos="fade-up">');
            }
        }
     }
     return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
    console.log(`Updated ${filePath}`);
  }
});

console.log(`Successfully updated ${updatedCount} files.`);
