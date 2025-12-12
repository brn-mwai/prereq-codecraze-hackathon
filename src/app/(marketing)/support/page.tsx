'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function SupportPage() {
  return (
    <div className={styles.legalPage}>
      <header className={styles.legalHeader}>
        <Link href="/" className={styles.logo}>
          <Image
            src="/Logo/Logo-full.svg"
            alt="Prereq"
            width={120}
            height={40}
            priority
          />
        </Link>
      </header>

      <main className={styles.legalContent}>
        <h1>Support Center</h1>
        <p className={styles.subtitle}>
          We&apos;re here to help you get the most out of Prereq.
        </p>

        <section className={styles.supportSection}>
          <h2>Frequently Asked Questions</h2>

          <div className={styles.faqItem}>
            <h3>How do I generate a brief?</h3>
            <p>
              You can generate a brief in two ways:
            </p>
            <ol>
              <li><strong>From the Dashboard:</strong> Go to your dashboard, click &quot;New Brief,&quot; paste a LinkedIn profile URL, select your meeting goal, and click Generate.</li>
              <li><strong>From the Chrome Extension:</strong> Visit any LinkedIn profile, click the Prereq button, and a brief will be generated automatically.</li>
            </ol>
          </div>

          <div className={styles.faqItem}>
            <h3>What LinkedIn profiles can I generate briefs for?</h3>
            <p>
              You can generate briefs for any public LinkedIn profile. Private profiles or profiles
              with restricted visibility may not have all information available.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How do I install the Chrome extension?</h3>
            <ol>
              <li>Visit the Chrome Web Store and search for &quot;Prereq&quot;</li>
              <li>Click &quot;Add to Chrome&quot;</li>
              <li>Click the extension icon and sign in with your Prereq account</li>
              <li>Visit any LinkedIn profile and click the Prereq button</li>
            </ol>
          </div>

          <div className={styles.faqItem}>
            <h3>How many briefs can I generate?</h3>
            <p>
              Brief limits depend on your plan:
            </p>
            <ul>
              <li><strong>Free:</strong> 10 briefs per month</li>
              <li><strong>Starter:</strong> 50 briefs per month</li>
              <li><strong>Pro:</strong> Unlimited briefs</li>
            </ul>
            <p>
              Limits reset on the first day of each month.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Can I connect my own LinkedIn profile?</h3>
            <p>
              Yes! Go to Dashboard &gt; Settings and paste your LinkedIn profile URL.
              This allows Prereq to find common ground between you and your contacts,
              making briefs more personalized.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How accurate is the AI-generated content?</h3>
            <p>
              Our AI strives for accuracy, but generated content should be used as a starting point.
              We recommend verifying important details before your meeting. The AI works with
              publicly available information and may not capture everything about a person.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>How do I cancel my subscription?</h3>
            <p>
              Go to Dashboard &gt; Billing and click &quot;Manage Subscription.&quot; You can cancel
              anytime, and your access will continue until the end of your billing period.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>Is my data secure?</h3>
            <p>
              Yes. We use industry-standard encryption, secure authentication through Clerk,
              and never sell your personal data. Read our <Link href="/privacy">Privacy Policy</Link> for details.
            </p>
          </div>
        </section>

        <section className={styles.supportSection}>
          <h2>Troubleshooting</h2>

          <div className={styles.faqItem}>
            <h3>The extension isn&apos;t working</h3>
            <ol>
              <li>Make sure you&apos;re signed in (click the extension icon to check)</li>
              <li>Refresh the LinkedIn page</li>
              <li>Try disabling and re-enabling the extension</li>
              <li>Clear your browser cache and cookies</li>
              <li>Reinstall the extension from the Chrome Web Store</li>
            </ol>
          </div>

          <div className={styles.faqItem}>
            <h3>Brief generation is failing</h3>
            <ul>
              <li>Check that the LinkedIn URL is valid and the profile is public</li>
              <li>Verify you haven&apos;t exceeded your monthly limit</li>
              <li>Try again in a few minutes (temporary API issues)</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>

          <div className={styles.faqItem}>
            <h3>I can&apos;t sign in</h3>
            <ul>
              <li>Clear your browser cookies and try again</li>
              <li>Try a different browser</li>
              <li>Check if your email address is correct</li>
              <li>Use the &quot;Forgot Password&quot; option if needed</li>
            </ul>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2>Contact Support</h2>
          <p>
            Can&apos;t find what you&apos;re looking for? We&apos;re happy to help.
          </p>

          <div className={styles.contactMethods}>
            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/>
                </svg>
              </div>
              <h3>Email Support</h3>
              <p>Get help via email</p>
              <a href="mailto:support@brianmwai.com" className={styles.contactLink}>
                support@brianmwai.com
              </a>
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <svg width="24" height="24" viewBox="0 0 256 256" fill="currentColor">
                  <path d="M128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"/>
                </svg>
              </div>
              <h3>Response Time</h3>
              <p>We typically respond within</p>
              <span className={styles.responseTime}>24 hours</span>
            </div>
          </div>
        </section>

        <section className={styles.supportSection}>
          <h2>Useful Links</h2>
          <div className={styles.usefulLinks}>
            <Link href="/privacy" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M208,40H48A16,16,0,0,0,32,56V200a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V56A16,16,0,0,0,208,40Zm0,160H48V56H208V200ZM136,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm-4-36a12,12,0,1,1-12-12A12,12,0,0,1,132,76Z"/>
              </svg>
              Privacy Policy
            </Link>
            <Link href="/terms" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M213.66,82.34l-56-56A8,8,0,0,0,152,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,213.66,82.34ZM160,51.31,188.69,80H160ZM200,216H56V40h88V88a8,8,0,0,0,8,8h48V216Z"/>
              </svg>
              Terms of Service
            </Link>
            <Link href="/cookies" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M164.49,163.51a12,12,0,1,1-17,0A12,12,0,0,1,164.49,163.51Zm-81-8a12,12,0,1,0,17,0A12,12,0,0,0,83.51,155.51Zm9-39a12,12,0,1,0-17,0A12,12,0,0,0,92.49,116.49Zm48-1a12,12,0,1,0,0,17A12,12,0,0,0,140.49,115.51ZM128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z"/>
              </svg>
              Cookie Policy
            </Link>
            <Link href="/dashboard" className={styles.usefulLink}>
              <svg width="20" height="20" viewBox="0 0 256 256" fill="currentColor">
                <path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM48,48H208V208H48ZM152,112a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,112Zm0,32a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,144Zm0,32a8,8,0,0,1-8,8H112a8,8,0,0,1,0-16h32A8,8,0,0,1,152,176ZM88,108a12,12,0,1,1-12-12A12,12,0,0,1,88,108Zm0,36a12,12,0,1,1-12-12A12,12,0,0,1,88,144Zm0,36a12,12,0,1,1-12-12A12,12,0,0,1,88,180Z"/>
              </svg>
              Go to Dashboard
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Prereq. All rights reserved.</p>
      </footer>
    </div>
  );
}
