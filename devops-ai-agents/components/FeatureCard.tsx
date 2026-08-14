"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  accentColor?: string;
  iconBg?: string;
}

export function FeatureCard({ title, description, icon, link, accentColor = "hover:border-slate-400", iconBg = "bg-slate-100 text-slate-700" }: FeatureCardProps) {
  return (
    <Link href={link} className="block group">
      <motion.div 
        className={`relative p-5 rounded-xl border border-slate-200/90 bg-white shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between h-full ${accentColor}`}
        whileHover={{ y: -3 }}
        transition={{ duration: 0.15 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center border border-slate-200/70 shadow-2xs ${iconBg}`}>
              {icon}
            </div>
            
            <h3 className="text-base font-semibold text-slate-900 group-hover:text-slate-950 transition-colors">
              {title}
            </h3>
          </div>
          
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium group-hover:text-slate-900">
          <span>Open Agent Studio</span>
          <svg className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
}
