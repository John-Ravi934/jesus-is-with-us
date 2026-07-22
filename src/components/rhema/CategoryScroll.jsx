import { useRef, useState } from 'react';
import styles from './CategoryScroll.module.css';

export default function CategoryScroll({ categories, selectedCategory, onSelect }) {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleSelect = (e, cat) => {
    // Prevent clicking if we were just dragging
    if (isDragging) {
      e.preventDefault();
      return;
    }
    onSelect(cat);
    
    // Auto center the clicked category
    const button = e.target;
    const container = scrollRef.current;
    if (container && button) {
      const scrollPos = button.offsetLeft - (container.offsetWidth / 2) + (button.offsetWidth / 2);
      container.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.scrollWrapper}>
      <div 
        className={`${styles.scrollContainer} ${isDragging ? styles.dragging : ''}`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`${styles.categoryBtn} ${selectedCategory === cat ? styles.active : ''}`}
            onClick={(e) => handleSelect(e, cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
