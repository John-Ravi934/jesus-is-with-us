import { useState, useEffect } from 'react';
import { 
  Share2, Heart, Bookmark, Search, 
  Calendar as CalendarIcon, Download,
  CheckCircle, Link2, Maximize2, X, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';
import styles from './RhemaWords.module.css';
import { getRhemaWords, incrementViews, incrementDownloads } from '../services/rhemaService';
import { getCategories } from '../services/categoryService';

const popularTags = ["Faith", "Healing", "Grace", "Peace", "Love"];

export default function RhemaWords() {
  const [rhemaDatabase, setRhemaDatabase] = useState([]);
  const [dbCategories, setDbCategories] = useState(["All"]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('today'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  
  const [favorites, setFavorites] = useState([]); 
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    // Fetch live data from Supabase
    Promise.all([
      getRhemaWords({ status: 'published' }),
      getCategories()
    ]).then(([rhemaData, catData]) => {
      setRhemaDatabase(rhemaData);
      setDbCategories(["All", ...catData.map(c => c.name)]);
      
      // Find the featured word index
      const featuredIdx = rhemaData.findIndex(d => d.featured === true);
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

  const toggleFavorite = (id) => {
    let newFavs;
    if(favorites.includes(id)) {
      newFavs = favorites.filter(fav => fav !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('rhema_favs', JSON.stringify(newFavs));
  };

  const handlePrev = () => {
    if (featuredIndex < rhemaDatabase.length - 1) {
      setFeaturedIndex(featuredIndex + 1); 
    }
  };

  const handleNext = () => {
    if (featuredIndex > 0) {
      setFeaturedIndex(featuredIndex - 1);
    }
  };

  const openLightbox = async () => {
    setLightboxOpen(true);
    // Increment view count in Supabase silently
    if (featuredWord) {
      await incrementViews(featuredWord.id).catch(console.error);
    }
  };

  const handleDownload = async (word) => {
    if (!word) return;
    try {
      // Trigger a download
      const response = await fetch(word.poster_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rhema-${word.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Increment download count in Supabase
      await incrementDownloads(word.id).catch(console.error);
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const filteredArchive = rhemaDatabase.filter(word => {
    const searchString = searchQuery.toLowerCase();
    const matchesSearch = 
      word.bible_verse.toLowerCase().includes(searchString) || 
      word.bible_reference.toLowerCase().includes(searchString) ||
      (word.title && word.title.toLowerCase().includes(searchString));
      
    const matchesCat = selectedCategory === 'All' || word.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className={`${styles.rhemaApp} ${darkMode ? styles.darkTheme : ''}`}>
      
      {/* Lightbox Modal */}
      {lightboxOpen && featuredWord && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>
            <X size={32} />
          </button>
          <img src={featuredWord.poster_url} alt="Fullscreen Rhema" className={styles.lightboxImg} onClick={(e) => e.stopPropagation()} />
          <div className={styles.lightboxActions} onClick={(e) => e.stopPropagation()}>
            <button className={styles.posterBtn} title="Download" onClick={() => handleDownload(featuredWord)}><Download size={24}/></button>
            <button className={styles.posterBtn} title="Share" onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={24}/></button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className={styles.rhemaHero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.brandBadge}>Jesus Is With Us Ministries</div>
          <h1 className="animate-fade-up">365 Rhema Words</h1>
          <p className={`${styles.tagline} animate-fade-up delay-100`}>"Receive God's Word Every Day"</p>
          
          <div className={`${styles.heroSearch} animate-fade-up delay-200`}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by Bible Book, Verse, Topic, or Date..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if(e.target.value) setActiveTab('archive');
              }}
            />
          </div>

          <div className={`${styles.popularTags} animate-fade-up delay-300`}>
            <span className={styles.tagLabel}>Popular:</span>
            {popularTags.map(tag => (
              <button key={tag} className={styles.tagPill} onClick={() => { setSelectedCategory(tag); setActiveTab('archive'); }}>{tag}</button>
            ))}
          </div>

          <div className={`${styles.heroTabs} animate-fade-up delay-300`}>
            <button className={`${styles.tabBtn} ${activeTab === 'today' ? styles.activeTab : ''}`} onClick={() => setActiveTab('today')}>Today's Word</button>
            <button className={`${styles.tabBtn} ${activeTab === 'archive' ? styles.activeTab : ''}`} onClick={() => setActiveTab('archive')}>Archive</button>
            <button className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.activeTab : ''}`} onClick={() => setActiveTab('timeline')}>Timeline</button>
            <button className={`${styles.tabBtn} ${activeTab === 'calendar' ? styles.activeTab : ''}`} onClick={() => setActiveTab('calendar')}>Calendar</button>
            <button className={`${styles.tabBtn} ${activeTab === 'favorites' ? styles.activeTab : ''}`} onClick={() => setActiveTab('favorites')}><Heart size={16}/> Favorites</button>
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
            <div className={styles.showcaseCard}>
              
              <div className={styles.showcaseImageWrapper} onClick={openLightbox}>
                <img src={featuredWord.poster_url} alt="Today's Rhema Poster" className={styles.showcaseImg} />
                <div className={styles.zoomHint}>
                  <Maximize2 size={24} />
                  <span>Click to Expand</span>
                </div>
              </div>

              <div className={styles.showcaseBody}>
                <div className={styles.showcaseMeta}>
                  <div className={styles.metaLeft}>
                    <span className={styles.metaBadge}><CalendarIcon size={14}/> {new Date(featuredWord.date).toLocaleDateString()}</span>
                    <span className={styles.metaBadge}>{featuredWord.category}</span>
                    <span className={styles.metaBadge}>{featuredWord.language}</span>
                  </div>
                  <div className={styles.metaRight}>
                    <span className={styles.metaStat}><Eye size={16}/> {featuredWord.views}</span>
                    <span className={styles.metaStat}><Download size={16}/> {featuredWord.downloads}</span>
                  </div>
                </div>

                <div className={styles.showcaseActions}>
                  <button className={styles.actionPill} onClick={() => handleDownload(featuredWord)}><Download size={18}/> Download</button>
                  <button className={styles.actionPill} onClick={() => navigator.clipboard.writeText(window.location.href)}><Share2 size={18}/> Share</button>
                  {featuredWord.youtube_url && (
                    <a href={featuredWord.youtube_url} target="_blank" rel="noreferrer" className={styles.actionPill} style={{textDecoration: 'none'}}>
                      <FaYoutube size={18}/> Community
                    </a>
                  )}
                  <button 
                    className={`${styles.actionIcon} ${favorites.includes(featuredWord.id) ? styles.favorited : ''}`} 
                    onClick={() => toggleFavorite(featuredWord.id)}
                    title="Bookmark"
                  >
                    <Bookmark size={20} fill={favorites.includes(featuredWord.id) ? "currentColor" : "none"}/>
                  </button>
                  <button className={styles.actionIcon} title="Mark as Read"><CheckCircle size={20}/></button>
                </div>

                <div className={styles.galleryNav}>
                  <button className={styles.navBtn} onClick={handlePrev} disabled={featuredIndex === rhemaDatabase.length - 1}>
                    <ChevronLeft size={20} /> Previous
                  </button>
                  <button className={styles.navBtnPrimary} onClick={() => {
                    const idx = rhemaDatabase.findIndex(d => d.featured);
                    setFeaturedIndex(idx !== -1 ? idx : 0);
                  }}>
                    Today's Rhema
                  </button>
                  <button className={styles.navBtn} onClick={handleNext} disabled={featuredIndex === 0}>
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Related Row */}
            <div className={styles.relatedRowContainer}>
              <h3 className={styles.relatedRowTitle}>Previous Rhema Words</h3>
              <div className={styles.relatedRow}>
                {rhemaDatabase.filter((_, idx) => idx !== featuredIndex).map((word) => {
                  const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                  return (
                    <div key={word.id} className={styles.relatedCard} onClick={() => setFeaturedIndex(originalIndex)}>
                      <img src={word.poster_url} alt="Thumbnail" className={styles.relatedThumb} />
                      <div className={styles.relatedCardInfo}>
                        <span>{new Date(word.date).toLocaleDateString()}</span>
                        <h4>{word.bible_reference}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ARCHIVE VIEW */}
        {!loading && activeTab === 'archive' && (
          <div className={styles.archiveSection}>
            <div className={styles.filterPills}>
              {dbCategories.map(cat => (
                <button 
                  key={cat} 
                  className={`${styles.filterPill} ${selectedCategory === cat ? styles.activeFilter : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.resultsCount}>
              Showing {filteredArchive.length} results
            </div>

            <div className={styles.archiveGrid}>
              {filteredArchive.map((word) => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.archiveCard} onClick={() => { setFeaturedIndex(originalIndex); setActiveTab('today'); }}>
                    <div className={styles.archivePoster}>
                      <img src={word.poster_url} alt={word.bible_reference} />
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
                    <div className={styles.timelineContent} onClick={() => { setFeaturedIndex(originalIndex); setActiveTab('today'); }}>
                      <div className={styles.timelineThumb}>
                        <img src={word.poster_url} alt="thumb" />
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
          <div className={styles.calendarSection}>
            <div className={styles.calendarHeader}>
              <h2>July 2026</h2>
            </div>
            <div className={styles.calendarGrid}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={styles.calDayHeader}>{day}</div>
              ))}
              <div className={styles.calDayEmpty}></div>
              <div className={styles.calDayEmpty}></div>
              <div className={styles.calDayEmpty}></div>
              
              {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                const isToday = day === 22;
                const hasWord = day <= 22;
                return (
                  <div key={day} className={`${styles.calDay} ${isToday ? styles.calToday : ''} ${hasWord ? styles.calActive : ''}`}>
                    <span className={styles.dayNum}>{day}</span>
                    {hasWord && <span className={styles.wordDot}></span>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* FAVORITES VIEW */}
        {!loading && activeTab === 'favorites' && (
          <div className={styles.archiveSection}>
            <h2 className={styles.timelineTitle}>Your Favorite Collections</h2>
            <div className={styles.archiveGrid}>
              {rhemaDatabase.filter(w => favorites.includes(w.id)).map(word => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.archiveCard} onClick={() => { setFeaturedIndex(originalIndex); setActiveTab('today'); }}>
                    <div className={styles.archivePoster}>
                      <img src={word.poster_url} alt={word.bible_reference} />
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
              {favorites.length === 0 && <p style={{color: '#64748B', width: '100%'}}>No favorites yet. Click the heart icon to save.</p>}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
