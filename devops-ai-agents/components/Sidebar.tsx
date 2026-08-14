'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  BsGear, 
  BsCloud, 
  BsCodeSquare, 
  BsShieldCheck, 
  BsBoxSeam, 
  BsGraphUp, 
  BsSpeedometer, 
  BsBug, 
  BsHouseDoor, 
  BsList, 
  BsX, 
  BsLightbulb, 
  BsRobot 
} from 'react-icons/bs';

interface MenuItem {
  name: string;
  path: string;
  icon: JSX.Element;
  activeColor: string; // light accent background and border
  activeText: string;
  dotColor: string;
}

const menuItems: MenuItem[] = [
  { 
    name: "Home", 
    path: "/", 
    icon: <BsHouseDoor size={18} />, 
    activeColor: "bg-slate-100 border-slate-300", 
    activeText: "text-slate-900 font-semibold",
    dotColor: "bg-slate-700"
  },
  { 
    name: "CI/CD Pipeline", 
    path: "/ci-cd", 
    icon: <BsGear size={18} />, 
    activeColor: "bg-sky-50 border-sky-200", 
    activeText: "text-sky-800 font-semibold",
    dotColor: "bg-sky-500"
  },
  { 
    name: "Cloud Infrastructure", 
    path: "/cloud-infrastructure", 
    icon: <BsCloud size={18} />, 
    activeColor: "bg-cyan-50 border-cyan-200", 
    activeText: "text-cyan-800 font-semibold",
    dotColor: "bg-cyan-500"
  },
  { 
    name: "Code Analysis", 
    path: "/code-analysis", 
    icon: <BsCodeSquare size={18} />, 
    activeColor: "bg-purple-50 border-purple-200", 
    activeText: "text-purple-800 font-semibold",
    dotColor: "bg-purple-500"
  },
  { 
    name: "Security Scanning", 
    path: "/security-scanning", 
    icon: <BsShieldCheck size={18} />, 
    activeColor: "bg-rose-50 border-rose-200", 
    activeText: "text-rose-800 font-semibold",
    dotColor: "bg-rose-500"
  },
  { 
    name: "Container Creation", 
    path: "/container-creation", 
    icon: <BsBoxSeam size={18} />, 
    activeColor: "bg-teal-50 border-teal-200", 
    activeText: "text-teal-800 font-semibold",
    dotColor: "bg-teal-500"
  },
  { 
    name: "Performance Monitoring", 
    path: "/performance-monitoring", 
    icon: <BsGraphUp size={18} />, 
    activeColor: "bg-emerald-50 border-emerald-200", 
    activeText: "text-emerald-800 font-semibold",
    dotColor: "bg-emerald-500"
  },
  { 
    name: "Load Testing", 
    path: "/load-testing", 
    icon: <BsSpeedometer size={18} />, 
    activeColor: "bg-amber-50 border-amber-200", 
    activeText: "text-amber-800 font-semibold",
    dotColor: "bg-amber-500"
  },
  { 
    name: "Incident Response", 
    path: "/incident-response", 
    icon: <BsBug size={18} />, 
    activeColor: "bg-red-50 border-red-200", 
    activeText: "text-red-800 font-semibold",
    dotColor: "bg-red-500"
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-white border border-slate-300 text-slate-700 md:hidden shadow-sm hover:bg-slate-50 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <BsX size={22} /> : <BsList size={22} />}
      </button>
      
      {/* Sidebar Container */}
      <motion.aside 
        className={`fixed top-0 left-0 h-screen bg-white border-r border-slate-200/90 z-30 md:relative md:block flex-shrink-0 ${
          isOpen ? 'block' : 'hidden md:block'
        }`}
        style={{ width: '270px' }}
      >
        <div className="p-5 h-full flex flex-col justify-between">
          <div>
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 pb-6 mb-4 border-b border-slate-100">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                <BsRobot size={18} />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 tracking-tight">DevOps AI Agents</h1>
                <p className="text-[11px] text-slate-500 font-medium">Autonomous Operations</p>
              </div>
            </div>
            
            {/* Navigation List */}
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path || (item.path === '/container-creation' && pathname === '/container-orchestration');
                  return (
                    <li key={item.path}>
                      <Link 
                        href={item.path}
                        className={`flex items-center justify-between py-2.5 px-3 rounded-lg text-xs transition-all duration-150 border ${
                          isActive 
                            ? `${item.activeColor} ${item.activeText} shadow-xs` 
                            : 'border-transparent text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`transition-colors ${isActive ? item.activeText : 'text-slate-400'}`}>
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </div>
                        {isActive && (
                          <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          
          {/* Bottom Card - Light Grey Box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
                  <BsLightbulb size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-800">Need AI DevOps Help?</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    Ask any agent for automated diagnostic & remediation scripts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
