"use client";

import { useState, useEffect, useRef } from 'react';
import PageLayout from '@/components/PageLayout';
import { 
  BsGear, 
  BsCheckCircle, 
  BsArrowRepeat, 
  BsBarChart, 
  BsGithub, 
  BsRobot, 
  BsLightning, 
  BsArrowClockwise,
  BsGit,
  BsPlay,
  BsServer,
  BsTerminal,
  BsQuestionCircle,
  BsChevronDown,
  BsChevronUp,
  BsCodeSquare,
  BsHourglassSplit,
  BsXCircle,
  BsInfoCircle
} from 'react-icons/bs';
import { FaGitlab, FaBitbucket } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Types for our GitHub and AI integration data
interface GitHubWorkflow {
  id: string;
  name: string;
  status: 'success' | 'running' | 'failed';
  lastRun: string;
  duration: string;
  url: string;
  branch: string;
}

interface AIAnalysis {
  id: string;
  suggestion: string;
  improvement: string;
  confidenceScore: number;
  category: 'performance' | 'security' | 'reliability' | 'cost';
  applied: boolean;
}

interface MCPServerStatus {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  lastStarted?: string;
  port: number;
  endpoint: string;
}

interface GitPlatform {
  id: string;
  name: string;
  icon: JSX.Element;
  connected: boolean;
  url?: string;
}

