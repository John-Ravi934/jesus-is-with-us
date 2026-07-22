import { Search, FolderOpen } from 'lucide-react';
import styles from './Resources.module.css';

export default function Resources() {
  const categories = ["All", "Sermons", "Bible Studies", "Devotionals", "Worship", "E-Books"];
  
  const playlists = [
    { title: 'MESSAGE - JOHNSAM JOYSON', image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'MESSAGE - DAVIDSAM JOYSON', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'MONTHLY PROMISE WORD - 2026', image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'BIBLE STUDY - 2026', image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'AUGUST PRAYER MESSAGE - 2026', image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'PRAISE AND WORSHIP - 2026', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'MONTHLY PROMISE WORD - 2025', image: 'https://images.unsplash.com/photo-1511632765486-a01c80cb8ee5?ixlib=rb-4.0.3&w=400&q=80' },
    { title: 'BIBLE STUDY - 2025', image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&w=400&q=80' },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Equip Yourself</span>
          <h1 className="animate-fade-up delay-100">Media & <span className="script-accent">Playlists</span></h1>
        </div>
      </section>

      <section className="light-section">
        <div className="container">
          <div className={styles.searchBar}>
            <Search className={styles.searchIcon} size={20} />
            <input type="text" placeholder="Search playlists, sermons, topics..." />
            <button className="btn btn-primary">Search</button>
          </div>

          <div className={styles.categories}>
            {categories.map((cat, idx) => (
              <button key={idx} className={`${styles.catBtn} ${idx === 0 ? styles.active : ''}`}>{cat}</button>
            ))}
          </div>

          <h2 className={styles.sectionTitle}>Playlists</h2>

          <div className={styles.playlistGrid}>
            {playlists.map((pl, idx) => (
              <div key={idx} className={styles.folderCard}>
                <div className={styles.folderTab}></div>
                <div className={styles.folderBody}>
                  <div className={styles.folderImageWrapper}>
                    <img src={pl.image} alt={pl.title} />
                  </div>
                  <h3>{pl.title}</h3>
                  <a href="#" className={styles.viewPlaylist}>
                    View full playlist
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.loadMore}>
            <button className="btn btn-secondary">Load More Playlists</button>
          </div>
        </div>
      </section>
    </>
  );
}
