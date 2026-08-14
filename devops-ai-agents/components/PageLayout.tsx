"use client";

import { motion } from 'framer-motion';
import AgentChat from './AgentChat';
import { 
  BsRobot, 
  BsLightningCharge, 
  BsGear, 
  BsCloud, 
  BsCodeSquare, 
  BsShieldCheck, 
  BsBoxSeam, 
  BsGraphUp, 
  BsSpeedometer, 
  BsBug 
} from 'react-icons/bs';

interface PageLayoutProps {
  title: string;
  description: string;
  agentType: string;
  children?: React.ReactNode;
}

const AGENT_THEMES: Record<string, {
  lightBg: string;
  lightBorder: string;
  badgeStyle: string;
  iconBg: string;
  accentBar: string;
  icon: JSX.Element;
}> = {
  "ci-cd": {
    lightBg: "bg-sky-50/40",
    lightBorder: "border-sky-200",
    badgeStyle: "bg-sky-50 text-sky-800 border-sky-200",
    iconBg: "bg-sky-100 text-sky-700",
    accentBar: "bg-sky-500",
    icon: <BsGear size={20} />
  },
  "cloud-infrastructure": {
    lightBg: "bg-cyan-50/40",
    lightBorder: "border-cyan-200",
    badgeStyle: "bg-cyan-50 text-cyan-800 border-cyan-200",
    iconBg: "bg-cyan-100 text-cyan-700",
    accentBar: "bg-cyan-500",
    icon: <BsCloud size={20} />
  },
  "code-analysis": {
    lightBg: "bg-purple-50/40",
    lightBorder: "border-purple-200",
    badgeStyle: "bg-purple-50 text-purple-800 border-purple-200",
    iconBg: "bg-purple-100 text-purple-700",
    accentBar: "bg-purple-500",
    icon: <BsCodeSquare size={20} />
  },
  "security-scanning": {
    lightBg: "bg-rose-50/40",
    lightBorder: "border-rose-200",
    badgeStyle: "bg-rose-50 text-rose-800 border-rose-200",
    iconBg: "bg-rose-100 text-rose-700",
    accentBar: "bg-rose-500",
    icon: <BsShieldCheck size={20} />
  },
  "container-creation": {
    lightBg: "bg-teal-50/40",
    lightBorder: "border-teal-200",
    badgeStyle: "bg-teal-50 text-teal-800 border-teal-200",
    iconBg: "bg-teal-100 text-teal-700",
    accentBar: "bg-teal-500",
    icon: <BsBoxSeam size={20} />
  },
  "container-orchestration": {
    lightBg: "bg-teal-50/40",
    lightBorder: "border-teal-200",
    badgeStyle: "bg-teal-50 text-teal-800 border-teal-200",
    iconBg: "bg-teal-100 text-teal-700",
    accentBar: "bg-teal-500",
    icon: <BsBoxSeam size={20} />
  },
  "performance-monitoring": {
    lightBg: "bg-emerald-50/40",
    lightBorder: "border-emerald-200",
    badgeStyle: "bg-emerald-50 text-emerald-800 border-emerald-200",
    iconBg: "bg-emerald-100 text-emerald-700",
    accentBar: "bg-emerald-500",
    icon: <BsGraphUp size={20} />
  },
  "load-testing": {
    lightBg: "bg-amber-50/40",
    lightBorder: "border-amber-200",
    badgeStyle: "bg-amber-50 text-amber-800 border-amber-200",
    iconBg: "bg-amber-100 text-amber-700",
    accentBar: "bg-amber-500",
    icon: <BsSpeedometer size={20} />
  },
  "incident-response": {
    lightBg: "bg-red-50/40",
    lightBorder: "border-red-200",
    badgeStyle: "bg-red-50 text-red-800 border-red-200",
    iconBg: "bg-red-100 text-red-700",
    accentBar: "bg-red-500",
    icon: <BsBug size={20} />
  },
};

const DEFAULT_THEME = {
  lightBg: "bg-slate-50",
  lightBorder: "border-slate-200",
  badgeStyle: "bg-slate-100 text-slate-800 border-slate-200",
  iconBg: "bg-slate-100 text-slate-700",
  accentBar: "bg-slate-600",
  icon: <BsRobot size={20} />
};

export default function PageLayout({ 
  title, 
  description, 
  agentType,
  children 
}: PageLayoutProps) {
  const theme = AGENT_THEMES[agentType] || DEFAULT_THEME;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto px-2 sm:px-4 py-4"
    >
      {/* Header Section in Clean White & Grey */}
      <div className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs mb-6 relative overflow-hidden">
        {/* Subtle light accent bar on top */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accentBar}`} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`p-3 rounded-xl ${theme.iconBg} shadow-2xs flex-shrink-0`}>
              {theme.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {title}
                </h1>
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${theme.badgeStyle}`}>
                  {agentType.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          {/* Workflow Status Indicator - Green for Active Workflow */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex-shrink-0 self-start md:self-auto">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-700">
              Agent <span className="text-emerald-600 font-semibold">Active</span> & Ready
            </span>
          </div>
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Chat Component Column */}
        <div className="order-2 lg:order-1">
          <AgentChat agentType={agentType} />
        </div>
        
        {/* Specific Agent UI Details Column */}
        <div className="order-1 lg:order-2 space-y-6">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
