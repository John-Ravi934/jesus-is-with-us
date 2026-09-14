import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminLogin } from '../../services/authService';
import toast from 'react-hot-toast';
import styles from './AdminStyles.module.css';
import { Lock, Mail, Eye, EyeOff, AlertCircle, Heart, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState(localStorage.getItem('lockedEmail') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(() => {
    const saved = localStorage.getItem('lockoutTime');
    return saved && new Date().getTime() < parseInt(saved) ? parseInt(saved) : null;
  });
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!lockoutTime) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = lockoutTime - now;

      if (distance <= 0) {
        setLockoutTime(null);
        setTimeLeft('');
        localStorage.removeItem('lockoutTime');
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockoutTime]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLockoutTime(null);
    try {
      await adminLogin(email, password);
      toast.success('Login Successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.lockedUntil) {
        const time = new Date(err.lockedUntil).getTime();
        setLockoutTime(time);
        localStorage.setItem('lockoutTime', time.toString());
        localStorage.setItem('lockedEmail', email);
        toast.error('Account is locked due to too many failed attempts.');
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
      <img src="/assets/Cloud.webp" alt="Clouds" className={styles.bgCloud} />

      <div className={styles.loginLeftPanel}>
        <img src="/assets/cross-bible.webp" alt="Cross and Bible" className={styles.panelImage} />
        <div className={styles.panelQuote}>
          <p>"For I know the plans I have for you,"<br />declares the Lord, "plans to prosper you<br />and not to harm you, plans to give you<br />hope and a future."</p>
          <span>— Jeremiah 29:11</span>
          <img src="/assets/leaves.webp" alt="Leaves" className={styles.bgLeaves} />
        </div>
      </div>

      <div className={styles.loginCenterPanel}>
        <div className={styles.loginCardNew}>
          <div className={styles.loginHeaderNew}>
            <div className={styles.headerIconWrapper}>
              <img src="/assets/bible-icon.webp" alt="Bible Icon" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
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

            <button type="submit" className={styles.primaryBtnNew} disabled={loading || !!lockoutTime}>
              <Lock size={16} />
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>

            {lockoutTime && (
              <div style={{ marginTop: '15px', color: '#dc2626', textAlign: 'center', fontSize: '0.9rem', fontWeight: '500', background: '#fef2f2', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                Account Locked. Try again in: {timeLeft}
              </div>
            )}

            <div className={styles.loginFooterNew}>
              <div className={styles.footerLine}></div>
              <div style={{ marginTop: '0.2rem', marginBottom: '20px' }}>
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
          <p>I can do all this through him<br />who gives me strength.</p>
          <span>— Philippians 4:13</span>
        </div>
        <img src="/assets/Jesus.webp" alt="Jesus Praying" className={styles.panelImageRight} />
      </div>
    </div>
  );
}
