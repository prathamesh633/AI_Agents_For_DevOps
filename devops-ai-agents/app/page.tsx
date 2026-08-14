"use client";

import Link from 'next/link';
import { FeatureCard } from '@/components/FeatureCard';
import { 
  BsGear, 
  BsCloud, 
  BsCodeSquare, 
  BsShieldCheck, 
  BsBoxSeam, 
  BsGraphUp, 
  BsSpeedometer, 
  BsBug, 
  BsRobot, 
  BsArrowRight, 
  BsLightning, 
  BsCheckCircleFill,
  BsExclamationCircleFill,
  BsLayers
} from 'react-icons/bs';
import { motion } from 'framer-motion';
import MultiModalChat from '@/components/MultiModalChat';

export default function Home() {
  const features = [
    {
      title: "CI/CD Pipeline Management",
      description: "Automate buildx caching, secret drift detection, and workflow healing",
      icon: <BsGear size={20} />,
      link: "/ci-cd",
      iconBg: "bg-sky-50 text-sky-700",
      accentColor: "hover:border-sky-300"
    },
    {
      title: "Cloud Infrastructure",
      description: "Diagnose Azure App Service EasyAuth, VNet DB networks, and AWS IAM",
      icon: <BsCloud size={20} />,
      link: "/cloud-infrastructure",
      iconBg: "bg-cyan-50 text-cyan-700",
      accentColor: "hover:border-cyan-300"
    },
    {
      title: "Code Analysis & Quality",
      description: "Detect async deadlocks, memory leaks, and query vulnerabilities",
      icon: <BsCodeSquare size={20} />,
      link: "/code-analysis",
      iconBg: "bg-purple-50 text-purple-700",
      accentColor: "hover:border-purple-300"
    },
    {
      title: "Security & Compliance",
      description: "Audit Dockerfiles, Terraform IaC, and secrets against CIS benchmarks",
      icon: <BsShieldCheck size={20} />,
      link: "/security-scanning",
      iconBg: "bg-rose-50 text-rose-700",
      accentColor: "hover:border-rose-300"
    },
    {
      title: "Container Creation",
      description: "Generate multi-stage, non-root Dockerfiles & docker-compose configurations",
      icon: <BsBoxSeam size={20} />,
      link: "/container-creation",
      iconBg: "bg-teal-50 text-teal-700",
      accentColor: "hover:border-teal-300"
    },
    {
      title: "Performance Monitoring",
      description: "Monitor worker CPU spikes, p99 latencies, and unindexed database queries",
      icon: <BsGraphUp size={20} />,
      link: "/performance-monitoring",
      iconBg: "bg-emerald-50 text-emerald-700",
      accentColor: "hover:border-emerald-300"
    },
    {
      title: "Load Testing & FinOps",
      description: "Generate k6 / Locust scripts and benchmark concurrency limits",
      icon: <BsSpeedometer size={20} />,
      link: "/load-testing",
      iconBg: "bg-amber-50 text-amber-700",
      accentColor: "hover:border-amber-300"
    },
    {
      title: "Incident Response War Room",
      description: "Perform 5-Why Root Cause Analysis on crashes and connection exhaustion",
      icon: <BsBug size={20} />,
      link: "/incident-response",
      iconBg: "bg-red-50 text-red-700",
      accentColor: "hover:border-red-300"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.02
      }
    }
  };

  const itemVariants = {
    hidden: { y: 0, opacity: 1 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Hero Section in Clean White & Grey */}
      <motion.div 
        className="relative overflow-hidden mb-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs p-6 md:p-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="md:w-3/5">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold mb-3">
              <BsRobot className="mr-1.5 text-slate-700" />
              DevOps Agentic AI Platform
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">
              Autonomous AI Agents for Modern DevOps
            </h1>
            
            <p className="text-sm md:text-base text-slate-600 mb-6 leading-relaxed">
              Streamline multi-cloud infrastructure, automate incident root cause analysis, generate hardened Dockerfiles, and secure your CI/CD pipelines with deterministic safety guardrails.
            </p>
            
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href="/container-creation"
                className="inline-flex items-center bg-slate-900 hover:bg-slate-800 text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-2xs"
              >
                <BsLightning className="mr-1.5" />
                Launch Container Studio
              </Link>
              <Link 
                href="/ci-cd"
                className="inline-flex items-center bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs md:text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-2xs"
              >
                Explore CI/CD Agent
                <BsArrowRight className="ml-1.5" />
              </Link>
            </div>
          </div>

          {/* Operational Metrics Cards in Hero */}
          <div className="md:w-2/5 grid grid-cols-2 gap-3">
            {/* Workflows (Green) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Workflows</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-2xl font-bold text-slate-900">24 / 24</div>
              <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
                <BsCheckCircleFill size={10} /> 100% Operational
              </div>
            </div>

            {/* Error RCA (Red) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Incidents Triaged</span>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">0 Active</div>
              <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-1">
                <BsExclamationCircleFill size={10} /> Auto-Remediated
              </div>
            </div>

            {/* Security Guardrails (Teal) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">CIS Benchmark</span>
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">100%</div>
              <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1 mt-1">
                <BsLayers size={10} /> Non-Root & Hardened
              </div>
            </div>

            {/* AI Engine Status (Sky) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Engine Providers</span>
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              </div>
              <div className="text-2xl font-bold text-slate-900">3 Modes</div>
              <div className="text-[11px] text-sky-700 font-medium flex items-center gap-1 mt-1">
                Rule / Gemini / Ollama
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Agents Section Title */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Specialized DevOps AI Agents
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select a specialized agent studio to diagnose issues, generate configurations, and automate operations.
          </p>
        </div>
        <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md font-mono hidden sm:inline">
          8 Modules Available
        </span>
      </div>
      
      {/* Features grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <FeatureCard {...feature} />
          </motion.div>
        ))}
      </motion.div>

      {/* Multi-Modal AI Chat Widget */}
      <MultiModalChat />
    </div>
  );
}