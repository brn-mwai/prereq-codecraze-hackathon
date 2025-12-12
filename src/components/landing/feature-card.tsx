'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import styles from './landing.module.css';

export interface FeatureCardProps {
  title: string;
  description: string;
  preview: React.ReactNode;
}

export function FeatureCard({ title, description, preview }: FeatureCardProps) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featurePreview}>{preview}</div>
      <div className={styles.featureContent}>
        <div className={styles.featureTitle}>{title}</div>
        <div className={styles.featureDesc}>{description}</div>
      </div>
    </div>
  );
}

// -------------------- Feature Preview Components --------------------

export function TimerPreview() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev >= 30) {
          // Reset after a brief pause at 30
          setTimeout(() => setCount(0), 500);
          return 30;
        }
        return prev + 1;
      });
    }, 100); // Count up over ~3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.miniTimer}>
      <div className={styles.miniTimerCircle}>{count}s</div>
      <div className={styles.miniTimerText}>
        <span className={styles.miniTimerTextStrong}>
          {count >= 30 ? 'Brief Ready' : 'Preparing...'}
        </span>
        Know anyone instantly
      </div>
    </div>
  );
}

export function ExtensionPreview() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  const items = [
    'VP Product @ Stripe',
    "Stanford CS '15",
    '3 mutual connections',
  ];

  useEffect(() => {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex < items.length) {
        setVisibleItems((prev) => [...prev, currentIndex]);
        currentIndex++;
        setTimeout(showNext, 400);
      } else {
        // Reset after showing all items
        setTimeout(() => {
          setVisibleItems([]);
          currentIndex = 0;
          setTimeout(showNext, 600);
        }, 2000);
      }
    };

    const timer = setTimeout(showNext, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.miniExtension}>
      <div className={styles.miniExtensionHeader}>
        <Image
          src="/Logo/Logo mark.png"
          alt="Prereq"
          width={16}
          height={16}
        />
      </div>
      <div className={styles.miniExtensionBody}>
        {items.map((item, index) => (
          <div
            key={index}
            className={`${styles.miniExtensionItem} ${visibleItems.includes(index) ? styles.miniExtensionItemVisible : styles.miniExtensionItemHidden}`}
          >
            <div className={styles.miniExtensionDot}></div>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TalkingPointsPreview() {
  const [visibleBubbles, setVisibleBubbles] = useState<number[]>([]);

  const bubbles = [
    'Ask about their API launch',
    'Mention AfricaTech Summit',
  ];

  useEffect(() => {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex < bubbles.length) {
        setVisibleBubbles((prev) => [...prev, currentIndex]);
        currentIndex++;
        setTimeout(showNext, 600);
      } else {
        // Reset after showing all bubbles
        setTimeout(() => {
          setVisibleBubbles([]);
          currentIndex = 0;
          setTimeout(showNext, 800);
        }, 2500);
      }
    };

    const timer = setTimeout(showNext, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.miniChat}>
      <div className={styles.miniChatHeader}>
        <div className={styles.miniChatHeaderIcon}>
          <i className="ph ph-lightbulb"></i>
        </div>
        <div className={styles.miniChatHeaderText}>Talking Points</div>
      </div>
      <div className={styles.miniChatBody}>
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className={`${styles.miniChatBubble} ${styles.miniChatBubbleBot} ${visibleBubbles.includes(index) ? styles.miniChatBubbleVisible : styles.miniChatBubbleHidden}`}
          >
            {bubble}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MutualConnectionsPreview() {
  return (
    <div className={styles.miniUsers}>
      <div className={styles.miniUsersAvatars}>
        <div className={styles.miniUsersAvatar}>
          <Image src="/Assets/Mutual Connections/1.png" alt="" width={52} height={52} />
        </div>
        <div className={styles.miniUsersAvatar}>
          <Image src="/Assets/Mutual Connections/2.png" alt="" width={52} height={52} />
        </div>
        <div className={styles.miniUsersAvatar}>
          <Image src="/Assets/Mutual Connections/3.png" alt="" width={52} height={52} />
        </div>
        <div className={`${styles.miniUsersAvatar} ${styles.miniUsersAvatarLast}`}>+5</div>
      </div>
      <div className={styles.miniUsersCount}>
        <i className="ph ph-users"></i>
        <strong>8</strong> mutual connections
      </div>
    </div>
  );
}

export function AIAssistantPreview() {
  const [visibleBubbles, setVisibleBubbles] = useState<number[]>([]);

  const bubbles = [
    { text: 'How can I help you prepare?', isBot: true },
    { text: 'Meeting with a VC', isBot: false },
    { text: 'Here are key points...', isBot: true },
  ];

  useEffect(() => {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex < bubbles.length) {
        setVisibleBubbles((prev) => [...prev, currentIndex]);
        currentIndex++;
        setTimeout(showNext, 800);
      } else {
        // Reset after showing all bubbles
        setTimeout(() => {
          setVisibleBubbles([]);
          currentIndex = 0;
          setTimeout(showNext, 1000);
        }, 3000);
      }
    };

    const timer = setTimeout(showNext, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.miniChat}>
      <div className={styles.miniChatHeader}>
        <div className={styles.miniChatHeaderIcon}>
          <Image src="/Assets/AI Orb.png" alt="Sage" width={24} height={24} />
        </div>
        <div className={styles.miniChatHeaderText}>Sage</div>
      </div>
      <div className={styles.miniChatBody}>
        {bubbles.map((bubble, index) => (
          <div
            key={index}
            className={`${styles.miniChatBubble} ${bubble.isBot ? styles.miniChatBubbleBot : styles.miniChatBubbleUser} ${visibleBubbles.includes(index) ? styles.miniChatBubbleVisible : styles.miniChatBubbleHidden}`}
          >
            {bubble.text}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HistoryPreview() {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);

  const items = [
    { initials: 'JW', name: 'Jasmine Williams', time: '2h ago' },
    { initials: 'MJ', name: 'Mike Johnson', time: 'Yesterday' },
    { initials: 'EW', name: 'Emily Wong', time: '2 days ago' },
  ];

  useEffect(() => {
    let currentIndex = 0;

    const showNext = () => {
      if (currentIndex < items.length) {
        setVisibleItems((prev) => [...prev, currentIndex]);
        currentIndex++;
        setTimeout(showNext, 400);
      } else {
        // Reset after showing all items
        setTimeout(() => {
          setVisibleItems([]);
          currentIndex = 0;
          setTimeout(showNext, 800);
        }, 2500);
      }
    };

    const timer = setTimeout(showNext, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={styles.miniHistory}>
      <div className={styles.miniHistoryHeader}>
        <i className="ph ph-clock-counter-clockwise"></i>
        Recent Briefs
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          className={`${styles.miniHistoryItem} ${visibleItems.includes(index) ? styles.miniHistoryItemVisible : styles.miniHistoryItemHidden}`}
        >
          <div className={styles.miniHistoryAvatar}>{item.initials}</div>
          <div className={styles.miniHistoryInfo}>
            <div className={styles.miniHistoryName}>{item.name}</div>
            <div className={styles.miniHistoryTime}>{item.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
