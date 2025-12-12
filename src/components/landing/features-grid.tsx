'use client';

import {
  FeatureCard,
  TimerPreview,
  ExtensionPreview,
  TalkingPointsPreview,
  MutualConnectionsPreview,
  AIAssistantPreview,
  HistoryPreview,
} from './feature-card';
import styles from './landing.module.css';

const FEATURES = [
  {
    title: '30-Second Briefs',
    description:
      'Get everything you need to know about anyone in seconds, not minutes of Googling.',
    preview: <TimerPreview />,
  },
  {
    title: 'Chrome Extension',
    description:
      'One-click briefs directly on LinkedIn. No copy-pasting URLs or switching tabs.',
    preview: <ExtensionPreview />,
  },
  {
    title: 'Smart Talking Points',
    description:
      'AI-generated conversation starters based on their recent activity and your background.',
    preview: <TalkingPointsPreview />,
  },
  {
    title: 'Mutual Connections',
    description:
      'Instantly see who you know in common and leverage warm introductions.',
    preview: <MutualConnectionsPreview />,
  },
  {
    title: 'AI Assistant',
    description:
      'Chat with our AI to get deeper insights and personalized meeting strategies.',
    preview: <AIAssistantPreview />,
  },
  {
    title: 'Brief History',
    description:
      'Access your past briefs anytime. Perfect for follow-up meetings.',
    preview: <HistoryPreview />,
  },
];

export function FeaturesGrid() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need to prepare</h2>
          <p className={styles.sectionDesc}>
            From Chrome extension to web dashboard, we&apos;ve got your meeting prep
            covered.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              preview={feature.preview}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
