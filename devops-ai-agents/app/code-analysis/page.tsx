"use client";

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  BsCodeSlash,
  BsShieldCheck,
  BsSpeedometer2,
  BsBarChart,
  BsArrowRepeat,
  BsGearWideConnected,
  BsCheck2Circle,
  BsExclamationTriangle,
  BsLightbulbFill,
  BsChevronRight
} from 'react-icons/bs';

export default function CodeAnalysisPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'features' | 'settings'>('overview');

  const codeMetrics = {
    bugs: 42,
    vulnerabilities: 7,
    codeCoverage: 68,
    duplications: 3.2,
    complexity: 'Medium',
    techDebt: '4d 2h',
    qualityGate: 'Passed'
  };

  const features = [
    {
      id: 'static-analysis',
      title: 'Static Code Analysis',
      description: 'Analyze code without execution to find bugs, vulnerabilities, and code smells early in development.',
      icon: <BsCodeSlash className="text-purple-700" size={20} />,
      metrics: ['156 issues resolved this month', '24% improvement in code quality'],
      integrations: ['GitHub', 'GitLab', 'BitBucket', 'Azure DevOps']
    },
    {
      id: 'security',
      title: 'Security Vulnerability Analysis',
      description: 'Identify OWASP Top 10 security vulnerabilities, secrets leakage, and compliance flaws.',
      icon: <BsShieldCheck className="text-emerald-700" size={20} />,
      metrics: ['7 critical vulnerabilities detected', '3 security hotspots need review'],
      integrations: ['Snyk', 'SonarQube', 'Veracode', 'Checkmarx']
    },
    {
      id: 'performance',
      title: 'Performance & Profiling Optimization',
      description: 'Detect memory leaks, async event loop blocking, and unindexed database queries.',
      icon: <BsSpeedometer2 className="text-amber-700" size={20} />,
      metrics: ['15% average response time improvement', '23 slow database queries optimized'],
      integrations: ['New Relic', 'Datadog', 'Dynatrace', 'Lighthouse']
    },
    {
      id: 'metrics',
      title: 'Code Quality Metrics',
      description: 'Track technical debt, duplication percentages, and maintainability index across repositories.',
      icon: <BsBarChart className="text-purple-700" size={20} />,
      metrics: ['Technical debt reduced by 18%', 'Test coverage increased to 68%'],
      integrations: ['SonarQube', 'CodeClimate', 'Codacy', 'Codecov']
    }
  ];

  const issues = [
    { id: 1, severity: 'Critical', type: 'Security', description: 'SQL injection vulnerability in login form', file: 'src/controllers/auth.js', line: 42 },
    { id: 2, severity: 'Major', type: 'Bug', description: 'Possible null reference exception in user payload', file: 'src/services/user.ts', line: 127 },
    { id: 3, severity: 'Minor', type: 'Code Smell', description: 'Function has cyclomatic complexity of 15', file: 'src/utils/parser.js', line: 85 },
    { id: 4, severity: 'Critical', type: 'Security', description: 'Hard-coded API credentials in configuration file', file: 'src/config/database.js', line: 23 },
    { id: 5, severity: 'Major', type: 'Bug', description: 'Race condition in concurrent cache transactions', file: 'src/services/transaction.ts', line: 94 }
  ];

  return (
    <PageLayout
      title="Code Analysis & Quality"
      description="Inspect source code quality, detect vulnerabilities, and enforce quality gate standards."
      agentType="code-analysis"
    >
      {/* Tabs Navigation in Clean White & Grey */}
      <div className="flex space-x-1 mb-6 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'issues'
              ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Issues ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'features'
              ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Modules
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'settings'
              ? 'text-purple-700 border-b-2 border-purple-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Quality Gates
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Quality Gate</span>
                <BsCheck2Circle className="text-emerald-500" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">A+</span>
                <span className="text-[11px] text-emerald-600 font-medium">Passed</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Issues</span>
                <BsExclamationTriangle className="text-amber-500" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{codeMetrics.bugs + codeMetrics.vulnerabilities}</span>
                <span className="text-[11px] text-rose-600 font-medium">2 Critical</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Test Coverage</span>
                <BsBarChart className="text-purple-600" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{codeMetrics.codeCoverage}%</span>
                <span className="text-[11px] text-emerald-600 font-medium">↑ 5% this sprint</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Technical Debt</span>
                <BsLightbulbFill className="text-slate-500" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{codeMetrics.techDebt}</span>
                <span className="text-[11px] text-emerald-600 font-medium">Low risk</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="card p-5 mb-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4">Repository Quality Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Reliability (Bugs)</span>
                  <span className="font-bold text-slate-900">{codeMetrics.bugs}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Security (CVEs)</span>
                  <span className="font-bold text-slate-900">{codeMetrics.vulnerabilities}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600">Maintainability (Smells)</span>
                  <span className="font-bold text-slate-900">124</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Issues Table */}
          <div className="card p-5">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-bold text-slate-900">Recent Static Analysis Findings</h2>
              <button className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 font-medium cursor-pointer">
                <BsArrowRepeat size={11} /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500 border-b border-slate-200">
                    <th className="pb-2 font-medium">Severity</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.map(issue => (
                    <tr key={issue.id} className="hover:bg-slate-50">
                      <td className="py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          issue.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                          issue.severity === 'Major' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {issue.severity}
                        </span>
                      </td>
                      <td className="py-2.5 font-medium text-slate-800">
                        {issue.type}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {issue.description}
                      </td>
                      <td className="py-2.5 font-mono text-[11px] text-slate-500">
                        {issue.file}:{issue.line}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="card p-5">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 className="text-sm font-bold text-slate-900">All Detected Code Issues</h2>
            <div className="flex items-center gap-2">
              <select className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-xs text-slate-700">
                <option>All Severities</option>
                <option>Critical</option>
                <option>Major</option>
                <option>Minor</option>
              </select>
              <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-md px-2.5 py-1 font-medium shadow-2xs">
                <BsArrowRepeat size={11} /> Re-scan
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left bg-slate-50 text-slate-600 border-y border-slate-200">
                  <th className="px-3 py-2.5 font-medium">Severity</th>
                  <th className="px-3 py-2.5 font-medium">Type</th>
                  <th className="px-3 py-2.5 font-medium">Description</th>
                  <th className="px-3 py-2.5 font-medium">File</th>
                  <th className="px-3 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {issues.map(issue => (
                  <tr key={issue.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        issue.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        issue.severity === 'Major' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {issue.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {issue.type}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {issue.description}
                    </td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500">
                      {issue.file}:{issue.line}
                    </td>
                    <td className="px-3 py-3">
                      <button className="text-purple-700 hover:text-purple-900 font-semibold text-xs">
                        Auto-Fix
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modules Tab */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map(feature => (
            <div key={feature.id} className="card p-4 bg-white border border-slate-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 flex-shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-600 mb-3">{feature.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {feature.integrations.map((integration, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] rounded px-2 py-0.5 font-mono">
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quality Gate Settings */}
      {activeTab === 'settings' && (
        <div className="card p-5">
          <h2 className="text-sm font-bold text-slate-900 mb-3">Quality Gate Enforcement</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Block PRs on Critical CVEs</h4>
                <p className="text-[11px] text-slate-500">Prevent merge if static scanner finds unresolved high/critical security issues.</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Enabled</span>
            </div>

            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Minimum 65% Unit Test Coverage</h4>
                <p className="text-[11px] text-slate-500">Fail CI pipeline if changed files decrease overall branch coverage below threshold.</p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">Enabled</span>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
