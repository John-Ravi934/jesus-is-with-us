import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '../contexts/LanguageContext';
import styles from './Fellowship.module.css';
import { supabase } from '../lib/supabase';
import { saveMessage } from '../services/messageService';

export default function Fellowship() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (window.location.hash === '#form' || window.location.hash === '#join-form') {
      const section = document.getElementById('join-form');
      if (section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else if (window.location.hash === '#whatsapp') {
      const section = document.getElementById('whatsapp');
      if (section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  }, []);

  const groups = [
    { title: t('fel_group_1_title'), time: t('fel_group_1_time'), location: t('fel_group_1_loc'), desc: t('fel_group_1_desc') },
    { title: t('fel_group_2_title'), time: t('fel_group_2_time'), location: t('fel_group_2_loc'), desc: t('fel_group_2_desc') },
    { title: t('fel_group_3_title'), time: t('fel_group_3_time'), location: t('fel_group_3_loc'), desc: t('fel_group_3_desc') },
    { title: t('fel_group_4_title'), time: t('fel_group_4_time'), location: t('fel_group_4_loc'), desc: t('fel_group_4_desc') },
  ];

  return (
    <>
      <section data-aos="fade-up" className={styles.hero} style={{ backgroundImage: `url('/assets/fellowship.png')` }}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">{t('fel_hero_label')}</span>
          <h1 data-aos="fade-up" className="animate-fade-up delay-100">{t('fel_hero_title')}<span className="script-accent">{t('fel_hero_title_2')}</span></h1>
        </div>
      </section>

      <section data-aos="fade-up" className="light-section">
        <div className="container">
          <div className={styles.headerText}>
            <span className="subheading">{t('fel_intro_label')}</span>
            <h2 data-aos="fade-up">{t('fel_intro_title')}<span className="script-accent">{t('fel_intro_title_2')}</span>{t('fel_intro_title_3')}</h2>
            <p data-aos="fade-up">{t('fel_intro_desc')}</p>
          </div>

          <div className={styles.groupsGrid} data-aos="fade-up">
            {groups.map((group, idx) => (
              <div data-aos="fade-up" key={idx} className={styles.groupCard}>
                <div data-aos="fade-up" className={styles.cardHeader}>
                  <div className={styles.iconWrapper}>
                    <Users size={32} className={styles.groupIcon} />
                  </div>
                  <h3 data-aos="fade-up">{group.title}</h3>
                </div>
                <p data-aos="fade-up" className={styles.groupDesc}>{group.desc}</p>
                <div className={styles.groupMeta}>
                  <span><Clock size={16} /> {group.time}</span>
                  <span><MapPin size={16} /> {group.location}</span>
                </div>
                <a
                  href="#join-form"
                  className={`btn btn-secondary ${styles.joinGroupBtn}`}
                  style={{ textDecoration: 'none', textAlign: 'center' }}
                  onClick={(e) => {
                    // Smooth scroll
                    e.preventDefault();
                    const section = document.getElementById('join-form');
                    if (section) {
                      const y = section.getBoundingClientRect().top + window.scrollY - 100;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }}
                >
                  {t('fel_join_group_btn')}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section data-aos="fade-up" className="gray-section">
        <div className={`container ${styles.joinContainer}`} id="join-form">
          <div className={styles.joinForm}>
            <h3 data-aos="fade-up" style={{ color: '#090b24' }}>{t('fel_form_title')}</h3>
            <p data-aos="fade-up">{t('fel_form_desc')}</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);

                const payload = {
                  fullName: e.target[0].value,
                  email: e.target[1].value,
                  phone: e.target[2].value,
                  interest: e.target[3].options[e.target[3].selectedIndex].text,
                  message: e.target[4].value
                };

                try {
                  // Save to DB so admin can see notifications
                  await saveMessage({
                    formType: 'Fellowship',
                    fullName: payload.fullName,
                    email: payload.email,
                    phone: payload.phone,
                    subject: payload.interest,
                    message: payload.message || 'I would like to join this fellowship.'
                  }).catch(e => console.warn('Failed to save message to DB:', e));

                  // Send data to our secure Edge Function
                  const { data, error } = await supabase.functions.invoke('send-email', {
                    body: payload
                  });

                  if (error) {
                    toast.error('Failed to send request. Please try again.');
                  } else {
                    toast.success('Thank you, we will reach you soon!');
                    e.target.reset();
                  }
                } catch (err) {
                  toast.error('An unexpected error occurred.');
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className={styles.form}
            >
              <div className={styles.inputGroup}>
                <input type="text" placeholder={t('fel_form_name')} required />
                <input type="email" placeholder={t('fel_form_email')} required />
              </div>
              <input type="tel" placeholder={t('fel_form_phone')} required />
              <select required>
                <option value="">{t('fel_form_select')}</option>
                <option value="men">{t('fel_form_select_opt1')}</option>
                <option value="women">{t('fel_form_select_opt2')}</option>
                <option value="youth">{t('fel_form_select_opt3')}</option>
                <option value="bible">{t('fel_form_select_opt4')}</option>
                <option value="volunteer">{t('fel_form_select_opt5')}</option>
                <option value="sunday">{t('fel_form_select_opt6')}</option>
              </select>
              <textarea placeholder={t('fel_form_msg')} rows="4" style={{ resize: 'vertical' }}></textarea>
              <button data-aos="fade-up" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isSubmitting}>
                {isSubmitting ? t('fel_form_submitting') : t('fel_form_submit')}
              </button>
            </form>
          </div>
          <div data-aos="fade-up" className={styles.whatsappCard} id="whatsapp">
            <Heart size={48} color="#fff" style={{ marginBottom: '1rem', position: 'relative', zIndex: 2 }} />
            <h3 data-aos="fade-up">{t('fel_whatsapp_title')}</h3>
            <p data-aos="fade-up">{t('fel_whatsapp_desc')}</p>
            <a data-aos="fade-up" href="https://chat.whatsapp.com/your-invite-link" target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
              {t('fel_whatsapp_btn')}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
/ /   T r i g g e r   V e r c e l   b u i l d  
 