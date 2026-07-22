import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from './RhemaComponents.module.css';

export default function FavoriteButton({ wordId }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const savedFavs = JSON.parse(localStorage.getItem('rhema_favs') || '[]');
    setIsFavorite(savedFavs.includes(wordId));
  }, [wordId]);

  const toggleFavorite = () => {
    const savedFavs = JSON.parse(localStorage.getItem('rhema_favs') || '[]');
    let newFavs;
    let added = false;
    
    if (savedFavs.includes(wordId)) {
      newFavs = savedFavs.filter(id => id !== wordId);
    } else {
      newFavs = [...savedFavs, wordId];
      added = true;
    }
    
    localStorage.setItem('rhema_favs', JSON.stringify(newFavs));
    setIsFavorite(added);
    
    // Trigger animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // Toast
    if (added) {
      toast.success("Saved to Favorites", { icon: '❤️' });
    } else {
      toast("Removed from Favorites", { icon: '💔' });
    }
  };

  return (
    <button 
      className={`${styles.toolbarBtn} ${isFavorite ? styles.favorited : ''}`} 
      onClick={toggleFavorite}
      title="Save to Favorites"
    >
      <Heart 
        size={20} 
        fill={isFavorite ? "currentColor" : "none"} 
        className={animating ? styles.heartAnimate : ''} 
      /> 
      {isFavorite ? 'Favorited' : 'Favorite'}
    </button>
  );
}
