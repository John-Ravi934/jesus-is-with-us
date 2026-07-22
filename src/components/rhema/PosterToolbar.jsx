import { FaYoutube } from 'react-icons/fa';
import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import FavoriteButton from './FavoriteButton';
import styles from './RhemaComponents.module.css';

export default function PosterToolbar({ word }) {
  if (!word) return null;

  return (
    <div className={styles.toolbar}>
      <DownloadButton word={word} />
      <ShareButton word={word} />
      
      {word.youtube_url && (
        <a 
          href={word.youtube_url} 
          target="_blank" 
          rel="noreferrer" 
          className={styles.toolbarBtn} 
          style={{textDecoration: 'none'}}
          title="Watch/Discuss on YouTube"
        >
          <FaYoutube size={20} color="#FF0000" /> Community
        </a>
      )}
      
      <FavoriteButton wordId={word.id} />
    </div>
  );
}
