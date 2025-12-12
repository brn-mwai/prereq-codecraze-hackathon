'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SageVisual } from '@/components/sage';

const meetingGoals = [
  { id: 'networking', label: 'Networking', icon: 'ph-handshake' },
  { id: 'sales', label: 'Sales', icon: 'ph-currency-dollar' },
  { id: 'hiring', label: 'Hiring', icon: 'ph-user-plus' },
  { id: 'investor', label: 'Investor', icon: 'ph-trend-up' },
  { id: 'partner', label: 'Partner', icon: 'ph-users-three' },
];

interface Stats {
  briefsGenerated: number;
  briefsThisMonth: number;
  briefsLimit: number;
  briefsRemaining: number;
  timeSaved: number;
  meetingsPrepped: number;
  plan: string;
}

interface RecentBrief {
  id: string;
  name: string;
  headline: string;
  photoUrl?: string;
  goal: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('networking');
  const [customGoalText, setCustomGoalText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<Stats>({
    briefsGenerated: 0,
    briefsThisMonth: 0,
    briefsLimit: 10,
    briefsRemaining: 10,
    timeSaved: 0,
    meetingsPrepped: 0,
    plan: 'free',
  });

  const [recentBriefs, setRecentBriefs] = useState<RecentBrief[]>([]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (data.success) {
        setStats({
          briefsGenerated: data.data.briefs_generated,
          briefsThisMonth: data.data.briefs_this_month,
          briefsLimit: data.data.briefs_limit,
          briefsRemaining: data.data.briefs_remaining,
          timeSaved: Math.round(data.data.time_saved_minutes / 60),
          meetingsPrepped: data.data.meetings_prepped,
          plan: data.data.plan,
        });
        setRecentBriefs(data.data.recent_briefs || []);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!linkedinUrl.trim()) return;

    // Check usage limit before generating
    if (stats.briefsRemaining <= 0) {
      setShowUpgradeModal(true);
      return;
    }

    // Use custom goal text if custom is selected, otherwise use preset
    const goalToUse = selectedGoal === 'custom' ? customGoalText.trim() : selectedGoal;
    if (selectedGoal === 'custom' && !customGoalText.trim()) {
      return; // Don't generate without custom goal text
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/briefs/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkedin_url: linkedinUrl,
          meeting_goal: goalToUse,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.brief?.id) {
        router.push(`/dashboard/briefs/${data.data.brief.id}`);
      } else if (data.error === 'USAGE_LIMIT_EXCEEDED') {
        setShowUpgradeModal(true);
      } else {
        setError(data.error || 'Failed to generate brief');
        console.error('Failed to generate brief:', data.error);
      }
    } catch (err) {
      setError('Failed to generate brief. Please try again.');
      console.error('Error generating brief:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const isAtLimit = stats.briefsRemaining <= 0;

  return (
    <div className="dashboard-page">
      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="upgrade-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUpgradeModal(false)}>
              <i className="ph ph-x"></i>
            </button>
            <div className="upgrade-modal-icon">
              <i className="ph ph-lightning"></i>
            </div>
            <h2>Monthly Limit Reached</h2>
            <p>
              You've used all <strong>{stats.briefsLimit} briefs</strong> included in your{' '}
              <strong>{stats.plan === 'free' ? 'Free' : stats.plan}</strong> plan this month.
            </p>
            <p className="upgrade-modal-subtext">
              Upgrade to generate more briefs and unlock additional features.
            </p>
            <div className="upgrade-modal-plans">
              <div className="upgrade-plan">
                <div className="upgrade-plan-name">Starter</div>
                <div className="upgrade-plan-price">$7<span>/mo</span></div>
                <div className="upgrade-plan-feature">30 briefs per month</div>
              </div>
              <div className="upgrade-plan recommended">
                <div className="upgrade-plan-badge">Most Popular</div>
                <div className="upgrade-plan-name">Pro</div>
                <div className="upgrade-plan-price">$15<span>/mo</span></div>
                <div className="upgrade-plan-feature">100 briefs per month</div>
              </div>
            </div>
            <Link href="/dashboard/billing" className="upgrade-modal-btn">
              <i className="ph ph-rocket"></i>
              Upgrade Now
            </Link>
            <p className="upgrade-modal-reset">
              Your free briefs reset on the 1st of each month.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="dashboard-page-subtitle">
            Your AI-powered meeting prep assistant is ready.
          </p>
        </div>
        <div className={`plan-badge ${isAtLimit ? 'at-limit' : ''}`}>
          <span className="plan-badge-count">{stats.briefsRemaining}</span>
          <span>of {stats.briefsLimit} briefs remaining this month</span>
        </div>
      </div>

      {/* Usage Warning */}
      {isAtLimit && (
        <div className="usage-warning">
          <i className="ph ph-warning"></i>
          <div className="usage-warning-content">
            <strong>Monthly limit reached!</strong>
            <span>You've used all {stats.briefsLimit} briefs this month. Upgrade to continue generating briefs.</span>
          </div>
          <Link href="/dashboard/billing" className="usage-warning-btn">
            Upgrade
          </Link>
        </div>
      )}

      {/* Brief Generator */}
      <div className={`brief-generator ${isAtLimit ? 'disabled' : ''}`}>
        <h2 className="brief-generator-title">
          <i className="ph ph-link"></i>
          Generate New Brief
        </h2>
        {error && (
          <div className="brief-generator-error">
            <i className="ph ph-warning-circle"></i>
            {error}
          </div>
        )}
        <div className="brief-generator-input-group">
          <input
            type="text"
            className="brief-generator-input"
            placeholder="Paste LinkedIn profile URL..."
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            disabled={isAtLimit}
          />
          <button
            className="brief-generator-btn"
            onClick={handleGenerate}
            disabled={isGenerating || !linkedinUrl.trim() || isAtLimit}
          >
            {isGenerating ? (
              <>
                <i className="ph ph-spinner animate-spin"></i>
                Generating...
              </>
            ) : isAtLimit ? (
              <>
                <i className="ph ph-lock"></i>
                Limit Reached
              </>
            ) : (
              <>
                <i className="ph ph-lightning"></i>
                Generate
              </>
            )}
          </button>
        </div>
        <div>
          <span className="goal-selector-label">Meeting goal (optional)</span>
          <div className="goal-selector">
            {meetingGoals.map((goal) => (
              <button
                key={goal.id}
                className={`goal-btn ${selectedGoal === goal.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedGoal(goal.id);
                  setShowCustomInput(false);
                }}
                disabled={isAtLimit}
              >
                <i className={`ph ${goal.icon}`}></i>
                {goal.label}
              </button>
            ))}
            <button
              className={`goal-btn goal-btn-custom ${selectedGoal === 'custom' ? 'active' : ''}`}
              onClick={() => {
                setSelectedGoal('custom');
                setShowCustomInput(true);
              }}
              disabled={isAtLimit}
            >
              <i className={`ph ${customGoalText ? 'ph-pencil-simple' : 'ph-plus'}`}></i>
              {customGoalText && selectedGoal === 'custom'
                ? (customGoalText.length > 12 ? customGoalText.slice(0, 12) + '...' : customGoalText)
                : 'Custom'}
            </button>
          </div>
          {showCustomInput && (
            <div className="custom-goal-input">
              <input
                type="text"
                placeholder="e.g., Partnership discussion, Mentorship, Conference intro..."
                value={customGoalText}
                onChange={(e) => setCustomGoalText(e.target.value)}
                maxLength={100}
                autoFocus
              />
              <div className="custom-goal-actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => {
                    setShowCustomInput(false);
                    setSelectedGoal('networking');
                    setCustomGoalText('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary btn-sm"
                  onClick={() => setShowCustomInput(false)}
                  disabled={!customGoalText.trim()}
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-files"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : stats.briefsGenerated}</div>
          <div className="stat-card-label">Briefs Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-lightning"></i>
          </div>
          <div className="stat-card-value">
            {isLoading ? '-' : `${stats.briefsThisMonth}/${stats.briefsLimit}`}
          </div>
          <div className="stat-card-label">Used This Month</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-clock"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : `${stats.timeSaved}h`}</div>
          <div className="stat-card-label">Time Saved</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon">
            <i className="ph ph-calendar-check"></i>
          </div>
          <div className="stat-card-value">{isLoading ? '-' : stats.meetingsPrepped}</div>
          <div className="stat-card-label">Meetings Prepped</div>
        </div>
      </div>

      {/* Recent Briefs */}
      <div className="recent-briefs">
        <div className="recent-briefs-header">
          <h3 className="recent-briefs-title">Recent Briefs</h3>
          <Link href="/dashboard/briefs" className="recent-briefs-link">
            View all <i className="ph ph-arrow-right"></i>
          </Link>
        </div>
        {isLoading ? (
          <div className="recent-briefs-loading">
            <i className="ph ph-spinner animate-spin"></i>
            <span>Loading...</span>
          </div>
        ) : recentBriefs.length > 0 ? (
          <div className="recent-briefs-list">
            {recentBriefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/dashboard/briefs/${brief.id}`}
                className="recent-brief-item"
              >
                <div className="recent-brief-avatar">
                  {brief.photoUrl ? (
                    <img src={brief.photoUrl} alt={brief.name} />
                  ) : (
                    getInitials(brief.name)
                  )}
                </div>
                <div className="recent-brief-info">
                  <div className="recent-brief-name">{brief.name}</div>
                  <div className="recent-brief-headline">{brief.headline}</div>
                </div>
                <div className="recent-brief-meta">
                  <span className="recent-brief-goal">{brief.goal}</span>
                  <span className="recent-brief-saved">
                    <i className="ph ph-clock"></i>
                    15m
                  </span>
                  <span className="recent-brief-time">
                    {formatTimeAgo(brief.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="recent-briefs-empty">
            <div className="recent-briefs-empty-icon">
              <i className="ph ph-note-blank"></i>
            </div>
            <p>No briefs yet. Generate your first brief above!</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link href="/dashboard/new" className="quick-action-card">
          <div className="quick-action-icon">
            <i className="ph ph-puzzle-piece"></i>
          </div>
          <div className="quick-action-content">
            <h3>Chrome Extension</h3>
            <p>Generate briefs directly on LinkedIn</p>
          </div>
        </Link>
        <Link href="/dashboard/sage" className="quick-action-card sage-card">
          <div className="quick-action-icon sage">
            <SageVisual state="idle" size="medium" colorMode={7} />
          </div>
          <div className="quick-action-content">
            <h3>Chat with Sage AI</h3>
            <p>Get deeper meeting insights</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
