import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Share2, Heart, Bookmark, Search, 
  Calendar as CalendarIcon, Download,
  CheckCircle, Link2, Maximize2, X, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import styles from './RhemaWords.module.css';
import { getRhemaWords, incrementViews, incrementDownloads } from '../services/rhemaService';
import { getCategories } from '../services/categoryService';
import TodayRhemaView from '../components/rhema/TodayRhemaView';
import CategoryScroll from '../components/rhema/CategoryScroll';
import DynamicCalendar from '../components/rhema/DynamicCalendar';

const popularTags = ["Faith", "Healing", "Grace", "Peace", "Love"];

export default function RhemaWords() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [rhemaDatabase, setRhemaDatabase] = useState([]);
  const [dbCategories, setDbCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('today'); 
  const contentRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }; 
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]); 
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Initialize from URL params or defaults
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    // Sync to URL whenever state changes
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, setSearchParams]);

  useEffect(() => {
    // Fetch live data from Supabase
    Promise.all([
      getRhemaWords({ status: 'published' }),
      getCategories()
    ]).then(([rhemaData, catData]) => {
      setRhemaDatabase(rhemaData);
      setDbCategories(["All", ...catData.map(c => c.name)]);
      
      // Handle ?date= param if provided
      const paramDate = searchParams.get('date');
      let featuredIdx = -1;
      
      if (paramDate) {
        featuredIdx = rhemaData.findIndex(d => d.date === paramDate);
      }
      
      if (featuredIdx === -1) {
        featuredIdx = rhemaData.findIndex(d => d.featured === true);
      }
      
      if (featuredIdx !== -1) {
        setFeaturedIndex(featuredIdx);
      }
      setLoading(false);
    }).catch(console.error);

    // Load favorites from local storage
    const savedFavs = localStorage.getItem('rhema_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  const featuredWord = rhemaDatabase[featuredIndex] || null;

  // Memoize filtered archive to prevent unnecessary recalculations
  const filteredArchive = useMemo(() => {
    return rhemaDatabase.filter(word => {
      const searchString = searchQuery.toLowerCase();
      const matchesSearch = 
        word.bible_verse?.toLowerCase().includes(searchString) || 
        word.bible_reference?.toLowerCase().includes(searchString) ||
        word.title?.toLowerCase().includes(searchString);
        
      const matchesCat = selectedCategory === 'All' || word.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [rhemaDatabase, searchQuery, selectedCategory]);

  const handleSelectDateFromCalendar = (word) => {
    const idx = rhemaDatabase.findIndex(w => w.id === word.id);
    if (idx !== -1) {
      setFeaturedIndex(idx);
      setActiveTab('today');
    }
  };

  return (
    <div className={`${styles.rhemaApp} ${darkMode ? styles.darkTheme : ''}`}>
      
      {/* Hero Section */}
      <section className={styles.rhemaHero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <h1 className="animate-fade-up">Daily Rhema Words</h1>
          <p className={`${styles.tagline} animate-fade-up delay-100`}>"Receive God's Word Every Day"</p>
          
          <div className={`${styles.heroSearch} animate-fade-up delay-200`}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Bible Book, Verse, Topic, or Date..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if(e.target.value && activeTab !== 'archive') {
                  handleTabChange('archive');
                }
              }}
            />
          </div>

          <div className={`${styles.heroTabs} animate-fade-up delay-300`}>
            <button className={`${styles.tabBtn} ${activeTab === 'today' ? styles.activeTab : ''}`} onClick={() => handleTabChange('today')}>Today's Word</button>
            <button className={`${styles.tabBtn} ${activeTab === 'archive' ? styles.activeTab : ''}`} onClick={() => handleTabChange('archive')}>Archive</button>
            <button className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.activeTab : ''}`} onClick={() => handleTabChange('timeline')}>Timeline</button>
            <button className={`${styles.tabBtn} ${activeTab === 'calendar' ? styles.activeTab : ''}`} onClick={() => handleTabChange('calendar')}>Calendar</button>
            <button className={`${styles.tabBtn} ${activeTab === 'favorites' ? styles.activeTab : ''}`} onClick={() => handleTabChange('favorites')}><Heart size={16}/> Favorites</button>
          </div>
        </div>
      </section>

      {/* Statistics Strip */}
      <div className={styles.statsStrip}>
        <div className="container">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <h3>{loading ? '...' : rhemaDatabase.length}+</h3>
              <p>Rhema Words</p>
            </div>
            <div className={styles.statItem}>
              <h3>2</h3>
              <p>Languages</p>
            </div>
            <div className={styles.statItem}>
              <h3>45K+</h3>
              <p>Lives Touched</p>
            </div>
            <div className={styles.themeToggle}>
              <button onClick={() => setDarkMode(!darkMode)} className={styles.toggleBtn}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`container ${styles.mainAppArea}`}>
        
        {/* GLOBAL CATEGORY SCROLLER */}
        {!loading && activeTab === 'archive' && (
          <CategoryScroll 
            categories={dbCategories}
            selectedCategory={selectedCategory}
            onSelect={(cat) => setSelectedCategory(cat)}
          />
        )}
        
        <div ref={contentRef} key={activeTab} className={styles.tabTransition}>
        
        {loading && <div style={{textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#64748B'}}>Loading Rhema Archive from Database...</div>}

        {!loading && rhemaDatabase.length === 0 && (
          <div style={{textAlign: 'center', padding: '4rem', color: '#64748B'}}>
            <h3>No Rhema Words Published Yet</h3>
            <p>Please log in to the admin dashboard and publish a Rhema word.</p>
          </div>
        )}

        {/* TODAY'S POSTER GALLERY VIEW */}
        {!loading && activeTab === 'today' && featuredWord && (
          <div className={styles.gallerySection}>
            <TodayRhemaView 
              rhemaDatabase={filteredArchive} // Pass filtered to keep previous/next within the filter!
              featuredIndex={filteredArchive.findIndex(w => w.id === featuredWord.id) >= 0 ? filteredArchive.findIndex(w => w.id === featuredWord.id) : 0}
              setFeaturedIndex={(filteredIdx) => {
                // We need to map the filtered index back to the global index
                const globalIdx = rhemaDatabase.findIndex(w => w.id === filteredArchive[filteredIdx]?.id);
                if (globalIdx !== -1) setFeaturedIndex(globalIdx);
              }}
            />
            {/* If the current featuredWord doesn't match the filter, show a message */}
            {filteredArchive.findIndex(w => w.id === featuredWord.id) === -1 && (
              <div style={{textAlign: 'center', margin: '2rem 0', color: '#64748b'}}>
                The selected category doesn't contain the currently featured word. Switching to the first match.
                {setTimeout(() => {
                  if (filteredArchive.length > 0) {
                     const globalIdx = rhemaDatabase.findIndex(w => w.id === filteredArchive[0].id);
                     setFeaturedIndex(globalIdx);
                  }
                }, 100) ? "" : ""}
              </div>
            )}
          </div>
        )}

        {/* ARCHIVE VIEW */}
        {!loading && activeTab === 'archive' && (
          <div className={styles.archiveSection}>
            <div className={styles.resultsCount}>
              Showing {filteredArchive.length} results
            </div>

            <div className={styles.archiveGrid}>
              {filteredArchive.map((word) => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.archiveCard} onClick={() => { setFeaturedIndex(originalIndex); handleTabChange('today'); }}>
                    <div className={styles.archivePoster}>
                      <img src={word.poster_url} alt={word.bible_reference} loading="lazy" />
                      <div className={styles.archiveBadges}>
                        <span className={styles.badgeSmall}>{word.category}</span>
                      </div>
                    </div>
                    <div className={styles.archiveBody}>
                      <div className={styles.archiveMeta}>
                        <span className={styles.archiveDate}>{new Date(word.date).toLocaleDateString()}</span>
                        {favorites.includes(word.id) && <Heart size={14} fill="#C8A646" color="#C8A646" />}
                      </div>
                      <h4>{word.bible_reference}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {!loading && activeTab === 'timeline' && (
          <div className={styles.timelineSection}>
            <h2 className={styles.timelineTitle}>Devotional History</h2>
            <div className={styles.timelineContainer}>
              {filteredArchive.map((word) => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineDate}>{new Date(word.date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                    <div className={styles.timelineContent} onClick={() => { setFeaturedIndex(originalIndex); handleTabChange('today'); }}>
                      <div className={styles.timelineThumb}>
                        <img src={word.poster_url} alt="thumb" loading="lazy" />
                      </div>
                      <div className={styles.timelineText}>
                        <h4>{word.bible_reference}</h4>
                        <p>"{word.bible_verse.substring(0, 60)}..."</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CALENDAR VIEW */}
        {!loading && activeTab === 'calendar' && (
          <DynamicCalendar 
            filteredArchive={filteredArchive} 
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}

        {/* FAVORITES VIEW */}
        {!loading && activeTab === 'favorites' && (
          <div className={styles.archiveSection}>
            <h2 className={styles.timelineTitle}>Your Favorite Collections</h2>
            <div className={styles.archiveGrid}>
              {filteredArchive.filter(w => favorites.includes(w.id)).map(word => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.archiveCard} onClick={() => { setFeaturedIndex(originalIndex); handleTabChange('today'); }}>
                    <div className={styles.archivePoster}>
                      <img src={word.poster_url} alt={word.bible_reference} loading="lazy" />
                    </div>
                    <div className={styles.archiveBody}>
                      <div className={styles.archiveMeta}>
                        <span className={styles.archiveDate}>{new Date(word.date).toLocaleDateString()}</span>
                        <Heart size={14} fill="#C8A646" color="#C8A646" />
                      </div>
                      <h4>{word.bible_reference}</h4>
                    </div>
                  </div>
                );
              })}
              {filteredArchive.filter(w => favorites.includes(w.id)).length === 0 && <p style={{color: '#64748B', width: '100%', textAlign: 'center'}}>No favorites found matching your filters.</p>}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
