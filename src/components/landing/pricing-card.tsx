'use client';

import Link from 'next/link';
import styles from './landing.module.css';

export interface PricingPlan {
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  ctaText?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
}

export function PricingCard({ plan }: PricingCardProps) {
  const {
    name,
    price,
    period,
    description,
    features,
    featured = false,
    ctaText = 'Get Started',
  } = plan;

  return (
    <div className={`${styles.pricingCard} ${featured ? styles.pricingCardFeatured : ''}`}>
      {featured && (
        <div className={styles.pricingFeaturedBadge}>Popular</div>
      )}

      <div className={styles.pricingName}>{name}</div>

      <div className={styles.pricingPrice}>
        ${price}
        <span className={styles.pricingPeriod}>/{period}</span>
      </div>

      <div className={styles.pricingDesc}>{description}</div>

      <ul className={styles.pricingFeatures}>
        {features.map((feature, index) => (
          <li key={index} className={styles.pricingFeature}>
            <i className="ph-bold ph-check" style={{ color: 'var(--primary-500)' }}></i>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href="/sign-up"
        className={`${styles.btn} ${featured ? styles.btnPrimary : styles.btnOutline}`}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {ctaText}
      </Link>
    </div>
  );
}
