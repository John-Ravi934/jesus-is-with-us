import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import NotFoundImage from '/assets/404 image.png';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.container}>
      
      {/* LEFT CONTENT */}
      <div className={styles.leftContent}>
        
        <h1 data-aos="fade-up" className={styles.title}>404</h1>
        
        <h2 data-aos="fade-up" className={styles.subtitle}>Looks like you've taken a<br/>wrong turn.</h2>

        <p data-aos="fade-up" className={styles.description}>
          Let's help you get back on<br/>the right path.
        </p>
        
        <Link 
          to="/" 
          className={styles.homeButton}
        >
          <Home size={20} />
          Back to Home
        </Link>

        {/* QUOTE BOX */}
        <div className={styles.quoteBox}>
          <span className={styles.quoteMark}>“</span>
          <p data-aos="fade-up" className={styles.quoteText}>
            Whether you turn to the right or<br/>to the left, your ears will hear a<br/>voice behind you, saying,<br/>'This is the way; walk in it.'
          </p>
          <p data-aos="fade-up" className={styles.quoteRef}>— Isaiah 30:21</p>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <div className={styles.rightContent}>
        <img data-aos="fade-up" 
          src={NotFoundImage} 
          alt="Man at crossroads looking at cross" 
          className={styles.image}
        />
      </div>

    </div>
  );
}
