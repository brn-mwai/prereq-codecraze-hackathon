'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SageVisual, useSageState, SageThinking } from '@/components/sage';
import { MODEL_GROUPS, getDefaultModel, type AIModel } from '@/config/ai-models';
import { useSidebar } from '@/components/dashboard';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  attachments?: { name: string; type: string }[];
}

interface RecentChat {
  id: string;
  title: string;
  briefId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RecentBrief {
  id: string;
  name: string;
  headline: string;
  photoUrl?: string;
  goal: string;
  createdAt: string;
}

const quickPrompts = [
  { label: 'Write intro email', prompt: 'Help me write a professional introduction email for a networking meeting. Make it personalized and warm.' },
  { label: 'LinkedIn DM template', prompt: 'Write a casual, authentic LinkedIn connection request message that gets responses. Keep it under 300 characters.' },
  { label: 'Meeting prep tips', prompt: 'What are your top tips for preparing for a professional meeting?' },
  { label: 'Follow-up email', prompt: 'Write a professional follow-up email template to send after a networking meeting.' },
  { label: 'Handle nerves', prompt: 'I get nervous before meetings. Any advice?' },
];

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/json',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function SagePage() {
  const { state: sageState, setThinking, setIdle, setSpeaking } = useSageState();
  const { setCollapsed } = useSidebar();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Sage AI, your meeting prep assistant. I'm here to help you prepare for professional meetings. You can also upload documents (PDF, Word, TXT, CSV) for me to analyze. What can I help you with today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => getDefaultModel());
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [recentBriefs, setRecentBriefs] = useState<RecentBrief[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);

