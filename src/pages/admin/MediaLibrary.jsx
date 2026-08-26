import { useState, useEffect } from 'react';
import { listPosters, deletePoster } from '../../services/storageService';
import { Trash2, Download, ImageIcon, FileText, HardDrive, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function MediaLibrary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [dateFilter, setDateFilter] = useState('All Time');
  const itemsPerPage = 40;

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePoster(deleteId);
      toast.success("Image deleted successfully");
      loadFiles();
    } catch (e) {
      toast.error(e.message || "Failed to delete image");
    } finally {
      setDeleteId(null);
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

  const getFilteredFiles = () => {
    if (dateFilter === 'All Time') return files;
    
    const now = new Date();
    return files.filter(f => {
      if (!f.created_at) return false;
      const fileDate = new Date(f.created_at);
      const diffTime = Math.abs(now - fileDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === '7 Days') return diffDays <= 7;
      if (dateFilter === '15 Days') return diffDays <= 15;
      if (dateFilter === '30 Days') return diffDays <= 30;
      if (dateFilter === '3 Months') return diffDays <= 90;
      if (dateFilter === '6 Months') return diffDays <= 180;
      if (dateFilter === '1 Year') return diffDays <= 365;
      if (dateFilter === '3 Years') return diffDays <= 365 * 3;
      if (dateFilter === '5 Years') return diffDays <= 365 * 5;
      return true;
    });
  };

  const filteredFiles = getFilteredFiles();

  // Calculations for summary cards
  const totalFiles = filteredFiles.length;
  const imageFiles = filteredFiles.filter(f => f.metadata?.mimetype?.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length;
  const totalSizeBytes = filteredFiles.reduce((acc, f) => acc + (f.metadata?.size || 0), 0);
  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
  const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
    <div className={styles.sectionBox} style={{ backgroundColor: '#f8fafc', padding: '2rem' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Media Library</h2>
        <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>
          Storage Bucket: <span style={{ color: '#16a34a', fontWeight: 500 }}>rhema-posters</span>
        </p>
      </div>

      {loading ? (
        <p style={{padding: '2rem', textAlign: 'center'}}>Loading storage bucket...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: '200px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#dcfce7', color: '#16a34a', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>Total Files</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.2rem' }}>{totalFiles}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>All media</div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: '200px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#e0f2fe', color: '#0284c7', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>Images</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.2rem' }}>{imageFiles}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>JPG, PNG</div>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1.2rem', flex: 1, minWidth: '200px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div style={{ background: '#fef3c7', color: '#d97706', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardDrive size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem' }}>Total Size</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1, marginBottom: '0.2rem' }}>{totalSizeMB} MB</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Used storage</div>
              </div>
            </div>
          </div>

          {/* Filters & View Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['All Time', '7 Days', '15 Days', '30 Days', '3 Months', '6 Months', '1 Year', '3 Years', '5 Years'].map(option => (
                <button 
                  key={option}
                  onClick={() => { setDateFilter(option); setCurrentPage(1); }}
                  style={{ 
                    padding: '0.4rem 0.8rem', 
                    background: dateFilter === option ? '#16a34a' : '#fff', 
                    color: dateFilter === option ? 'white' : '#64748b', 
                    border: dateFilter === option ? 'none' : '1px solid #e2e8f0', 
                    borderRadius: '6px', 
                    fontWeight: 500, 
                    fontSize: '0.85rem',
                    cursor: 'pointer' 
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setViewMode('grid')}
                style={{ padding: '0.5rem', background: viewMode === 'grid' ? '#16a34a' : '#fff', color: viewMode === 'grid' ? 'white' : '#64748b', border: viewMode === 'grid' ? 'none' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutGrid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                style={{ padding: '0.5rem', background: viewMode === 'list' ? '#16a34a' : '#fff', color: viewMode === 'list' ? 'white' : '#64748b', border: viewMode === 'list' ? 'none' : '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Image Content */}
          {viewMode === 'list' ? (
            <div style={{ width: '100%', overflowX: 'auto', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>PREVIEW</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>NAME</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>SIZE</th>
                    <th style={{ padding: '1rem', fontWeight: 600 }}>DATE</th>
                    <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedFiles.map(f => {
                    const dateStr = f.created_at ? new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown Date';
                    const kbSize = (f.metadata?.size / 1024).toFixed(1);
                    return (
                      <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ width: '60px', height: '40px', background: '#f8fafc', backgroundImage: `url(${f.publicUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {!f.publicUrl && <ImageIcon size={20} color="#cbd5e1" />}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', color: '#0f172a', fontWeight: 500, fontSize: '0.9rem' }}>{f.name}</td>
                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{kbSize} KB</td>
                        <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.85rem' }}>{dateStr}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => handleDownload(f.publicUrl, f.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem' }} title="Download"><Download size={16} /></button>
                            <button onClick={() => setDeleteId(f.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }} title="Delete Permanently"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredFiles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <ImageIcon size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
                  <p>No images found for the selected period.</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
              gap: '1.5rem'
            }}>
              {paginatedFiles.map(f => {
                const dateStr = f.created_at ? new Date(f.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown Date';
                const kbSize = (f.metadata?.size / 1024).toFixed(1);
                return (
                  <div key={f.id} style={{
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{
                      height: '160px', 
                      backgroundColor: '#f8fafc', 
                      backgroundImage: `url(${f.publicUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {!f.publicUrl && <ImageIcon size={32} color="#cbd5e1" />}
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 0.5rem 0', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.name}
                      </h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>
                          <span style={{ color: '#475569', fontWeight: 600 }}>{kbSize} KB</span> • {dateStr}
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            onClick={() => handleDownload(f.publicUrl, f.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '0.2rem' }}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteId(f.name)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem' }}
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              {filteredFiles.length === 0 && (
                <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#64748b'}}>
                  <ImageIcon size={48} style={{opacity: 0.5, marginBottom: '1rem'}} />
                  <p>No images found for the selected period.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredFiles.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', padding: '1rem 0', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFiles.length)} of {filteredFiles.length} files
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                    cursor: currentPage === 1 ? 'default' : 'pointer'
                  }}
                >
                  &lt;
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: page === currentPage ? 'none' : '1px solid #e2e8f0', 
                      borderRadius: '6px', 
                      background: page === currentPage ? '#16a34a' : '#fff', 
                      color: page === currentPage ? '#fff' : '#64748b',
                      fontWeight: 500,
                      cursor: 'pointer'
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                    cursor: currentPage === totalPages ? 'default' : 'pointer'
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Image Permanently"
      message="Are you sure you want to permanently delete this image from storage? Any Rhema words using this image will break!"
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
