import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DynamicCalendar.module.css';

export default function DynamicCalendar({ filteredArchive, onSelectDate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Find all dates from filteredArchive that fall in the current month/year
  // We'll map them by day number for fast lookup
  const publishedDays = useMemo(() => {
    const map = new Map();
    filteredArchive.forEach(word => {
      if (word.date) {
        const d = new Date(word.date);
        // Correct for timezone offsets by parsing date string locally
        // Assuming word.date is YYYY-MM-DD
        const localDate = new Date(word.date + 'T00:00:00');
        
        if (localDate.getFullYear() === year && localDate.getMonth() === month) {
          map.set(localDate.getDate(), word);
        }
      }
    });
    return map;
  }, [filteredArchive, year, month]);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className={styles.calendarSection}>
      <div className={styles.calendarHeader}>
        <button className={styles.navBtn} onClick={handlePrevMonth}>
          <ChevronLeft size={24} />
        </button>
        <h2>{monthNames[month]} {year}</h2>
        <button className={styles.navBtn} onClick={handleNextMonth}>
          <ChevronRight size={24} />
        </button>
      </div>

      <div className={styles.calendarGrid}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.calDayHeader}>{day}</div>
        ))}
        
        {/* Empty slots for the first day offset */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className={styles.calDayEmpty}></div>
        ))}
        
        {/* Actual days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isToday = isCurrentMonth && today.getDate() === day;
          
          // Check if this date is in the future
          const checkDate = new Date(year, month, day);
          const isFuture = checkDate > today;
          
          const publishedWord = publishedDays.get(day);
          const hasWord = !!publishedWord;

          let dayClass = styles.calDay;
          if (isFuture) dayClass += ` ${styles.futureDay}`;
          else if (isToday) dayClass += ` ${styles.todayDay}`;
          else if (hasWord) dayClass += ` ${styles.publishedDay}`;
          else dayClass += ` ${styles.emptyDay}`;

          return (
            <div 
              key={day} 
              className={dayClass}
              onClick={() => {
                if (hasWord) onSelectDate(publishedWord);
              }}
            >
              <span className={styles.dayNum}>{day}</span>
              {hasWord && <span className={styles.wordDot}></span>}
            </div>
          )
        })}
      </div>
    </div>
  );
}
