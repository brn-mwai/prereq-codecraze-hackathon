'use client';

import { PricingCard, type PricingPlan } from './pricing-card';
import styles from './landing.module.css';

const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'For occasional use',
    features: [
      '5 briefs per month',
      'Chrome extension',
      'Basic talking points',
      'Brief history',
    ],
    ctaText: 'Get Started',
  },
  {
    name: 'Starter',
    price: 7,
    period: 'month',
    description: 'For active networkers',
    features: [
      '30 briefs per month',
      'Chrome extension',
      'Advanced talking points',
      'Common ground analysis',
      'AI Assistant chat',
    ],
    featured: true,
    ctaText: 'Get Started',
  },
  {
    name: 'Pro',
    price: 15,
    period: 'month',
    description: 'For power users',
    features: [
      '100 briefs per month',
      'Everything in Starter',
      'Calendar integration',
      'Auto meeting prep',
      'Priority support',
    ],
    ctaText: 'Get Started',
  },
];

export function PricingSection() {
  return (
    <section className={styles.section} id="pricing">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <div className={styles.pricingBetaBadge}>
            <span className={styles.badgeBeta}>Beta Pricing</span>
          </div>
          <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
          <p className={styles.sectionDesc}>
            Start free. Upgrade when you need more briefs.
          </p>
        </div>

        <div className={styles.pricingGrid}>
          {PRICING_PLANS.map((plan) => (
            <PricingCard key={plan.name} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}
