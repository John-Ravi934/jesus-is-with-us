import { AlertTriangle, X } from 'lucide-react';
import styles from '../../pages/admin/AdminStyles.module.css'; // Adjust path if needed

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Delete", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '400px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden', animation: 'scaleIn 0.2s ease-out'
      }}>
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{
            background: '#FEE2E2', color: '#EF4444', padding: '0.75rem', 
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#0F172A', fontWeight: 600 }}>{title}</h3>
            <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {message}
            </p>
          </div>
          <button 
            onClick={onCancel}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ 
          background: '#F8FAFC', padding: '1rem 1.5rem', 
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
          borderTop: '1px solid #E2E8F0'
        }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '0.5rem 1rem', background: '#fff', border: '1px solid #CBD5E1', 
              borderRadius: '6px', color: '#334155', fontWeight: 500, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1rem', background: '#EF4444', border: 'none', 
              borderRadius: '6px', color: '#fff', fontWeight: 500, cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
