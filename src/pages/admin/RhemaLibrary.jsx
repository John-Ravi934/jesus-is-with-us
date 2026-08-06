import { useState, useEffect } from 'react';
import { getRhemaWords, deleteRhema } from '../../services/rhemaService';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Eye, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function RhemaLibrary() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getRhemaWords();
      setData(result);
    } catch (e) {
      toast.error(e.message || "Failed to load library");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteRhema(deleteId);
      toast.success("Deleted successfully");
      loadData();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  const filteredData = data.filter(r => 
    r.bible_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    <div className={styles.sectionBox}>
      <div className={styles.sectionHeader}>
        <h3>Rhema Library</h3>
        <button onClick={() => navigate('/admin/rhema/add')} className={styles.primaryBtn} style={{width: 'auto', padding: '0.6rem 1.2rem'}}>
          <Plus size={18} /> Add New
        </button>
      </div>
      
      <div style={{marginBottom: '1.5rem', display: 'flex', gap: '1rem'}}>
        <div className={styles.inputWrapper} style={{maxWidth: '300px'}}>
          <Search size={18} className={styles.inputIcon} />
          <input 
            type="text" 
            placeholder="Search reference or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div style={{overflowX: 'auto'}}>
        {loading ? (
          <p style={{textAlign: 'center', padding: '2rem'}}>Loading library from Supabase...</p>
        ) : (
          <div style={{overflowX: "auto"}}><table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Reference</th>
                <th>Category</th>
                <th>Date</th>
                <th>Views</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(r => {
                const getValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http') ? url : '';
                const thumbUrl = getValidUrl(r.tamil_poster_url) ? r.tamil_poster_url : (getValidUrl(r.poster_url) ? r.poster_url : '');
                return (
                <tr key={r.id}>
                  <td>
                    <img src={thumbUrl} alt="thumb" style={{width: 50, height: 50, objectFit: 'cover', borderRadius: 6}} />
                  </td>
                  <td>
                    <strong>{r.bible_reference}</strong>
                    <div style={{fontSize: '0.8rem', color: '#64748B'}}>{r.title}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>{new Date(r.date).toLocaleDateString('en-GB')}</td>
                  <td>{r.views}</td>
                  <td><span className={`${styles.statusBadge} ${styles[r.status]}`}>{r.status}</span></td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className={styles.iconBtn} title="Preview" onClick={() => window.open(thumbUrl, '_blank')}>
                        <Eye size={16}/>
                      </button>
                      <button className={styles.iconBtn} title="Edit" onClick={() => navigate(`/admin/rhema/edit/${r.id}`)}>
                        <Edit2 size={16}/>
                      </button>
                      <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => setDeleteId(r.id)} title="Delete"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              )})}
              {filteredData.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No Rhema words found in Database.</td></tr>}
            </tbody>
          </table></div>
        )}
      </div>
    </div>
    
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Rhema Word"
      message="Are you sure you want to delete this Rhema word? This cannot be undone."
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
