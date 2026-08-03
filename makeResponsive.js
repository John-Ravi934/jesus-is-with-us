const fs = require('fs');
const path = require('path');

const cssUpdates = {
  'Home.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .heroTitle { font-size: 2.2rem; }
  .actionGroup { flex-direction: column; width: 100%; gap: 1rem; }
  .actionGroup button, .actionGroup a { width: 100%; text-align: center; justify-content: center; }
  .aboutBlock, .reverseBlock, .splitGrid, .upcomingGrid { grid-template-columns: 1fr; gap: 2rem; }
  .aboutText h2, .servicesContent h2 { font-size: 2rem; }
  .locationCard { flex-direction: column; gap: 1rem; padding: 1rem; }
  .miniVideoSlider { flex-wrap: wrap; justify-content: center; }
  .serviceSchedule { padding: 1.5rem; }
  .posterSection, .upcomingList { padding: 1.5rem; }
  .stackedCards { width: 100%; height: 280px; margin: 2rem auto; }
  .stackedCards img { height: 200px; }
  .stackItem2 { left: 10px; top: 15px; }
  .stackItem3 { left: 20px; top: 30px; }
  .scatterImg { display: none; }
}
,
  'AboutUs.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .aboutBlock, .reverseBlock, .missionVisionGrid { grid-template-columns: 1fr; gap: 2rem; }
  .aboutText h2 { font-size: 2rem; }
  .timeline { padding: 2rem 5%; }
  .timelineContent h3 { font-size: 1.8rem; }
  .statsRow { flex-direction: column; gap: 1.5rem; }
  .statBox { width: 100%; padding: 1.5rem; }
  .ctaSection { padding: 4rem 5%; }
  .ctaContent h2 { font-size: 1.8rem; }
}
,
  'Ministries.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .introBlock { padding: 3rem 5%; }
  .introBlock h2 { font-size: 2rem; }
  .ministriesGrid { grid-template-columns: 1fr; padding: 2rem 5%; gap: 2rem; }
  .ministryCard { margin-bottom: 1rem; }
  .impactSection { padding: 3rem 5%; }
  .impactGrid { grid-template-columns: 1fr; gap: 2rem; }
  .impactLeft h2 { font-size: 2rem; }
  .statsGrid { grid-template-columns: 1fr; gap: 1rem; }
  .statCard { padding: 1.5rem; }
}
,
  'Fellowship.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .introBlock { padding: 3rem 5%; }
  .introBlock h2 { font-size: 2rem; }
  .groupsGrid { grid-template-columns: 1fr; padding: 2rem 5%; gap: 1.5rem; }
  .groupCard { padding: 1.5rem; }
  .joinSection { padding: 3rem 5%; }
  .joinGrid { grid-template-columns: 1fr; gap: 2rem; }
  .formCard, .whatsappCard { padding: 1.5rem; }
}
,
  'Donate.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .whyGiveSection { padding: 3rem 5%; }
  .whyGiveSection h2 { font-size: 2rem; }
  .impactGrid { grid-template-columns: 1fr; gap: 1.5rem; }
  .impactCard { padding: 1.5rem; }
  .methodsSection { padding: 2rem 5%; }
  .methodsGrid { grid-template-columns: 1fr; gap: 2rem; }
  .upiCard, .bankCard { padding: 1.5rem; }
  .bankGrid { grid-template-columns: 1fr; gap: 1.5rem; }
  .upiAppIcons { flex-wrap: wrap; justify-content: center; }
}
,
  'Contact.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .contactSection { padding: 3rem 5%; }
  .contactGrid { grid-template-columns: 1fr; gap: 2rem; }
  .infoCard, .formCard { padding: 1.5rem; }
  .mapContainer { height: 300px; }
}
,
  'Resources.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .hero h1 { font-size: 2.2rem; }
  .resourcesSection { padding: 2rem 5%; }
  .tabsContainer { flex-wrap: wrap; justify-content: center; gap: 0.5rem; }
  .tabBtn { width: 100%; padding: 0.8rem; }
  .booksGrid, .mediaGrid { grid-template-columns: 1fr; gap: 1.5rem; }
  .bookCard, .mediaCard { padding: 1.5rem; }
}
,
  'RhemaWords.module.css': 
/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .hero { padding: 6rem 5% 3rem 5%; }
  .heroTitle { font-size: 2.2rem; }
  .container { padding: 2rem 5%; }
  .devotionGrid { grid-template-columns: 1fr; gap: 1.5rem; }
  .verseCard, .articleCard { padding: 1.5rem; }
  .devotionHeader { flex-direction: column; align-items: flex-start; gap: 1rem; }
}

};

Object.keys(cssUpdates).forEach(fileName => {
  const filePath = path.join(__dirname, 'src', 'pages', fileName);
  if (fs.existsSync(filePath)) {
    fs.appendFileSync(filePath, cssUpdates[fileName], 'utf8');
    console.log('Updated ' + fileName);
  }
});