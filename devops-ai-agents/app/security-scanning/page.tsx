"use client";

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  BsShieldLock,
  BsSearch,
  BsExclamationTriangle,
  BsBug,
  BsShieldCheck,
  BsBarChart,
  BsCheckCircle,
  BsEye,
  BsFileCode,
  BsLock,
  BsTag
} from 'react-icons/bs';
import { FaServer, FaDatabase } from 'react-icons/fa';

export default function SecurityScanningPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vulnerabilities' | 'scans'>('dashboard');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedScan, setSelectedScan] = useState<string | null>(null);

  const vulnerabilityData = {
    critical: 5,
    high: 12,
    medium: 24,
    low: 18,
    info: 8,
    total: 67,
    fixed: 23,
    fixRate: 34
  };

  const scanHistory = [
    { 
      id: 'scan-001', 
      timestamp: '2025-04-09T08:30:00Z', 
      type: 'Full Container & Code Scan',
      target: 'Production Cluster', 
      status: 'Completed',
      vulnerabilities: { critical: 5, high: 12, medium: 24, low: 18 },
      duration: '12m 45s'
    },
    { 
      id: 'scan-002', 
      timestamp: '2025-04-08T15:12:00Z', 
      type: 'SAST Source Inspection',
      target: 'Backend API Gateway', 
      status: 'Completed',
      vulnerabilities: { critical: 0, high: 4, medium: 9, low: 7 },
      duration: '8m 12s'
    },
    { 
      id: 'scan-003', 
      timestamp: '2025-04-07T11:45:00Z', 
      type: 'Docker Image CVE Scan',
      target: 'Base Node.js Image', 
      status: 'Completed',
      vulnerabilities: { critical: 2, high: 5, medium: 11, low: 6 },
      duration: '10m 38s'
    }
  ];

  const vulnerabilities = [
    {
      id: 'vuln-001',
      title: 'SQL Injection Vulnerability',
      severity: 'Critical',
      category: 'Injection',
      location: 'src/controllers/user.js:42',
      description: 'User input is directly concatenated into SQL query without parameterization.',
      cwe: 'CWE-89',
      cvss: 8.8,
      remediation: 'Use parameterized queries or ORM models instead of raw string interpolation.',
      status: 'Open',
      discovered: '2025-04-09T08:30:00Z'
    },
    {
      id: 'vuln-002',
      title: 'Cross-Site Scripting (XSS)',
      severity: 'High',
      category: 'XSS',
      location: 'src/views/dashboard.jsx:157',
      description: 'User-supplied data is rendered directly to the DOM without proper escaping.',
      cwe: 'CWE-79',
      cvss: 6.4,
      remediation: 'Sanitize user input before DOM insertion and configure Content-Security-Policy.',
      status: 'Open',
      discovered: '2025-04-09T08:30:00Z'
    },
    {
      id: 'vuln-003',
      title: 'Insecure Direct Object Reference (IDOR)',
      severity: 'High',
      category: 'Access Control',
      location: 'src/api/resources.js:89',
      description: 'API endpoint does not verify ownership before resource access.',
      cwe: 'CWE-639',
      cvss: 7.1,
      remediation: 'Implement scoped RBAC checks against session user token.',
      status: 'Fixed',
      discovered: '2025-04-07T11:45:00Z'
    },
    {
      id: 'vuln-005',
      title: 'Insufficient Password Hashing Algorithm',
      severity: 'Critical',
      category: 'Authentication',
      location: 'src/services/auth.js:123',
      description: 'Passwords hashed with legacy single-round MD5.',
      cwe: 'CWE-916',
      cvss: 9.1,
      remediation: 'Migrate to Argon2id or bcrypt with minimum work factor of 12.',
      status: 'Open',
      discovered: '2025-04-09T08:30:00Z'
    }
  ].filter(v => filterSeverity === 'all' || v.severity.toLowerCase() === filterSeverity);

  const securityCompliance = [
    { standard: 'OWASP Top 10', compliance: 72, icon: <BsShieldLock size={16} /> },
    { standard: 'SOC 2 Type II', compliance: 85, icon: <BsShieldCheck size={16} /> },
    { standard: 'PCI DSS v4.0', compliance: 90, icon: <BsLock size={16} /> },
    { standard: 'CIS Benchmark', compliance: 78, icon: <BsShieldCheck size={16} /> }
  ];

  const scanCategories = [
    {
      id: 'code',
      name: 'SAST Source Analysis',
      description: 'Static analysis of application source code to detect security vulnerabilities',
      icon: <BsFileCode size={18} />,
      last_scan: '2 hours ago',
      issues: 37,
      fixed: 12
    },
    {
      id: 'dependencies',
      name: 'SCA Dependency Scanning',
      description: 'Identifies vulnerable npm / pip dependencies in lockfiles',
      icon: <BsTag size={18} />,
      last_scan: '5 hours ago',
      issues: 15,
      fixed: 6
    },
    {
      id: 'secrets',
      name: 'Secret & Key Detection',
      description: 'Detects hardcoded API tokens, private keys, and environment leaks',
      icon: <BsEye size={18} />,
      last_scan: '1 day ago',
      issues: 5,
      fixed: 3
    },
    {
      id: 'container',
      name: 'Container Image Security',
      description: 'Analyzes base images and OS packages for known CVEs',
      icon: <FaServer size={18} />,
      last_scan: '1 day ago',
      issues: 24,
      fixed: 9
    }
  ];

  return (
    <PageLayout
      title="Security Scanning & Vulnerability Management"
      description="Automate SAST/DAST scanning, detect secrets in pull requests, and enforce compliance."
      agentType="security-scanning"
    >
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'text-rose-700 border-b-2 border-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Security Posture
        </button>
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'vulnerabilities'
              ? 'text-rose-700 border-b-2 border-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Vulnerabilities ({vulnerabilities.length})
        </button>
        <button
          onClick={() => setActiveTab('scans')}
          className={`px-4 py-2 font-semibold transition-all cursor-pointer ${
            activeTab === 'scans'
              ? 'text-rose-700 border-b-2 border-rose-600 font-bold'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Scan Runs
        </button>
      </div>

      {/* Dashboard View */}
      {activeTab === 'dashboard' && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Critical CVEs</span>
                <BsExclamationTriangle className="text-rose-600" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{vulnerabilityData.critical}</span>
                <span className="text-[11px] text-rose-600 font-medium">Immediate patch</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Findings</span>
                <BsBug className="text-amber-500" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{vulnerabilityData.total}</span>
                <span className="text-[11px] text-slate-500 font-medium">Across all repos</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Remediated</span>
                <BsCheckCircle className="text-emerald-500" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{vulnerabilityData.fixed}</span>
                <span className="text-[11px] text-emerald-600 font-medium">Fixed this sprint</span>
              </div>
            </div>

            <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Fix Rate</span>
                <BsBarChart className="text-slate-600" size={16} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">{vulnerabilityData.fixRate}%</span>
                <span className="text-[11px] text-emerald-600 font-medium">MTTR: 18 hrs</span>
              </div>
            </div>
          </div>

          {/* Compliance & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <div className="card p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3.5">Compliance Standard Pass Rates</h2>
              <div className="space-y-3.5">
                {securityCompliance.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 flex items-center gap-1.5">
                        {item.icon} {item.standard}
                      </span>
                      <span className="font-mono font-bold text-slate-900">{item.compliance}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${item.compliance >= 85 ? 'bg-emerald-500' : 'bg-slate-800'}`} 
                        style={{ width: `${item.compliance}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-sm font-bold text-slate-900 mb-3.5">Active Scanner Engines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scanCategories.map((category) => (
                  <div key={category.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-xs text-slate-900">{category.name}</h3>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-2">
                      <span>{category.last_scan}</span>
                      <span className="font-semibold text-rose-600">{category.issues - category.fixed} open</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Vulnerabilities Tab */}
      {activeTab === 'vulnerabilities' && (
        <div className="card p-5">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 className="text-sm font-bold text-slate-900">Vulnerability Findings</h2>
            <div className="flex items-center gap-2">
              <select 
                className="px-2.5 py-1 border border-slate-300 rounded-md bg-white text-xs text-slate-700"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left bg-slate-50 text-slate-600 border-y border-slate-200">
                  <th className="px-3 py-2.5 font-medium">Severity</th>
                  <th className="px-3 py-2.5 font-medium">Title</th>
                  <th className="px-3 py-2.5 font-medium">Category</th>
                  <th className="px-3 py-2.5 font-medium">Location</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">CVSS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vulnerabilities.map((vuln) => (
                  <tr 
                    key={vuln.id} 
                    className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedScan(vuln.id === selectedScan ? null : vuln.id)}
                  >
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        vuln.severity === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        vuln.severity === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                        'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {vuln.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{vuln.title}</td>
                    <td className="px-3 py-3 text-slate-600">{vuln.category}</td>
                    <td className="px-3 py-3 font-mono text-[11px] text-slate-500">{vuln.location}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                        vuln.status === 'Open' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {vuln.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono font-bold text-slate-900">
                      {vuln.cvss.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedScan && (
            <div className="mt-4 p-4 border border-rose-200 bg-rose-50/40 rounded-lg">
              {(() => {
                const vuln = vulnerabilities.find(v => v.id === selectedScan);
                if (!vuln) return null;
                return (
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 mb-1">{vuln.title}</h3>
                    <p className="text-xs text-slate-600 mb-2">{vuln.description}</p>
                    <div className="text-xs font-medium text-slate-800 bg-white p-2.5 rounded border border-rose-200 mb-3">
                      <strong>Remediation:</strong> {vuln.remediation}
                    </div>
                    <button
                      onClick={() => setSelectedScan(null)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                    >
                      Close Details
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* Scans Tab */}
      {activeTab === 'scans' && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-slate-900">Security Scan Execution History</h2>
            <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-md px-3 py-1.5 font-medium shadow-2xs">
              <BsSearch size={11} /> Run Full Scan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left bg-slate-50 text-slate-600 border-y border-slate-200">
                  <th className="px-3 py-2.5 font-medium">Timestamp</th>
                  <th className="px-3 py-2.5 font-medium">Scan Type</th>
                  <th className="px-3 py-2.5 font-medium">Target</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scanHistory.map((scan) => (
                  <tr key={scan.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3 text-slate-600">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{scan.type}</td>
                    <td className="px-3 py-3 text-slate-600">{scan.target}</td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {scan.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-slate-500">{scan.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
