import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addRhema, updateRhema, getRhemaById } from '../../services/rhemaService';
import { uploadPoster } from '../../services/storageService';
import toast from 'react-hot-toast';
import { UploadCloud, CheckCircle, Save } from 'lucide-react';
import styles from './AdminStyles.module.css';

import { getCategories } from '../../services/categoryService';

const languages = ["English", "Tamil"];

export default function AddRhema() {
  const navigate = useNavigate();
  const { id } = useParams(); // If id exists, we are in Edit mode
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(true);
  const [dbCategories, setDbCategories] = useState(["Faith"]);
  const [saving, setSaving] = useState(false);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [originalPoster, setOriginalPoster] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    tamilTitle: '',
    reference: '',
    verse: '', 
    category: 'Faith',
    language: 'English',
    date: new Date().toISOString().split('T')[0],
    youtubeUrl: '',
    status: 'published',
    featured: true
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const cats = await getCategories();
      if (cats.length > 0) {
        setDbCategories(cats.map(c => c.name));
      }

      if (isEditMode) {
        const data = await getRhemaById(id);
        setFormData({
          title: data.title,
          tamilTitle: data.tamil_title || '',
          reference: data.bible_reference,
          verse: data.bible_verse,
          category: data.category,
          language: data.language,
          date: data.date,
          youtubeUrl: data.youtube_url || '',
          status: data.status,
          featured: data.featured
        });
        setPreview(data.poster_url);
        setOriginalPoster(data.poster_url);
      } else if (cats.length > 0) {
        setFormData(prev => ({ ...prev, category: cats[0].name }));
      }
    } catch (e) {
      toast.error("Failed to load details");
      if (isEditMode) navigate('/admin/rhema/library');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleSubmit = async (e, forceDraft = false) => {
    e.preventDefault();
    if (!file && !preview) {
      toast.error("Please upload a poster image!");
      return;
    }

    setSaving(true);
    try {
      let finalPosterUrl = originalPoster;

      // 1. Upload new poster to Supabase Storage if a new file was selected
      if (file) {
        const { publicUrl } = await uploadPoster(file);
        finalPosterUrl = publicUrl;
      }

      const payload = {
        title: formData.title,
        tamil_title: formData.tamilTitle,
        bible_reference: formData.reference,
        bible_verse: formData.verse,
        category: formData.category,
        language: formData.language,
        date: formData.date,
        poster_url: finalPosterUrl,
        youtube_url: formData.youtubeUrl,
        featured: formData.featured,
        status: forceDraft ? 'draft' : 'published'
      };

      // 2. Save or Update the database record using real Supabase API
      if (isEditMode) {
        await updateRhema(id, payload);
        toast.success(forceDraft ? 'Draft updated!' : 'Rhema updated successfully!');
      } else {
        await addRhema(payload);
        toast.success(forceDraft ? 'Draft saved!' : 'Rhema published successfully!');
      }
      
      navigate('/admin/rhema/library');
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{padding: '2rem'}}>Loading Rhema Details...</div>;
  }

  return (
    <div className={styles.addGrid}>
      <div className={styles.sectionBox}>
        <div className={styles.sectionHeader}>
          <h3>{isEditMode ? 'Edit Rhema Details' : 'New Rhema Details'}</h3>
        </div>
        
        <form onSubmit={(e) => handleSubmit(e, false)} id="rhemaForm">
          <div className={styles.formGroup}>
            <label>Bible Reference (e.g. Isaiah 40:31)</label>
            <div className={styles.inputWrapper}>
              <input type="text" name="reference" required value={formData.reference} onChange={handleChange} placeholder="Isaiah 40:31" />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Bible Verse Text</label>
            <div className={styles.inputWrapper}>
              <input type="text" name="verse" required value={formData.verse} onChange={handleChange} placeholder="But they that wait upon the LORD..." />
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label>Poster Title (English)</label>
              <div className={styles.inputWrapper}>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Mount Up With Wings" />
              </div>
            </div>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label>Poster Title (Tamil)</label>
              <div className={styles.inputWrapper}>
                <input type="text" name="tamilTitle" value={formData.tamilTitle} onChange={handleChange} placeholder="கழுகுகளைப் போல..." />
              </div>
            </div>
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label>Category</label>
              <div className={styles.inputWrapper}>
                <select name="category" value={formData.category} onChange={handleChange}>
                  {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formGroup} style={{flex: 1}}>
              <label>Language</label>
              <div className={styles.inputWrapper}>
                <select name="language" value={formData.language} onChange={handleChange}>
                  {languages.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Schedule Date</label>
            <div className={styles.inputWrapper}>
              <input type="date" name="date" required value={formData.date} onChange={handleChange} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>YouTube Community Post URL (Optional)</label>
            <div className={styles.inputWrapper}>
              <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://youtube.com/..." />
            </div>
          </div>

          <div className={styles.formGroup} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem'}}>
            <input type="checkbox" id="featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} style={{width: '20px', height: '20px'}} />
            <label htmlFor="featured" style={{marginBottom: 0}}>Mark as Today's Featured Rhema</label>
          </div>
        </form>
      </div>

      <div>
        <div className={styles.sectionBox}>
          <div className={styles.sectionHeader}>
            <h3>Poster Image</h3>
          </div>
          
          {!preview ? (
            <label className={styles.imageUploadArea}>
              <UploadCloud size={48} className={styles.uploadIcon} />
              <div>
                <strong>Click to upload</strong> or drag and drop<br/>
                <span style={{fontSize: '0.8rem', color: '#94A3B8'}}>PNG, JPG, WEBP (Max 5MB)</span>
              </div>
              <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} style={{display: 'none'}} />
            </label>
          ) : (
            <div style={{textAlign: 'center'}}>
              <img src={preview} alt="Preview" className={styles.previewImage} />
              <button className={styles.removeImageBtn} onClick={() => {setPreview(null); setFile(null);}}>
                {isEditMode ? 'Replace Image' : 'Remove Image'}
              </button>
              {isEditMode && !preview && (
                 <label className={styles.imageUploadArea} style={{marginTop: '1rem'}}>
                 <UploadCloud size={32} className={styles.uploadIcon} />
                 <span>Upload New Poster</span>
                 <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} style={{display: 'none'}} />
               </label>
              )}
            </div>
          )}
        </div>

        <div className={styles.sectionBox}>
          <div className={styles.sectionHeader}>
            <h3>Publish Actions</h3>
          </div>
          
          <button type="submit" form="rhemaForm" className={styles.primaryBtn} disabled={saving} style={{marginBottom: '1rem'}}>
            <CheckCircle size={20} /> {saving ? 'Saving...' : (isEditMode && formData.status === 'published' ? 'Update Rhema' : 'Publish Now')}
          </button>
          
          <button type="button" onClick={(e) => handleSubmit(e, true)} className={styles.primaryBtn} disabled={saving} style={{background: '#F1F5F9', color: '#334155'}}>
            <Save size={20} /> Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}
