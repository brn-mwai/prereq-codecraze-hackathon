'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';

export function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLogo}>
          <Image
            src="/Logo/Logo-full.svg"
            alt="Prereq"
            width={100}
            height={28}
            className={styles.footerLogoImg}
          />
          <span className={styles.badgeBetaSmall}>Beta</span>
        </div>

        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>
            Privacy
          </Link>
          <Link href="/terms" className={styles.footerLink}>
            Terms
          </Link>
          <Link href="/cookies" className={styles.footerLink}>
            Cookies
          </Link>
          <Link href="/support" className={styles.footerLink}>
            Support
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerLink}
            title="GitHub"
          >
            <i className="ph ph-github-logo" style={{ fontSize: '1.25rem' }}></i>
          </a>
        </div>

        <div className={styles.footerCopyright}>
          &copy; {new Date().getFullYear()} Prereq. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
