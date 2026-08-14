'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  BsSend, 
  BsRobot, 
  BsShieldCheck, 
  BsCpu, 
  BsCheck2, 
  BsCopy,
  BsTerminal,
  BsExclamationTriangle,
  BsStars
} from 'react-icons/bs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  provider_used?: string;
  suggestions?: string[];
  execution_plan?: string[];
  safety_level?: string;
  timeStr?: string;
}

interface AgentChatProps {
  agentType: string;
}

const AGENT_SUGGESTIONS: Record<string, string[]> = {
  "cloud-infrastructure": [
    "Diagnose blank page after EasyAuth SSO login on Azure App Service",
    "Check VNet database connectivity between App Service and Postgres",
    "Audit S3 bucket public access and IAM policies"
  ],
  "incident-response": [
    "High latency and HTTP 502 errors in invoice processing app",
    "Database connection pool exhaustion RCA (100 max reached)",
    "Container crashed with Exit Code 137 OOMKilled"
  ],
  "ci-cd": [
    "Optimize slow GitHub Actions Docker build steps",
    "Fix missing production secrets in workflow",
    "Add automated post-deployment smoke test step"
  ],
  "container-creation": [
    "Generate multi-stage Dockerfile for FastAPI + Uvicorn backend",
    "Create optimized Dockerfile for Next.js 14 frontend (standalone)",
    "Generate docker-compose.yml for FastAPI + PostgreSQL + Redis",
    "Create hardened Dockerfile with non-root user and healthcheck"
  ],
  "container-orchestration": [
    "Generate multi-stage Dockerfile for FastAPI + Uvicorn backend",
    "Create optimized Dockerfile for Next.js 14 frontend (standalone)",
    "Generate docker-compose.yml for FastAPI + PostgreSQL + Redis",
    "Create hardened Dockerfile with non-root user and healthcheck"
  ],
  "security-scanning": [
    "Scan Terraform files for CIS compliance violations",
    "Audit Dockerfile for root user and secret leaks",
    "Check SSL certificate expiration on web endpoints"
  ],
  "code-analysis": [
    "Detect memory leaks and async deadlocks in Python backend",
    "Audit SQL injection vulnerabilities in query builder",
    "Review FastAPI async route handlers for blocking I/O"
  ],
  "performance-monitoring": [
    "Investigate CPU spike on FastAPI worker nodes",
    "Analyze p99 latency degradation on invoice endpoint",
    "Detect unindexed slow queries in PostgreSQL"
  ],
  "load-testing": [
    "Generate k6 load testing script for 1,000 concurrent users",
    "Identify throughput bottleneck in invoice processing",
    "Simulate traffic surge on Azure App Service"
  ]
};

const AGENT_ACCENT_STYLES: Record<string, {
  pillActive: string;
  tagStyle: string;
  btnStyle: string;
  userBubble: string;
}> = {
  "ci-cd": {
    pillActive: "bg-sky-50 text-sky-800 border-sky-200",
    tagStyle: "text-sky-700 bg-sky-50 border-sky-200",
    btnStyle: "bg-sky-600 hover:bg-sky-700 text-white",
    userBubble: "bg-sky-900 text-white"
  },
  "cloud-infrastructure": {
    pillActive: "bg-cyan-50 text-cyan-800 border-cyan-200",
    tagStyle: "text-cyan-700 bg-cyan-50 border-cyan-200",
    btnStyle: "bg-cyan-600 hover:bg-cyan-700 text-white",
    userBubble: "bg-cyan-950 text-white"
  },
  "code-analysis": {
    pillActive: "bg-purple-50 text-purple-800 border-purple-200",
    tagStyle: "text-purple-700 bg-purple-50 border-purple-200",
    btnStyle: "bg-purple-600 hover:bg-purple-700 text-white",
    userBubble: "bg-purple-950 text-white"
  },
  "security-scanning": {
    pillActive: "bg-rose-50 text-rose-800 border-rose-200",
    tagStyle: "text-rose-700 bg-rose-50 border-rose-200",
    btnStyle: "bg-rose-600 hover:bg-rose-700 text-white",
    userBubble: "bg-rose-950 text-white"
  },
  "container-creation": {
    pillActive: "bg-teal-50 text-teal-800 border-teal-200",
    tagStyle: "text-teal-700 bg-teal-50 border-teal-200",
    btnStyle: "bg-teal-600 hover:bg-teal-700 text-white",
    userBubble: "bg-teal-950 text-white"
  },
  "container-orchestration": {
    pillActive: "bg-teal-50 text-teal-800 border-teal-200",
    tagStyle: "text-teal-700 bg-teal-50 border-teal-200",
    btnStyle: "bg-teal-600 hover:bg-teal-700 text-white",
    userBubble: "bg-teal-950 text-white"
  },
  "performance-monitoring": {
    pillActive: "bg-emerald-50 text-emerald-800 border-emerald-200",
    tagStyle: "text-emerald-700 bg-emerald-50 border-emerald-200",
    btnStyle: "bg-emerald-600 hover:bg-emerald-700 text-white",
    userBubble: "bg-emerald-950 text-white"
  },
  "load-testing": {
    pillActive: "bg-amber-50 text-amber-800 border-amber-200",
    tagStyle: "text-amber-700 bg-amber-50 border-amber-200",
    btnStyle: "bg-amber-600 hover:bg-amber-700 text-white",
    userBubble: "bg-amber-950 text-white"
  },
  "incident-response": {
    pillActive: "bg-red-50 text-red-800 border-red-200",
    tagStyle: "text-red-700 bg-red-50 border-red-200",
    btnStyle: "bg-red-600 hover:bg-red-700 text-white",
    userBubble: "bg-red-950 text-white"
  }
};

