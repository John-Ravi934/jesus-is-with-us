import { useState, useEffect } from 'react';
import { listPosters, deletePoster } from '../../services/storageService';
import { Trash2, Download, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const data = await listPosters();
      setFiles(data);
    } catch (e) {
      toast.error(e.message || "Failed to load media library");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName) => {
    if (window.confirm("Are you sure you want to permanently delete this image from storage? Any Rhema words using this image will break!")) {
      try {
        await deletePoster(fileName);
        toast.success("Image deleted successfully");
        loadFiles();
      } catch (e) {
        toast.error(e.message || "Failed to delete image");
      }
    }
  };

  const handleDownload = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  return (
    <div className={styles.sectionBox}>
      <div className={styles.adminPageHeader}>
        <div className={styles.adminPageTitle}>
          <h2>Media Library</h2>
          <p>Storage Bucket: rhema-posters</p>
        </div>
      </div>
      
      {loading ? (
        <p style={{padding: '2rem', textAlign: 'center'}}>Loading storage bucket...</p>
      ) : (
        <div style={{
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.5rem', 
          marginTop: '1rem'
        }}>
          {files.map(f => (
            <div key={f.id} style={{
              border: '1px solid #E2E8F0', 
              borderRadius: '8px', 
              overflow: 'hidden',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                height: '150px', 
                backgroundColor: '#F8FAFC', 
                backgroundImage: `url(${f.publicUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {!f.publicUrl && <ImageIcon size={32} color="#CBD5E1" />}
              </div>
              <div style={{padding: '0.75rem'}}>
                <p style={{fontSize: '0.8rem', color: '#64748B', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {f.name}
                </p>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '0.75rem', fontWeight: 600}}>
                    {(f.metadata?.size / 1024).toFixed(1)} KB
                  </span>
                  <div style={{display: 'flex', gap: '0.5rem'}}>
                    <button 
                      onClick={() => handleDownload(f.publicUrl, f.name)}
                      style={{background: 'none', border: 'none', cursor: 'pointer', color: '#334155'}}
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(f.name)}
                      style={{background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444'}}
                      title="Delete Permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {files.length === 0 && (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748B'}}>
              <ImageIcon size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
              <p>No images found in the storage bucket.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
