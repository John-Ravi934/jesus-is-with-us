import React from 'react';
import { Target } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function DivineVision({ hideSubtitle }) {
  const { t } = useLanguage();

  return (
    <section data-aos="fade-up" className="dark-section" style={{ padding: '6rem 0' }}>
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          {!hideSubtitle && (
            <span data-aos="fade-up" className="vision_label" style={{ color: 'var(--color-golden-accent)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
              {t('vision_label')}
            </span>
          )}
          <Target size={48} color="var(--color-golden-accent)" style={{ marginBottom: '1.5rem' }} />
          <h2 data-aos="fade-up" style={{ color: '#fff', fontSize: '2.5rem', margin: '1rem 0 2rem 0' }}>
            {t('vision_heading')}
          </h2>
          <blockquote
            data-aos="fade-up"
            style={{
              fontSize: '1.5rem',
              fontStyle: 'italic',
              color: 'var(--color-brand-accent)',
              borderLeft: '4px solid var(--color-brand-accent)',
              paddingLeft: '1.5rem',
              margin: '0 auto 2rem auto',
              textAlign: 'left',
              display: 'inline-block'
            }}
          >
            {t('vision_quote')}
          </blockquote>

          <div style={{ textAlign: 'left', color: '#cbd5e1', fontSize: '1.1rem', lineHeight: '1.8' }}>
            <p data-aos="fade-up" style={{ marginBottom: '1rem' }}>
              {t('vision_p1')}
            </p>
            <p data-aos="fade-up">
              {t('vision_p2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