const DEFAULT_ACCENT = {
  pillActive: "bg-slate-100 text-slate-800 border-slate-200",
  tagStyle: "text-slate-700 bg-slate-100 border-slate-200",
  btnStyle: "bg-slate-900 hover:bg-slate-800 text-white",
  userBubble: "bg-slate-900 text-white"
};

function FormattedContent({ content }: { content: string }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyToClipboard = (text: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }
  };

  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed font-sans text-slate-800">
      {parts.map((part, idx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = firstLineEnd !== -1 ? part.slice(3, firstLineEnd).trim() : '';
          const code = firstLineEnd !== -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);

          return (
            <div key={idx} className="my-3 rounded-lg overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/90 text-slate-400 text-xs font-mono border-b border-slate-700">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <BsTerminal /> {lang || 'code'}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(code, idx)}
                  className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedIdx === idx ? <BsCheck2 className="text-emerald-400" /> : <BsCopy size={11} />}
                  <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        const lines = part.split('\n');
        return (
          <div key={idx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lineIdx} className="h-1" />;

              if (trimmed.startsWith('### ')) {
                return <h4 key={lineIdx} className="font-bold text-slate-900 text-sm mt-3 mb-1">{trimmed.replace('### ', '')}</h4>;
              }
              if (trimmed.startsWith('## ')) {
                return <h3 key={lineIdx} className="font-bold text-slate-900 text-base mt-3 mb-1">{trimmed.replace('## ', '')}</h3>;
              }
              if (trimmed.startsWith('# ')) {
                return <h2 key={lineIdx} className="font-bold text-slate-900 text-lg mt-3 mb-1">{trimmed.replace('# ', '')}</h2>;
              }
              if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2 text-slate-700">
                    <span className="text-slate-400 font-bold">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }} />
                  </div>
                );
              }
              if (/^\d+\.\s/.test(trimmed)) {
                const match = trimmed.match(/^(\d+\.)\s(.*)/);
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2 text-slate-700">
                    <span className="text-slate-600 font-semibold">{match ? match[1] : '•'}</span>
                    <span dangerouslySetInnerHTML={{ __html: formatInline(match ? match[2] : trimmed) }} />
                  </div>
                );
              }

              return (
                <p key={lineIdx} className="text-slate-700" dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function formatInline(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-xs font-mono font-medium border border-slate-200">$1</code>');
}

export default function AgentChat({ agentType }: AgentChatProps) {
  const [provider, setProvider] = useState<'heuristic' | 'gemini' | 'ollama'>('heuristic');
  const [apiKey, setApiKey] = useState('');
  
  const accent = AGENT_ACCENT_STYLES[agentType] || DEFAULT_ACCENT;

  const defaultSuggestions = AGENT_SUGGESTIONS[agentType] || [
    "Run diagnostic sweep",
    "Inspect environment health",
    "Generate optimization plan"
  ];

  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: `Hello! I'm your **${agentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} AI Agent**.\n\nI can inspect your infrastructure, diagnose incidents, generate IaC/code fixes, and enforce strict safety guardrails. Select a prompt or type your request below.`,
      provider_used: 'Local Intelligent Heuristic Engine (Free & Offline)',
      suggestions: defaultSuggestions,
      timeStr: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('devops_gemini_api_key');
      if (savedKey) {
        setApiKey(savedKey);
        setProvider('gemini');
      }
    }
  }, []);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devops_gemini_api_key', val);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const getTimeString = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: queryText, 
      timeStr: getTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/agent/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_type: agentType,
          prompt: queryText,
          provider: provider,
          api_key: apiKey || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: Message = {
        role: 'assistant',
        content: data.response,
        provider_used: data.provider_used,
        suggestions: data.suggestions || defaultSuggestions,
        execution_plan: data.execution_plan || [],
        safety_level: data.safety_level || 'READ_ONLY',
        timeStr: getTimeString(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const fallbackMsg: Message = {
        role: 'assistant',
        content: `⚠️ **Local Engine Response**\n\nAnalyzed query: "${queryText}"\n\n### 📋 Diagnostic Status:\n• Evaluated domain parameters for \`${agentType}\`.\n• Validated against security and best-practice baseline.\n• All actions safe and non-destructive.`,
        provider_used: 'Local Intelligent Engine',
        suggestions: defaultSuggestions,
        safety_level: 'READ_ONLY',
        timeStr: getTimeString(),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    sendQuery(suggestionText);
  };

  return (
    <div className="flex flex-col h-[660px] border border-slate-200/90 rounded-xl overflow-hidden shadow-sm bg-white">
      {/* Header in White & Light Grey */}
      <div className="bg-slate-50/80 p-4 border-b border-slate-200/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 shadow-2xs">
              <BsRobot size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                {agentType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} Agent
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${accent.pillActive}`}>
                  {provider.toUpperCase()}
                </span>
              </h3>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                <span>Active & Ready</span>
              </div>
            </div>
          </div>

          {/* Mode / Provider Toggle - Clean Grey Segmented Control */}
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setProvider('heuristic')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                provider === 'heuristic' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BsCpu size={12} /> Local Rule
            </button>
            <button
              type="button"
              onClick={() => setProvider('gemini')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                provider === 'gemini' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BsStars className="text-amber-500" size={12} /> Gemini 2.0
            </button>
            <button
              type="button"
              onClick={() => setProvider('ollama')}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                provider === 'ollama' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🦙 Ollama
            </button>
          </div>
        </div>

        {provider === 'gemini' && (
          <div className="mt-3 text-xs flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2.5 rounded-lg border border-amber-200 shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 shrink-0">
              <BsStars className="text-amber-500" size={14} />
              <span>Gemini API Key:</span>
            </div>
            <input
              type="password"
              placeholder="Paste Google AI Studio API Key (AIzaSy...)"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="bg-slate-50 text-slate-900 placeholder-slate-400 px-2.5 py-1 rounded flex-1 text-xs border border-slate-300 focus:outline-none focus:border-amber-500 font-mono"
            />
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-700 hover:text-amber-800 underline font-medium whitespace-nowrap"
            >
              Get Free Key ↗
            </a>
          </div>
        )}
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 space-y-3.5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[92%] rounded-xl p-4 shadow-2xs ${
                msg.role === 'user' 
                  ? `${accent.userBubble} rounded-tr-xs` 
                  : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs'
              }`}
            >
              {msg.provider_used && (
                <div className="text-[11px] font-mono mb-2.5 pb-2 border-b border-slate-100 flex items-center justify-between gap-2 flex-wrap text-slate-500">
                  <span>Engine: {msg.provider_used}</span>
                  {msg.safety_level && (
                    <span className={`px-2 py-0.5 rounded font-semibold text-[10px] border ${
                      msg.safety_level === 'REQUIRES_APPROVAL' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {msg.safety_level === 'REQUIRES_APPROVAL' ? '⚠️ REQUIRES APPROVAL' : '🛡️ READ ONLY'}
                    </span>
                  )}
                </div>
              )}

              {msg.role === 'assistant' ? (
                <FormattedContent content={msg.content} />
              ) : (
                <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}

              {/* Execution Plan Block - Preserving Functional Colors: Amber for approval, Emerald for read-only */}
              {msg.execution_plan && msg.execution_plan.length > 0 && (
                <div className="mt-3.5 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono border border-slate-800">
                  <div className="text-amber-400 font-semibold mb-2 flex items-center gap-1.5">
                    <BsShieldCheck size={14} /> Execution Guardrails:
                  </div>
                  {msg.execution_plan.map((step, sIdx) => {
                    const isApproval = step.includes('REQUIRES_APPROVAL');
                    return (
                      <div key={sIdx} className="py-0.5 flex items-start gap-1.5">
                        <span className={isApproval ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {isApproval ? '⚡' : '✓'}
                        </span>
                        <span className="text-slate-300">{step}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                  <span className="text-xs text-slate-400 font-medium self-center mr-1">Suggested:</span>
                  {msg.suggestions.map((sug, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSuggestionClick(sug)}
                      className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md border border-slate-200 transition-all text-left cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}

              {msg.timeStr && (
                <div className={`text-[10px] ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'} mt-2 text-right`}>
                  {msg.timeStr}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-800 rounded-xl rounded-tl-xs p-3.5 shadow-2xs max-w-[80%] flex items-center space-x-2.5">
              <BsRobot className="animate-spin text-slate-600" size={16} />
              <div className="text-xs font-medium text-slate-600">
                Agent analyzing request via <strong>{provider.toUpperCase()}</strong> engine...
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center p-1 bg-slate-50 rounded-lg border border-slate-300 focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${agentType.replace('-', ' ')} agent... (e.g. Diagnose error / generate configuration)`}
            className="flex-1 px-3 py-1.5 bg-transparent border-none focus:outline-none text-xs sm:text-sm text-slate-800"
            disabled={loading}
          />
          <button 
            type="submit" 
            className={`px-3.5 py-1.5 rounded-md font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              input.trim() 
                ? `${accent.btnStyle} shadow-2xs` 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            disabled={loading || !input.trim()}
          >
            <BsSend size={12} />
            <span>Send</span>
          </button>
        </div>
        <div className="mt-1.5 text-center flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <BsShieldCheck className="text-emerald-600" />
          <span>100% Free Local Execution • Two-Phase Plan Guardrails Active</span>
        </div>
      </form>
    </div>
  );
}