export default function CiCdPage() {
  const [workflows, setWorkflows] = useState<GitHubWorkflow[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis[]>([]);
  
  const [mcpServers, setMcpServers] = useState<MCPServerStatus[]>([
    {
      id: 'mcp-1',
      name: 'Production MCP',
      status: 'running',
      lastStarted: new Date().toISOString(),
      port: 8080,
      endpoint: '/api/v1/production'
    },
    {
      id: 'mcp-2',
      name: 'Staging MCP',
      status: 'stopped',
      port: 8081,
      endpoint: '/api/v1/staging'
    },
    {
      id: 'mcp-3',
      name: 'Development MCP',
      status: 'stopped',
      port: 8082,
      endpoint: '/api/v1/development'
    }
  ]);
  
  const [loading, setLoading] = useState({
    github: false,
    ai: false,
    mcp: false,
    git: false
  });
  
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const [gitPlatforms, setGitPlatforms] = useState<GitPlatform[]>([
    {
      id: 'github',
      name: 'GitHub',
      icon: <BsGithub size={18} />,
      connected: true,
      url: 'https://github.com/organization/repo'
    },
    {
      id: 'gitlab',
      name: 'GitLab',
      icon: <FaGitlab size={18} />,
      connected: false
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      icon: <FaBitbucket size={18} />,
      connected: false
    }
  ]);

  const aiQuestions = [
    "How can I optimize my Docker build steps to reduce build time?",
    "What are the common failure points in my CI pipeline for the feature branch?",
    "How should I configure resource limits for my Kubernetes deployments?"
  ];
  
  const [selectedQuestion, setSelectedQuestion] = useState('');
  
  const [expandedSections, setExpandedSections] = useState({
    gitPlatforms: true,
    mcpServers: true,
    workflows: true,
    aiQuestions: true,
    aiAnalysis: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchGitHubWorkflows = async () => {
    setLoading(prev => ({ ...prev, github: true }));
    
    setTimeout(() => {
      const mockWorkflows: GitHubWorkflow[] = [
        {
          id: 'wf-1',
          name: 'Main Build Pipeline',
          status: 'success',
          lastRun: new Date(Date.now() - 40 * 60000).toISOString(),
          duration: '8m 12s',
          url: 'https://github.com/organization/repo/actions/workflows/main.yml',
          branch: 'main'
        },
        {
          id: 'wf-2',
          name: 'Integration Tests',
          status: 'running',
          lastRun: new Date(Date.now() - 15 * 60000).toISOString(),
          duration: '15m 47s',
          url: 'https://github.com/organization/repo/actions/workflows/integration.yml',
          branch: 'feature/new-api'
        },
        {
          id: 'wf-3',
          name: 'Deploy to Staging',
          status: 'failed',
          lastRun: new Date(Date.now() - 120 * 60000).toISOString(),
          duration: '3m 45s',
          url: 'https://github.com/organization/repo/actions/workflows/deploy-staging.yml',
          branch: 'release/v2.3'
        },
        {
          id: 'wf-4',
          name: 'Security Scan',
          status: 'success',
          lastRun: new Date(Date.now() - 180 * 60000).toISOString(),
          duration: '12m 33s',
          url: 'https://github.com/organization/repo/actions/workflows/security.yml',
          branch: 'main'
        }
      ];
      
      setWorkflows(mockWorkflows);
      setLoading(prev => ({ ...prev, github: false }));
    }, 800);
  };

  const fetchAIAnalysis = async () => {
    setLoading(prev => ({ ...prev, ai: true }));
    
    setTimeout(() => {
      const mockAnalysis: AIAnalysis[] = [
        {
          id: 'ai-1',
          suggestion: 'Optimize Docker Image Caching',
          improvement: 'Current Docker build times could be reduced by ~42% by implementing proper layer caching strategies in your Dockerfiles.',
          confidenceScore: 0.89,
          category: 'performance',
          applied: false
        },
        {
          id: 'ai-2',
          suggestion: 'Parallelize Test Execution',
          improvement: 'Split your test suite into multiple parallel jobs to reduce total build time by approximately 65%.',
          confidenceScore: 0.78,
          category: 'performance',
          applied: false
        },
        {
          id: 'ai-3',
          suggestion: 'Add Secret Scanning',
          improvement: 'Implement automated secret scanning in your pipeline to detect potential credential leaks before they reach production.',
          confidenceScore: 0.95,
          category: 'security',
          applied: false
        }
      ];
      
      setAiAnalysis(mockAnalysis);
      setLoading(prev => ({ ...prev, ai: false }));
    }, 1000);
  };

  const applyAIOptimization = (id: string) => {
    setAiAnalysis(prev => 
      prev.map(item => 
        item.id === id ? { ...item, applied: true } : item
      )
    );
    
    showFeedbackMessage(`Optimization "${aiAnalysis.find(a => a.id === id)?.suggestion}" applied.`);
  };

  const toggleMcpServer = async (serverId: string) => {
    setLoading(prev => ({ ...prev, mcp: true }));
    
    setTimeout(() => {
      const updatedServers = mcpServers.map(s => {
        if (s.id === serverId) {
          const newStatus = s.status === 'running' ? 'stopped' as const : 'running' as const;
          const lastStarted = newStatus === 'running' ? new Date().toISOString() : s.lastStarted;
          
          return {
            ...s,
            status: newStatus,
            lastStarted
          };
        }
        return s;
      });
      
      setMcpServers(updatedServers);
      setLoading(prev => ({ ...prev, mcp: false }));
      
      const server = updatedServers.find(s => s.id === serverId);
      if (server?.status === 'running') {
        showFeedbackMessage(`MCP Server "${server.name}" started on port ${server.port}`);
      } else {
        showFeedbackMessage(`MCP Server "${server?.name}" stopped`);
      }
    }, 800);
  };

  const connectGitPlatform = async (platformId: string) => {
    setLoading(prev => ({ ...prev, git: true }));
    
    setTimeout(() => {
      const updatedPlatforms = gitPlatforms.map(p => {
        if (p.id === platformId) {
          return {
            ...p,
            connected: !p.connected,
            url: !p.connected ? `https://${p.id}.com/organization/repo` : undefined
          };
        }
        return p;
      });
      
      setGitPlatforms(updatedPlatforms);
      setLoading(prev => ({ ...prev, git: false }));
      
      const platform = updatedPlatforms.find(p => p.id === platformId);
      if (platform?.connected) {
        showFeedbackMessage(`Connected to ${platform.name}`);
      } else {
        showFeedbackMessage(`Disconnected from ${platform?.name}`);
      }
    }, 600);
  };

  const askAIQuestion = (question: string) => {
    setSelectedQuestion(question);
    showFeedbackMessage(`AI analyzing: "${question}"...`);
    
    setTimeout(() => {
      showFeedbackMessage(`AI Suggestion: Caching npm/pip dependencies across GitHub Actions jobs reduces pipeline execution duration by ~35%.`);
    }, 1500);
  };

  const showFeedbackMessage = (message: string) => {
    setFeedbackMessage(message);
    if (feedbackTimeout.current) {
      clearTimeout(feedbackTimeout.current);
    }
    feedbackTimeout.current = setTimeout(() => {
      setFeedbackMessage('');
    }, 6000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) {
        clearTimeout(feedbackTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    fetchGitHubWorkflows();
  }, []);

  useEffect(() => {
    if (workflows.length > 0) {
      fetchAIAnalysis();
    }
  }, [workflows]);

  return (
    <PageLayout
      title="CI/CD Pipeline Management"
      description="Optimize your continuous integration and delivery pipelines with AI-driven insights."
      agentType="ci-cd"
    >
      {/* Summary Cards in White & Grey with Functional Workflow Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        {/* Workflows (Green) */}
        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Total Workflows</div>
              <div className="text-xl font-bold text-slate-900">{workflows.length}</div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <BsCodeSquare size={18} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active GitHub Actions
          </div>
        </div>
        
        {/* Running (Sky) */}
        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Running Workflows</div>
              <div className="text-xl font-bold text-slate-900">{workflows.filter(w => w.status === 'running').length}</div>
            </div>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-700">
              <BsHourglassSplit size={18} />
            </div>
          </div>
          <div className="text-[11px] text-sky-600 font-medium mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span> In Progress
          </div>
        </div>
        
        {/* Failed (Red) */}
        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Failed Workflows</div>
              <div className="text-xl font-bold text-slate-900">{workflows.filter(w => w.status === 'failed').length}</div>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <BsXCircle size={18} />
            </div>
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Needs Attention
          </div>
        </div>
      </div>

      {/* Git Platform Integration */}
      <motion.div 
        className="card mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('gitPlatforms')}>
          <div className="flex items-center gap-2">
            <BsGit size={18} className="text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">Git Platform Integration</h3>
          </div>
          <button className="text-slate-400 hover:text-slate-700">
            {expandedSections.gitPlatforms ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.gitPlatforms && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {gitPlatforms.map(platform => (
                  <div 
                    key={platform.id} 
                    className={`border rounded-lg p-3.5 transition-all ${
                      platform.connected 
                        ? 'bg-emerald-50/40 border-emerald-200' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-700">{platform.icon}</span>
                        <h4 className="font-semibold text-xs text-slate-900">{platform.name}</h4>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        platform.connected 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {platform.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    
                    {platform.connected && platform.url && (
                      <div className="text-[11px] text-slate-500 mb-2 truncate">
                        Repo: <a href={platform.url} target="_blank" rel="noopener noreferrer" className="text-sky-700 hover:underline">{platform.url}</a>
                      </div>
                    )}
                    
                    <button
                      onClick={() => connectGitPlatform(platform.id)}
                      className={`w-full text-xs py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                        platform.connected 
                          ? 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                      disabled={loading.git}
                    >
                      {platform.connected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
              <div className="text-xs text-slate-600 bg-sky-50/50 p-2.5 rounded-lg border border-sky-100 flex items-start gap-2">
                <BsInfoCircle className="text-sky-700 mt-0.5 flex-shrink-0" size={14} />
                <p>Connect your repositories to enable automated workflow discovery and CI/CD healing.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* MCP Server Controls */}
      <motion.div 
        className="card mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
      >
        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('mcpServers')}>
          <div className="flex items-center gap-2">
            <BsServer size={18} className="text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">MCP Server Controls</h3>
          </div>
          <button className="text-slate-400 hover:text-slate-700">
            {expandedSections.mcpServers ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.mcpServers && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                {mcpServers.map(server => (
                  <div key={server.id} className="border border-slate-200 rounded-lg p-3 bg-white shadow-2xs">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 mb-0.5">{server.name}</h4>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2">
                          <span>Endpoint: <code className="font-mono text-slate-700">{server.endpoint}</code></span>
                          {server.status === 'running' && server.lastStarted && (
                            <span>• Port: {server.port}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status badge: Green for running, Red for error, Grey for stopped */}
                        <span className={`flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          server.status === 'running' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : server.status === 'error'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                            server.status === 'running' 
                              ? 'bg-emerald-500' 
                              : server.status === 'error'
                                ? 'bg-rose-500'
                                : 'bg-slate-400'
                          }`}></span>
                          {server.status.toUpperCase()}
                        </span>
                        
                        <button
                          onClick={() => toggleMcpServer(server.id)}
                          className={`flex items-center rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors ${
                            server.status === 'running'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                          }`}
                          disabled={loading.mcp}
                        >
                          {server.status === 'running' ? (
                            <>
                              <BsTerminal className="mr-1" size={11} />
                              Stop
                            </>
                          ) : (
                            <>
                              <BsPlay className="mr-1" size={12} />
                              Start
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* GitHub Workflow Integration */}
      <motion.div 
        className="card mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('workflows')}>
          <div className="flex items-center gap-2">
            <BsGithub size={18} className="text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">GitHub Workflow Status</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                fetchGitHubWorkflows();
              }}
              className="flex items-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700 font-medium cursor-pointer"
              disabled={loading.github}
            >
              <BsArrowClockwise className={`mr-1 ${loading.github ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button className="text-slate-400 hover:text-slate-700">
              {expandedSections.workflows ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {expandedSections.workflows && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loading.github ? (
                <div className="flex justify-center items-center py-6 text-xs text-slate-500">
                  <BsArrowClockwise className="animate-spin text-sky-700 mr-2" />
                  <span>Loading pipelines...</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {workflows.map(workflow => (
                    <div 
                      key={workflow.id} 
                      className={`border rounded-lg p-3 transition-all ${
                        workflow.status === 'success'
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : workflow.status === 'running'
                            ? 'bg-sky-50/40 border-sky-200'
                            : 'bg-rose-50/40 border-rose-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            {workflow.status === 'success' && <BsCheckCircle className="text-emerald-600" size={14} />}
                            {workflow.status === 'running' && <BsArrowRepeat className="text-sky-600 animate-spin" size={14} />}
                            {workflow.status === 'failed' && <BsXCircle className="text-rose-600" size={14} />}
                            <h4 className="font-semibold text-xs text-slate-900">{workflow.name}</h4>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">{workflow.branch}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                            <span>Last Run: {new Date(workflow.lastRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>Duration: {workflow.duration}</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            workflow.status === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : workflow.status === 'running'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {workflow.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Pipeline Optimizations */}
      <motion.div 
        className="card mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.15 }}
      >
        <div className="flex items-center justify-between mb-3 cursor-pointer" onClick={() => toggleSection('aiAnalysis')}>
          <div className="flex items-center gap-2">
            <BsRobot size={18} className="text-sky-700" />
            <h3 className="text-base font-bold text-slate-900">AI Pipeline Analysis</h3>
          </div>
          <button className="text-slate-400 hover:text-slate-700">
            {expandedSections.aiAnalysis ? <BsChevronUp size={14} /> : <BsChevronDown size={14} />}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.aiAnalysis && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-3">
                {aiAnalysis.map(analysis => (
                  <div 
                    key={analysis.id} 
                    className={`border rounded-lg p-3.5 ${
                      analysis.applied
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                        {analysis.category}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        Confidence: {Math.round(analysis.confidenceScore * 100)}%
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 mb-1">{analysis.suggestion}</h4>
                    <p className="text-xs text-slate-600 mb-2 leading-relaxed">{analysis.improvement}</p>
                    
                    {!analysis.applied ? (
                      <button
                        onClick={() => applyAIOptimization(analysis.id)}
                        className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer shadow-2xs"
                      >
                        <BsLightning size={11} />
                        Apply Optimization
                      </button>
                    ) : (
                      <div className="flex items-center text-emerald-600 text-xs font-medium">
                        <BsCheckCircle className="mr-1" />
                        Optimization Active
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Feedback Toast */}
      <AnimatePresence>
        {feedbackMessage && (
          <motion.div 
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-slate-900 text-white text-xs font-medium rounded-xl shadow-xl border border-slate-700 flex items-center gap-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.2 }}
          >
            <BsCheckCircle className="text-emerald-400" />
            <span>{feedbackMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
