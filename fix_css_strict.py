import re

with open('src/pages/Donate.module.css', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# I will find the `@media (max-width: 768px)` block and the start of the valid `.premiumCard {`
# and delete everything in between.
start_str = """@media (max-width: 768px) {
  .impactGrid {
    grid-template-columns: 1fr;
  }
  .amountGrid {
    grid-template-columns: repeat(2, 1fr);
  }
  .donationFormWrapper {
    padding: 2rem;
  }
}"""

end_str = ".premiumCard {"

start_idx = content.find(start_str)
end_idx = content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx + len(start_str)] + "\n\n" + content[end_idx:]
    with open('src/pages/Donate.module.css', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Fixed CSS file")
else:
    print("Could not find start or end strings")
