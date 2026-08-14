"use client";

import { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { 
  BsCloud, 
  BsServer, 
  BsCurrencyDollar, 
  BsGear, 
  BsArrowClockwise, 
  BsCheck2Circle, 
  BsTerminal, 
  BsLightningCharge,
  BsBarChart,
  BsArrowRepeat,
  BsPlus,
  BsShield,
  BsArrowRight,
  BsExclamationTriangle,
  BsExclamationTriangleFill,
  BsClockHistory,
  BsCheckCircle,
  BsFillPlayFill,
  BsStopFill
} from 'react-icons/bs';
import { FaAws, FaGoogle, FaMicrosoft, FaServer } from 'react-icons/fa';
import { SiOracle, SiDigitalocean } from 'react-icons/si';

// Types for our cloud infrastructure data
interface CloudProvider {
  id: string;
  name: string;
  icon: JSX.Element;
  connected: boolean;
  resources?: number;
  regions?: string[];
  account?: string;
  details?: string;
}

interface MCPServerCloudConfig {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  cloudProvider: string;
  region: string;
  lastSync: string | null;
  resourceCount: number;
}

interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  impact: string;
  savingsPercentage: number;
  category: 'cost' | 'performance' | 'security' | 'compliance';
  difficulty: 'easy' | 'medium' | 'hard';
  implemented: boolean;
}

interface ResourceMetric {
  name: string;
  usage: number;
  limit: number;
  unit: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'active' | 'investigating' | 'mitigating' | 'resolved';
  affectedServices: string[];
  affectedRegions: string[];
  detectedAt: string;
  resolvedAt: string | null;
  cloudProvider: string;
  metrics?: {
    impactedUsers: number;
    serviceDowntime: number;
    responseTime: number;
  };
  timeline?: {
    time: string;
    event: string;
  }[];
}

