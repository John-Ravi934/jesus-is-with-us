import { useState, useEffect } from 'react';
import { getRhemaWords, deleteRhema } from '../../services/rhemaService';
import { getCategories } from '../../services/categoryService';
import { biblicalIconCatalog } from '../../constants/biblicalIcons';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Eye, Plus, Search, BookOpen, Calendar, ArrowUpDown, ChevronLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function RhemaLibrary() {
  const [data, setData] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [deleteId, setDeleteId] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rhemaResult, catResult] = await Promise.all([
        getRhemaWords(),
        getCategories()
      ]);
      setData(rhemaResult);
      
      const map = {};
      catResult.forEach(c => {
        map[c.name_en || c.name] = { color: c.color, iconName: c.icon };
      });
      setCategoryMap(map);
    } catch (e) {
      toast.error(e.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRhema(deleteId);
      toast.success("Deleted successfully");
      loadData();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredData = data.filter(r => {
    const matchesSearch = (r.bible_reference_en && r.bible_reference_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (r.bible_reference_ta && r.bible_reference_ta.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (r.bible_reference && r.bible_reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'Latest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
    return 0;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const uniqueCategories = [...new Set(data.map(r => r.category))].filter(Boolean);

  const getCategoryBadge = (catName) => {
    const def = categoryMap[catName];
    let hex = '#64748b'; // default gray
    let iconName = 'LuLayoutGrid';
    if (def) {
      hex = def.color || hex;
      iconName = def.iconName || iconName;
    }
    const iconDef = biblicalIconCatalog.find(i => i.iconName === iconName);
    const IconComp = iconDef ? iconDef.icon : LayoutGrid;
    
    return (
      <div className={styles.categoryBadgePill} style={{ borderColor: hex, color: hex, backgroundColor: `${hex}15` }}>
        <IconComp size={14} />
        <span>{catName}</span>
      </div>
    );
  };

  return (
    <>
    <div className={styles.libraryContainer}>
      
      {/* Header */}
      <div className={styles.libraryTopHeader}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div className={styles.libraryIconBlock}>
            <BookOpen size={28} color="#ffffff" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className={styles.libraryTitle}>Rhema Library</h2>
            <p className={styles.librarySubtitle}>Manage and organize all your published Rhemas.</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin/rhema/add')} className={styles.primaryBtnPremium} style={{width: 'auto', padding: '0.8rem 1.2rem'}}>
          <Plus size={18} strokeWidth={3} /> Add New Rhema
        </button>
      </div>

      {/* Filter Bar */}
      <div className={styles.libraryFilterBar}>
        <div className={styles.filterLeft}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search by bible reference..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          
          <div className={styles.dropdownWrapper}>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        
        <div className={styles.filterRight}>
          <div className={styles.sortWrapper}>
            <ArrowUpDown size={16} className={styles.sortIcon} />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="Latest">Sort by: Latest</option>
              <option value="Oldest">Sort by: Oldest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      <div className={styles.libraryGridContainer}>
        {loading ? (
          <p style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>Loading library from Database...</p>
        ) : (
          <>
            <div className={styles.libraryGridHeader}>
              <div>RHEMA</div>
              <div>CATEGORY</div>
              <div>DATE</div>
              <div>VIEWS</div>
              <div>STATUS</div>
              <div style={{textAlign: 'center'}}>ACTIONS</div>
            </div>
            
            <div className={styles.libraryGridBody}>
              {paginatedData.map(r => {
                const getValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http') ? url : '';
                const thumbUrl = getValidUrl(r.tamil_poster_url) ? r.tamil_poster_url : (getValidUrl(r.poster_url) ? r.poster_url : '');
                
                return (
                  <div className={styles.libraryGridRow} key={r.id}>
                    <div className={styles.gridCellRhema}>
                      <img src={thumbUrl} alt="thumb" className={styles.gridRhemaThumb} />
                      <div className={styles.gridRhemaText}>
                        <div className={styles.gridRhemaTitle}>
                          {r.bible_reference_en || r.bible_reference_ta || r.bible_reference || 'Unknown Reference'}
                        </div>
                        <div className={styles.gridRhemaSub}>{(r.bible_verse_en || r.bible_verse_ta || r.bible_verse || '')?.substring(0,40)+'...'}</div>
                      </div>
                    </div>
                    
                    <div className={styles.gridCellCategory}>
                      {getCategoryBadge(r.category || 'Uncategorized')}
                    </div>
                    
                    <div className={styles.gridCellDate}>
                      <Calendar size={16} className={styles.metaIcon} />
                      <span>{new Date(r.date).toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</span>
                    </div>
                    
                    <div className={styles.gridCellViews}>
                      <Eye size={16} className={styles.metaIcon} />
                      <span>{r.views || 0}</span>
                    </div>
                    
                    <div className={styles.gridCellStatus}>
                      <div className={`${styles.statusDot} ${styles[r.status]}`}></div>
                      <span className={`${styles.statusText} ${styles[r.status]}`}>
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className={styles.gridCellActions}>
                      <button className={styles.actionBtnCircle} title="Preview" onClick={() => window.open(thumbUrl, '_blank')}>
                        <Eye size={16}/>
                      </button>
                      <button className={styles.actionBtnCircle} title="Edit" onClick={() => navigate(`/admin/rhema/edit/${r.id}`)}>
                        <Edit2 size={16}/>
                      </button>
                      <button className={`${styles.actionBtnCircle} ${styles.delete}`} onClick={() => setDeleteId(r.id)} title="Delete">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {paginatedData.length === 0 && (
                <div style={{textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                  No Rhema words match your criteria.
                </div>
              )}
            </div>
            
            {/* Pagination Row */}
            <div className={styles.paginationRow}>
              <div className={styles.paginationInfo}>
                Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} Rhemas
              </div>
              <div className={styles.paginationControls}>
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.active : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  className={styles.pageBtn} 
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Rhema Word"
      message="Are you sure you want to delete this Rhema word? This cannot be undone."
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
