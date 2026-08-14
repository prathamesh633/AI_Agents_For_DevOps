"use client";
import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import {
  BsLightningCharge,
  BsBarChart,
  BsBell,
  BsActivity,
  BsClockHistory,
  BsCpu,
  BsSpeedometer2,
  BsCheckCircle
} from 'react-icons/bs';

export default function PerformanceMonitoringPage() {
  const [realtimeUsage, setRealtimeUsage] = useState<number>(42);
  const [alerts, setAlerts] = useState<string[]>([
    "CPU usage spike detected on node01-us-east-1",
    "P99 latency threshold exceeded on /api/v1/auth"
  ]);

  const [history] = useState<number[]>([35, 42, 45, 50, 48, 52, 49, 44, 46, 55, 60, 58, 48, 42, 39, 41, 44, 42]);

  const kpis = [
    { name: 'Avg Response Time', value: '118ms', status: 'optimal' },
    { name: 'Throughput', value: '1.4k req/s', status: 'optimal' },
    { name: 'Error Rate', value: '0.04%', status: 'optimal' },
    { name: 'Memory Allocation', value: '58%', status: 'normal' },
    { name: 'Network I/O', value: '420 MB/s', status: 'normal' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeUsage(Math.min(Math.max(Math.floor(realtimeUsage + (Math.random() * 8 - 4)), 25), 85));
    }, 2000);
    return () => clearInterval(interval);
  }, [realtimeUsage]);

  return (
    <PageLayout
      title="Performance & APM Observability"
      description="Live cluster telemetry, latency percentiles, throughput metrics, and anomaly detection."
      agentType="performance-monitoring"
    >
      {/* Top Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cluster CPU Load</span>
            <BsLightningCharge className="text-emerald-600" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{realtimeUsage}%</span>
            <span className="text-[11px] text-emerald-600 font-medium">Nominal load</span>
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">P95 Response Time</span>
            <BsSpeedometer2 className="text-slate-600" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">118ms</span>
            <span className="text-[11px] text-emerald-600 font-medium">↓ 12ms</span>
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Throughput</span>
            <BsBarChart className="text-slate-600" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">1,420</span>
            <span className="text-[11px] text-slate-500 font-medium">req / sec</span>
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Error Rate</span>
            <BsCheckCircle className="text-emerald-500" size={16} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">0.04%</span>
            <span className="text-[11px] text-emerald-600 font-medium">SLA &gt; 99.9%</span>
          </div>
        </div>
      </div>

      {/* APM Telemetry & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {/* Real-time Telemetry Trend */}
        <div className="card lg:col-span-2 p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <BsActivity size={18} className="text-emerald-700" />
              <h2 className="text-sm font-bold text-slate-900">Real-Time Load Histogram</h2>
            </div>
            <span className="text-xs font-mono text-slate-500">Live stream (2s polling)</span>
          </div>

          <div className="h-40 flex items-end gap-2 pt-6 pb-2 px-2 bg-slate-50 border border-slate-200 rounded-lg">
            {history.map((val, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1 group">
                <div 
                  style={{ height: `${val * 1.5}px` }}
                  className={`w-full rounded-t transition-all ${
                    val > 55 ? 'bg-amber-500' : 'bg-slate-900 group-hover:bg-slate-700'
                  }`}
                  title={`${val}% utilization`}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[11px] text-slate-500 mt-2 px-1">
            <span>T-36s</span>
            <span>T-18s</span>
            <span>Now (Live)</span>
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BsBell size={18} className="text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">Telemetry Alerts</h2>
          </div>

          <div className="space-y-2.5">
            {alerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-900 font-medium leading-relaxed">{alert}</p>
                <span className="text-[10px] text-amber-700 mt-1 block">Triggered 4m ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional KPI metrics */}
      <div className="card p-5">
        <h2 className="text-sm font-bold text-slate-900 mb-3.5">Synthetic Performance Indicators</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {kpis.map((kpi, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50/40">
              <div className="text-slate-500 text-[11px] font-medium mb-1">{kpi.name}</div>
              <div className="text-base font-bold text-slate-900 font-mono">{kpi.value}</div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
