'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  reset_date: string;
  plan: 'free' | 'starter' | 'pro';
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    briefs: 10,
    features: [
      '10 briefs per month',
      'Chrome extension',
      'Basic talking points',
      'Brief history',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$7',
    period: '/month',
    briefs: 30,
    popular: true,
    features: [
      '30 briefs per month',
      'Chrome extension',
      'Advanced talking points',
      'Common ground analysis',
      'Sage AI chat',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$15',
    period: '/month',
    briefs: 100,
    features: [
      '100 briefs per month',
      'Everything in Starter',
      'Calendar integration',
      'Auto meeting prep',
      'Priority support',
    ],
  },
];

const planNames: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
};

export default function BillingPage() {
  const [usage, setUsage] = useState<UsageData>({
    used: 0,
    limit: 10,
    remaining: 10,
    reset_date: new Date().toISOString(),
    plan: 'free',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/usage');
      const data = await response.json();

      if (data.success) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const usagePercentage = Math.min((usage.used / usage.limit) * 100, 100);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Billing</h1>
          <p className="dashboard-page-subtitle">Manage your subscription and usage</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="billing-current-plan">
        <div className="billing-plan-info">
          <div className="billing-plan-badge">{planNames[usage.plan] || 'Free'} Plan</div>
          <h2 className="billing-plan-name">
            {planNames[usage.plan] || 'Free'} Plan
          </h2>
          <p className="billing-plan-desc">
            {usage.limit} briefs per month
          </p>
        </div>
        {usage.plan === 'free' && (
          <button className="billing-upgrade-btn">
            <i className="ph ph-lightning"></i>
            Upgrade Now
          </button>
        )}
        {usage.plan === 'starter' && (
          <button className="billing-upgrade-btn">
            <i className="ph ph-rocket"></i>
            Upgrade to Pro
          </button>
        )}
      </div>

      {/* Usage */}
      <div className="billing-usage">
        <div className="billing-usage-header">
          <h3>Usage This Month</h3>
          <span className="billing-usage-count">
            {isLoading ? '...' : `${usage.used} / ${usage.limit}`} briefs
          </span>
        </div>
        <div className="billing-usage-bar">
          <div
            className={`billing-usage-fill ${usagePercentage >= 90 ? 'warning' : ''} ${usagePercentage >= 100 ? 'full' : ''}`}
            style={{ width: `${usagePercentage}%` }}
          ></div>
        </div>
        <div className="billing-usage-footer">
          <p className="billing-usage-remaining">
            <strong>{usage.remaining}</strong> briefs remaining
          </p>
          <p className="billing-usage-reset">
            Resets on {formatDate(usage.reset_date)}
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="billing-plans-section">
        <h3 className="billing-section-title">Available Plans</h3>
        <div className="billing-plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`billing-plan-card ${plan.popular ? 'popular' : ''} ${usage.plan === plan.id ? 'current' : ''}`}
            >
              {plan.popular && <div className="billing-plan-popular">Most Popular</div>}
              <div className="billing-plan-header">
                <h4>{plan.name}</h4>
                <div className="billing-plan-price">
                  {plan.price}
                  <span>{plan.period}</span>
                </div>
              </div>
              <div className="billing-plan-briefs">
                <i className="ph ph-files"></i>
                {plan.briefs} briefs/month
              </div>
              <ul className="billing-plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <i className="ph ph-check"></i>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`billing-plan-btn ${usage.plan === plan.id ? 'current' : ''}`}
                disabled={usage.plan === plan.id}
              >
                {usage.plan === plan.id ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <div className="billing-history">
        <h3 className="billing-section-title">Billing History</h3>
        <div className="billing-history-empty">
          <i className="ph ph-receipt"></i>
          <p>No billing history yet</p>
        </div>
      </div>
    </div>
  );
}
