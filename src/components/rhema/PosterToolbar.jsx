import { FaYoutube } from 'react-icons/fa';
import DownloadButton from './DownloadButton';
import ShareButton from './ShareButton';
import FavoriteButton from './FavoriteButton';
import styles from './RhemaComponents.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

export default function PosterToolbar({ word }) {
  const { t } = useLanguage();
  if (!word) return null;

  return (
    <div className={styles.toolbarGrid}>
      <DownloadButton word={word} />
      <FavoriteButton wordId={word.id} />
      <ShareButton word={word} />
      
      {word.youtube_url ? (
        <a 
          href={word.youtube_url} 
          target="_blank" 
          rel="noreferrer" 
          className={styles.toolbarBtn} 
          style={{textDecoration: 'none'}}
          title="Watch/Discuss on YouTube"
        >
          <FaYoutube size={20} color="#FF0000" /> {t('rhema_btn_community') || 'Community'}
        </a>
      ) : (
        <button className={styles.toolbarBtn} disabled title="No Community Video Available">
          <FaYoutube size={20} /> {t('rhema_btn_community') || 'Community'}
        </button>
      )}
    </div>
  );
}