  // Auto-collapse main sidebar when on Sage page
  useEffect(() => {
    setCollapsed(true);
    return () => {
      setCollapsed(false); // Restore previous state when leaving
    };
  }, [setCollapsed]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch recent chats and briefs on mount
  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();

      if (data.success) {
        setRecentChats(data.data.recent_chats || []);
        setRecentBriefs(data.data.recent_briefs || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent data:', err);
    }
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Load saved model preference
  useEffect(() => {
    const savedModelId = localStorage.getItem('sage-preferred-model');
    if (savedModelId) {
      const allModels = MODEL_GROUPS.flatMap(g => g.models);
      const savedModel = allModels.find(m => m.id === savedModelId);
      if (savedModel) {
        setSelectedModel(savedModel);
      }
    }
  }, []);

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(e.target as Node)) {
        setIsModelSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    setIsModelSelectorOpen(false);
    localStorage.setItem('sage-preferred-model', model.id);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I can't process "${file.name}". Please upload PDF, Word, TXT, CSV, or JSON files.`,
          },
        ]);
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `"${file.name}" is too large. Please upload files under 10MB.`,
          },
        ]);
        continue;
      }

      const fileId = `file-${Date.now()}-${i}`;
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
      };
      newFiles.push(uploadedFile);
    }

    if (newFiles.length === 0) return;

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Process files
    for (let i = 0; i < newFiles.length; i++) {
      const file = files[i];
      const uploadedFile = newFiles[i];

      try {
        // Update status to processing
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'processing' } : f))
        );

        // Create form data for upload
        const formData = new FormData();
        formData.append('file', file);
        if (sessionId) formData.append('session_id', sessionId);

        const response = await fetch('/api/chat/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.success) {
          if (!sessionId && data.data.session_id) {
            setSessionId(data.data.session_id);
          }

          setUploadedFiles((prev) =>
            prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'ready' } : f))
          );

          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: `I've processed "${file.name}". You can now ask me questions about its contents.`,
            },
          ]);
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      } catch (err) {
        setUploadedFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: 'error' } : f))
        );

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Sorry, I couldn't process "${file.name}". Please try again.`,
          },
        ]);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isSending) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    setThinking();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          model_id: selectedModel.id,
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
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't process that. Please try again." },
      ]);
      setIdle();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className={`sage-fullpage-wrapper ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Sidebar with recent chats and briefs */}
      <div className={`sage-sidebar ${showSidebar ? 'expanded' : 'collapsed'}`}>
        {/* Collapsed State - Icon Bar */}
        {!showSidebar && (
          <div className="sage-sidebar-collapsed">
            <button
              className="sage-sidebar-collapsed-btn"
              onClick={() => setShowSidebar(true)}
              title="Expand sidebar"
            >
              <i className="ph ph-sidebar-simple"></i>
            </button>
            <div className="sage-sidebar-collapsed-icons">
              <button
                className="sage-sidebar-icon-btn"
                onClick={() => setShowSidebar(true)}
                title="Recent Chats"
              >
                <i className="ph ph-chats"></i>
                {recentChats.length > 0 && (
                  <span className="sage-sidebar-icon-badge">{recentChats.length}</span>
                )}
              </button>
              <button
                className="sage-sidebar-icon-btn"
                onClick={() => setShowSidebar(true)}
                title="Recent Briefs"
              >
                <i className="ph ph-files"></i>
                {recentBriefs.length > 0 && (
                  <span className="sage-sidebar-icon-badge">{recentBriefs.length}</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Expanded State - Full Sidebar */}
        {showSidebar && (
          <>
            <div className="sage-sidebar-header">
              <h3>Recent Activity</h3>
              <button
                className="sage-sidebar-toggle"
                onClick={() => setShowSidebar(false)}
                title="Collapse sidebar"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>

            {/* Recent Chats */}
            <div className="sage-sidebar-section">
              <div className="sage-sidebar-section-title">
                <i className="ph ph-chats"></i>
                Recent Chats
              </div>
              {recentChats.length > 0 ? (
                <div className="sage-sidebar-list">
                  {recentChats.map((chat) => (
                    <div key={chat.id} className="sage-sidebar-item">
                      <i className="ph ph-chat-circle"></i>
                      <div className="sage-sidebar-item-info">
                        <span className="sage-sidebar-item-title">
                          {chat.title || 'Untitled Chat'}
                        </span>
                        <span className="sage-sidebar-item-time">
                          {formatTimeAgo(chat.updatedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="sage-sidebar-empty">No recent chats</p>
              )}
            </div>

            {/* Recent Briefs */}
            <div className="sage-sidebar-section">
              <div className="sage-sidebar-section-title">
                <i className="ph ph-files"></i>
                Recent Briefs
              </div>
              {recentBriefs.length > 0 ? (
                <div className="sage-sidebar-list">
                  {recentBriefs.map((brief) => (
                    <Link
                      key={brief.id}
                      href={`/dashboard/briefs/${brief.id}`}
                      className="sage-sidebar-item clickable"
                    >
                      <div className="sage-sidebar-avatar">
                        {brief.photoUrl ? (
                          <img src={brief.photoUrl} alt={brief.name} />
                        ) : (
                          getInitials(brief.name)
                        )}
                      </div>
                      <div className="sage-sidebar-item-info">
                        <span className="sage-sidebar-item-title">{brief.name}</span>
                        <span className="sage-sidebar-item-time">
                          {formatTimeAgo(brief.createdAt)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="sage-sidebar-empty">No recent briefs</p>
              )}
            </div>

            <Link href="/dashboard/briefs" className="sage-sidebar-viewall">
              View all briefs <i className="ph ph-arrow-right"></i>
            </Link>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className={`sage-fullpage ${showSidebar ? '' : 'expanded'}`}>
        {/* Drag overlay */}
        {isDragging && (
          <div className="sage-drag-overlay">
            <div className="sage-drag-content">
              <i className="ph ph-file-arrow-up"></i>
              <p>Drop files here to upload</p>
              <span>PDF, Word, TXT, CSV, JSON (max 10MB)</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sage-fullpage-header">
        <div className="sage-header-left">
          <div className="sage-fullpage-orb">
            <SageVisual state={sageState} size="large" colorMode={7} />
          </div>
          <div className="sage-fullpage-info">
            <h1>Chat with Sage AI</h1>
            <p>Your AI meeting preparation assistant</p>
          </div>
        </div>
        <div className="sage-header-right" ref={modelSelectorRef}>
          <button
            className="sage-model-selector-btn"
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
          >
            <i className={`ph ${selectedModel.provider === 'claude' ? 'ph-robot' : 'ph-lightning'}`}></i>
            <span className="sage-model-name">{selectedModel.name}</span>
            <i className={`ph ph-caret-${isModelSelectorOpen ? 'up' : 'down'}`}></i>
          </button>
          {isModelSelectorOpen && (
            <div className="sage-model-dropdown">
              <div className="sage-model-dropdown-header">
                <span>Select AI Model</span>
              </div>
              <div className="sage-model-dropdown-content">
                {MODEL_GROUPS.filter(g => g.models.length > 0).map((group) => (
                  <div key={group.label} className="sage-model-group">
                    <div className="sage-model-group-label">{group.label}</div>
                    {group.models.map((model) => (
                      <button
                        key={model.id}
                        className={`sage-model-option ${selectedModel.id === model.id ? 'selected' : ''}`}
                        onClick={() => handleModelSelect(model)}
                      >
                        <div className="sage-model-option-info">
                          <span className="sage-model-option-name">
                            {model.name}
                            {model.isRecommended && <span className="sage-model-badge recommended">Recommended</span>}
                            {model.isFast && <span className="sage-model-badge fast">Fast</span>}
                          </span>
                          <span className="sage-model-option-desc">{model.description}</span>
                        </div>
                        {selectedModel.id === model.id && (
                          <i className="ph ph-check"></i>
                        )}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="sage-fullpage-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`sage-fullpage-message ${msg.role}`}>
            <div className="sage-fullpage-message-content">
              {msg.content}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="sage-message-attachments">
                  {msg.attachments.map((att, j) => (
                    <span key={j} className="sage-attachment-badge">
                      <i className="ph ph-file"></i>
                      {att.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="sage-fullpage-message assistant">
            <div className="sage-thinking-bubble">
              <SageThinking size="small" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="sage-uploaded-files">
          {uploadedFiles.map((file) => (
            <div key={file.id} className={`sage-uploaded-file ${file.status}`}>
              <i className={`ph ${
                file.status === 'uploading' ? 'ph-spinner' :
                file.status === 'processing' ? 'ph-gear' :
                file.status === 'error' ? 'ph-warning' :
                'ph-file-text'
              } ${file.status === 'uploading' || file.status === 'processing' ? 'animate-spin' : ''}`}></i>
              <span className="sage-file-name">{file.name}</span>
              <span className="sage-file-size">{formatFileSize(file.size)}</span>
              <button
                className="sage-file-remove"
                onClick={() => removeFile(file.id)}
                title="Remove file"
              >
                <i className="ph ph-x"></i>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="sage-fullpage-prompts">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              className="sage-fullpage-prompt"
              onClick={() => handleSend(prompt.prompt)}
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="sage-fullpage-input-container">
        <div className="sage-fullpage-input-wrapper">
          <button
            className="sage-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Upload document"
          >
            <i className="ph ph-paperclip"></i>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="sage-file-input"
            accept=".pdf,.doc,.docx,.txt,.md,.csv,.json"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <input
            type="text"
            placeholder="Ask Sage anything or upload a document..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isSending}
          />
          <button
            className="sage-fullpage-send"
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
          >
            <i className="ph ph-paper-plane-tilt"></i>
          </button>
        </div>
        <p className="sage-fullpage-hint">
          Tip: Upload documents or generate a brief for personalized meeting advice
        </p>
      </div>
      </div>
    </div>
  );
}
