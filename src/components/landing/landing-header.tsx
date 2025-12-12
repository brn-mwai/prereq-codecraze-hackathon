'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';

interface LandingHeaderProps {
  onMobileMenuClick: () => void;
}

export function LandingHeader({ onMobileMenuClick }: LandingHeaderProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/Logo/Logo-full.svg"
              alt="Prereq"
              width={120}
              height={40}
              className={styles.logoImg}
              priority
            />
          </Link>
          <span className={styles.badgeBeta}>Beta</span>
        </div>

        <nav className={styles.desktopNav}>
          <button
            className={styles.navLink}
            onClick={() => scrollToSection('features')}
          >
            Features
          </button>
          <button
            className={styles.navLink}
            onClick={() => scrollToSection('how-it-works')}
          >
            How it works
          </button>
          <button
            className={styles.navLink}
            onClick={() => scrollToSection('pricing')}
          >
            Pricing
          </button>
        </nav>

        <div className={styles.navActions}>
          <Link href="/sign-in" className={`${styles.btn} ${styles.btnGhost}`}>
            Sign in
          </Link>
          <Link href="/sign-up" className={`${styles.btn} ${styles.btnPrimary}`}>
            Get Started
          </Link>
        </div>

        <button
          className={styles.mobileMenuBtn}
          onClick={onMobileMenuClick}
          aria-label="Open menu"
        >
          <i className="ph ph-list"></i>
        </button>
      </div>
    </header>
  );
}
