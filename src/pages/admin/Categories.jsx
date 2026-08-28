import { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory, updateCategory } from '../../services/categoryService';
import { getRhemaWords } from '../../services/rhemaService';
import { Plus, Trash2, Edit2, Search, ChevronDown, ChevronLeft, ChevronRight, Lightbulb, MoreHorizontal, Sparkles, Check, Save, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';
import CategoryIcon from '../../components/categories/CategoryIcon';
import CategoryIconPicker from '../../components/categories/CategoryIconPicker';
import CategorySuggestionModal from '../../components/categories/CategorySuggestionModal';
import { biblicalIconCatalog } from '../../constants/biblicalIcons';

const defaultIconNames = ['FaCrown', 'FaHeart', 'LuBook', 'LuFlame', 'FaDove', 'FaCross', 'LuShield', 'LuStar', 'FaAnchor'];
let mainIcons = defaultIconNames.map(name => biblicalIconCatalog.find(i => i.iconName === name)).filter(Boolean);
if (mainIcons.length < 9) {
  const extra = biblicalIconCatalog.filter(i => !mainIcons.includes(i)).slice(0, 9 - mainIcons.length);
  mainIcons.push(...extra);
}
const colorPresets = ['#22c55e', '#eab308', '#f97316', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#94a3b8'];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#22c55e', icon: mainIcons[0].iconName });
  const [deleteId, setDeleteId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter & Sort State
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('A-Z');
  
  // Pagination & Modal State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showIconModal, setShowIconModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filter, sortBy]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, words] = await Promise.all([
        getCategories(),
        getRhemaWords({})
      ]);
      setCategories(cats);
      
      const counts = {};
      words.forEach(w => {
        const cName = w.category || 'Uncategorized';
        counts[cName] = (counts[cName] || 0) + 1;
      });
      setCategoryCounts(counts);
    } catch (e) {
      toast.error(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, newCat.name, newCat.color, newCat.icon);
        toast.success("Category updated!");
      } else {
        await addCategory(newCat.name, newCat.color, newCat.icon);
        toast.success("Category added!");
      }
      setNewCat({ name: '', color: '#22c55e', icon: mainIcons[0].iconName });
      setEditingId(null);
      loadData();
    } catch (e) {
      toast.error(e.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setNewCat({ name: cat.name, color: cat.color, icon: cat.icon || mainIcons[0].iconName });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCat({ name: '', color: '#22c55e', icon: mainIcons[0].iconName });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      toast.success("Category deleted");
      loadData();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(c => {
    if (filter === 'All') return true;
    const count = categoryCounts[c.name] || 0;
    if (filter === 'Active') return count > 0;
    if (filter === 'Inactive') return count === 0;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
    return b.name.localeCompare(a.name);
  });
  
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div style={{ position: 'relative' }}>
      <div className={styles.headerDecor}></div>

      <div className={styles.adminPageHeader} style={{ position: 'relative', zIndex: 10 }}>
        <div className={styles.adminPageTitle}>
          <h2>Categories</h2>
          <p>Organize your Rhema words with topics and labels.</p>
        </div>
        <div className={styles.headerGraphic}>
          <div className={styles.folderGraphic}>
            <div className={styles.folderBack}></div>
            <div className={styles.folderFront}></div>
            <div className={styles.folderTag}></div>
            <div className={styles.dot1}></div>
            <div className={styles.dot2}></div>
          </div>
        </div>
      </div>

      <div className={styles.categoryLayout} style={{ position: 'relative', zIndex: 10 }}>
        <div className={styles.categoryFormCard}>
          <div className={styles.categoryFormHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className={styles.categoryFormHeaderIcon}>
                <Plus size={20} />
              </div>
              {editingId ? 'Edit Category' : 'Create New Category'}
            </div>
            {!editingId && (
              <button 
                type="button"
                className={styles.suggestBtn}
                onClick={() => setShowSuggestionModal(true)}
                title="Suggest Biblical Category"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  color: '#7c3aed',
                  backgroundColor: '#8b5cf615',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Sparkles size={18} />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Category Name</label>
              <div className={styles.inputWrapper}>
                <input 
                  type="text" 
                  value={newCat.name} 
                  onChange={e => setNewCat({...newCat, name: e.target.value})} 
                  placeholder="e.g. Worship" 
                  required 
                  style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Choose Icon</label>
              <div className={styles.iconGrid}>
                {mainIcons.map(iconDef => {
                  const isSelected = newCat.icon === iconDef.iconName;
                  const IconComp = iconDef.icon;
                  return (
                    <div 
                      key={iconDef.iconName} 
                      className={`${styles.iconOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => setNewCat({...newCat, icon: iconDef.iconName})}
                      title={iconDef.name}
                    >
                      <IconComp size={20} />
                    </div>
                  );
                })}
                <div 
                  className={styles.iconOptionMore}
                  onClick={() => setShowIconModal(true)}
                  title="More Icons"
                >
                  <MoreHorizontal size={20} />
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em' }}>MORE</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Choose Color</label>
              <div className={styles.colorPresets}>
                {colorPresets.slice(0, -1).map(preset => {
                  const isSelected = newCat.color.toLowerCase() === preset.toLowerCase();
                  return (
                    <div 
                      key={preset}
                      className={`${styles.colorPreset} ${isSelected ? styles.selected : ''}`}
                      style={{ backgroundColor: preset }}
                      onClick={() => setNewCat({...newCat, color: preset})}
                    >
                      {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                    </div>
                  );
                })}
                <div 
                  className={styles.colorPreset}
                  style={{ 
                    background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                    position: 'relative',
                    border: !colorPresets.slice(0, -1).some(p => p.toLowerCase() === newCat.color.toLowerCase()) ? '3px solid #fff' : 'none',
                    boxShadow: !colorPresets.slice(0, -1).some(p => p.toLowerCase() === newCat.color.toLowerCase()) ? '0 0 0 2px #3b82f6' : 'none'
                  }}
                  title="Pick a custom color"
                  onClick={() => document.getElementById('customColorPicker').click()}
                >
                  {!colorPresets.slice(0, -1).some(p => p.toLowerCase() === newCat.color.toLowerCase()) && (
                    <Check size={16} color="#ffffff" strokeWidth={3} style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.5))'}} />
                  )}
                  <input 
                    id="customColorPicker"
                    type="color" 
                    value={newCat.color}
                    onChange={(e) => setNewCat({...newCat, color: e.target.value})}
                    style={{
                      opacity: 0,
                      position: 'absolute',
                      top: 0, left: 0, width: 0, height: 0,
                      visibility: 'hidden'
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className={styles.primaryBtnPremium} disabled={submitting}>
                <Save size={18} />
                {submitting ? 'Saving...' : (editingId ? 'Update Category' : 'Save Category')}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className={styles.secondaryBtnPremium} disabled={submitting}>
                  Cancel
                </button>
              )}
            </div>

            <div className={styles.tipBox}>
              <Lightbulb size={24} style={{ flexShrink: 0 }} />
              <div>Tip: Use clear names and unique icons to keep your categories organized.</div>
            </div>
          </form>
        </div>

        <div className={styles.categoryListCard}>
          <div className={styles.listHeaderRow}>
            <div className={styles.listTitle}>
              Existing Categories <span className={styles.countBadge}>{categories.length}</span>
            </div>
            <div className={styles.searchBar}>
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.filterControls}>
            <div className={styles.filterPills}>
              <button 
                className={`${styles.filterPill} ${filter === 'All' ? styles.active : ''}`}
                onClick={() => setFilter('All')}
              >
                All ({categories.length})
              </button>
              <button 
                className={`${styles.filterPill} ${filter === 'Active' ? styles.active : ''}`}
                onClick={() => setFilter('Active')}
              >
                Active ({categories.filter(c => (categoryCounts[c.name] || 0) > 0).length})
              </button>
              <button 
                className={`${styles.filterPill} ${filter === 'Inactive' ? styles.active : ''}`}
                onClick={() => setFilter('Inactive')}
              >
                Inactive ({categories.filter(c => (categoryCounts[c.name] || 0) === 0).length})
              </button>
            </div>
            <div 
              className={styles.sortDropdown} 
              onClick={() => setSortBy(sortBy === 'A-Z' ? 'Z-A' : 'A-Z')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Sort by: {sortBy === 'A-Z' ? 'A to Z' : 'Z to A'} <ChevronDown size={14} style={{ display: 'inline', marginLeft: '4px' }} />
            </div>
          </div>

          {loading ? <p>Loading categories...</p> : (
            <>
              <div className={styles.listTableHeader}>
                <div className={styles.colCategory}>CATEGORY</div>
                <div className={styles.colPosts}>POSTS</div>
                <div className={styles.colActions}>ACTIONS</div>
              </div>
              <div className={styles.categoryListPremium}>
                {paginatedCategories.map(c => {
                  const count = categoryCounts[c.name] || 0;
                  return (
                    <div key={c.id} className={styles.categoryRowGrid}>
                      <div className={styles.categoryColMain}>
                        <CategoryIcon icon={c.icon} color={c.color} size={38} iconSize={18} className={styles.categoryDot} />
                        <div className={styles.categoryRowContent}>
                          <div className={styles.categoryRowName}>{c.name}</div>
                          <div className={styles.categoryRowSlug}>{c.slug}</div>
                        </div>
                      </div>
                      <div className={styles.categoryColPosts}>
                        {count}
                      </div>
                      <div className={styles.categoryColActions}>
                        <button className={`${styles.actionBtnSquarePremium} ${styles.edit}`} onClick={() => handleEdit(c)} title="Edit">
                          <Edit2 size={16}/>
                        </button>
                        <button className={`${styles.actionBtnSquarePremium} ${styles.delete}`} onClick={() => setDeleteId(c.id)} title="Delete">
                          <Trash2 size={16}/>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {filteredCategories.length === 0 && (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    No categories found.
                  </div>
                )}
              </div>

              <div className={styles.paginationRow}>
                <div>
                  Showing {filteredCategories.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                </div>
                <div className={styles.paginationControls}>
                  <button 
                    className={styles.pageBtn} 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={16}/>
                  </button>
                  {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(page => (
                    <button 
                      key={page}
                      className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    className={styles.pageBtn} 
                    onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight size={16}/>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete Category"
        message="Are you sure you want to delete this category? Any rhema words assigned to this category will keep their label."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

      <CategoryIconPicker 
        isOpen={showIconModal} 
        onClose={() => setShowIconModal(false)}
        selectedIcon={newCat.icon}
        onSelect={(iconValue) => setNewCat({...newCat, icon: iconValue})}
      />

      <CategorySuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
        existingCategories={categories}
        onSelect={(suggestion) => {
          setNewCat({
            name: suggestion.name,
            icon: suggestion.icon,
            color: suggestion.color
          });
          setEditingId(null); // Switch to create mode if it was in edit mode
        }}
      />
    </div>
  );
}
