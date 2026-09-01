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
import CategoryIcon from '../components/categories/CategoryIcon';
import { useLanguage } from '../contexts/LanguageContext';

const renderReference = (word, language) => {
  return word[`bible_reference_${language}`] || word.bible_reference_en || word.bible_reference || 'Reference';
};

const popularTags = ["Faith", "Healing", "Grace", "Peace", "Love"];

const isValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http');
const getThumb = (word) => isValidUrl(word.tamil_poster_url) ? word.tamil_poster_url : (isValidUrl(word.poster_url) ? word.poster_url : '');

export default function RhemaWords() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [rhemaDatabase, setRhemaDatabase] = useState([]);
  const [dbCategories, setDbCategories] = useState([{ value: 'All', label: 'All' }]);
  const [dbCategoriesData, setDbCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'today'); 
  const contentRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }; 
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]); 
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const navigateToToday = (index) => {
    setFeaturedIndex(index);
    handleTabChange('today');
    const tryScroll = (attempts = 0) => {
      const el = document.getElementById('today-rhema-view-container');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else if (attempts < 10) {
        requestAnimationFrame(() => tryScroll(attempts + 1));
      }
    };
    requestAnimationFrame(() => tryScroll(0));
  };

  // Initialize from URL params or defaults
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    // Sync to URL whenever state changes
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('search', searchQuery);
    else params.delete('search');
    
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    else params.delete('category');
    
    params.set('tab', activeTab);
    
    setSearchParams(params, { replace: true });
  }, [searchQuery, selectedCategory, activeTab, setSearchParams]);

  useEffect(() => {
    // Fetch live data from Supabase
    Promise.all([
      getRhemaWords({ status: 'published' }),
      getCategories()
    ]).then(([rhemaData, catData]) => {
      setRhemaDatabase(rhemaData);
      setDbCategoriesData(catData);
      setDbCategories([
        { value: 'All', label: language === 'ta' ? 'அனைத்தும்' : 'All', icon: 'LuLayoutGrid', color: '#64748b' },
        ...catData.map(c => ({
          value: c.name_en || c.name,
          label: language === 'ta' && c.name_ta ? c.name_ta : (c.name_en || c.name),
          icon: c.icon || 'LuTag',
          color: c.color || '#64748b'
        }))
      ]);
      
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

    const loadFavorites = () => {
      const savedFavs = localStorage.getItem('rhema_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    };
    
    loadFavorites();
    window.addEventListener('favoritesChanged', loadFavorites);
    
    const handleStatsUpdate = (e) => {
      const { id, type } = e.detail;
      setRhemaDatabase(prev => prev.map(word => {
        if (word.id === id) {
          return {
            ...word,
            views: type === 'view' ? (word.views || 0) + 1 : (word.views || 0),
            downloads: type === 'download' ? (word.downloads || 0) + 1 : (word.downloads || 0)
          };
        }
        return word;
      }));
    };
    
    window.addEventListener('statsUpdated', handleStatsUpdate);
    
    return () => {
      window.removeEventListener('favoritesChanged', loadFavorites);
      window.removeEventListener('statsUpdated', handleStatsUpdate);
    };
  }, [language]);

  const getTranslatedCategory = (catStr) => {
    if (!catStr) return catStr;
    const catObj = dbCategoriesData.find(c => c.name === catStr || c.name_en === catStr);
    if (language === 'ta' && catObj && catObj.name_ta) {
      return catObj.name_ta;
    }
    return catObj ? (catObj.name_en || catObj.name) : catStr;
  };

  const featuredWord = rhemaDatabase[featuredIndex] || null;

  // Memoize filtered archive to prevent unnecessary recalculations
  const filteredArchive = useMemo(() => {
    return rhemaDatabase.filter(word => {
      // Only apply filters (search and category) when on the Archive tab
      if (activeTab !== 'archive') {
        return true;
      }

      const searchString = searchQuery.toLowerCase();
      
      // Format date like '06/08/2026' or '6/8/2026' or 'Aug 6, 2026' for search matching
      const dateObj = new Date(word.date);
      const dateStr1 = dateObj.toLocaleDateString(); // e.g. 8/6/2026
      const dateStr2 = dateObj.toLocaleDateString('en-GB'); // e.g. 06/08/2026
      const dateStr3 = dateObj.toLocaleDateString('en-GB', {month: 'long', day: 'numeric', year: 'numeric'});

        const translatedCat = getTranslatedCategory(word.category);

        const matchesSearch = 
          word.bible_verse_ta?.toLowerCase().includes(searchString) || 
          word.bible_verse?.toLowerCase().includes(searchString) || 
          word.bible_reference_en?.toLowerCase().includes(searchString) ||
          word.bible_reference_ta?.toLowerCase().includes(searchString) ||
          word.bible_reference?.toLowerCase().includes(searchString) ||

          word.category?.toLowerCase().includes(searchString) ||
          (translatedCat && translatedCat.toLowerCase().includes(searchString)) ||
          dateStr1.includes(searchString) ||
          dateStr2.includes(searchString) ||
          dateStr3.toLowerCase().includes(searchString);
        
      const matchesCat = selectedCategory === 'All' || word.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [rhemaDatabase, searchQuery, selectedCategory, activeTab]);

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
      <section data-aos="fade-up" className={styles.rhemaHero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">{t('rhema_hero_label')}</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100" style={{ paddingTop: '20px' }}>{t('rhema_hero_title')}<span className="script-accent">{t('rhema_hero_title_2')}</span></h1>
          <p data-aos="fade-up" className={`${styles.tagline} animate-fade-up delay-100`}>{t('rhema_hero_tagline')}</p>
          
          <div className={`${styles.heroSearch} animate-fade-up delay-200`}>
            <Search size={20} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder={t('rhema_search_placeholder')} 
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
            <button className={`${styles.tabBtn} ${activeTab === 'today' ? styles.activeTab : ''}`} onClick={() => handleTabChange('today')}>{t('rhema_tab_today')}</button>
            <button className={`${styles.tabBtn} ${activeTab === 'archive' ? styles.activeTab : ''}`} onClick={() => handleTabChange('archive')}>{t('rhema_tab_archive')}</button>
            <button className={`${styles.tabBtn} ${activeTab === 'timeline' ? styles.activeTab : ''}`} onClick={() => handleTabChange('timeline')}>{t('rhema_tab_timeline')}</button>
            <button className={`${styles.tabBtn} ${activeTab === 'calendar' ? styles.activeTab : ''}`} onClick={() => handleTabChange('calendar')}>{t('rhema_tab_calendar')}</button>
            <button className={`${styles.tabBtn} ${activeTab === 'favorites' ? styles.activeTab : ''}`} onClick={() => handleTabChange('favorites')}><Heart size={16}/> {t('rhema_tab_favorites')}</button>
          </div>
        </div>
      </section>

      {/* Statistics Strip */}
      <div className={styles.statsStrip}>
        <div className="container" data-aos="fade-up">
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <h3 data-aos="fade-up">{loading ? '...' : rhemaDatabase.length}+</h3>
              <p data-aos="fade-up">{t('rhema_stat_words')}</p>
            </div>
            <div className={styles.statItem}>
              <h3 data-aos="fade-up">2</h3>
              <p data-aos="fade-up">{t('rhema_stat_lang')}</p>
            </div>
            <div className={styles.statItem}>
              <h3 data-aos="fade-up">{loading ? '...' : rhemaDatabase.reduce((acc, word) => acc + (word.views || 0) + (word.downloads || 0), 0).toLocaleString()}+</h3>
              <p data-aos="fade-up">{t('rhema_stat_lives')}</p>
            </div>
            <div className={styles.themeToggle}>
              <button data-aos="fade-up" onClick={() => setDarkMode(!darkMode)} className={styles.toggleBtn}>
                {darkMode ? t('rhema_btn_light') : t('rhema_btn_dark')}
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
        
        {loading && <div style={{textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#64748B'}}>{t('rhema_loading')}</div>}

        {!loading && rhemaDatabase.length === 0 && (
          <div style={{textAlign: 'center', padding: '4rem', color: '#64748B'}}>
            <h3 data-aos="fade-up">{t('rhema_empty_title')}</h3>
            <p data-aos="fade-up">{t('rhema_empty_desc')}</p>
          </div>
        )}

        {/* TODAY'S POSTER GALLERY VIEW */}
        {!loading && activeTab === 'today' && featuredWord && (
          <div data-aos="fade-up" className={styles.gallerySection}>
            <TodayRhemaView 
              rhemaDatabase={filteredArchive} // Pass filtered to keep previous/next within the filter!
              categories={dbCategoriesData}
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
          <div data-aos="fade-up" className={styles.archiveSection}>
            <div className={styles.resultsCount}>
              {t('rhema_showing_results')} {filteredArchive.length} {t('rhema_results')}
            </div>

            <div className={styles.archiveGrid}>
              {filteredArchive.map((word) => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div data-aos="fade-up" key={word.id} className={styles.archiveCard} onClick={() => navigateToToday(originalIndex)}>
                    <div className={styles.archivePoster}>
                      <img data-aos="fade-up" src={getThumb(word)} alt={word.bible_reference_en || word.bible_reference} loading="lazy" />
                      <div className={styles.archiveBadges}>
                        {(() => {
                          const cat = dbCategoriesData.find(c => c.name === word.category || c.name_en === word.category);
                          return (
                            <span className={styles.badgeSmall} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              {cat && cat.icon && (
                                <CategoryIcon icon={cat.icon} color="#fff" size={12} iconSize={10} transparentBg={true} />
                              )}
                              {getTranslatedCategory(word.category)}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    <div className={styles.archiveBody}>
                      <div className={styles.archiveMeta}>
                        <span className={styles.archiveDate}>{new Date(word.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB')}</span>
                        {favorites.includes(word.id) && <Heart size={14} fill="#C8A646" color="#C8A646" />}
                      </div>
                      <h4 data-aos="fade-up" style={{ fontWeight: 'normal' }}>{renderReference(word, language)}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {!loading && activeTab === 'timeline' && (
          <div data-aos="fade-up" className={styles.timelineSection}>
            <h2 data-aos="fade-up" className={styles.timelineTitle}>{t('rhema_timeline_title')}</h2>
            <div className={styles.timelineContainer}>
              {filteredArchive.map((word) => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div key={word.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot}></div>
                    <div className={styles.timelineDate}>{new Date(word.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB', {month: 'short', day: 'numeric', year: 'numeric'})}</div>
                    <div className={styles.timelineContent} onClick={() => navigateToToday(originalIndex)}>
                      <div className={styles.timelineThumb}>
                        <img data-aos="fade-up" src={getThumb(word)} alt="thumb" loading="lazy" />
                      </div>
                      <div className={styles.timelineText}>
                        <h4 data-aos="fade-up" style={{ fontWeight: 'normal' }}>{renderReference(word, language)}</h4>
                        <p data-aos="fade-up">"{(word[`bible_verse_${language}`] || word.bible_verse_ta || word.bible_verse_en || word.bible_verse || '').substring(0, 60)}..."</p>
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
          <div data-aos="fade-up" className={styles.archiveSection}>
            <h2 data-aos="fade-up" className={styles.timelineTitle}>{t('rhema_favorites_title')}</h2>
            <div className={styles.archiveGrid}>
              {filteredArchive.filter(w => favorites.includes(w.id)).map(word => {
                const originalIndex = rhemaDatabase.findIndex(w => w.id === word.id);
                return (
                  <div data-aos="fade-up" key={word.id} className={styles.archiveCard} onClick={() => navigateToToday(originalIndex)}>
                    <div className={styles.archivePoster}>
                      <img data-aos="fade-up" src={getThumb(word)} alt={word.bible_reference_en || word.bible_reference} loading="lazy" />
                    </div>
                    <div className={styles.archiveBody}>
                      <div className={styles.archiveMeta}>
                        <span className={styles.archiveDate}>{new Date(word.date).toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-GB')}</span>
                        <Heart size={14} fill="#C8A646" color="#C8A646" />
                      </div>
                      <h4 data-aos="fade-up" style={{ fontWeight: 'normal' }}>{renderReference(word, language)}</h4>
                    </div>
                  </div>
                );
              })}
              {filteredArchive.filter(w => favorites.includes(w.id)).length === 0 && <p data-aos="fade-up" style={{color: '#64748B', width: '100%', textAlign: 'center'}}>{t('rhema_favorites_empty')}</p>}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
