'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function PrivacyPolicyPage() {
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
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: December 12, 2024</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Prereq (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy
            and ensuring the security of your personal information. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our website (prereq.brianmwai.com) and
            Chrome extension (collectively, the &quot;Service&quot;).
          </p>
          <p>
            By using our Service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>

          <h3>2.1 Information You Provide</h3>
          <ul>
            <li><strong>Account Information:</strong> When you create an account, we collect your name, email address, and authentication credentials through our authentication provider (Clerk).</li>
            <li><strong>LinkedIn Profile URL:</strong> When you generate a brief, you provide the LinkedIn profile URL of the person you want to research.</li>
            <li><strong>Your LinkedIn Data:</strong> If you choose to connect your LinkedIn profile, we store your professional information to find common ground with your contacts.</li>
          </ul>

          <h3>2.2 Information Collected Automatically</h3>
          <ul>
            <li><strong>Usage Data:</strong> We collect information about how you use the Service, including briefs generated, features used, and timestamps.</li>
            <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers.</li>
            <li><strong>Log Data:</strong> IP address, access times, and pages viewed.</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <ul>
            <li><strong>LinkedIn Data:</strong> We use the RapidAPI LinkedIn Data API to fetch publicly available profile information for brief generation.</li>
            <li><strong>Authentication Provider:</strong> We receive basic profile information from Clerk when you sign in.</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use the collected information for:</p>
          <ul>
            <li>Providing and maintaining the Service</li>
            <li>Generating AI-powered meeting briefs</li>
            <li>Personalizing your experience and finding common ground</li>
            <li>Processing transactions and managing subscriptions</li>
            <li>Communicating with you about updates, security alerts, and support</li>
            <li>Analyzing usage patterns to improve our Service</li>
            <li>Enforcing our terms and preventing fraud</li>
          </ul>
        </section>

        <section>
          <h2>4. Data Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party services that help us operate the Service (e.g., Clerk for authentication, Supabase for database, Anthropic/OpenAI for AI processing).</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety.</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information, including:
          </p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Secure authentication through Clerk</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication for our systems</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide the Service.
            Generated briefs are stored until you delete them or close your account. You can request deletion of your
            data at any time by contacting us.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Correct inaccurate or incomplete information</li>
            <li>Delete your personal information</li>
            <li>Export your data in a portable format</li>
            <li>Opt-out of marketing communications</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>To exercise these rights, please contact us at the email below.</p>
        </section>

        <section>
          <h2>8. Chrome Extension</h2>
          <p>Our Chrome extension:</p>
          <ul>
            <li>Stores authentication tokens locally in Chrome storage</li>
            <li>Detects LinkedIn profile URLs from your current browser tab</li>
            <li>Sends profile URLs to our servers to generate briefs</li>
            <li>Does not track your browsing history</li>
            <li>Only activates on LinkedIn.com domains</li>
          </ul>
        </section>

        <section>
          <h2>9. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember your preferences,
            and analyze usage. For more information, please see our <Link href="/cookies">Cookie Policy</Link>.
          </p>
        </section>

        <section>
          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Our Service is not intended for individuals under the age of 16. We do not knowingly collect
            personal information from children. If you believe we have collected information from a child,
            please contact us immediately.
          </p>
        </section>

        <section>
          <h2>11. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place to protect your information in accordance
            with this Privacy Policy.
          </p>
        </section>

        <section>
          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new policy on this page and updating the &quot;Last updated&quot; date. Continued use
            of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us at:
          </p>
          <ul>
            <li>Email: privacy@brianmwai.com</li>
            <li>Website: <Link href="https://prereq.brianmwai.com">prereq.brianmwai.com</Link></li>
          </ul>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/support">Support</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Prereq. All rights reserved.</p>
      </footer>
    </div>
  );
}
