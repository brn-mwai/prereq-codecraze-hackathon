'use client';

import Image from 'next/image';
import styles from './landing.module.css';

export function PreviewSection() {
  return (
    <section className={`${styles.section} ${styles.sectionGray}`} id="demo">
      <div className={styles.preview}>
        <div className={styles.previewInner}>
          <div className={styles.previewHeader}>
            <div className={styles.previewDot}></div>
            <div className={styles.previewDot}></div>
            <div className={styles.previewDot}></div>
          </div>
          <div className={styles.previewContent}>
            {/* LinkedIn Mock */}
            <div className={styles.linkedinMock}>
              <div className={styles.linkedinHeader}>
                <div className={styles.linkedinLogo}>in</div>
                <div className={styles.linkedinSearch}>Search</div>
              </div>
              <div className={styles.linkedinProfile}>
                <div className={styles.linkedinCover}>
                  <Image
                    src="/Assets/banner-prereq.png"
                    alt="Cover"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.linkedinAvatar}>
                  <Image
                    src="/Assets/Jasmine Williams.png"
                    alt="Jasmine Williams"
                    width={100}
                    height={100}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.linkedinName}>Jasmine Williams</div>
                <div className={styles.linkedinTitle}>VP of Product at Stripe | Ex-Airbnb, Ex-Google</div>
                <div className={styles.linkedinLocation}>
                  <i className="ph ph-map-pin"></i>
                  San Francisco Bay Area
                </div>
                <div className={styles.linkedinStats}>
                  <span>500+ connections</span>
                  <span>12 mutual</span>
                </div>
                <div className={styles.linkedinAbout}>
                  <div className={styles.linkedinAboutTitle}>About</div>
                  <div className={styles.linkedinAboutText}>
                    Passionate product leader with 10+ years building user-centric experiences at scale. I specialize in API platforms and developer tools, helping companies turn complex infrastructure into intuitive products.
                  </div>
                </div>
                <div className={styles.linkedinFiller}>
                  <div className={styles.linkedinFillerBar} style={{ width: '100%' }}></div>
                  <div className={styles.linkedinFillerBar} style={{ width: '85%' }}></div>
                  <div className={styles.linkedinFillerBar} style={{ width: '70%' }}></div>
                </div>
                <div className={styles.linkedinFiller}>
                  <div className={styles.linkedinFillerBar} style={{ width: '100%' }}></div>
                  <div className={styles.linkedinFillerBar} style={{ width: '90%' }}></div>
                  <div className={styles.linkedinFillerBar} style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>

            {/* Extension Sidebar */}
            <div className={styles.extensionSidebar}>
              <div className={styles.extensionHeader}>
                <div className={styles.extensionLogo}>
                  <Image
                    src="/Logo/Logo mark.png"
                    alt="Prereq"
                    width={32}
                    height={32}
                    className={styles.extensionLogoImg}
                  />
                </div>
                <span className={styles.badgeBetaSmall}>Beta</span>
              </div>
              <div className={styles.extensionBody}>
                <div className={styles.briefHeader}>
                  <div className={styles.briefAvatar}>
                    <Image
                      src="/Assets/Jasmine Williams.png"
                      alt="Jasmine Williams"
                      width={48}
                      height={48}
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                    />
                  </div>
                  <div className={styles.briefInfo}>
                    <div className={styles.briefName}>Jasmine Williams</div>
                    <div className={styles.briefHeadline}>VP Product @ Stripe | Ex-Airbnb</div>
                  </div>
                </div>

                <div className={styles.briefSection}>
                  <div className={styles.briefSectionHeader}>
                    <i className="ph ph-user"></i>
                    About
                  </div>
                  <div className={styles.briefSectionContent}>
                    <div className={styles.briefAbout}>
                      Passionate product leader with 10+ years building user-centric experiences at scale. Specializes in API platforms and developer tools.
                    </div>
                  </div>
                </div>

                <div className={styles.briefSection}>
                  <div className={styles.briefSectionHeader}>
                    <i className="ph ph-chat-text"></i>
                    Talking Points
                  </div>
                  <div className={styles.briefSectionContent}>
                    <div className={styles.briefBullet}>Just launched Stripe Billing v2 - major API overhaul</div>
                    <div className={styles.briefBullet}>Stanford CS grad, same year as your connection John Doe</div>
                    <div className={styles.briefBullet}>Writes frequently about API design patterns</div>
                  </div>
                </div>

                <div className={styles.briefSection}>
                  <div className={styles.briefSectionHeader}>
                    <i className="ph ph-users"></i>
                    Common Ground
                  </div>
                  <div className={styles.briefSectionContent}>
                    <div className={styles.briefBullet}>Both spoke at AfricaTech Summit 2024</div>
                    <div className={styles.briefBullet}>Mutual: John Doe, Jane Smith, Alex Wong</div>
                  </div>
                </div>

                <div className={styles.briefSection}>
                  <div className={styles.briefSectionHeader}>
                    <i className="ph ph-lightning"></i>
                    Icebreaker
                  </div>
                  <div className={styles.briefIcebreaker}>
                    &ldquo;Saw your thread on rate limiting strategies - we hit the same scaling issue at our Series A...&rdquo;
                  </div>
                </div>

                <div className={styles.briefFooter}>
                  <button className={styles.briefAction}>
                    <i className="ph ph-copy"></i>
                    Copy
                  </button>
                  <button className={styles.briefAction}>
                    <i className="ph ph-arrow-clockwise"></i>
                    Refresh
                  </button>
                  <button className={styles.briefAction}>
                    <i className="ph ph-bookmark-simple"></i>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
