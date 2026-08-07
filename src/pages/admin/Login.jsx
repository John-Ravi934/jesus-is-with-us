import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../../services/authService';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Heart, ArrowLeft } from 'lucide-react';

import CrossBibleImg from '/assets/cross-bible.png';
import JesusImg from '/assets/Jesus.png';
import BibleIcon from '/assets/bible-icon.png';
import CloudImg from '/assets/Cloud.png';
import LeavesImg from '/assets/leaves.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    return parseInt(localStorage.getItem('adminLoginAttempts') || '0', 10);
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 2 * 60 * 1000; // 2 minutes

  useEffect(() => {
    const lockoutUntil = parseInt(localStorage.getItem('adminLockoutUntil') || '0', 10);
    const now = Date.now();
    let intervalId;

    if (lockoutUntil > now) {
      setAttempts(MAX_ATTEMPTS);
      setTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
      
      intervalId = setInterval(() => {
        const currentNow = Date.now();
        if (lockoutUntil <= currentNow) {
          setAttempts(0);
          setTimeLeft(0);
          localStorage.removeItem('adminLoginAttempts');
          localStorage.removeItem('adminLockoutUntil');
          clearInterval(intervalId);
        } else {
          setTimeLeft(Math.ceil((lockoutUntil - currentNow) / 1000));
        }
      }, 1000);

      return () => clearInterval(intervalId);
    } else if (lockoutUntil > 0 && lockoutUntil <= now) {
      setAttempts(0);
      setTimeLeft(0);
      localStorage.removeItem('adminLoginAttempts');
      localStorage.removeItem('adminLockoutUntil');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminLogin(email, password);
      toast.success('Login Successful!');
      setAttempts(0);
      localStorage.removeItem('adminLoginAttempts');
      localStorage.removeItem('adminLockoutUntil');
      navigate('/admin/dashboard');
    } catch (err) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('adminLoginAttempts', newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        toast.error('Maximum login attempts reached. Please try again later.');
        const lockoutUntil = Date.now() + LOCKOUT_DURATION;
        localStorage.setItem('adminLockoutUntil', lockoutUntil.toString());
        setTimeLeft(LOCKOUT_DURATION / 1000);
        
        const intervalId = setInterval(() => {
          const now = Date.now();
          if (lockoutUntil <= now) {
            setAttempts(0);
            setTimeLeft(0);
            localStorage.removeItem('adminLoginAttempts');
            localStorage.removeItem('adminLockoutUntil');
            clearInterval(intervalId);
          } else {
            setTimeLeft(Math.ceil((lockoutUntil - now) / 1000));
          }
        }, 1000);
      } else {
        toast.error(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginPageWrapper}>
      
      {/* Background Decorators */}
      <img src={CloudImg} alt="Clouds" className={styles.bgCloud} />

      <div className={styles.loginLeftPanel}>
        <img src={CrossBibleImg} alt="Cross and Bible" className={styles.panelImage} />
        <div className={styles.panelQuote}>
          <p>"For I know the plans I have for you,"<br/>declares the Lord, "plans to prosper you<br/>and not to harm you, plans to give you<br/>hope and a future."</p>
          <span>— Jeremiah 29:11</span>
          <img src={LeavesImg} alt="Leaves" className={styles.bgLeaves} />
        </div>
      </div>

      <div className={styles.loginCenterPanel}>
        <div className={styles.loginCardNew}>
          <div className={styles.loginHeaderNew}>
            <div className={styles.headerIconWrapper}>
              <img src={BibleIcon} alt="Bible Icon" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>
            <h2>Jesus is with us</h2>
            <p>Ministry Admin Portal</p>
          </div>
          
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroupNew}>
              <label>Email Address</label>
              <div className={styles.inputWrapperNew}>
                <Mail size={18} className={styles.inputIconNew} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@jesusiswithus.org" 
                />
              </div>
            </div>
            
            <div className={styles.formGroupNew}>
              <label>Password</label>
              <div className={styles.inputWrapperNew}>
                <Lock size={18} className={styles.inputIconNew} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  disabled={attempts >= MAX_ATTEMPTS}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={16} /> You have {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts > 1 ? 's' : ''} remaining.
              </div>
            )}
            
            {attempts >= MAX_ATTEMPTS && (
              <div style={{ color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertCircle size={16} /> Account locked due to failed attempts.
                </div>
                {timeLeft > 0 && (
                  <div style={{ fontWeight: 'bold' }}>
                    Try again in {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>
            )}

            <button type="submit" className={styles.primaryBtnNew} disabled={loading || attempts >= MAX_ATTEMPTS}>
              <Lock size={16} />
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
            
            <div className={styles.loginFooterNew}>
              <div className={styles.footerLine}></div>
              <p>Walk in faith. Serve with love.</p>
              <Heart size={16} color="var(--color-primary-green)" />
              <div style={{ marginTop: '1.5rem' }}>
                <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = '#2e7d32'} onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}>
                  <ArrowLeft size={16} /> Return Home
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className={styles.loginRightPanel}>
        <div className={styles.panelQuoteTopRight}>
          <span className={styles.quoteIconRight}>“</span>
          <p>I can do all this through him<br/>who gives me strength.</p>
          <span>— Philippians 4:13</span>
        </div>
        <img src={JesusImg} alt="Jesus Praying" className={styles.panelImageRight} />
      </div>
    </div>
  );
}
