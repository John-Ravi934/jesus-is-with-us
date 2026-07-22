import { Heart, Globe, BookOpen, ShieldCheck, CreditCard, Landmark } from 'lucide-react';
import styles from './Donate.module.css';

export default function Donate() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <div className={`container ${styles.heroContent}`}>
          <span className="subheading animate-fade-up">Partner With Us</span>
          <h1 className="animate-fade-up delay-100">Make An <span className="script-accent">Impact</span></h1>
        </div>
      </section>

      <section className="gray-section">
        <div className="container">
          <div className={styles.introHeader}>
            <span className="subheading">Why Give?</span>
            <h2>Your Giving Changes <span className="script-accent">Lives</span></h2>
            <p>Every seed you sow goes directly towards advancing the Gospel, helping those in need, and supporting our various outreach programs. Together, we can make a difference.</p>
          </div>

          <div className={styles.impactGrid}>
            <div className={styles.impactCard}>
              <Globe size={40} className={styles.impactIcon} />
              <h4>Global Missions</h4>
              <p>Funding crusades and church planting in remote areas.</p>
            </div>
            <div className={styles.impactCard}>
              <Heart size={40} className={styles.impactIcon} />
              <h4>Community Outreach</h4>
              <p>Feeding the hungry and providing shelter for the homeless.</p>
            </div>
            <div className={styles.impactCard}>
              <BookOpen size={40} className={styles.impactIcon} />
              <h4>Next Generation</h4>
              <p>Equipping youth and children with educational resources.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="light-section">
        <div className={`container ${styles.donationContainer}`}>
          <div className={styles.donationFormWrapper}>
            <div className={styles.toggleGroup}>
              <button className={`${styles.toggleBtn} ${styles.active}`}>Give Once</button>
              <button className={styles.toggleBtn}>Give Monthly</button>
            </div>

            <div className={styles.amountGrid}>
              <button className={styles.amountBtn}>$25</button>
              <button className={`${styles.amountBtn} ${styles.active}`}>$50</button>
              <button className={styles.amountBtn}>$100</button>
              <button className={styles.amountBtn}>$250</button>
              <button className={styles.amountBtn}>Custom</button>
            </div>

            <div className={styles.paymentPlaceholder}>
              <CreditCard size={48} color="#ccc" style={{marginBottom: '1rem'}} />
              <p>Payment Gateway Integration Placeholder</p>
              <span className={styles.secureBadge}><ShieldCheck size={16}/> Secure SSL Encryption</span>
            </div>

            <button className="btn btn-primary" style={{width: '100%', marginTop: '2rem'}}>Complete Donation</button>
          </div>

          <div className={styles.altPaymentMethods}>
            <h3>Other Ways To Give</h3>
            <div className={styles.methodCard}>
              <Landmark className={styles.methodIcon} size={24} />
              <div>
                <h4>Bank Transfer</h4>
                <p>Account Name: Jesus Is With Us</p>
                <p>Account No: 1234567890</p>
                <p>Routing: 098765432</p>
              </div>
            </div>
            <div className={styles.methodCard}>
              {/* QR Code Placeholder */}
              <div className={styles.qrPlaceholder}>QR Code</div>
              <div>
                <h4>Scan to Pay</h4>
                <p>Use your favorite UPI app to scan and give securely.</p>
              </div>
            </div>
            
            <div className={`glass-dark ${styles.transparencyBox}`}>
              <h4>Financial Transparency</h4>
              <p>We are a registered 501(c)(3) non-profit organization. All donations are tax-deductible. Annual financial reports are available upon request.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