export default function CloudInfrastructurePage() {
  const [liveCloudData, setLiveCloudData] = useState<any>(null);

  const [cloudProviders, setCloudProviders] = useState<CloudProvider[]>([
    {
      id: 'azure',
      name: 'Microsoft Azure',
      icon: <FaMicrosoft size={20} />,
      connected: true,
      resources: 1,
      regions: ['AzureCloud']
    },
    {
      id: 'aws',
      name: 'AWS',
      icon: <FaAws size={20} />,
      connected: false
    },
    {
      id: 'gcp',
      name: 'Google Cloud',
      icon: <FaGoogle size={20} />,
      connected: false
    },
    {
      id: 'oracle',
      name: 'Oracle Cloud',
      icon: <SiOracle size={20} />,
      connected: false
    },
    {
      id: 'ibm',
      name: 'IBM Cloud',
      icon: <FaServer size={20} />,
      connected: false
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean',
      icon: <SiDigitalocean size={20} />,
      connected: false
    }
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/api/cloud/live-status')
      .then(res => res.json())
      .then(data => {
        setLiveCloudData(data);
        if (data && data.azure) {
          setCloudProviders(prev => prev.map(p => {
            if (p.id === 'azure') {
              return {
                ...p,
                connected: data.azure.connected,
                resources: data.azure.connected ? 1 : 0,
                regions: data.azure.connected ? ['AzureCloud'] : undefined,
                account: data.azure.user,
                details: data.azure.subscription_name
              };
            }
            if (p.id === 'aws') {
              return {
                ...p,
                connected: data.aws?.connected || false,
                account: data.aws?.arn
              };
            }
            if (p.id === 'gcp') {
              return {
                ...p,
                connected: data.gcp?.connected || false,
                account: data.gcp?.account
              };
            }
            return p;
          }));
        }
      })
      .catch(() => {});
  }, []);

  const [mcpServers, setMcpServers] = useState<MCPServerCloudConfig[]>([
    {
      id: 'mcp-1',
      name: 'Production Cloud MCP',
      status: 'running',
      cloudProvider: 'aws',
      region: 'us-east-1',
      lastSync: new Date().toISOString(),
      resourceCount: 18
    },
    {
      id: 'mcp-2',
      name: 'Development Cloud MCP',
      status: 'stopped',
      cloudProvider: 'gcp',
      region: 'us-central1',
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      resourceCount: 12
    }
  ]);

  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'rec-1',
      title: 'Right-size underutilized EC2 instances',
      description: 'Detected 8 EC2 instances consistently running below 20% CPU utilization. Downsizing recommended.',
      impact: 'Monthly savings of $320 with zero latency impact',
      savingsPercentage: 12,
      category: 'cost',
      difficulty: 'easy',
      implemented: false
    },
    {
      id: 'rec-2',
      title: 'Enable auto-scaling for application tier',
      description: 'Current application tier handles variable load. Recommending HPA auto-scaling policy.',
      impact: 'Resilience during peak traffic and 15% cost reduction off-peak',
      savingsPercentage: 15,
      category: 'performance',
      difficulty: 'medium',
      implemented: false
    },
    {
      id: 'rec-3',
      title: 'Implement lifecycle policies for S3 buckets',
      description: 'Transition older infrequently accessed data to Glacier / Standard-IA tiers automatically.',
      impact: 'Projected 30% reduction in cloud storage expenditure',
      savingsPercentage: 30,
      category: 'cost',
      difficulty: 'easy',
      implemented: false
    }
  ]);

  const [resourceMetrics, setResourceMetrics] = useState<ResourceMetric[]>([
    { name: 'CPU Utilization', usage: 42, limit: 100, unit: '%' },
    { name: 'Memory Allocation', usage: 68, limit: 100, unit: '%' },
    { name: 'NVMe Storage', usage: 53, limit: 100, unit: '%' },
    { name: 'Bandwidth Egress', usage: 37, limit: 100, unit: 'Gbps' }
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'inc-1',
      title: 'API Gateway Latency Spike',
      description: 'Significant increase in response time for API Gateway endpoints in us-east-1',
      severity: 'high',
      status: 'active',
      affectedServices: ['API Gateway', 'Lambda'],
      affectedRegions: ['us-east-1'],
      detectedAt: new Date(Date.now() - 35 * 60000).toISOString(),
      resolvedAt: null,
      cloudProvider: 'aws',
      metrics: {
        impactedUsers: 2840,
        serviceDowntime: 0,
        responseTime: 35,
      },
      timeline: [
        {
          time: new Date(Date.now() - 35 * 60000).toISOString(),
          event: 'Anomaly detection identified latency increase'
        },
        {
          time: new Date(Date.now() - 30 * 60000).toISOString(),
          event: 'Alert triggered for API response time > 500ms'
        }
      ]
    },
    {
      id: 'inc-2',
      title: 'S3 Access Policy Misconfiguration',
      description: 'Temporary IAM sync anomaly causing access denied errors on staging bucket',
      severity: 'low',
      status: 'resolved',
      affectedServices: ['S3', 'IAM'],
      affectedRegions: ['global'],
      detectedAt: new Date(Date.now() - 240 * 60000).toISOString(),
      resolvedAt: new Date(Date.now() - 180 * 60000).toISOString(),
      cloudProvider: 'aws',
      metrics: {
        impactedUsers: 520,
        serviceDowntime: 60,
        responseTime: 10,
      }
    }
  ]);

  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [isRespondingToIncident, setIsRespondingToIncident] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  const [loading, setLoading] = useState({
    providers: false,
    recommendations: false,
    metrics: false,
    incidents: false
  });

  const [feedbackMessage, setFeedbackMessage] = useState('');

  const connectCloudProvider = (providerId: string) => {
    setLoading(prev => ({ ...prev, providers: true }));
    setTimeout(() => {
      const updatedProviders = cloudProviders.map(provider => {
        if (provider.id === providerId) {
          const isConnecting = !provider.connected;
          return {
            ...provider,
            connected: isConnecting,
            resources: isConnecting ? Math.floor(Math.random() * 50) + 5 : undefined,
            regions: isConnecting ? ['us-east-1', 'eu-west-1'] : undefined,
          };
        }
        return provider;
      });
      setCloudProviders(updatedProviders);
      setLoading(prev => ({ ...prev, providers: false }));
      const provider = updatedProviders.find(p => p.id === providerId);
      setFeedbackMessage(provider?.connected 
        ? `Connected to ${provider.name} (${provider.resources} resources discovered).` 
        : `Disconnected from ${provider?.name}.`
      );
    }, 600);
  };

  const toggleMcpServer = (serverId: string) => {
    setLoading(prev => ({ ...prev, metrics: true }));
    setTimeout(() => {
      const updatedServers = mcpServers.map(server => {
        if (server.id === serverId) {
          const newStatus = server.status === 'running' ? 'stopped' as const : 'running' as const;
          return {
            ...server,
            status: newStatus,
            lastSync: newStatus === 'running' ? new Date().toISOString() : server.lastSync
          };
        }
        return server;
      });
      setMcpServers(updatedServers);
      setLoading(prev => ({ ...prev, metrics: false }));
      const server = updatedServers.find(s => s.id === serverId);
      setFeedbackMessage(server?.status === 'running' 
        ? `MCP Server "${server.name}" started` 
        : `MCP Server "${server?.name}" stopped`
      );
    }, 600);
  };

  const applyRecommendation = (recommendationId: string) => {
    setLoading(prev => ({ ...prev, recommendations: true }));
    setTimeout(() => {
      const updatedRecommendations = recommendations.map(rec => {
        if (rec.id === recommendationId) {
          return { ...rec, implemented: true };
        }
        return rec;
      });
      setRecommendations(updatedRecommendations);
      setLoading(prev => ({ ...prev, recommendations: false }));
      setFeedbackMessage('Recommendation applied successfully.');
    }, 800);
  };

  const refreshMetrics = () => {
    setLoading(prev => ({ ...prev, metrics: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, metrics: false }));
      setFeedbackMessage('Cloud metrics updated in real-time.');
    }, 600);
  };

  const updateIncidentStatus = (incidentId: string, newStatus: Incident['status']) => {
    setLoading(prev => ({ ...prev, incidents: true }));
    setTimeout(() => {
      const updatedIncidents = incidents.map(incident => {
        if (incident.id === incidentId) {
          return { 
            ...incident, 
            status: newStatus,
            resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : incident.resolvedAt
          };
        }
        return incident;
      });
      
      setIncidents(updatedIncidents);
      setLoading(prev => ({ ...prev, incidents: false }));
      setFeedbackMessage(`Incident status updated to ${newStatus}.`);
      
      if (newStatus === 'resolved') {
        setIsRespondingToIncident(false);
        setSelectedIncident(null);
      }
    }, 600);
  };

  return (
    <PageLayout
      title="Cloud Infrastructure Management"
      description="Monitor multi-cloud resource health, optimize FinOps, and diagnose network boundaries."
      agentType="cloud-infrastructure"
    >
      {/* Cloud Provider Integration */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <BsCloud size={18} className="text-cyan-700" />
            <h3 className="text-base font-bold text-slate-900">Cloud Provider Integration</h3>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 py-0.5 px-2.5 rounded-full border border-slate-200 font-medium">
            {cloudProviders.filter(p => p.connected).length}/{cloudProviders.length} Connected
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {cloudProviders.map((provider) => (
            <div 
              key={provider.id}
              className={`border rounded-lg p-3.5 transition-all ${
                provider.connected 
                  ? 'bg-emerald-50/40 border-emerald-200' 
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="text-slate-700">
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-slate-900">{provider.name}</h4>
                    {provider.connected && (
                      <span className="text-[11px] text-emerald-800 font-medium block truncate max-w-[150px]" title={provider.account || provider.details}>
                        {provider.account || `${provider.resources} resources monitored`}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  provider.connected 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {provider.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {provider.connected && provider.regions && (
                <div className="mb-2.5">
                  <div className="flex flex-wrap gap-1">
                    {provider.regions.map(region => (
                      <span 
                        key={region} 
                        className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-mono"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => connectCloudProvider(provider.id)}
                disabled={loading.providers}
                className={`w-full text-xs py-1.5 rounded-md font-medium cursor-pointer transition-colors ${
                  provider.connected 
                    ? 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                {provider.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud MCP Servers */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <BsServer size={18} className="text-cyan-700" />
            <h3 className="text-base font-bold text-slate-900">Cloud MCP Diagnostics</h3>
          </div>
        </div>

        <div className="space-y-3">
          {mcpServers.map(server => (
            <div 
              key={server.id}
              className="border border-slate-200 rounded-lg p-3 bg-white shadow-2xs"
            >
              <div className="flex flex-wrap md:flex-nowrap md:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-xs text-slate-900">{server.name}</h4>
                    <span className={`flex items-center text-[10px] px-2 py-0.2 rounded-full font-medium ${
                      server.status === 'running' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        server.status === 'running' ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}></span>
                      {server.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    <span>Provider: <strong className="text-slate-700">{server.cloudProvider.toUpperCase()}</strong></span>
                    <span>Region: <strong className="text-slate-700">{server.region}</strong></span>
                    <span>Resources: <strong className="text-slate-700">{server.resourceCount}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => toggleMcpServer(server.id)}
                  disabled={loading.metrics}
                  className={`flex items-center text-xs font-medium rounded-md px-3 py-1.5 cursor-pointer transition-colors ${
                    server.status === 'running' 
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                  }`}
                >
                  {server.status === 'running' ? (
                    <>
                      <BsTerminal className="mr-1" size={11} />
                      Stop Server
                    </>
                  ) : (
                    <>
                      <BsLightningCharge className="mr-1" size={11} />
                      Start Server
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Utilization and AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Resource Utilization Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BsBarChart size={18} className="text-cyan-700" />
              <h3 className="text-base font-bold text-slate-900">Resource Utilization</h3>
            </div>
            <button 
              onClick={refreshMetrics}
              disabled={loading.metrics}
              className="flex items-center text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-md px-2.5 py-1 font-medium cursor-pointer"
            >
              <BsArrowClockwise className={`mr-1 ${loading.metrics ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          <div className="space-y-3.5">
            {resourceMetrics.map((metric, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{metric.name}</span>
                  <span className="font-mono text-slate-900 font-bold">
                    {metric.usage}{metric.unit}
                  </span>
                </div>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      metric.usage > 80 ? 'bg-rose-500' :
                      metric.usage > 60 ? 'bg-amber-500' : 'bg-slate-900'
                    }`}
                    style={{ width: `${(metric.usage / metric.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BsLightningCharge size={18} className="text-cyan-700" />
              <h3 className="text-base font-bold text-slate-900">FinOps Recommendations</h3>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="border border-slate-200 rounded-lg p-3 bg-slate-50/50"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-xs text-slate-900">{rec.title}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                    {rec.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rec.description}</p>
                <div className="flex justify-between items-center text-xs">
                  <div className="text-emerald-700 font-medium text-[11px]">
                    {rec.savingsPercentage}% savings • {rec.impact}
                  </div>

                  {rec.implemented ? (
                    <span className="flex items-center text-emerald-600 text-xs font-medium">
                      <BsCheck2Circle className="mr-1" /> Implemented
                    </span>
                  ) : (
                    <button
                      onClick={() => applyRecommendation(rec.id)}
                      className="flex items-center text-xs bg-slate-900 hover:bg-slate-800 text-white rounded px-2.5 py-1 font-medium cursor-pointer shadow-2xs"
                    >
                      <BsArrowRight className="mr-1" /> Apply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Incident Status Table */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <BsExclamationTriangle size={18} className="text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">Incident Triage & Alerts</h3>
          </div>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
            incidents.filter(i => i.status !== 'resolved').length > 0
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {incidents.filter(i => i.status !== 'resolved').length} Active
          </span>
        </div>

        <div className="space-y-2.5">
          {incidents.map(incident => (
            <div 
              key={incident.id}
              className={`border rounded-lg p-3 transition-all ${
                incident.status === 'resolved'
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-rose-50/30 border-rose-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-xs text-slate-900">{incident.title}</h4>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                      incident.severity === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${
                      incident.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{incident.description}</p>
                </div>

                <div>
                  {incident.status !== 'resolved' ? (
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3 py-1.5 rounded-md font-medium cursor-pointer shadow-2xs"
                    >
                      Resolve Incident
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <BsCheckCircle /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
