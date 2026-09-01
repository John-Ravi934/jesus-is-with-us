import { useState, useEffect, useMemo } from 'react';
import { Search, FolderOpen, AlertCircle, Eye } from 'lucide-react';
import { getPlaylists, incrementPlaylistViews } from '../services/playlistService';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Resources.module.css';

export default function Resources() {
  const { t, language } = useLanguage();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filtering and Search state
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);

  const categoriesMap = [
    { key: 'All', label: t('res_tab_all') },
    { key: 'Sermons', label: t('res_tab_sermons') },
    { key: 'Bible Studies', label: t('res_tab_bible') },
    { key: 'Devotionals', label: t('res_tab_devotionals') },
    { key: 'Worship', label: t('res_tab_worship') },
    { key: 'E-Books', label: t('res_tab_ebooks') }
  ];

  useEffect(() => {
    async function loadPlaylists() {
      try {
        const data = await getPlaylists();
        setPlaylists(data || []);
      } catch (err) {
        console.error("Failed to load playlists:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadPlaylists();
  }, []);

  const filteredPlaylists = useMemo(() => {
    return playlists.filter(pl => {
      const plTitle = pl[`title_${language}`] || pl.title_en || pl.title || '';
      const matchesTab = activeTab === 'All' || pl.category === activeTab;
      const matchesSearch = plTitle.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (pl.category && pl.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [playlists, activeTab, searchQuery, t]);

  const visiblePlaylists = filteredPlaylists.slice(0, displayCount);
  const hasMore = displayCount < filteredPlaylists.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  const handleViewPlaylist = async (pl, e) => {
    e.preventDefault();
    
    // Open the link in a new tab
    if (pl.link_url) {
      window.open(pl.link_url, '_blank', 'noopener,noreferrer');
    }
    
    // Optimistic UI update
    setPlaylists(prev => prev.map(p => 
      p.id === pl.id ? { ...p, views: (p.views || 0) + 1 } : p
    ));
    
    // Increment in DB
    try {
      await incrementPlaylistViews(pl.id, pl.views);
    } catch (err) {
      console.error("Failed to increment views", err);
    }
  };

  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">{t('res_hero_label')}</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">{t('res_hero_title')}<span className="script-accent">{t('res_hero_title_2')}</span></h1>
        </div>
      </section>

      <section data-aos="fade-up" className="light-section">
        <div className="container">
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder={t('res_search_placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button data-aos="fade-up" className="btn btn-primary">{t('res_search_btn')}</button>
          </div>

          <div className={styles.categories}>
            {categoriesMap.map((cat, idx) => (
              <button
                key={idx} 
                className={`${styles.catBtn} ${activeTab === cat.key ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(cat.key);
                  setDisplayCount(8); // Reset pagination on tab change
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 data-aos="fade-up" className={styles.sectionTitle} style={{ marginBottom: 0 }}>{t('res_title_playlists')}</h2>
            {!loading && !error && (
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {t('res_showing')} {visiblePlaylists.length} {t('res_of')} {filteredPlaylists.length}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              {t('res_loading')}
            </div>
          ) : error ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444', background: '#fef2f2', borderRadius: '12px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h3>{t('res_db_setup')}</h3>
              <p>{t('res_db_setup_desc')}</p>
            </div>
          ) : visiblePlaylists.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <FolderOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3>{t('res_empty_title')}</h3>
              <p>{t('res_empty_desc')}</p>
            </div>
          ) : (
            <div className={styles.playlistGrid}>
              {visiblePlaylists.map((pl) => (
                <div key={pl.id} className={styles.folderCard}>
                  <div className={styles.folderTab}></div>
                  <div className={styles.folderBody}>
                    <div className={styles.folderImageWrapper}>
                      <img src={pl.image_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&w=400&q=80'} alt={pl[`title_${language}`] || pl.title_en || pl.title} />
                    </div>
                    <h3>{pl[`title_${language}`] || pl.title_en || pl.title}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <a 
                        href={pl.link_url || '#'} 
                        target={pl.link_url ? "_blank" : "_self"} 
                        rel="noreferrer" 
                        className={styles.viewPlaylist}
                        onClick={(e) => handleViewPlaylist(pl, e)}
                      >
                        {t('res_view_playlist')}
                      </a>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                        <Eye size={16} />
                        <span>{pl.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && hasMore && (
            <div className={styles.loadMore}>
              <button data-aos="fade-up" className="btn btn-secondary" onClick={handleLoadMore}>{t('res_load_more')}</button>
            </div>
          )}
        </div>
      </section>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
