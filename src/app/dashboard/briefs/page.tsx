'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Brief {
  id: string;
  profile_name: string;
  profile_headline: string;
  profile_photo_url?: string;
  meeting_goal: string;
  is_saved: boolean;
  created_at: string;
}

const goalLabels: Record<string, string> = {
  networking: 'Networking',
  sales: 'Sales',
  hiring: 'Hiring',
  investor: 'Investor',
  partner: 'Partner',
  general: 'General',
};

export default function MyBriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState<string>('all');
  const [filterSaved, setFilterSaved] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  useEffect(() => {
    fetchBriefs();
  }, []);

  const fetchBriefs = async () => {
    try {
      const response = await fetch('/api/briefs');
      const data = await response.json();

      if (data.success) {
        setBriefs(data.data.briefs || []);
      }
    } catch (err) {
      console.error('Failed to fetch briefs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this brief?')) return;

    try {
      const response = await fetch(`/api/briefs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBriefs((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete brief:', err);
    }
  };

  const handleToggleSave = async (id: string, currentSaved: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const response = await fetch(`/api/briefs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_saved: !currentSaved }),
      });

      const data = await response.json();

      if (data.success) {
        setBriefs((prev) =>
          prev.map((b) => (b.id === id ? { ...b, is_saved: !currentSaved } : b))
        );
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const filteredBriefs = briefs
    .filter((brief) => {
      const matchesSearch =
        brief.profile_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.profile_headline.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGoal = filterGoal === 'all' || brief.meeting_goal === filterGoal;
      const matchesSaved = filterSaved === null || brief.is_saved === filterSaved;
      return matchesSearch && matchesGoal && matchesSaved;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return a.profile_name.localeCompare(b.profile_name);
    });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 className="dashboard-page-title">My Briefs</h1>
          <p className="dashboard-page-subtitle">
            {briefs.length} brief{briefs.length !== 1 ? 's' : ''} generated
          </p>
        </div>
        <Link href="/dashboard" className="brief-action-btn primary">
          <i className="ph ph-plus"></i>
          New Brief
        </Link>
      </div>

      {/* Filters */}
      <div className="briefs-filters">
        <div className="briefs-search">
          <i className="ph ph-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search briefs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="briefs-filter-group">
          <select
            value={filterGoal}
            onChange={(e) => setFilterGoal(e.target.value)}
            className="briefs-filter-select"
          >
            <option value="all">All Goals</option>
            {Object.entries(goalLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={filterSaved === null ? 'all' : filterSaved ? 'saved' : 'unsaved'}
            onChange={(e) => {
              const val = e.target.value;
              setFilterSaved(val === 'all' ? null : val === 'saved');
            }}
            className="briefs-filter-select"
          >
            <option value="all">All Briefs</option>
            <option value="saved">Saved Only</option>
            <option value="unsaved">Unsaved Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
            className="briefs-filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Briefs Grid */}
      {isLoading ? (
        <div className="briefs-loading">
          <div className="brief-loading-spinner"></div>
          <p>Loading briefs...</p>
        </div>
      ) : filteredBriefs.length > 0 ? (
        <div className="briefs-grid">
          {filteredBriefs.map((brief) => (
            <Link
              key={brief.id}
              href={`/dashboard/briefs/${brief.id}`}
              className="brief-card"
            >
              <div className="brief-card-header">
                <div className="brief-card-avatar">
                  {brief.profile_photo_url ? (
                    <img src={brief.profile_photo_url} alt={brief.profile_name} />
                  ) : (
                    getInitials(brief.profile_name)
                  )}
                </div>
                <div className="brief-card-actions">
                  <button
                    className={`brief-card-action ${brief.is_saved ? 'active' : ''}`}
                    onClick={(e) => handleToggleSave(brief.id, brief.is_saved, e)}
                    title={brief.is_saved ? 'Unsave' : 'Save'}
                  >
                    <i className={`ph ${brief.is_saved ? 'ph-star-fill' : 'ph-star'}`}></i>
                  </button>
                  <button
                    className="brief-card-action delete"
                    onClick={(e) => handleDelete(brief.id, e)}
                    title="Delete"
                  >
                    <i className="ph ph-trash"></i>
                  </button>
                </div>
              </div>
              <div className="brief-card-content">
                <h3 className="brief-card-name">{brief.profile_name}</h3>
                <p className="brief-card-headline">{brief.profile_headline}</p>
              </div>
              <div className="brief-card-footer">
                <span className="brief-card-goal">
                  {goalLabels[brief.meeting_goal] || 'General'}
                </span>
                <span className="brief-card-time-saved">
                  <i className="ph ph-clock"></i>
                  15 min saved
                </span>
                <span className="brief-card-date">{formatDate(brief.created_at)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="briefs-empty">
          <div className="briefs-empty-icon">
            <i className="ph ph-files"></i>
          </div>
          <h2>No briefs found</h2>
          {searchQuery || filterGoal !== 'all' || filterSaved !== null ? (
            <p>Try adjusting your filters or search query.</p>
          ) : (
            <>
              <p>Generate your first brief to get started!</p>
              <Link href="/dashboard" className="brief-action-btn primary" style={{ marginTop: '1rem' }}>
                <i className="ph ph-plus"></i>
                Generate Brief
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
