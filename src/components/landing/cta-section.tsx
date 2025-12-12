'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export function CTASection() {
  return (
    <section className={styles.cta}>
      <div className={styles.ctaInner}>
        <h2 className={styles.ctaTitle}>Ready to ace every meeting?</h2>
        <p className={styles.ctaDesc}>
          Join our beta and be the first to experience the future of meeting prep.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/sign-up" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            <i className="ph ph-chrome-logo"></i>
            Join the Beta - Free
          </Link>
        </div>
      </div>
    </section>
  );
}
