import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './RhemaComponents.module.css';
import { incrementDownloads } from '../../services/rhemaService';

export default function DownloadButton({ word }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!word) return;
    setDownloading(true);
    try {
      // Fetch Blob
      const response = await fetch(word.poster_url);
      if (!response.ok) throw new Error("Network error");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create hidden link
      const link = document.createElement('a');
      link.href = url;
      link.download = `Rhema-${word.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      // Success
      toast.success("Download Complete!");
      
      // Analytics
      await incrementDownloads(word.id).catch(console.error);
    } catch (e) {
      console.error("Download failed", e);
      toast.error("Failed to download poster");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button 
      className={styles.toolbarBtn} 
      onClick={handleDownload}
      disabled={downloading}
    >
      {downloading ? <Loader2 size={20} className={styles.spinner} /> : <Download size={20} />}
      {downloading ? 'Downloading...' : 'Download'}
    </button>
  );
}
