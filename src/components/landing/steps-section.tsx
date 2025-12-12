'use client';

import Image from 'next/image';
import styles from './landing.module.css';

function ChromeVisual() {
  return (
    <div className={styles.visualChrome}>
      <div className={styles.visualChromeBar}>
        <div className={styles.visualChromeDots}>
          <div className={styles.visualChromeDot}></div>
          <div className={styles.visualChromeDot}></div>
          <div className={styles.visualChromeDot}></div>
        </div>
        <div className={styles.visualChromeUrl}>chrome://extensions</div>
      </div>
      <div className={styles.visualChromeBody}>
        <div className={styles.visualChromeIcon}>
          <Image
            src="/Logo/Logo mark.png"
            alt="Prereq"
            width={48}
            height={48}
          />
        </div>
        <div className={styles.visualChromeText}>
          <span className={styles.visualChromeTextStrong}>Prereq</span>
          Added to Chrome
        </div>
      </div>
    </div>
  );
}

function LinkedInVisual() {
  return (
    <div className={styles.visualLinkedin}>
      <div className={styles.visualLinkedinHeader}>
        <div className={styles.visualLinkedinLogo}>in</div>
        <div className={styles.visualLinkedinSearch}>Search</div>
      </div>
      <div className={styles.visualLinkedinProfile}>
        <div className={styles.visualLinkedinAvatar}>
          <Image
            src="/Assets/Jasmine Williams.png"
            alt="Jasmine Williams"
            width={56}
            height={56}
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.visualLinkedinName}>Jasmine Williams</div>
        <div className={styles.visualLinkedinTitle}>VP Product @ Stripe</div>
      </div>
    </div>
  );
}

function BriefVisual() {
  return (
    <div className={styles.visualBrief}>
      <div className={styles.visualBriefHeader}>
        <div className={styles.visualBriefAvatar}>
          <Image
            src="/Assets/Jasmine Williams.png"
            alt="JW"
            width={32}
            height={32}
            style={{ objectFit: 'cover', borderRadius: '50%' }}
          />
        </div>
        <div>
          <div className={styles.visualBriefName}>Jasmine Williams</div>
          <div className={styles.visualBriefRole}>VP @ Stripe</div>
        </div>
      </div>
      <div className={styles.visualBriefBody}>
        <div className={styles.visualBriefSection}>
          <div className={styles.visualBriefLabel}>
            <i className="ph ph-chat-text"></i>
            Talking Points
          </div>
          <div className={styles.visualBriefItem}>
            <div className={styles.visualBriefDot}></div>
            Launched Stripe Billing v2
          </div>
          <div className={styles.visualBriefItem}>
            <div className={styles.visualBriefDot}></div>
            Stanford CS grad
          </div>
        </div>
        <div className={styles.visualBriefSection}>
          <div className={styles.visualBriefLabel}>
            <i className="ph ph-lightning"></i>
            Icebreaker
          </div>
          <div className={styles.visualBriefItem}>
            <div className={styles.visualBriefDot}></div>
            Ask about API design
          </div>
        </div>
      </div>
    </div>
  );
}

export function StepsSection() {
  return (
    <section className={`${styles.section} ${styles.sectionGray}`} id="how-it-works">
      <div className={styles.sectionInner}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionDesc}>
            Three simple steps to never walk into a meeting unprepared.
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <ChromeVisual />
            </div>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepTitle}>Install the extension</div>
            <div className={styles.stepDesc}>Add Prereq to Chrome in one click. Takes less than 10 seconds.</div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <LinkedInVisual />
            </div>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepTitle}>Visit any profile</div>
            <div className={styles.stepDesc}>Navigate to the LinkedIn profile of anyone you&apos;re about to meet.</div>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepVisual}>
              <BriefVisual />
            </div>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepTitle}>Get your brief</div>
            <div className={styles.stepDesc}>Click the Prereq button and get an instant brief with talking points.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
