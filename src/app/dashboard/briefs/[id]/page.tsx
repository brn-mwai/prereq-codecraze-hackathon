'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { SageVisual, useSageState, SageThinking } from '@/components/sage';

interface EnhancedInsights {
  personality_insights?: string;
  communication_style?: string;
  rapport_tips?: string[];
  potential_challenges?: string[];
  meeting_strategy?: string;
  follow_up_hooks?: string[];
  linkedin_dm_template?: string;
  email_template?: string;
}

interface Experience {
  title?: string;
  company?: string;
  description?: string;
  location?: string;
  starts_at?: { year?: number; month?: number };
  ends_at?: { year?: number; month?: number } | null;
  logo_url?: string;
}

interface Education {
  school?: string;
  degree_name?: string;
  field_of_study?: string;
  description?: string;
  starts_at?: { year?: number };
  ends_at?: { year?: number };
  logo_url?: string;
}

interface Activity {
  title?: string;
  activity_status?: string;
  link?: string;
}

interface Comment {
  text?: string;
  postUrl?: string;
  commentedAt?: string;
}

interface Reaction {
  reactionType?: string;
  postText?: string;
  postUrl?: string;
}

interface Recommendation {
  text?: string;
  recommenderName?: string;
  recommenderTitle?: string;
  relationship?: string;
}

interface ProfileData {
  enhanced_insights?: EnhancedInsights;
  full_name?: string;
  headline?: string;
  summary?: string;
  profile_pic_url?: string;
  city?: string;
  country_full_name?: string;
  connections?: number;
  follower_count?: number;
  experiences?: Experience[];
  education?: Education[];
  skills?: string[];
  languages?: string[];
  activities?: Activity[];
  certifications?: Array<{
    name?: string;
    authority?: string;
  }>;
  volunteer_work?: Array<{
    title?: string;
    company?: string;
    description?: string;
  }>;
  open_to_work?: boolean;
  is_premium?: boolean;
  is_influencer?: boolean;
  // Contact info
  email?: string;
  emails?: string[];
  phone?: string;
  phones?: string[];
  twitter?: string;
  websites?: string[];
  address?: string;
  birthday?: string;
  // Engagement data
  comments?: Comment[];
  reactions?: Reaction[];
  recommendations_received?: Recommendation[];
}

