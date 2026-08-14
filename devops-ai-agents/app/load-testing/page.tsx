"use client";
import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  BsGraphUp,
  BsGearFill,
  BsLightning,
  BsCardChecklist,
  BsClipboardData,
  BsBarChart,
  BsPlayFill
} from 'react-icons/bs';

interface LoadTestResult {
  scenario: string;
  tps: number;
  errors: number;
  p95: string;
}

export default function LoadTestingPage() {
  const [testScenarios, setTestScenarios] = useState([
    { name: 'Smoke Test Baseline', load: 100, duration: '5m' },
    { name: 'Spike Traffic Test', load: 1500, duration: '10m' }
  ]);
  const [results, setResults] = useState<LoadTestResult[]>([
    { scenario: 'Smoke Test Baseline', tps: 240, errors: 0, p95: '128ms' }
  ]);
  const [loading, setLoading] = useState(false);

  const loadTestKpis = [
    { name: 'P95 Latency', value: '230ms', target: '<300ms', pass: true },
    { name: 'Max Throughput', value: '1,420 req/s', target: '>1,000 req/s', pass: true },
    { name: 'Error Rate', value: '0.08%', target: '<1.0%', pass: true },
    { name: 'Virtual Users (VU)', value: '2,500', target: 'Capacity 5k', pass: true }
  ];

  const runTest = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(prev => [
        { scenario: 'Spike Traffic Test', tps: 1380, errors: 2, p95: '242ms' },
        ...prev
      ]);
      setLoading(false);
    }, 1200);
  };

  const addScenario = () => {
    setTestScenarios([
      ...testScenarios,
      { name: `Stress Test Tier ${testScenarios.length + 1}`, load: 2000, duration: '15m' }
    ]);
  };

  return (
    <PageLayout
      title="Distributed Load & Stress Testing"
      description="Simulate real-world traffic volume, verify autoscaling thresholds, and analyze P99 latencies."
      agentType="load-testing"
    >
      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {loadTestKpis.map((kpi, idx) => (
          <div key={idx} className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{kpi.name}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                kpi.pass ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {kpi.target}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Scenarios Configuration */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BsCardChecklist size={18} className="text-indigo-700" />
              <h2 className="text-sm font-bold text-slate-900">Configured Scenarios</h2>
            </div>
            <button
              onClick={addScenario}
              className="text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md font-medium cursor-pointer"
            >
              + Add Scenario
            </button>
          </div>

          <div className="space-y-3">
            {testScenarios.map((sc, idx) => (
              <div key={idx} className="p-3 bg-slate-50/50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-xs text-slate-900">{sc.name}</h4>
                  <span className="text-[11px] text-slate-500">{sc.load} Virtual Users • {sc.duration} ramp</span>
                </div>
                <button
                  onClick={runTest}
                  disabled={loading}
                  className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded-md shadow-2xs cursor-pointer"
                >
                  <BsPlayFill size={14} /> Run
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Live Metrics & Test Results */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BsClipboardData size={18} className="text-indigo-700" />
              <h2 className="text-sm font-bold text-slate-900">Execution Run Results</h2>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-lg">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mb-2"></div>
              <p className="text-xs text-slate-600">Simulating concurrent virtual user workloads...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((res, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-xs text-slate-900">{res.scenario}</h4>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                      res.errors === 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {res.errors === 0 ? 'Passed' : `${res.errors} Errors`}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[11px] text-slate-600 mt-2 font-mono">
                    <span>TPS: <strong className="text-slate-900">{res.tps}</strong></span>
                    <span>P95: <strong className="text-slate-900">{res.p95}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
