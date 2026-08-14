"use client";

import PageLayout from '@/components/PageLayout';
import { 
  BsClockHistory, 
  BsExclamationCircle, 
  BsCheck2Circle, 
  BsShieldExclamation,
  BsPlayFill
} from 'react-icons/bs';

export default function IncidentResponsePage() {
  return (
    <PageLayout
      title="Incident Response & Remediation"
      description="Automate triage, runbook execution, root-cause analysis, and post-mortem generation."
      agentType="incident-response"
    >
      <div className="card mb-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BsShieldExclamation size={18} className="text-rose-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Incident Triage</h3>
          </div>
          <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-medium">
            2 Unresolved
          </span>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 bg-rose-50/40 rounded-lg border border-rose-200">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <BsExclamationCircle className="text-rose-600" size={14} />
                <span className="font-bold text-xs text-slate-900">Database Connection Pool Starvation</span>
              </div>
              <span className="bg-rose-100 text-rose-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                CRITICAL
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2.5">
              Connection pool saturation causing intermittent HTTP 504 gateway timeouts in auth cluster.
            </p>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Detected 35m ago • 24 downstream services impacted</span>
              <button className="flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white text-xs px-2.5 py-1 rounded-md font-medium shadow-2xs cursor-pointer">
                <BsPlayFill size={14} /> Runbook
              </button>
            </div>
          </div>
          
          <div className="p-3.5 bg-amber-50/40 rounded-lg border border-amber-200">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <BsExclamationCircle className="text-amber-600" size={14} />
                <span className="font-bold text-xs text-slate-900">Payment Gateway P99 Latency Anomaly</span>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                HIGH
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-2.5">
              Stripe webhook dispatch delays exceeding 1,200ms threshold.
            </p>
            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Detected 2h ago • Auto-scaling group adjusting capacity</span>
              <button className="flex items-center gap-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-medium cursor-pointer">
                Investigate
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <BsClockHistory size={18} className="text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900">Recently Remediated Incidents</h3>
        </div>

        <div className="space-y-2.5">
          <div className="flex justify-between items-center p-3 bg-emerald-50/30 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2.5">
              <BsCheck2Circle className="text-emerald-600" size={16} />
              <div>
                <div className="font-semibold text-xs text-slate-900">Edge CDN Invalidation Failure</div>
                <div className="text-[11px] text-slate-500">Resolved 2 hours ago via Automated Cache Flush</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
              MTTR: 42m
            </span>
          </div>

          <div className="flex justify-between items-center p-3 bg-emerald-50/30 rounded-lg border border-emerald-200">
            <div className="flex items-center gap-2.5">
              <BsCheck2Circle className="text-emerald-600" size={16} />
              <div>
                <div className="font-semibold text-xs text-slate-900">OAuth2 Refresh Token Expiry Desync</div>
                <div className="text-[11px] text-slate-500">Resolved 1 day ago via Redis Lock Clear</div>
              </div>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
              MTTR: 28m
            </span>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
