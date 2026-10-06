'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  Bot,
  User,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Receipt,
  Clock,
  History,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  CheckCheck,
  ShieldAlert,
  BookOpen,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import AIMessageContent from './AIMessageContent';

export interface UICardMetric {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface UICard {
  type: 'attendance' | 'marks' | 'assignments' | 'exam' | 'fee' | 'schedule' | 'generic';
  title: string;
  badge?: string;
  metrics: UICardMetric[];
}

export interface UIAction {
  label: string;
  path: string;
  icon?: string;
}

export interface ActionProposal {
  actionType: 'createAnnouncement' | 'createStudyPlan' | 'generateAttendanceReport';
  title: string;
  description: string;
  payload: Record<string, any>;
  requiresConfirmation: true;
}

export interface SourceCitation {
  documentName: string;
  category?: string;
  sourceCitation: string;
}

export interface AIChatMessageItem {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: SourceCitation[];
  actionProposal?: ActionProposal;
  uiCards?: UICard[];
  uiActions?: UIAction[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
  lastMessage?: string;
}

interface AIChatProps {
  initialRole?: string;
  initialUserName?: string;
  schoolName?: string;
}

export default function AIChat({
  initialRole,
  initialUserName,
  schoolName = 'Alpha Edu Hub',
}: AIChatProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');

  // Active conversation state
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationList, setConversationList] = useState<ConversationSummary[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Messages & input state
  const [messages, setMessages] = useState<AIChatMessageItem[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // Pending action proposal for confirmation modal
  const [pendingAction, setPendingAction] = useState<ActionProposal | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Dynamic session details
  const [userName, setUserName] = useState<string>(initialUserName || '');
  const [userRole, setUserRole] = useState<string>(initialRole || '');
  const [greeting, setGreeting] = useState<string>('Hi there 👋\nHow can I help you today?');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [isOpen, activeTab, messages, scrollToBottom]);

  // Load contextual greeting & dynamic suggestions whenever pathname changes
  const loadCopilotMeta = useCallback(async () => {
    try {
      const url = `/api/ai/chat?currentPath=${encodeURIComponent(pathname || '/')}`;
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.greeting) setGreeting(data.greeting);
          if (data.suggestions) setSuggestions(data.suggestions);
          if (data.user?.name) setUserName(data.user.name);
          if (data.user?.role) setUserRole(data.user.role);
        }
      }
    } catch (err) {
      console.warn('[AI CHAT] Failed to load session greeting:', err);
    }
  }, [pathname]);

  useEffect(() => {
    loadCopilotMeta();
  }, [loadCopilotMeta]);

  // Fetch user conversations list
  const loadConversations = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const res = await fetch('/api/ai/conversations');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversationList(data.conversations);
        }
      }
    } catch (err) {
      console.warn('[AI CHAT] Failed to load conversations list:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  // Switch to a previous conversation
  const handleSelectConversation = async (convId: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/ai/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.conversation) {
          setCurrentConversationId(convId);
          const rawMsgs = data.conversation.messages || [];
          setMessages(
            rawMsgs.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              uiCards: m.metadata?.uiCards,
              uiActions: m.metadata?.uiActions,
              sources: m.metadata?.sources,
              actionProposal: m.metadata?.actionProposal,
            }))
          );
          setActiveTab('chat');
        }
      }
    } catch (err) {
      setErrorMessage('Could not load selected conversation.');
    } finally {
      setIsLoading(false);
    }
  };

  // Start a fresh conversation
  const handleStartNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setErrorMessage(null);
    setPendingAction(null);
    setActionSuccessMessage(null);
    setActiveTab('chat');
  };

  // Rename a conversation
  const handleSaveRename = async (convId: string) => {
    if (!editingTitle.trim()) {
      setEditingConvId(null);
      return;
    }

    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (res.ok) {
        setConversationList((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: editingTitle.trim() } : c))
        );
      }
    } catch (err) {
      console.warn('[AI CHAT] Rename failed:', err);
    } finally {
      setEditingConvId(null);
      setEditingTitle('');
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const res = await fetch(`/api/ai/conversations/${convId}`, { method: 'DELETE' });
      if (res.ok) {
        setConversationList((prev) => prev.filter((c) => c.id !== convId));
        if (currentConversationId === convId) {
          handleStartNewChat();
        }
      }
    } catch (err) {
      console.warn('[AI CHAT] Delete failed:', err);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || isLoading) return;

    setErrorMessage(null);
    setActionSuccessMessage(null);
    setInput('');
    setLastUserPrompt(messageContent);

    const userMessage: AIChatMessageItem = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const history = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          conversationId: currentConversationId || undefined,
          currentPath: pathname,
          history,
        }),
      });

      const data = await res.json();

      if (data.success && data.message) {
        if (data.conversationId && !currentConversationId) {
          setCurrentConversationId(data.conversationId);
          loadConversations();
        }

        const assistantMessage: AIChatMessageItem = {
          id: `ai_${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: data.sources,
          actionProposal: data.actionProposal,
          uiCards: data.uiCards,
          uiActions: data.uiActions,
        };

        if (data.actionProposal) {
          setPendingAction(data.actionProposal);
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setErrorMessage(data.error || 'Failed to receive a response from Alpha AI Copilot.');
      }
    } catch (err) {
      console.error('[AI CHAT CLIENT ERROR]:', err);
      setErrorMessage(
        'Unable to communicate with the AI server. Please check your network connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm and execute pending action safely
  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setIsExecutingAction(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/ai/actions/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: pendingAction.actionType,
          payload: pendingAction.payload,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionSuccessMessage(data.message || 'Action executed successfully.');
        const successMessage: AIChatMessageItem = {
          id: `act_${Date.now()}`,
          role: 'assistant',
          content: `✅ **Action Confirmed & Executed**\n\n${data.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, successMessage]);
        setPendingAction(null);
      } else {
        setErrorMessage(data.error || 'Failed to execute proposed action.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while executing action.');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Copy assistant response
  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  // Retry last prompt
  const handleRetryLast = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderCardIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'marks':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      case 'exam':
      case 'schedule':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'fee':
        return <Receipt className="w-4 h-4 text-amber-600" />;
      case 'assignments':
        return <Clock className="w-4 h-4 text-sky-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <>
      {/* ─── Floating Trigger Button (Bottom-Right) ───────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open Alpha AI Copilot Assistant"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#0B72E7] to-[#1D4ED8] hover:from-[#095ec2] hover:to-[#1e40af] text-white rounded-full shadow-[0_8px_30px_rgb(11,114,231,0.35)] hover:shadow-[0_12px_36px_rgb(11,114,231,0.5)] transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98] group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-400" />
            </span>
          </div>
          <span className="font-semibold text-sm tracking-wide pr-1">Alpha Copilot</span>
        </button>
      )}

      {/* ─── Expandable Chat Modal Panel ──────────────────────────────── */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Alpha AI Copilot Chat Panel"
          className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[450px] max-w-full sm:max-w-[450px] h-[100dvh] sm:h-[640px] max-h-[100dvh] sm:max-h-[calc(100vh-48px)] bg-white/95 backdrop-blur-md rounded-none sm:rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#0B72E7] via-[#1E40AF] to-[#0B72E7] text-white flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-sm tracking-wide leading-tight text-white">
                    Alpha AI Copilot
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/20 text-sky-100 uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-blue-100/90 leading-tight">
                  {schoolName} • RAG & Live ERP
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Tab Toggle: Chat vs History */}
              <button
                onClick={() => setActiveTab(activeTab === 'chat' ? 'history' : 'chat')}
                title={activeTab === 'chat' ? 'View Conversation History' : 'Back to Chat'}
                aria-label="Toggle Conversation History"
                className={`p-1.5 rounded-lg transition-colors ${
                  activeTab === 'history' ? 'bg-white/20 text-white' : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                <History className="w-4 h-4" />
              </button>

              {/* New Chat Button */}
              <button
                onClick={handleStartNewChat}
                title="Start a new chat"
                aria-label="Start new chat"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                aria-label="Close assistant"
                className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ─── TAB: CONVERSATION HISTORY LIST ───────────────────────── */}
          {activeTab === 'history' ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Recent Conversations
                </span>
                <button
                  onClick={handleStartNewChat}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0B72E7] hover:bg-blue-700 rounded-lg transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>

              {isHistoryLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0B72E7]" />
                </div>
              ) : conversationList.length === 0 ? (
                <div className="text-center py-12 text-slate-500 space-y-2">
                  <History className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-medium">No previous conversations yet.</p>
                  <p className="text-[11px] text-slate-400">Your chat threads will be saved here automatically.</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {conversationList.map((conv) => {
                    const isSelected = currentConversationId === conv.id;
                    const isEditing = editingConvId === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={() => !isEditing && handleSelectConversation(conv.id)}
                        className={`group p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#0B72E7] text-[#0B72E7]'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          {isEditing ? (
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editingTitle}
                                onChange={(e) => setEditingTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveRename(conv.id);
                                  if (e.key === 'Escape') setEditingConvId(null);
                                }}
                                className="w-full text-xs px-2 py-1 bg-white border border-blue-400 rounded focus:outline-none"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveRename(conv.id)}
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingConvId(null)}
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <h4 className="text-xs font-semibold truncate leading-tight">{conv.title}</h4>
                              <p className="text-[10px] text-slate-400 pt-0.5">
                                {new Date(conv.updatedAt).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })} • {conv.messagesCount || 0} messages
                              </p>
                            </>
                          )}
                        </div>

                        {!isEditing && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingConvId(conv.id);
                                setEditingTitle(conv.title);
                              }}
                              title="Rename chat"
                              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteConversation(conv.id, e)}
                              title="Delete chat"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ─── TAB: ACTIVE CHAT CONVERSATION ──────────────────────── */
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 scroll-smooth">
              {/* Initial Welcome & Role Greeting Card */}
              {messages.length === 0 && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
                    <div className="flex items-center gap-2 text-[#0B72E7]">
                      <Bot className="w-5 h-5" />
                      <span className="font-semibold text-xs tracking-wider uppercase text-slate-500">
                        Institutional Copilot
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                      {greeting}
                    </p>
                    <p className="text-xs text-slate-500 pt-1 leading-normal">
                      Powered by institutional handbook policies, safe action workflows, and live ERP records.
                    </p>
                  </div>

                  {/* Contextual Dynamic Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 px-1">
                        Suggested actions & queries
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {suggestions.map((sugg, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sugg)}
                            className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-blue-50/80 hover:text-[#0B72E7] border border-slate-200 rounded-xl transition-all duration-150 shadow-xs hover:border-blue-200 cursor-pointer flex items-center justify-between group"
                          >
                            <span>{sugg}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0B72E7] transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Conversation Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  } animate-in fade-in duration-200`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B72E7] to-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed shadow-xs space-y-2.5 relative group ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#0B72E7] to-[#1D4ED8] text-white rounded-br-xs'
                        : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {/* Copy Response Button on Assistant messages */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        title="Copy answer"
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {copiedMessageId === msg.id ? (
                          <CheckCheck className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}

                    {/* Markdown Formatted Content */}
                    <AIMessageContent content={msg.content} isUser={msg.role === 'user'} />

                    {/* RAG Source Citations */}
                    {Array.isArray(msg.sources) && msg.sources.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-100 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-[#0B72E7]" />
                          Verified Sources:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.sources.map((s, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium"
                            >
                              {s.sourceCitation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Structured UI Cards */}
                    {Array.isArray(msg.uiCards) && msg.uiCards.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.uiCards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-2.5 space-y-2 shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-1.5">
                              <div className="flex items-center gap-1.5">
                                {renderCardIcon(card.type)}
                                <span className="font-semibold text-xs text-slate-800">{card.title}</span>
                              </div>
                              {card.badge && (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-[#0B72E7] rounded-full">
                                  {card.badge}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {card.metrics.map((m, mIdx) => (
                                <div
                                  key={mIdx}
                                  className={`rounded-lg p-1.5 text-center border ${
                                    m.highlight
                                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                                      : 'bg-white border-slate-100 text-slate-700'
                                  }`}
                                >
                                  <div className="text-[10px] text-slate-500 truncate">{m.label}</div>
                                  <div className="font-bold text-xs truncate">{m.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Follow-up Navigation Actions */}
                    {Array.isArray(msg.uiActions) && msg.uiActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-100">
                        {msg.uiActions.map((act, aIdx) => (
                          <button
                            key={aIdx}
                            onClick={() => router.push(act.path)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-blue-50 text-[#0B72E7] hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>{act.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1 text-right select-none ${
                        msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs uppercase shadow-xs">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {/* ─── PENDING ACTION CONFIRMATION MODAL / CARD ─────────── */}
              {pendingAction && (
                <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-2xl shadow-sm space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 text-amber-900">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs">{pendingAction.title}</h4>
                      <p className="text-[11px] text-amber-700">{pendingAction.description}</p>
                    </div>
                  </div>

                  {/* Payload Summary Preview */}
                  <div className="p-2.5 bg-white/90 rounded-xl border border-amber-200 text-[11px] text-slate-700 space-y-1">
                    {Object.entries(pendingAction.payload).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-slate-100 last:border-0 py-0.5">
                        <span className="font-medium text-slate-500 capitalize">{k}:</span>
                        <span className="font-semibold truncate max-w-[200px]">{String(v)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setPendingAction(null)}
                      disabled={isExecutingAction}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-amber-100/60 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAction}
                      disabled={isExecutingAction}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0B72E7] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {isExecutingAction ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Authorizing & Executing...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Confirm & Execute</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Action Success Alert */}
              {actionSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{actionSuccessMessage}</span>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-2.5 justify-start items-center text-slate-500 text-xs py-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0B72E7] to-indigo-600 flex items-center justify-center text-white shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  </div>
                  <div className="bg-white border border-slate-200/90 px-3.5 py-2 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B72E7] animate-ping" />
                    <span className="text-slate-600 text-xs font-medium">Processing school policies & records...</span>
                  </div>
                </div>
              )}

              {/* Error Message Alert with Retry */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start justify-between gap-2 shadow-xs">
                  <div className="flex items-start gap-2 flex-1">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                    <p className="font-medium">{errorMessage}</p>
                  </div>
                  {lastUserPrompt && (
                    <button
                      onClick={handleRetryLast}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 hover:underline shrink-0"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Footer Input Area (Only when in chat mode) */}
          {activeTab === 'chat' && (
            <div className="p-3 bg-white border-t border-slate-200/80">
              <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:bg-white focus-within:border-[#0B72E7] focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Alpha Copilot anything..."
                  aria-label="Ask Alpha Copilot anything..."
                  className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none max-h-24 py-1.5"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  title="Send message (Enter)"
                  aria-label="Send message"
                  className="p-1.5 rounded-lg bg-[#0B72E7] text-white hover:bg-[#095ec2] disabled:opacity-40 disabled:hover:bg-[#0B72E7] transition-all shrink-0 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-1.5">
                Press <kbd className="px-1 py-0.2 bg-slate-100 border rounded text-[9px]">Enter</kbd> to send, <kbd className="px-1 py-0.2 bg-slate-100 border rounded text-[9px]">Shift+Enter</kbd> for newline
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
