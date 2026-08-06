import { useState, useEffect } from 'react';
import { getCategories, addCategory, deleteCategory } from '../../services/categoryService';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#2E7D32' });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      toast.error(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    setSubmitting(true);
    try {
      await addCategory(newCat.name, newCat.color);
      toast.success("Category added!");
      setNewCat({ name: '', color: '#2E7D32' });
      loadCategories();
    } catch (e) {
      toast.error(e.message || "Failed to add category");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCategory(deleteId);
      toast.success("Category deleted");
      loadCategories();
    } catch (e) {
      toast.error(e.message || "Failed to delete");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <>
    <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
      <div className={styles.sectionBox} style={{flex: '1 1 300px'}}>
        <div className={styles.sectionHeader}>
          <h3>Add New Category</h3>
        </div>
        <form onSubmit={handleAdd}>
          <div className={styles.formGroup}>
            <label>Category Name</label>
            <div className={styles.inputWrapper}>
              <input 
                type="text" 
                value={newCat.name} 
                onChange={e => setNewCat({...newCat, name: e.target.value})} 
                placeholder="e.g. Worship" 
                required 
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Badge Color</label>
            <div className={styles.colorPickerWrapper}>
              <input 
                type="color" 
                value={newCat.color} 
                onChange={e => setNewCat({...newCat, color: e.target.value})} 
                className={styles.colorInput}
              />
              <span className={styles.colorHex}>{newCat.color}</span>
            </div>
          </div>
          <button type="submit" className={styles.primaryBtn} disabled={submitting}>
            <Plus size={18} /> {submitting ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      <div className={styles.sectionBox} style={{flex: '2 1 500px'}}>
        <div className={styles.sectionHeader}>
          <h3>Existing Categories</h3>
        </div>
        {loading ? <p>Loading...</p> : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Color</th>
                <th>Name</th>
                <th>Slug</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{width: 24, height: 24, borderRadius: '50%', backgroundColor: c.color}}></div>
                  </td>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.slug}</td>
                  <td style={{textAlign: 'right'}}>
                    <button className={`${styles.iconBtn} ${styles.delete}`} onClick={() => setDeleteId(c.id)} title="Delete">
                      <Trash2 size={16}/>
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan="4" style={{textAlign:'center'}}>No categories found</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
    <ConfirmModal 
      isOpen={!!deleteId}
      title="Delete Category"
      message="Are you sure you want to delete this category? Any rhema words assigned to this category will keep their label."
      onConfirm={confirmDelete}
      onCancel={() => setDeleteId(null)}
    />
    </>
  );
}
