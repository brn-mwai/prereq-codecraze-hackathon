'use client';

import Link from 'next/link';
import Image from 'next/image';
import styles from '../legal.module.css';

export default function TermsOfServicePage() {
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
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: December 12, 2024</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using Prereq (&quot;Service&quot;), operated by Prereq (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;),
            you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
            please do not use the Service.
          </p>
          <p>
            These Terms apply to all visitors, users, and others who access or use the Service, including
            the website at prereq.brianmwai.com and the Prereq Chrome extension.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Prereq is an AI-powered meeting preparation tool that generates briefs from LinkedIn profiles.
            The Service helps users prepare for professional meetings by providing insights, talking points,
            and conversation starters based on publicly available LinkedIn profile data.
          </p>
        </section>

        <section>
          <h2>3. Account Registration</h2>
          <p>To use certain features of the Service, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Maintain and update your information to keep it accurate</li>
            <li>Maintain the security of your account credentials</li>
            <li>Accept responsibility for all activities that occur under your account</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms or
            for any other reason at our sole discretion.
          </p>
        </section>

        <section>
          <h2>4. Acceptable Use</h2>
          <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
          <ul>
            <li>Use the Service to stalk, harass, or harm another person</li>
            <li>Impersonate any person or entity or falsely state your affiliation</li>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Interfere with or disrupt the Service or servers/networks connected to it</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
            <li>Circumvent usage limits or restrictions</li>
            <li>Reverse engineer or attempt to extract source code from the Service</li>
            <li>Use the Service to collect data for competitive purposes</li>
            <li>Resell or redistribute the Service without authorization</li>
          </ul>
        </section>

        <section>
          <h2>5. LinkedIn Data Usage</h2>
          <p>
            Our Service accesses publicly available LinkedIn profile data through authorized third-party APIs.
            By using the Service, you acknowledge that:
          </p>
          <ul>
            <li>We only access publicly available profile information</li>
            <li>You will use the generated briefs for legitimate professional purposes</li>
            <li>You will not use the Service to gather data for spam, harassment, or illegal activities</li>
            <li>LinkedIn&apos;s terms of service may apply to your use of information about their users</li>
          </ul>
        </section>

        <section>
          <h2>6. Subscription Plans and Billing</h2>
          <h3>6.1 Free Plan</h3>
          <p>
            We offer a free plan with limited brief generation. Free plan users are subject to
            monthly usage limits as displayed in the Service.
          </p>

          <h3>6.2 Paid Plans</h3>
          <p>
            Paid subscription plans offer additional features and higher usage limits.
            By subscribing to a paid plan:
          </p>
          <ul>
            <li>You authorize us to charge your payment method on a recurring basis</li>
            <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
            <li>Price changes will be communicated in advance</li>
            <li>Refunds are provided in accordance with our refund policy</li>
          </ul>

          <h3>6.3 Cancellation</h3>
          <p>
            You may cancel your subscription at any time through your account settings.
            Cancellation takes effect at the end of the current billing period.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <h3>7.1 Our Content</h3>
          <p>
            The Service and its original content (excluding user content), features, and functionality
            are owned by Prereq and are protected by international copyright, trademark, and other
            intellectual property laws.
          </p>

          <h3>7.2 Your Content</h3>
          <p>
            You retain ownership of any content you provide to the Service. By providing content,
            you grant us a license to use, store, and process it to provide the Service.
          </p>

          <h3>7.3 Generated Briefs</h3>
          <p>
            Briefs generated by the Service are provided for your personal or internal business use.
            You may use generated briefs for meeting preparation but may not resell or redistribute them.
          </p>
        </section>

        <section>
          <h2>8. AI-Generated Content Disclaimer</h2>
          <p>
            The briefs and insights generated by our Service are created using artificial intelligence.
            While we strive for accuracy:
          </p>
          <ul>
            <li>AI-generated content may contain errors or inaccuracies</li>
            <li>Information should be verified before making important decisions</li>
            <li>We do not guarantee the completeness or reliability of generated content</li>
            <li>You are responsible for how you use the generated information</li>
          </ul>
        </section>

        <section>
          <h2>9. Privacy</h2>
          <p>
            Your use of the Service is also governed by our <Link href="/privacy">Privacy Policy</Link>,
            which describes how we collect, use, and protect your information.
          </p>
        </section>

        <section>
          <h2>10. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            We do not warrant that the Service will be uninterrupted, secure, or error-free,
            or that any defects will be corrected.
          </p>
        </section>

        <section>
          <h2>11. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, PREREQ SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS,
            DATA, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE SERVICE.
          </p>
          <p>
            Our total liability for any claims arising from the Service shall not exceed the
            amount you paid us in the twelve months preceding the claim.
          </p>
        </section>

        <section>
          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Prereq, its officers, directors, employees,
            and agents from any claims, damages, losses, or expenses arising from your use of
            the Service or violation of these Terms.
          </p>
        </section>

        <section>
          <h2>13. Modifications to Service</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue the Service (or any part thereof)
            at any time with or without notice. We shall not be liable to you or any third party
            for any modification, suspension, or discontinuation.
          </p>
        </section>

        <section>
          <h2>14. Changes to Terms</h2>
          <p>
            We may revise these Terms at any time by posting the updated terms on this page.
            Your continued use of the Service after changes are posted constitutes acceptance
            of the revised Terms.
          </p>
        </section>

        <section>
          <h2>15. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Kenya,
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>16. Dispute Resolution</h2>
          <p>
            Any disputes arising from these Terms or the Service shall first be attempted to be
            resolved through good-faith negotiation. If negotiation fails, disputes shall be
            resolved through binding arbitration or in the courts of Kenya.
          </p>
        </section>

        <section>
          <h2>17. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable, the remaining provisions
            will continue in full force and effect.
          </p>
        </section>

        <section>
          <h2>18. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us at:</p>
          <ul>
            <li>Email: legal@brianmwai.com</li>
            <li>Website: <Link href="https://prereq.brianmwai.com">prereq.brianmwai.com</Link></li>
          </ul>
        </section>
      </main>

      <footer className={styles.legalFooter}>
        <div className={styles.footerLinks}>
          <Link href="/">Home</Link>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/cookies">Cookie Policy</Link>
          <Link href="/support">Support</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} Prereq. All rights reserved.</p>
      </footer>
    </div>
  );
}
