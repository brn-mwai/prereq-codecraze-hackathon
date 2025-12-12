'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { MODEL_GROUPS, getDefaultModel, type AIModel } from '@/config/ai-models';

interface LinkedInData {
  full_name?: string;
  headline?: string;
  summary?: string;
  profile_pic_url?: string;
  city?: string;
  country_full_name?: string;
  experiences?: Array<{
    title?: string;
    company?: string;
  }>;
  education?: Array<{
    school?: string;
    degree_name?: string;
  }>;
  skills?: string[];
  connections?: number;
  follower_count?: number;
}

interface UserProfile {
  full_name: string;
  company: string;
  role: string;
  linkedin_url: string;
  linkedin_data?: LinkedInData | null;
}

export default function SettingsPage() {
  const { user } = useUser();
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    company: '',
    role: '',
    linkedin_url: '',
    linkedin_data: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => getDefaultModel());

  useEffect(() => {
    fetchProfile();
    // Load saved model preference
    const savedModelId = localStorage.getItem('sage-preferred-model');
    if (savedModelId) {
      const allModels = MODEL_GROUPS.flatMap(g => g.models);
      const savedModel = allModels.find(m => m.id === savedModelId);
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  const handleModelChange = (modelId: string) => {
    const allModels = MODEL_GROUPS.flatMap(g => g.models);
    const model = allModels.find(m => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      localStorage.setItem('sage-preferred-model', model.id);
      setSaveMessage({ type: 'success', text: 'AI model preference saved!' });
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();

      if (data.success && data.data.user) {
        setProfile({
          full_name: data.data.user.name || data.data.user.full_name || '',
          company: data.data.user.company || '',
          role: data.data.user.role || '',
          linkedin_url: data.data.user.linkedin_url || '',
          linkedin_data: data.data.user.linkedin_data || null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
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

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleSyncLinkedIn = async () => {
    if (!profile.linkedin_url) {
      setSaveMessage({ type: 'error', text: 'Please enter your LinkedIn URL first' });
      return;
    }

    // First save the LinkedIn URL
    setIsSaving(true);
    try {
      await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedin_url: profile.linkedin_url }),
      });
    } catch (err) {
      console.error('Failed to save LinkedIn URL:', err);
    }
    setIsSaving(false);

    // Then sync the profile data
    setIsSyncing(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/user/linkedin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setSaveMessage({ type: 'success', text: 'LinkedIn profile synced! Your persona is now ready.' });
        setProfile(prev => ({
          ...prev,
          linkedin_data: data.data.user.linkedin_data,
        }));
      } else {
        setSaveMessage({ type: 'error', text: data.error || 'Failed to sync LinkedIn' });
      }
    } catch (err) {
      setSaveMessage({ type: 'error', text: 'Failed to sync LinkedIn' });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">Settings</h1>
          <p className="dashboard-page-subtitle">Manage your profile and preferences</p>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`settings-message ${saveMessage.type}`}>
          <i className={`ph ${saveMessage.type === 'success' ? 'ph-check-circle' : 'ph-warning-circle'}`}></i>
          {saveMessage.text}
        </div>
      )}

      {/* Profile Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Profile Information</h2>
          <p className="settings-section-desc">Update your profile to help Sage personalize your briefs</p>
        </div>
        <div className="settings-form">
          <div className="settings-form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>
          <div className="settings-form-row">
            <div className="settings-form-group">
              <label>Company</label>
              <input
                type="text"
                value={profile.company}
                onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                placeholder="Where do you work?"
              />
            </div>
            <div className="settings-form-group">
              <label>Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                placeholder="What's your title?"
              />
            </div>
          </div>
        </div>
      </div>

      {/* LinkedIn Section */}
      <div className="settings-section settings-linkedin-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">
            <i className="ph ph-linkedin-logo"></i>
            LinkedIn Connection
          </h2>
          <p className="settings-section-desc">Connect your LinkedIn so Sage AI can create your persona and find similarities with contacts</p>
        </div>

        {/* Persona Card - Show when LinkedIn is synced */}
        {profile.linkedin_data && (
          <div className="settings-persona-card">
            <div className="settings-persona-header">
              <div className="settings-persona-photo">
                {profile.linkedin_data.profile_pic_url ? (
                  <img
                    src={profile.linkedin_data.profile_pic_url}
                    alt={profile.linkedin_data.full_name || 'Profile'}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const initialsEl = e.currentTarget.nextElementSibling;
                      if (initialsEl) (initialsEl as HTMLElement).style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className="settings-persona-initials"
                  style={{ display: profile.linkedin_data.profile_pic_url ? 'none' : 'flex' }}
                >
                  {getInitials(profile.linkedin_data.full_name || profile.full_name || 'U')}
                </div>
              </div>
              <div className="settings-persona-info">
                <h3 className="settings-persona-name">{profile.linkedin_data.full_name || profile.full_name}</h3>
                <p className="settings-persona-headline">{profile.linkedin_data.headline}</p>
                {profile.linkedin_data.city && (
                  <span className="settings-persona-location">
                    <i className="ph ph-map-pin"></i>
                    {[profile.linkedin_data.city, profile.linkedin_data.country_full_name].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
              <div className="settings-persona-badge">
                <i className="ph ph-check-circle"></i>
                Synced
              </div>
            </div>

            {/* Persona Stats */}
            <div className="settings-persona-stats">
              {profile.linkedin_data.experiences?.[0] && (
                <div className="settings-persona-stat">
                  <i className="ph ph-briefcase"></i>
                  <span>{profile.linkedin_data.experiences[0].title} at {profile.linkedin_data.experiences[0].company}</span>
                </div>
              )}
              {profile.linkedin_data.education?.[0] && (
                <div className="settings-persona-stat">
                  <i className="ph ph-graduation-cap"></i>
                  <span>{profile.linkedin_data.education[0].school}</span>
                </div>
              )}
              {profile.linkedin_data.connections && (
                <div className="settings-persona-stat">
                  <i className="ph ph-users"></i>
                  <span>{profile.linkedin_data.connections.toLocaleString()} connections</span>
                </div>
              )}
            </div>

            {/* Skills Preview */}
            {profile.linkedin_data.skills && profile.linkedin_data.skills.length > 0 && (
              <div className="settings-persona-skills">
                <span className="settings-persona-skills-label">Your Skills:</span>
                <div className="settings-persona-skills-list">
                  {profile.linkedin_data.skills.slice(0, 8).map((skill, i) => (
                    <span key={i} className="settings-persona-skill">{skill}</span>
                  ))}
                  {profile.linkedin_data.skills.length > 8 && (
                    <span className="settings-persona-skill-more">+{profile.linkedin_data.skills.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Summary */}
            {profile.linkedin_data.summary && (
              <div className="settings-persona-summary">
                <p>{profile.linkedin_data.summary.slice(0, 200)}{profile.linkedin_data.summary.length > 200 ? '...' : ''}</p>
              </div>
            )}

            <div className="settings-persona-footer">
              <p className="settings-persona-usage">
                <i className="ph ph-sparkle"></i>
                Sage will use this to find common ground and personalize your briefs
              </p>
            </div>
          </div>
        )}

        <div className="settings-form">
          <div className="settings-form-group">
            <label>LinkedIn Profile URL</label>
            <div className="settings-input-with-btn">
              <input
                type="text"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              <button
                className="settings-sync-btn"
                onClick={handleSyncLinkedIn}
                disabled={isSaving || isSyncing || !profile.linkedin_url}
              >
                {isSyncing ? (
                  <>
                    <i className="ph ph-spinner animate-spin"></i>
                    Syncing...
                  </>
                ) : (
                  <>
                    <i className="ph ph-arrows-clockwise"></i>
                    {profile.linkedin_data ? 'Re-sync' : 'Sync Profile'}
                  </>
                )}
              </button>
            </div>
            <span className="settings-help-text">
              {profile.linkedin_data
                ? 'Your persona is synced! Re-sync to update your profile data.'
                : 'Enter your LinkedIn URL and click Sync to create your persona'}
            </span>
          </div>
        </div>
      </div>

      {/* AI Preferences Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">AI Preferences</h2>
          <p className="settings-section-desc">Choose your preferred AI model for Sage</p>
        </div>
        <div className="settings-form">
          <div className="settings-form-group">
            <label>Preferred AI Model</label>
            <select
              value={selectedModel.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="settings-select"
            >
              {MODEL_GROUPS.filter(g => g.models.length > 0).map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.isRecommended ? '(Recommended)' : ''} {model.isFast ? '(Fast)' : ''}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <span className="settings-help-text">
              {selectedModel.description}
            </span>
          </div>
          <div className="settings-model-info">
            <div className="settings-model-stat">
              <span className="settings-model-label">Provider</span>
              <span className="settings-model-value">{selectedModel.provider === 'claude' ? 'Anthropic Claude' : 'Groq'}</span>
            </div>
            <div className="settings-model-stat">
              <span className="settings-model-label">Context Window</span>
              <span className="settings-model-value">{(selectedModel.contextWindow / 1000).toFixed(0)}K tokens</span>
            </div>
            <div className="settings-model-stat">
              <span className="settings-model-label">Max Output</span>
              <span className="settings-model-value">{(selectedModel.maxOutput / 1000).toFixed(0)}K tokens</span>
            </div>
            {selectedModel.supportsTools && (
              <div className="settings-model-stat">
                <span className="settings-model-label">Tools</span>
                <span className="settings-model-value">Supported</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Account</h2>
          <p className="settings-section-desc">Manage your account settings</p>
        </div>
        <div className="settings-account-info">
          <div className="settings-account-row">
            <span className="settings-account-label">Email</span>
            <span className="settings-account-value">{user?.primaryEmailAddress?.emailAddress || 'Not available'}</span>
          </div>
          <div className="settings-account-row">
            <span className="settings-account-label">Account created</span>
            <span className="settings-account-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Danger Zone</h2>
          <p className="settings-section-desc">Irreversible actions</p>
        </div>
        <div className="settings-danger-content">
          <div className="settings-danger-item">
            <div>
              <h3>Delete all briefs</h3>
              <p>Permanently delete all your generated briefs</p>
            </div>
            <button className="settings-danger-btn">Delete All Briefs</button>
          </div>
          <div className="settings-danger-item">
            <div>
              <h3>Delete account</h3>
              <p>Permanently delete your account and all data</p>
            </div>
            <button className="settings-danger-btn">Delete Account</button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="settings-actions">
        <button className="settings-save-btn" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <i className="ph ph-spinner animate-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="ph ph-check"></i>
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
