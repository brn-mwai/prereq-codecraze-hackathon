'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export function HeroSection() {
  const scrollToDemo = () => {
    const element = document.getElementById('demo');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroBadge}>
          <i className="ph ph-flask"></i>
          Beta - Testing Phase Only
        </div>

        <h1 className={styles.heroTitle}>
          Know anyone in
          <br />
          <span className={styles.heroTitleHighlight}>30 seconds</span>
        </h1>

        <p className={styles.heroDesc}>
          Stop wasting 15 minutes Googling before meetings. Get instant,
          AI-powered briefs on anyone from their LinkedIn profile.
        </p>

        <div className={styles.heroButtons}>
          <Link href="/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            <i className="ph ph-chrome-logo"></i>
            Add to Chrome - Free
          </Link>
          <button
            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnLg}`}
            onClick={scrollToDemo}
          >
            <i className="ph ph-play"></i>
            Watch Demo
          </button>
        </div>

        <div className={styles.heroChecks}>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>5 free briefs/month</span>
          </div>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>No credit card required</span>
          </div>
          <div className={styles.heroCheck}>
            <i className="ph-bold ph-check-circle"></i>
            <span>Works on any LinkedIn profile</span>
          </div>
        </div>
      </div>
    </section>
  );
}
