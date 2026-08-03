const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to match <tag ...> but not closing tags, and ensuring we don't duplicate data-aos
  // and we don't mess up tags that are self-closing or have other attributes
  
  const tagsToAnimate = ['h1', 'h2', 'h3', 'h4', 'p', 'img'];
  
  tagsToAnimate.forEach(tag => {
    // Matches <tag> or <tag className="..."> but not <tag data-aos...>
    const regex = new RegExp((<(?![^>]*data-aos)[^>]*)>, 'g');
    content = content.replace(regex, $1 data-aos="fade-up">);
  });

  // Specifically animate elements with 'card' in their className
  // This is a bit riskier with regex but usually works for standard JSX
  const cardRegex = /(<div[^>]*className=\{[^}]*Card[^}]*\}(?![^>]*data-aos)[^>]*)>/g;
  content = content.replace(cardRegex, $1 data-aos="fade-up">);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(Updated );
});