interface Brief {
  id: string;
  linkedin_url: string;
  meeting_goal: string;
  profile_name: string;
  profile_headline: string;
  profile_photo_url?: string;
  profile_location?: string;
  profile_company?: string;
  profile_data?: ProfileData;
  summary: string;
  talking_points: string[];
  common_ground: string[];
  icebreaker: string;
  questions: string[];
  is_saved: boolean;
  created_at: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const presetGoals = [
  { id: 'networking', label: 'Networking', icon: 'ph-handshake' },
  { id: 'sales', label: 'Sales', icon: 'ph-currency-dollar' },
  { id: 'hiring', label: 'Hiring', icon: 'ph-user-plus' },
  { id: 'investor', label: 'Investor', icon: 'ph-trend-up' },
  { id: 'partner', label: 'Partner', icon: 'ph-users-three' },
];

const goalIcons: Record<string, string> = {
  networking: 'ph-handshake',
  sales: 'ph-currency-dollar',
  hiring: 'ph-user-plus',
  investor: 'ph-trend-up',
  partner: 'ph-users-three',
  general: 'ph-chat-circle',
};

const goalLabels: Record<string, string> = {
  networking: 'Networking',
  sales: 'Sales',
  hiring: 'Hiring',
  investor: 'Investor',
  partner: 'Partner',
  general: 'General',
};

const isPresetGoal = (goal: string) => presetGoals.some(g => g.id === goal);

export default function BriefViewPage() {
  const params = useParams();
  const briefId = params.id as string;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Goal change state
  const [showGoalSelector, setShowGoalSelector] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [customGoalText, setCustomGoalText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state: sageState, setThinking, setIdle, setSpeaking } = useSageState();

  const quickPrompts = [
    { label: 'Write intro email', prompt: `Write a professional introduction email to ${brief?.profile_name || 'them'} for a ${brief?.meeting_goal || 'networking'} meeting. Keep it personalized and reference their background.` },
    { label: 'LinkedIn DM', prompt: `Write a warm, casual LinkedIn DM to connect with ${brief?.profile_name || 'them'}. Keep it under 300 characters and make it feel authentic.` },
    { label: 'Meeting strategy', prompt: `What's the best strategy to make this ${brief?.meeting_goal || 'networking'} meeting successful with ${brief?.profile_name || 'them'}?` },
    { label: 'Build rapport', prompt: `How can I quickly build rapport with ${brief?.profile_name || 'them'} based on their background?` },
    { label: 'Follow-up email', prompt: `Write a follow-up email to send after meeting ${brief?.profile_name || 'them'}. Reference our ${brief?.meeting_goal || 'networking'} discussion.` },
  ];

  useEffect(() => {
    fetchBrief();
  }, [briefId]);

  // Initialize goal state when brief loads
  useEffect(() => {
    if (brief) {
      const goal = brief.meeting_goal;
      if (isPresetGoal(goal)) {
        setSelectedGoal(goal);
        setCustomGoalText('');
      } else {
        setSelectedGoal('custom');
        setCustomGoalText(goal);
      }
    }
  }, [brief?.meeting_goal]);

  useEffect(() => {
    if (brief && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: `I've analyzed ${brief.profile_name}'s profile. What would you like to know to prepare for your ${goalLabels[brief.meeting_goal]?.toLowerCase() || ''} meeting?`,
        },
      ]);
    }
  }, [brief]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBrief = async () => {
    try {
      const response = await fetch(`/api/briefs/${briefId}`);
      const data = await response.json();

      if (data.success) {
        setBrief(data.data.brief);
      } else {
        setError(data.error || 'Failed to load brief');
      }
    } catch (err) {
      setError('Failed to load brief');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (section: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyAll = async () => {
    if (!brief) return;

    const fullBrief = `PREREQ BRIEF: ${brief.profile_name}
${brief.profile_headline}
${brief.profile_location || ''}

SUMMARY
${brief.summary}

TALKING POINTS
${brief.talking_points.map((p) => `• ${p}`).join('\n')}

COMMON GROUND
${brief.common_ground.map((c) => `• ${c}`).join('\n')}

ICEBREAKER
${brief.icebreaker}

QUESTIONS TO ASK
${brief.questions.map((q) => `• ${q}`).join('\n')}

---
Generated by Prereq`;

    await handleCopy('all', fullBrief);
  };

  const handleRefresh = async (newGoal?: string) => {
    if (!brief) return;

    const goalToUse = newGoal || brief.meeting_goal;

    setIsRefreshing(true);
    setShowGoalSelector(false);
    try {
      const response = await fetch(`/api/briefs/${briefId}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_goal: goalToUse }),
      });

      const data = await response.json();

      if (data.success) {
        setBrief(data.data.brief);
      }
    } catch (err) {
      console.error('Failed to refresh:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGoalChange = async (goalId: string) => {
    if (goalId === 'custom') {
      setShowCustomInput(true);
      setSelectedGoal('custom');
    } else {
      setSelectedGoal(goalId);
      setCustomGoalText('');
      setShowCustomInput(false);
      await handleRefresh(goalId);
    }
  };

  const handleApplyCustomGoal = async () => {
    if (!customGoalText.trim()) return;
    setShowCustomInput(false);
    await handleRefresh(customGoalText.trim());
  };

  const handleSave = async () => {
    if (!brief) return;

    try {
      const response = await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_saved: !brief.is_saved }),
      });

      const data = await response.json();

      if (data.success) {
        setBrief(data.data.brief);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || chatInput.trim();
    if (!text || isSending) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsSending(true);
    setThinking();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          brief_id: briefId,
          session_id: sessionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (!sessionId && data.data.session_id) {
          setSessionId(data.data.session_id);
        }

        setSpeaking();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.data.message.content },
        ]);

        // Return to idle after "speaking"
        setTimeout(() => setIdle(), 2000);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't process that. Please try again.",
        },
      ]);
      setIdle();
    } finally {
      setIsSending(false);
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

  const formatExperienceDuration = (exp: Experience) => {
    const startYear = exp.starts_at?.year;
    const endYear = exp.ends_at?.year;
    if (!startYear) return '';
    if (!endYear) return `${startYear} - Present`;
    return `${startYear} - ${endYear}`;
  };

  const getCurrentRole = () => {
    const exp = brief?.profile_data?.experiences?.[0];
    if (!exp) return null;
    return {
      title: exp.title,
      company: exp.company,
      duration: formatExperienceDuration(exp),
      description: exp.description,
    };
  };

  const formatNumber = (num?: number) => {
    if (!num) return null;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="brief-view-page">
        <div className="brief-loading">
          <div className="brief-loading-spinner"></div>
          <p>Loading brief...</p>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="brief-view-page">
        <div className="brief-loading">
          <p>{error || 'Brief not found'}</p>
          <Link href="/dashboard/briefs" className="brief-action-btn primary" style={{ marginTop: '1rem' }}>
            Back to Briefs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="brief-view-page">
      {/* Header */}
      <div className="brief-view-header">
        <Link href="/dashboard/briefs" className="brief-view-back">
          <i className="ph ph-arrow-left"></i>
          Back to Briefs
        </Link>
        <div className="brief-view-actions">
          <button
            className="brief-action-btn"
            onClick={handleCopyAll}
          >
            <i className={`ph ${copiedSection === 'all' ? 'ph-check' : 'ph-copy'}`}></i>
            {copiedSection === 'all' ? 'Copied!' : 'Copy All'}
          </button>
          <button
            className="brief-action-btn"
            onClick={() => handleRefresh()}
            disabled={isRefreshing}
          >
            <i className={`ph ph-arrows-clockwise ${isRefreshing ? 'animate-spin' : ''}`}></i>
            Refresh
          </button>
          <button
            className={`brief-action-btn ${brief.is_saved ? 'saved' : ''}`}
            onClick={handleSave}
          >
            <i className={`ph ${brief.is_saved ? 'ph-star-fill' : 'ph-star'}`}></i>
            {brief.is_saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="brief-view-layout">
        {/* Brief Content */}
        <div className="brief-content-container">
          {/* Hero Profile Card */}
          <div className="brief-hero-card">
            <div className="brief-hero-top">
              <div className="brief-hero-photo">
                {brief.profile_photo_url ? (
                  <img
                    src={brief.profile_photo_url}
                    alt={brief.profile_name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const initialsEl = e.currentTarget.nextElementSibling;
                      if (initialsEl) (initialsEl as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="brief-hero-initials"
                  style={{ display: brief.profile_photo_url ? 'none' : 'flex' }}
                >
                  {getInitials(brief.profile_name)}
                </div>
                {brief.profile_data?.open_to_work && (
                  <div className="brief-hero-badge open-to-work">Open to Work</div>
                )}
                {brief.profile_data?.is_influencer && (
                  <div className="brief-hero-badge influencer">Influencer</div>
                )}
              </div>
              <div className="brief-hero-info">
                <div className="brief-hero-name-row">
                  <h1 className="brief-hero-name">{brief.profile_name}</h1>
                  <a
                    href={brief.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brief-linkedin-btn"
                    title="View LinkedIn Profile"
                  >
                    <i className="ph ph-linkedin-logo"></i>
                    View Profile
                  </a>
                </div>
                <p className="brief-hero-headline">{brief.profile_headline}</p>

                {/* Current Role */}
                {getCurrentRole() && (
                  <div className="brief-hero-current">
                    <i className="ph ph-briefcase"></i>
                    <span className="brief-hero-role">{getCurrentRole()?.title}</span>
                    <span className="brief-hero-at">at</span>
                    <span className="brief-hero-company">{getCurrentRole()?.company}</span>
                  </div>
                )}

                {/* Location & Stats */}
                <div className="brief-hero-meta">
                  {brief.profile_location && (
                    <span className="brief-hero-meta-item">
                      <i className="ph ph-map-pin"></i>
                      {brief.profile_location}
                    </span>
                  )}
                  {brief.profile_data?.connections && (
                    <span className="brief-hero-meta-item">
                      <i className="ph ph-users"></i>
                      {formatNumber(brief.profile_data.connections)} connections
                    </span>
                  )}
                  {brief.profile_data?.follower_count && (
                    <span className="brief-hero-meta-item">
                      <i className="ph ph-user-circle"></i>
                      {formatNumber(brief.profile_data.follower_count)} followers
                    </span>
                  )}
                  <span className="brief-hero-meta-item time-saved">
                    <i className="ph ph-clock"></i>
                    15 min saved
                  </span>
                </div>
              </div>
            </div>

            {/* Meeting Goal Selector */}
            <div className="brief-hero-goal">
              <span className="brief-hero-goal-label">Meeting Goal:</span>
              <div className="brief-goal-wrapper">
                <button
                  className="brief-goal-badge clickable"
                  onClick={() => setShowGoalSelector(!showGoalSelector)}
                  disabled={isRefreshing}
                >
                  <i className={`ph ${goalIcons[brief.meeting_goal] || 'ph-pencil-simple'}`}></i>
                  {goalLabels[brief.meeting_goal] || brief.meeting_goal}
                  <i className={`ph ph-caret-${showGoalSelector ? 'up' : 'down'} goal-caret`}></i>
                </button>

                {showGoalSelector && (
                  <div className="goal-dropdown">
                    <div className="goal-dropdown-label">Change meeting goal:</div>
                    <div className="goal-dropdown-options">
                      {presetGoals.map((goal) => (
                        <button
                          key={goal.id}
                          className={`goal-dropdown-btn ${selectedGoal === goal.id ? 'active' : ''}`}
                          onClick={() => handleGoalChange(goal.id)}
                        >
                          <i className={`ph ${goal.icon}`}></i>
                          {goal.label}
                        </button>
                      ))}
                      <button
                        className={`goal-dropdown-btn goal-dropdown-custom ${selectedGoal === 'custom' ? 'active' : ''}`}
                        onClick={() => handleGoalChange('custom')}
                      >
                        <i className={`ph ${customGoalText ? 'ph-pencil-simple' : 'ph-plus'}`}></i>
                        {customGoalText || 'Custom'}
                      </button>
                    </div>

                    {showCustomInput && (
                      <div className="goal-dropdown-custom-input">
                        <input
                          type="text"
                          placeholder="e.g., Partnership, Mentorship..."
                          value={customGoalText}
                          onChange={(e) => setCustomGoalText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomGoal()}
                          maxLength={100}
                          autoFocus
                        />
                        <div className="goal-dropdown-actions">
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => {
                              setShowCustomInput(false);
                              setShowGoalSelector(false);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn-primary btn-sm"
                            onClick={handleApplyCustomGoal}
                            disabled={!customGoalText.trim()}
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="brief-profile-grid">
            {/* About Section */}
            {brief.profile_data?.summary && (
              <div className="brief-profile-card brief-about-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-user"></i>
                  About {brief.profile_name.split(' ')[0]}
                </h3>
                <p className="brief-about-text">{brief.profile_data.summary}</p>
              </div>
            )}

            {/* Experience Section */}
            {brief.profile_data?.experiences && brief.profile_data.experiences.length > 0 && (
              <div className="brief-profile-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-briefcase"></i>
                  Experience
                </h3>
                <div className="brief-experience-list">
                  {brief.profile_data.experiences.slice(0, 3).map((exp, i) => (
                    <div key={i} className="brief-experience-item">
                      <div className="brief-exp-header">
                        <span className="brief-exp-title">{exp.title}</span>
                        <span className="brief-exp-duration">{formatExperienceDuration(exp)}</span>
                      </div>
                      <span className="brief-exp-company">{exp.company}</span>
                      {exp.description && (
                        <p className="brief-exp-desc">{exp.description.slice(0, 150)}{exp.description.length > 150 ? '...' : ''}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {brief.profile_data?.education && brief.profile_data.education.length > 0 && (
              <div className="brief-profile-card brief-education-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-graduation-cap"></i>
                  Education
                </h3>
                <div className="brief-education-list">
                  {brief.profile_data.education.slice(0, 2).map((edu, i) => (
                    <div key={i} className="brief-education-item">
                      <span className="brief-edu-school">{edu.school}</span>
                      {(edu.degree_name || edu.field_of_study) && (
                        <span className="brief-edu-degree">
                          {edu.degree_name}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {brief.profile_data?.skills && brief.profile_data.skills.length > 0 && (
              <div className="brief-profile-card brief-skills-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-lightning"></i>
                  Skills
                </h3>
                <div className="brief-skills-list">
                  {brief.profile_data.skills.slice(0, 12).map((skill, i) => (
                    <span key={i} className="brief-skill-chip">{skill}</span>
                  ))}
                  {brief.profile_data.skills.length > 12 && (
                    <span className="brief-skill-chip brief-skill-more">+{brief.profile_data.skills.length - 12}</span>
                  )}
                </div>
              </div>
            )}

            {/* Recent Activity Section */}
            {brief.profile_data?.activities && brief.profile_data.activities.length > 0 && (
              <div className="brief-profile-card brief-activity-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-newspaper"></i>
                  Recent Activity
                </h3>
                <div className="brief-activity-list">
                  {brief.profile_data.activities.slice(0, 5).map((activity, i) => (
                    <div key={i} className="brief-activity-item">
                      <i className="ph ph-article"></i>
                      <div className="brief-activity-content">
                        {activity.link ? (
                          <a
                            href={activity.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="brief-activity-title brief-activity-link"
                          >
                            {activity.title}
                            <i className="ph ph-arrow-square-out"></i>
                          </a>
                        ) : (
                          <span className="brief-activity-title">{activity.title}</span>
                        )}
                        <span className="brief-activity-status">{activity.activity_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Languages & Certifications */}
            {((brief.profile_data?.languages && brief.profile_data.languages.length > 0) ||
              (brief.profile_data?.certifications && brief.profile_data.certifications.length > 0)) && (
              <div className="brief-profile-card brief-extras-card">
                {brief.profile_data?.languages && brief.profile_data.languages.length > 0 && (
                  <div className="brief-extras-section">
                    <h4><i className="ph ph-translate"></i> Languages</h4>
                    <div className="brief-extras-list">
                      {brief.profile_data.languages.map((lang, i) => (
                        <span key={i} className="brief-extras-tag">{lang}</span>
                      ))}
                    </div>
                  </div>
                )}
                {brief.profile_data?.certifications && brief.profile_data.certifications.length > 0 && (
                  <div className="brief-extras-section">
                    <h4><i className="ph ph-certificate"></i> Certifications</h4>
                    <div className="brief-cert-list">
                      {brief.profile_data.certifications.slice(0, 3).map((cert, i) => (
                        <div key={i} className="brief-cert-item">
                          <span className="brief-cert-name">{cert.name}</span>
                          {cert.authority && <span className="brief-cert-issuer">{cert.authority}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Contact Info */}
            {(brief.profile_data?.email || brief.profile_data?.phone || brief.profile_data?.twitter ||
              (brief.profile_data?.websites && brief.profile_data.websites.length > 0)) && (
              <div className="brief-profile-card brief-contact-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-address-book"></i>
                  Contact Information
                </h3>
                <div className="brief-contact-list">
                  {brief.profile_data?.email && (
                    <div className="brief-contact-item">
                      <i className="ph ph-envelope"></i>
                      <a href={`mailto:${brief.profile_data.email}`} className="brief-contact-link">
                        {brief.profile_data.email}
                      </a>
                    </div>
                  )}
                  {brief.profile_data?.phone && (
                    <div className="brief-contact-item">
                      <i className="ph ph-phone"></i>
                      <a href={`tel:${brief.profile_data.phone}`} className="brief-contact-link">
                        {brief.profile_data.phone}
                      </a>
                    </div>
                  )}
                  {brief.profile_data?.twitter && (
                    <div className="brief-contact-item">
                      <i className="ph ph-twitter-logo"></i>
                      <a href={`https://twitter.com/${brief.profile_data.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="brief-contact-link">
                        {brief.profile_data.twitter}
                      </a>
                    </div>
                  )}
                  {brief.profile_data?.websites && brief.profile_data.websites.length > 0 && (
                    brief.profile_data.websites.map((website, i) => (
                      <div key={i} className="brief-contact-item">
                        <i className="ph ph-globe"></i>
                        <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="brief-contact-link">
                          {website}
                        </a>
                      </div>
                    ))
                  )}
                  {brief.profile_data?.address && (
                    <div className="brief-contact-item">
                      <i className="ph ph-map-pin"></i>
                      <span>{brief.profile_data.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recommendations Received */}
            {brief.profile_data?.recommendations_received && brief.profile_data.recommendations_received.length > 0 && (
              <div className="brief-profile-card brief-recommendations-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-quotes"></i>
                  Recommendations Received
                </h3>
                <div className="brief-recommendations-list">
                  {brief.profile_data.recommendations_received.slice(0, 3).map((rec, i) => (
                    <div key={i} className="brief-recommendation-item">
                      <p className="brief-recommendation-text">"{rec.text?.substring(0, 200)}{rec.text && rec.text.length > 200 ? '...' : ''}"</p>
                      <div className="brief-recommendation-author">
                        <span className="brief-recommendation-name">{rec.recommenderName}</span>
                        {rec.recommenderTitle && <span className="brief-recommendation-title">{rec.recommenderTitle}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Comments */}
            {brief.profile_data?.comments && brief.profile_data.comments.length > 0 && (
              <div className="brief-profile-card brief-comments-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-chat-dots"></i>
                  Recent Comments
                </h3>
                <div className="brief-comments-list">
                  {brief.profile_data.comments.slice(0, 3).map((comment, i) => (
                    <div key={i} className="brief-comment-item">
                      <p className="brief-comment-text">{comment.text}</p>
                      <div className="brief-comment-meta">
                        <span className="brief-comment-date">{comment.commentedAt}</span>
                        {comment.postUrl && (
                          <a href={comment.postUrl} target="_blank" rel="noopener noreferrer" className="brief-comment-link">
                            View Post <i className="ph ph-arrow-square-out"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reactions/Engagement */}
            {brief.profile_data?.reactions && brief.profile_data.reactions.length > 0 && (
              <div className="brief-profile-card brief-reactions-card">
                <h3 className="brief-card-title">
                  <i className="ph ph-thumbs-up"></i>
                  Recent Engagement
                </h3>
                <div className="brief-reactions-list">
                  {brief.profile_data.reactions.slice(0, 3).map((reaction, i) => (
                    <div key={i} className="brief-reaction-item">
                      <span className="brief-reaction-type">
                        <i className={`ph ${reaction.reactionType === 'like' ? 'ph-thumbs-up' : reaction.reactionType === 'celebrate' ? 'ph-confetti' : reaction.reactionType === 'love' ? 'ph-heart' : 'ph-smiley'}`}></i>
                        {reaction.reactionType}
                      </span>
                      {reaction.postText && <p className="brief-reaction-text">{reaction.postText}</p>}
                      {reaction.postUrl && (
                        <a href={reaction.postUrl} target="_blank" rel="noopener noreferrer" className="brief-reaction-link">
                          View <i className="ph ph-arrow-square-out"></i>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="brief-section">
            <div className="brief-section-header">
              <h2 className="brief-section-title">
                <i className="ph ph-note"></i>
                Summary
              </h2>
              <button
                className={`brief-copy-btn ${copiedSection === 'summary' ? 'copied' : ''}`}
                onClick={() => handleCopy('summary', brief.summary)}
              >
                <i className={`ph ${copiedSection === 'summary' ? 'ph-check' : 'ph-copy'}`}></i>
                {copiedSection === 'summary' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="brief-section-content">
              <p className="brief-section-text">{brief.summary}</p>
            </div>
          </div>

          {/* Talking Points */}
          <div className="brief-section">
            <div className="brief-section-header">
              <h2 className="brief-section-title">
                <i className="ph ph-chat-text"></i>
                Talking Points
              </h2>
              <button
                className={`brief-copy-btn ${copiedSection === 'talking_points' ? 'copied' : ''}`}
                onClick={() =>
                  handleCopy('talking_points', brief.talking_points.map((p) => `• ${p}`).join('\n'))
                }
              >
                <i className={`ph ${copiedSection === 'talking_points' ? 'ph-check' : 'ph-copy'}`}></i>
                {copiedSection === 'talking_points' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="brief-section-content">
              <ul className="brief-section-list">
                {brief.talking_points.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Common Ground */}
          <div className="brief-section">
            <div className="brief-section-header">
              <h2 className="brief-section-title">
                <i className="ph ph-handshake"></i>
                Common Ground
              </h2>
              <button
                className={`brief-copy-btn ${copiedSection === 'common_ground' ? 'copied' : ''}`}
                onClick={() =>
                  handleCopy('common_ground', brief.common_ground.map((c) => `• ${c}`).join('\n'))
                }
              >
                <i className={`ph ${copiedSection === 'common_ground' ? 'ph-check' : 'ph-copy'}`}></i>
                {copiedSection === 'common_ground' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="brief-section-content">
              <ul className="brief-section-list">
                {brief.common_ground.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Icebreaker */}
          <div className="brief-section">
            <div className="brief-section-header">
              <h2 className="brief-section-title">
                <i className="ph ph-lightning"></i>
                Icebreaker
              </h2>
              <button
                className={`brief-copy-btn ${copiedSection === 'icebreaker' ? 'copied' : ''}`}
                onClick={() => handleCopy('icebreaker', brief.icebreaker)}
              >
                <i className={`ph ${copiedSection === 'icebreaker' ? 'ph-check' : 'ph-copy'}`}></i>
                {copiedSection === 'icebreaker' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="brief-section-content">
              <div className="brief-icebreaker">{brief.icebreaker}</div>
            </div>
          </div>

          {/* Questions */}
          <div className="brief-section">
            <div className="brief-section-header">
              <h2 className="brief-section-title">
                <i className="ph ph-question"></i>
                Questions to Ask
              </h2>
              <button
                className={`brief-copy-btn ${copiedSection === 'questions' ? 'copied' : ''}`}
                onClick={() =>
                  handleCopy('questions', brief.questions.map((q) => `• ${q}`).join('\n'))
                }
              >
                <i className={`ph ${copiedSection === 'questions' ? 'ph-check' : 'ph-copy'}`}></i>
                {copiedSection === 'questions' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="brief-section-content">
              <ul className="brief-section-list">
                {brief.questions.map((question, i) => (
                  <li key={i}>{question}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Enhanced Insights Section */}
          {brief.profile_data?.enhanced_insights && (
            <>
              {/* Personality & Communication */}
              {(brief.profile_data.enhanced_insights.personality_insights || brief.profile_data.enhanced_insights.communication_style) && (
                <div className="brief-section brief-section-highlight">
                  <div className="brief-section-header">
                    <h2 className="brief-section-title">
                      <i className="ph ph-brain"></i>
                      Personality & Communication
                    </h2>
                  </div>
                  <div className="brief-section-content">
                    {brief.profile_data.enhanced_insights.personality_insights && (
                      <div className="brief-insight-block">
                        <h4><i className="ph ph-user-focus"></i> Personality Insights</h4>
                        <p>{brief.profile_data.enhanced_insights.personality_insights}</p>
                      </div>
                    )}
                    {brief.profile_data.enhanced_insights.communication_style && (
                      <div className="brief-insight-block">
                        <h4><i className="ph ph-chat-centered-text"></i> Communication Style</h4>
                        <p>{brief.profile_data.enhanced_insights.communication_style}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Meeting Strategy */}
              {brief.profile_data.enhanced_insights.meeting_strategy && (
                <div className="brief-section brief-section-strategy">
                  <div className="brief-section-header">
                    <h2 className="brief-section-title">
                      <i className="ph ph-target"></i>
                      Meeting Strategy
                    </h2>
                    <button
                      className={`brief-copy-btn ${copiedSection === 'strategy' ? 'copied' : ''}`}
                      onClick={() => handleCopy('strategy', brief.profile_data?.enhanced_insights?.meeting_strategy || '')}
                    >
                      <i className={`ph ${copiedSection === 'strategy' ? 'ph-check' : 'ph-copy'}`}></i>
                      {copiedSection === 'strategy' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="brief-section-content">
                    <div className="brief-strategy-box">
                      {brief.profile_data.enhanced_insights.meeting_strategy}
                    </div>
                  </div>
                </div>
              )}

              {/* Rapport Tips */}
              {brief.profile_data.enhanced_insights.rapport_tips && brief.profile_data.enhanced_insights.rapport_tips.length > 0 && (
                <div className="brief-section">
                  <div className="brief-section-header">
                    <h2 className="brief-section-title">
                      <i className="ph ph-heart-handshake"></i>
                      Rapport Building Tips
                    </h2>
                  </div>
                  <div className="brief-section-content">
                    <ul className="brief-section-list">
                      {brief.profile_data.enhanced_insights.rapport_tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Potential Challenges */}
              {brief.profile_data.enhanced_insights.potential_challenges && brief.profile_data.enhanced_insights.potential_challenges.length > 0 && (
                <div className="brief-section brief-section-warning">
                  <div className="brief-section-header">
                    <h2 className="brief-section-title">
                      <i className="ph ph-warning-circle"></i>
                      Potential Challenges
                    </h2>
                  </div>
                  <div className="brief-section-content">
                    <ul className="brief-section-list">
                      {brief.profile_data.enhanced_insights.potential_challenges.map((challenge, i) => (
                        <li key={i}>{challenge}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Follow-up Hooks */}
              {brief.profile_data.enhanced_insights.follow_up_hooks && brief.profile_data.enhanced_insights.follow_up_hooks.length > 0 && (
                <div className="brief-section">
                  <div className="brief-section-header">
                    <h2 className="brief-section-title">
                      <i className="ph ph-arrow-bend-up-right"></i>
                      Follow-up Hooks
                    </h2>
                  </div>
                  <div className="brief-section-content">
                    <ul className="brief-section-list">
                      {brief.profile_data.enhanced_insights.follow_up_hooks.map((hook, i) => (
                        <li key={i}>{hook}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Templates Section */}
              {(brief.profile_data.enhanced_insights.linkedin_dm_template || brief.profile_data.enhanced_insights.email_template) && (
                <div className="brief-templates-section">
                  <h2 className="brief-templates-title">
                    <i className="ph ph-envelope-simple"></i>
                    Ready-to-Use Templates
                  </h2>
                  <div className="brief-templates-grid">
                    {/* LinkedIn DM Template */}
                    {brief.profile_data.enhanced_insights.linkedin_dm_template && (
                      <div className="brief-template-card">
                        <div className="brief-template-header">
                          <i className="ph ph-linkedin-logo"></i>
                          <span>LinkedIn DM</span>
                          <button
                            className={`brief-copy-btn ${copiedSection === 'dm' ? 'copied' : ''}`}
                            onClick={() => handleCopy('dm', brief.profile_data?.enhanced_insights?.linkedin_dm_template || '')}
                          >
                            <i className={`ph ${copiedSection === 'dm' ? 'ph-check' : 'ph-copy'}`}></i>
                          </button>
                        </div>
                        <div className="brief-template-content">
                          {brief.profile_data.enhanced_insights.linkedin_dm_template}
                        </div>
                      </div>
                    )}

                    {/* Email Template */}
                    {brief.profile_data.enhanced_insights.email_template && (
                      <div className="brief-template-card">
                        <div className="brief-template-header">
                          <i className="ph ph-envelope"></i>
                          <span>Email Template</span>
                          <button
                            className={`brief-copy-btn ${copiedSection === 'email' ? 'copied' : ''}`}
                            onClick={() => handleCopy('email', brief.profile_data?.enhanced_insights?.email_template || '')}
                          >
                            <i className={`ph ${copiedSection === 'email' ? 'ph-check' : 'ph-copy'}`}></i>
                          </button>
                        </div>
                        <div className="brief-template-content">
                          {brief.profile_data.enhanced_insights.email_template}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sage Chat Panel */}
        <div className="sage-chat-panel">
          <div className="sage-chat-header">
            <div className="sage-chat-orb">
              <SageVisual state={sageState} size="medium" colorMode={7} />
            </div>
            <div className="sage-chat-info">
              <h3>Sage AI</h3>
              <p>Your meeting prep assistant</p>
            </div>
          </div>

          <div className="sage-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`sage-message ${msg.role}`}>
                <div className="sage-message-content">{msg.content}</div>
              </div>
            ))}
            {isSending && (
              <div className="sage-message assistant">
                <div className="sage-thinking-bubble">
                  <SageThinking size="small" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 2 && (
            <div className="sage-quick-prompts">
              {quickPrompts.map((item, i) => (
                <button
                  key={i}
                  className="sage-quick-prompt"
                  onClick={() => handleSendMessage(item.prompt)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="sage-chat-input-container">
            <div className="sage-chat-input-wrapper">
              <input
                type="text"
                className="sage-chat-input"
                placeholder="Ask Sage anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isSending}
              />
              <button
                className="sage-chat-send"
                onClick={() => handleSendMessage()}
                disabled={!chatInput.trim() || isSending}
              >
                <i className="ph ph-paper-plane-tilt"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
