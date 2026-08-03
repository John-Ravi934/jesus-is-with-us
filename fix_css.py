import re

with open('src/pages/Donate.module.css', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Strip out the corrupted UTF-16 strings if they exist
idx = content.find('. p r e m i u m C a r d')
if idx != -1:
    content = content[:idx]

clean_css = """
.premiumCard {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
  padding: 3rem 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}
.premiumCard::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 4px;
  background: linear-gradient(90deg, #e33b70, #ff8c42);
}
.qrContainer {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 2rem;
  padding: 10px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.qrContainer::after {
  content: '';
  position: absolute;
  top: -2px; left: -2px; right: -2px; bottom: -2px;
  background: linear-gradient(45deg, #e33b70, transparent, #ff8c42);
  z-index: -1;
  border-radius: 22px;
  animation: rotateGradient 4s linear infinite;
}
@keyframes rotateGradient {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.pillBadge {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e2e8f0;
  padding: 1rem 1.5rem;
  border-radius: 50px;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(255,255,255,0.8);
}
.pillBadgeLabel {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.pillBadgeValue {
  color: #0f172a;
  font-size: 1.1rem;
  font-weight: 800;
}
.bankCard {
  background: linear-gradient(135deg, #1e293b, #0f172a);
  border-radius: 20px;
  padding: 2rem;
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}
.bankCard::before {
  content: '';
  position: absolute;
  top: -50%; left: -50%; width: 200%; height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 60%);
  transform: rotate(30deg);
  pointer-events: none;
}
.bankRow {
  display: flex;
  justify-content: space-between;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.bankRow:last-child {
  border-bottom: none;
}
.bankLabel {
  color: #94a3b8;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.bankValue {
  color: #f8fafc;
  font-weight: 600;
  font-size: 1rem;
  text-align: right;
}
"""

with open('src/pages/Donate.module.css', 'w', encoding='utf-8') as f:
    f.write(content + clean_css)
