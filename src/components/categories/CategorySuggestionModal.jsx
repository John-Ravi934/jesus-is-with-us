import { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuX, LuFilter, LuPlus } from 'react-icons/lu';
import { biblicalCategorySuggestions } from '../../constants/biblicalCategorySuggestions';
import { biblicalIconMap } from '../../constants/biblicalIcons';
import styles from './CategorySuggestionModal.module.css';

// Predefined beautiful colors for categories
const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // light blue
  '#6366f1', // indigo
];

// Simple hash to deterministically pick a color based on category name
const getColorForCategory = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CATEGORY_COLORS.length;
  return CATEGORY_COLORS[index];
};

const normalizeName = (name) => {
  return name ? name.trim().toLowerCase().replace(/\s+/g, ' ') : '';
};

export default function CategorySuggestionModal({ isOpen, onClose, onSelect, existingCategories = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Compute normalized existing names for fast lookup
  const existingNormalizedNames = useMemo(() => {
    const set = new Set();
    existingCategories.forEach(cat => {
      set.add(normalizeName(cat.name_en || cat.name));
    });
    return set;
  }, [existingCategories]);

  // Extract unique groups
  const groups = useMemo(() => {
    const allGroups = biblicalCategorySuggestions.map(s => s.group);
    return ['All', ...new Set(allGroups)].filter(Boolean);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedGroup('All');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSuggestions = biblicalCategorySuggestions.filter(suggestion => {
    // 1. Exclude existing
    if (existingNormalizedNames.has(normalizeName(suggestion.name))) {
      return false;
    }

    // 2. Filter by group
    const matchesGroup = selectedGroup === 'All' || suggestion.group === selectedGroup;
    if (!matchesGroup) return false;

    // 3. Filter by search
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return suggestion.name.toLowerCase().includes(query) || 
           suggestion.keywords.some(kw => kw.toLowerCase().includes(query)) ||
           suggestion.group.toLowerCase().includes(query);
  });

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="suggestion-modal-title">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 id="suggestion-modal-title" className={styles.title}>✨ Suggest Biblical Category</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeBtn}
            aria-label="Close suggestion modal"
          >
            <LuX size={20} />
          </button>
        </div>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <LuSearch size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search category suggestions..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
        </div>

        <div className={styles.bodyContainer}>
          <div className={styles.sidebar}>
            <div className={styles.sidebarTitle}>
              <LuFilter size={16} /> Categories
            </div>
            <ul className={styles.groupList}>
              {groups.map(group => (
                <li key={group}>
                  <button
                    type="button"
                    className={`${styles.groupBtn} ${selectedGroup === group ? styles.groupBtnSelected : ''}`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    {group}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.gridWrapper}>
            <div className={styles.suggestionGrid}>
              {filteredSuggestions.length > 0 ? (
                filteredSuggestions.map(suggestion => {
                  const IconComp = biblicalIconMap[suggestion.icon] || biblicalIconMap[suggestion.id];
                  const color = getColorForCategory(suggestion.name);
                  
                  return (
                    <button
                      key={suggestion.id}
                      type="button"
                      className={styles.suggestionCard}
                      onClick={() => {
                        onSelect({
                          name: suggestion.name,
                          slug: suggestion.slug,
                          icon: suggestion.icon,
                          color: color
                        });
                        onClose();
                      }}
                    >
                      <div className={styles.cardIcon} style={{ color: color, backgroundColor: `${color}15` }}>
                        {IconComp && <IconComp size={24} />}
                      </div>
                      <div className={styles.cardContent}>
                        <h4 className={styles.cardName}>{suggestion.name}</h4>
                        <span className={styles.cardGroup}>{suggestion.group}</span>
                      </div>
                      <div className={styles.cardAction}>
                        <LuPlus size={18} />
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <p>No suggestions found. You might have added all of them or none match your search!</p>
                  <button 
                    type="button" 
                    className={styles.clearFilterBtn}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGroup('All');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
