import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addRhema, updateRhema, getRhemaById } from '../../services/rhemaService';
import { uploadPoster } from '../../services/storageService';
import toast from 'react-hot-toast';
import { UploadCloud, Save, FileEdit, BookOpen, Folder, Globe, Calendar, Link as LinkIcon, Image as ImageIcon, Send, Info, Check } from 'lucide-react';
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
  const [enableEnglish, setEnableEnglish] = useState(true);

  const [tamilFile, setTamilFile] = useState(null);
  const [tamilPreview, setTamilPreview] = useState(null);
  const [originalTamilPoster, setOriginalTamilPoster] = useState(null);
  
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
        const getValidUrl = (url) => url && typeof url === 'string' && url.startsWith('http') ? url : null;
        setPreview(getValidUrl(data.poster_url));
        setOriginalPoster(getValidUrl(data.poster_url));
        setEnableEnglish(!!getValidUrl(data.poster_url));
        setTamilPreview(getValidUrl(data.tamil_poster_url));
        setOriginalTamilPoster(getValidUrl(data.tamil_poster_url));
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

  const handleTamilImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setTamilFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setTamilPreview(url);
    }
  };

  const handleSubmit = async (e, forceDraft = false) => {
    e.preventDefault();
    if (!tamilFile && !tamilPreview) {
      toast.error("Please upload a Tamil poster image!");
      return;
    }
    if (enableEnglish && !file && !preview) {
      toast.error("Please upload an English poster image!");
      return;
    }

    setSaving(true);
    try {
      let finalPosterUrl = enableEnglish ? originalPoster : '';
      let finalTamilPosterUrl = originalTamilPoster;

      // 1. Upload new poster to Supabase Storage if a new file was selected
      if (enableEnglish && file) {
        const { publicUrl } = await uploadPoster(file);
        finalPosterUrl = publicUrl;
      }
      
      if (tamilFile) {
        const { publicUrl } = await uploadPoster(tamilFile);
        finalTamilPosterUrl = publicUrl;
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
        tamil_poster_url: finalTamilPosterUrl,
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
    <div style={{ position: 'relative' }}>
      <div className={styles.publishGrid}>
        
        {/* LEFT COLUMN: Rhema Details */}
        <div className={styles.publishMainColumn}>
          <div className={styles.detailsCard}>
            <div className={styles.detailsHeader}>
              <div className={styles.detailsIconWrapper}>
                <FileEdit size={24} color="#10b981" />
              </div>
              <div>
                <h3 className={styles.detailsTitle}>Rhema Details</h3>
                <p className={styles.detailsSubtitle}>Fill in the details below to publish a new Rhema.</p>
              </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e, false)} id="rhemaForm" className={styles.detailsForm}>
              <div className={styles.sectionDivider}>
                <span className={styles.sectionBadge}>BIBLE INFORMATION</span>
              </div>

              <div className={styles.formGroup}>
                <label>Bible Reference (e.g. Isaiah 40:31)</label>
                <div className={styles.inputWithIconRight}>
                  <input type="text" name="reference" required value={formData.reference} onChange={handleChange} placeholder="Isaiah 40:31" />
                  <BookOpen className={styles.inputIconIconRight} size={18} />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Bible Verse Text</label>
                <div className={styles.textareaWrapper}>
                  <textarea 
                    name="verse" 
                    required 
                    value={formData.verse} 
                    onChange={handleChange} 
                    placeholder="But they that wait upon the LORD..." 
                    rows={4}
                    maxLength={500}
                  ></textarea>
                  <span className={styles.charCount}>{formData.verse.length} / 500</span>
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Poster Title (English)</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleChange} placeholder="Mount Up With Wings" className={styles.standardInput} />
                </div>
                <div className={styles.formGroup}>
                  <label>Poster Title (Tamil)</label>
                  <input type="text" name="tamilTitle" value={formData.tamilTitle} onChange={handleChange} placeholder="சிறகுகளோடு மேலேற..." className={styles.standardInput} />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <div className={styles.inputWithIconLeft}>
                    <Folder className={styles.inputIconIconLeft} size={18} />
                    <select name="category" value={formData.category} onChange={handleChange} className={styles.hasLeftIcon}>
                      {dbCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Language</label>
                  <div className={styles.inputWithIconLeft}>
                    <Globe className={styles.inputIconIconLeft} size={18} />
                    <select name="language" value={formData.language} onChange={handleChange} className={styles.hasLeftIcon}>
                      {languages.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Schedule Date</label>
                <div className={styles.inputWithIconLeft}>
                  <Calendar className={styles.inputIconIconLeft} size={18} />
                  <input type="date" name="date" required value={formData.date} onChange={handleChange} className={styles.hasLeftIcon} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>YouTube Community Post URL (Optional)</label>
                <div className={styles.inputWithIconLeft}>
                  <LinkIcon className={styles.inputIconIconLeft} size={18} />
                  <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} placeholder="https://youtube.com/..." className={styles.hasLeftIcon} />
                </div>
              </div>

              <div className={`${styles.featuredToggleBox} ${formData.featured ? styles.activeBox : ''}`} onClick={() => setFormData({...formData, featured: !formData.featured})}>
                <div className={`${styles.customCheckbox} ${formData.featured ? styles.checked : ''}`}>
                  {formData.featured && <Check size={16} strokeWidth={4} color="#ffffff" />}
                </div>
                <div className={styles.featuredText}>
                  <h4>Mark as Today's Featured Rhema</h4>
                  <p>This will highlight the Rhema on today's section.</p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Uploads & Actions */}
        <div className={styles.publishSideColumn}>
          
          <div className={styles.uploadCard}>
            <div className={styles.uploadHeader}>
              <div className={styles.uploadIconWrapperPurple}>
                <ImageIcon size={18} color="#a855f7" />
              </div>
              <h4>Poster Image (Tamil)</h4>
            </div>
            {!tamilPreview ? (
              <label className={styles.uploadAreaPurple}>
                <UploadCloud size={36} color="#a855f7" style={{marginBottom: '0.75rem'}} />
                <div className={styles.uploadTextBold}>Drag & drop or click to upload</div>
                <div className={styles.uploadTextSub}>PNG, JPG, WEBP (Max 5MB)</div>
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleTamilImageUpload} style={{display: 'none'}} />
              </label>
            ) : (
              <div className={styles.previewContainer}>
                <img src={tamilPreview} alt="Preview" className={styles.previewImageFull} />
                <button className={styles.removeBtnOverlay} onClick={() => {setTamilPreview(null); setTamilFile(null);}}>Remove Image</button>
              </div>
            )}
          </div>

          <div className={`${styles.uploadCard} ${!enableEnglish ? styles.disabledCard : ''}`}>
            <div className={styles.uploadHeaderFlex}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className={styles.uploadIconWrapperGreen}>
                  <ImageIcon size={18} color="#10b981" />
                </div>
                <h4 style={{ color: enableEnglish ? '#0f172a' : '#94a3b8' }}>Poster Image (English)</h4>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}} onClick={() => setEnableEnglish(!enableEnglish)}>
                <span className={styles.toggleLabel} style={{ color: enableEnglish ? '#10b981' : '#94a3b8' }}>
                  {enableEnglish ? 'Enabled' : 'Disabled'}
                </span>
                <div className={`${styles.toggleSwitch} ${enableEnglish ? styles.active : ''}`}>
                  <div className={styles.toggleHandle}></div>
                </div>
              </div>
            </div>
            {enableEnglish && (
              !preview ? (
                <label className={styles.uploadAreaGreen}>
                  <UploadCloud size={36} color="#10b981" style={{marginBottom: '0.75rem'}} />
                  <div className={styles.uploadTextBold}>Drag & drop or click to upload</div>
                  <div className={styles.uploadTextSub}>PNG, JPG, WEBP (Max 5MB)</div>
                  <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} style={{display: 'none'}} />
                </label>
              ) : (
                <div className={styles.previewContainer}>
                  <img src={preview} alt="Preview" className={styles.previewImageFull} />
                  <button className={styles.removeBtnOverlay} onClick={() => {setPreview(null); setFile(null);}}>Remove Image</button>
                </div>
              )
            )}
          </div>

          <div className={styles.actionCard}>
            <div className={styles.uploadHeader}>
              <div className={styles.actionIconWrapper}>
                <Send size={18} color="#f59e0b" />
              </div>
              <div>
                <h4>Publish Actions</h4>
                <p className={styles.actionSub}>Choose an action to continue</p>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button type="submit" form="rhemaForm" className={styles.publishNowBtn} disabled={saving}>
                <Send size={18} /> {saving ? 'Saving...' : (isEditMode && formData.status === 'published' ? 'Update Now' : 'Publish Now')}
              </button>
              <button type="button" onClick={(e) => handleSubmit(e, true)} className={styles.saveDraftBtn} disabled={saving}>
                <Save size={18} /> {isEditMode && formData.status === 'draft' ? 'Update Draft' : 'Save as Draft'}
              </button>
            </div>
          </div>

          {/* Footer Banner - Moved under Actions */}
          <div className={styles.footerBanner}>
            <div className={styles.footerIconBox}>
              <Info size={18} />
            </div>
            <div><strong>Note:</strong> You can save as draft and publish later from the Rhema Library.</div>
          </div>

        </div>
      </div>
    </div>
  );
}
