import { useState, useEffect, useMemo } from 'react';
import { LuSearch, LuX, LuFilter } from 'react-icons/lu';
import { biblicalIconCatalog } from '../../constants/biblicalIcons';
import styles from './CategoryIconPicker.module.css';

export default function CategoryIconPicker({ isOpen, onClose, onSelect, selectedIcon }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');

  // Extract unique groups from the catalog
  const groups = useMemo(() => {
    const allGroups = biblicalIconCatalog.map(icon => icon.group);
    return ['All', ...new Set(allGroups)].filter(Boolean);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedGroup('All');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredIcons = biblicalIconCatalog.filter(iconDef => {
    const matchesGroup = selectedGroup === 'All' || iconDef.group === selectedGroup;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) return matchesGroup;
    
    const matchesSearch = iconDef.name.toLowerCase().includes(query) || 
                          iconDef.keywords.some(kw => kw.toLowerCase().includes(query)) ||
                          iconDef.group.toLowerCase().includes(query);
                          
    return matchesGroup && matchesSearch;
  });

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="icon-picker-title">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 id="icon-picker-title" className={styles.title}>Choose Biblical Icon</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className={styles.closeBtn}
            aria-label="Close icon picker"
          >
            <LuX size={20} />
          </button>
        </div>
        
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <LuSearch size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Search icons (e.g. prayer, cross, healing)..." 
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
          
          <div className={styles.iconGridWrapper}>
            <div className={styles.iconGrid}>
              {filteredIcons.length > 0 ? (
                filteredIcons.map(iconDef => {
                  const IconComp = iconDef.icon;
                  // Handle either 'id' or 'value' for backwards compatibility if needed
                  const identifier = iconDef.id || iconDef.value;
                  const isSelected = selectedIcon === identifier;
                  
                  return (
                    <button
                      key={identifier}
                      type="button"
                      className={`${styles.iconOption} ${isSelected ? styles.selected : ''}`}
                      onClick={() => {
                        onSelect(identifier);
                        onClose();
                      }}
                      title={`${iconDef.name} (${iconDef.group})`}
                      aria-label={`Select ${iconDef.name} icon`}
                      aria-pressed={isSelected}
                    >
                      <IconComp size={24} />
                      <span className={styles.iconName} aria-hidden="true">{iconDef.name}</span>
                    </button>
                  );
                })
              ) : (
                <div className={styles.emptyState}>
                  <p>No icons found matching "{searchQuery}"</p>
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
