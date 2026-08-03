import { useState, useEffect, useMemo } from 'react';
import { Search, FolderOpen, AlertCircle } from 'lucide-react';
import { getPlaylists } from '../services/playlistService';
import styles from './Resources.module.css';

export default function Resources() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filtering and Search state
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [displayCount, setDisplayCount] = useState(8);

  const categories = ["All", "Sermons", "Bible Studies", "Devotionals", "Worship", "E-Books"];

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
      const matchesTab = activeTab === "All" || pl.category === activeTab;
      const matchesSearch = pl.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (pl.category && pl.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTab && matchesSearch;
    });
  }, [playlists, activeTab, searchQuery]);

  const visiblePlaylists = filteredPlaylists.slice(0, displayCount);
  const hasMore = displayCount < filteredPlaylists.length;

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + 8);
  };

  return (
    <>
      <section className={styles.hero} data-aos="fade-in">
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Equip Yourself</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">Media & <span className="script-accent">Playlists</span></h1>
        </div>
      </section>

      <section className="light-section">
        <div className="container">
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input 
              type="text" 
              placeholder="Search playlists, sermons, topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-primary">Search</button>
          </div>

          <div className={styles.categories}>
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                className={`${styles.catBtn} ${activeTab === cat ? styles.active : ''}`}
                onClick={() => {
                  setActiveTab(cat);
                  setDisplayCount(8); // Reset pagination on tab change
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 data-aos="fade-up" className={styles.sectionTitle} style={{ marginBottom: 0 }}>Playlists</h2>
            {!loading && !error && (
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                Showing {visiblePlaylists.length} of {filteredPlaylists.length}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '3px solid #f3f4f6', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              Loading resources...
            </div>
          ) : error ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: '#ef4444', background: '#fef2f2', borderRadius: '12px' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
              <h3 data-aos="fade-up">Database Setup Required</h3>
              <p data-aos="fade-up">The Playlists table hasn't been created yet. Please run the SQL script in your Supabase dashboard.</p>
            </div>
          ) : visiblePlaylists.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <FolderOpen size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 data-aos="fade-up">No Playlists Found</h3>
              <p data-aos="fade-up">Try adjusting your search or category filters.</p>
            </div>
          ) : (
            <div className={styles.playlistGrid}>
              {visiblePlaylists.map((pl) => (
                <div data-aos="fade-up" key={pl.id} className={styles.folderCard}>
                  <div className={styles.folderTab}></div>
                  <div className={styles.folderBody}>
                    <div className={styles.folderImageWrapper}>
                      <img data-aos="fade-up" src={pl.image_url || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&w=400&q=80'} alt={pl.title} />
                    </div>
                    <h3 data-aos="fade-up">{pl.title}</h3>
                    <a href={pl.link_url || '#'} target={pl.link_url ? "_blank" : "_self"} rel="noreferrer" className={styles.viewPlaylist}>
                      View full playlist
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && !error && hasMore && (
            <div className={styles.loadMore}>
              <button className="btn btn-secondary" onClick={handleLoadMore}>Load More Playlists</button>
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
