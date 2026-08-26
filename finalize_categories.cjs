const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/Categories.jsx', 'utf8');

code = code.replace(
  "import { getCategories, addCategory, deleteCategory } from '../../services/categoryService';",
  "import { getCategories, addCategory, deleteCategory, updateCategory } from '../../services/categoryService';\nimport { getRhemaWords } from '../../services/rhemaService';"
);

// We want to replace the whole body of the Categories component because it's simpler.
// Find where the component starts
const compStart = code.indexOf('export default function Categories() {');
const preComp = code.substring(0, compStart);

const newComponent = `export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#10b981', icon: 'Tag' });
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
  const [iconSearch, setIconSearch] = useState('');

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
      setNewCat({ name: '', color: '#10b981', icon: 'Tag' });
      setEditingId(null);
      loadData();
    } catch (e) {
      toast.error(e.message || "Failed to save category.");
      if (e.message && e.message.includes("icon")) {
         toast.error("Please add an 'icon' column (type 'text') to your 'categories' table in Supabase.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setNewCat({ name: cat.name, color: cat.color, icon: cat.icon || 'Tag' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewCat({ name: '', color: '#10b981', icon: 'Tag' });
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
  ).filter(c => 
    filter === 'All' || (categoryCounts[c.name] > 0)
  ).sort((a, b) => {
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
          <p>Manage the topics and labels for your Rhema words.</p>
        </div>
      </div>

      <div className={styles.categoryLayout} style={{ position: 'relative', zIndex: 10 }}>
        <div className={styles.categoryFormCard}>
          <div className={styles.categoryFormHeader}>
            <div className={styles.categoryFormHeaderIcon}>
              <Plus size={20} />
            </div>
            {editingId ? 'Edit Category' : 'Create New Category'}
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
                {mainIconNames.map(iconName => {
                  const IconComp = iconMap[iconName];
                  if (!IconComp) return null;
                  const isSelected = newCat.icon === iconName;
                  return (
                    <div 
                      key={iconName} 
                      className={\`\${styles.iconOption} \${isSelected ? styles.selected : ''}\`}
                      onClick={() => setNewCat({...newCat, icon: iconName})}
                    >
                      <IconComp size={20} />
                    </div>
                  );
                })}
                <div 
                  className={styles.iconOption}
                  onClick={() => setShowIconModal(true)}
                  title="More Icons"
                >
                  <MoreHorizontal size={20} />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Choose Color</label>
              <div className={styles.colorPresets}>
                {colorPresets.map(preset => (
                  <div 
                    key={preset}
                    className={\`\${styles.colorPreset} \${newCat.color.toLowerCase() === preset ? styles.selected : ''}\`}
                    style={{ backgroundColor: preset }}
                    onClick={() => setNewCat({...newCat, color: preset})}
                  ></div>
                ))}
              </div>
              
              <div className={styles.colorPickerPremium}>
                <div 
                  className={styles.colorPreviewDot} 
                  style={{ backgroundColor: newCat.color }}
                  onClick={() => document.getElementById('catColorPicker').click()}
                ></div>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#475569', fontSize: '0.9rem' }}>
                  {newCat.color.toUpperCase()}
                </span>
                <input 
                  id="catColorPicker"
                  type="color" 
                  value={newCat.color} 
                  onChange={e => setNewCat({...newCat, color: e.target.value})} 
                  className={styles.colorInputHidden}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button type="submit" className={styles.primaryBtn} disabled={submitting} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', fontSize: '1rem' }}>
                {submitting ? 'Saving...' : (editingId ? 'Update Category' : 'Save Category')}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className={styles.secondaryBtn} disabled={submitting} style={{ padding: '0.8rem', borderRadius: '8px' }}>
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
                className={\`\${styles.filterPill} \${filter === 'All' ? styles.active : ''}\`}
                onClick={() => setFilter('All')}
              >
                All ({categories.length})
              </button>
              <button 
                className={\`\${styles.filterPill} \${filter === 'Active' ? styles.active : ''}\`}
                onClick={() => setFilter('Active')}
              >
                Active ({categories.filter(c => (categoryCounts[c.name] || 0) > 0).length})
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
              <div className={styles.categoryListPremium}>
                {paginatedCategories.map(c => {
                  const IconComp = iconMap[c.icon || 'Tag'] || Object.values(iconMap)[0];
                  const count = categoryCounts[c.name] || 0;
                  return (
                    <div key={c.id} className={styles.categoryRow}>
                      <div className={styles.categoryDot} style={{ backgroundColor: c.color }}>
                        <IconComp size={22} />
                      </div>
                      <div className={styles.categoryRowContent}>
                        <div className={styles.categoryRowName}>{c.name}</div>
                        <div className={styles.categoryRowSlug}>{c.slug}</div>
                      </div>
                      <div className={styles.categoryRowStat}>
                        {count}
                      </div>
                      <div className={styles.categoryRowActions}>
                        <button className={\`\${styles.actionBtnSquare} \${styles.edit}\`} onClick={() => handleEdit(c)} title="Edit">
                          <Edit2 size={16}/>
                        </button>
                        <button className={\`\${styles.actionBtnSquare} \${styles.delete}\`} onClick={() => setDeleteId(c.id)} title="Delete">
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
                      className={\`\${styles.pageBtn} \${currentPage === page ? styles.active : ''}\`}
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

      {showIconModal && (
        <div className={styles.modalOverlay} onClick={() => setShowIconModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Choose Icon</h3>
              <button onClick={() => setShowIconModal(false)} className={styles.iconBtn}><X size={20}/></button>
            </div>
            
            <div style={{ padding: '0 1.5rem', marginTop: '1rem' }}>
              <div className={styles.searchBar} style={{ width: '100%', maxWidth: 'none', margin: '0' }}>
                <Search size={18} color="#94a3b8" />
                <input 
                  type="text" 
                  placeholder="Search icons..." 
                  value={iconSearch}
                  onChange={e => setIconSearch(e.target.value)}
                  style={{ border: 'none', outline: 'none', width: '100%', padding: '0.5rem', marginLeft: '0.5rem', backgroundColor: 'transparent' }}
                />
              </div>
            </div>

            <div className={styles.iconGrid} style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: '1rem', marginTop: '1.5rem', maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              {iconNames.filter(name => name.toLowerCase().includes(iconSearch.toLowerCase())).map(iconName => {
                const IconComp = iconMap[iconName];
                if (!IconComp) return null;
                const isSelected = newCat.icon === iconName;
                return (
                  <div 
                    key={iconName} 
                    className={\`\${styles.iconOption} \${isSelected ? styles.selected : ''}\`}
                    onClick={() => {
                      setNewCat({...newCat, icon: iconName});
                      setShowIconModal(false);
                    }}
                  >
                    <IconComp size={24} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/pages/admin/Categories.jsx', preComp + newComponent);
console.log('Successfully finalized Categories.jsx!');
