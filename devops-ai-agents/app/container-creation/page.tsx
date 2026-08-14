"use client";

import { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { 
  BsBoxSeam, 
  BsShieldCheck, 
  BsLightningCharge, 
  BsCheck2, 
  BsCopy, 
  BsDownload,
  BsCheckCircleFill,
  BsLayers,
  BsFileEarmarkCode,
  BsHddStack,
  BsTerminal
} from 'react-icons/bs';
import { motion } from 'framer-motion';

const PRESETS = {
  fastapi: {
    name: "Python FastAPI / Uvicorn",
    icon: "🐍",
    description: "Multi-stage build with compiled wheels, non-root user, and health check",
    dockerfile: `# -------------------------------------------------------------
# Stage 1: Build Dependencies & Wheels
# -------------------------------------------------------------
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# -------------------------------------------------------------
# Stage 2: Lean Production Runtime
# -------------------------------------------------------------
FROM python:3.11-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    PYTHONFAULTHANDLER=1 \\
    PATH="/home/appuser/.local/bin:$PATH"

# Security: Create non-root dedicated application user
RUN groupadd -g 10001 appgroup && \\
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

WORKDIR /app

# Copy compiled Python packages from builder stage
COPY --from=builder --chown=appuser:appgroup /root/.local /home/appuser/.local

# Copy application source code with correct ownership
COPY --chown=appuser:appgroup . /app

# Switch to non-root user
USER appuser

EXPOSE 8000

# Health check directive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Production server execution
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers"]`,
    dockerignore: `__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
.git
.gitignore
.env
.pytest_cache/
.coverage
htmlcov/
Dockerfile*
docker-compose*
*.md`,
    compose: `version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fastapi_app
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
      - DATABASE_URL=postgresql://user:pass@db:5432/appdb
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3`
  },
  nextjs: {
    name: "Next.js 14 (Standalone)",
    icon: "▲",
    description: "Next.js 14 optimized standalone bundle with Alpine base and non-root nextjs user",
    dockerfile: `# -------------------------------------------------------------
# Stage 1: Base Dependencies
# -------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \\
  if [ -f package-lock.json ]; then npm ci; \\
  elif [ -f yarn.lock ]; then yarn --frozen-lockfile; \\
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \\
  else npm install; \\
  fi

# -------------------------------------------------------------
# Stage 2: Source Builder
# -------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# -------------------------------------------------------------
# Stage 3: Lean Production Runner
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Security: Create non-root system user
RUN addgroup --system --gid 1001 nodejs && \\
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]`,
    dockerignore: `node_modules
.next
.git
.gitignore
*.md
.env*.local
.vscode
Dockerfile*
docker-compose*`,
    compose: `version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: nextjs_app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:8000`
  },
  streamlit: {
    name: "Python Streamlit",
    icon: "📊",
    description: "Streamlit analytics dashboard container with headless mode and port 8501",
    dockerfile: `FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \\
    PYTHONUNBUFFERED=1 \\
    STREAMLIT_SERVER_PORT=8501 \\
    STREAMLIT_SERVER_HEADLESS=true \\
    STREAMLIT_SERVER_ENABLE_CORS=false

RUN groupadd -g 10001 appgroup && \\
    useradd -u 10001 -g appgroup -s /bin/bash -m appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 8501

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \\
  CMD curl --fail http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]`,
    dockerignore: `__pycache__
*.pyc
.git
.env
.venv`,
    compose: `version: '3.8'

services:
  dashboard:
    build: .
    container_name: streamlit_app
    ports:
      - "8501:8501"
    restart: unless-stopped`
  },
  fullstack: {
    name: "Full-Stack (API + DB + Cache + UI)",
    icon: "🌐",
    description: "Complete docker-compose stack with FastAPI, PostgreSQL, Redis, and Next.js UI",
    dockerfile: `# Use the respective service Dockerfiles (backend/Dockerfile, frontend/Dockerfile)`,
    dockerignore: `node_modules
__pycache__
.git
.env`,
    compose: `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: devops_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: app_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: secure_password_123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d app_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: devops_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: devops_backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://app_user:secure_password_123@postgres:5432/app_db
      - REDIS_URL=redis://redis:6379/0
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devops_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:`
  }
};

export default function ContainerCreationPage() {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESETS>('fastapi');
  const [activeTab, setActiveTab] = useState<'dockerfile' | 'compose' | 'dockerignore'>('dockerfile');
  const [copied, setCopied] = useState(false);

  const preset = PRESETS[selectedPreset];

  const getCurrentContent = () => {
    if (activeTab === 'dockerfile') return preset.dockerfile;
    if (activeTab === 'compose') return preset.compose;
    return preset.dockerignore;
  };

  const copyContent = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getCurrentContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFile = () => {
    const filename = activeTab === 'dockerfile' ? 'Dockerfile' : activeTab === 'compose' ? 'docker-compose.yml' : '.dockerignore';
    const blob = new Blob([getCurrentContent()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="Container Creation"
      description="Generate production-ready, multi-stage, and security-hardened Dockerfiles for your code."
      agentType="container-creation"
    >
      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Security</div>
              <div className="text-sm font-bold text-slate-800">Non-Root User</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BsShieldCheck size={18} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <BsCheckCircleFill size={10} /> CIS Compliant
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Efficiency</div>
              <div className="text-sm font-bold text-slate-800">Multi-Stage</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BsLayers size={18} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <BsCheckCircleFill size={10} /> 65% Smaller
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Reliability</div>
              <div className="text-sm font-bold text-slate-800">Health Checks</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BsLightningCharge size={18} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <BsCheckCircleFill size={10} /> Auto-Healing
          </div>
        </div>

        <div className="card p-3.5 bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Compose</div>
              <div className="text-sm font-bold text-slate-800">Multi-Service</div>
            </div>
            <div className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <BsHddStack size={18} />
            </div>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2 flex items-center gap-1">
            <BsCheckCircleFill size={10} /> Stack Ready
          </div>
        </div>
      </div>

      {/* Preset Selector & Dockerfile Studio */}
      <motion.div 
        className="bg-white rounded-xl shadow-2xs border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-teal-100 text-teal-800 rounded-lg">
                <BsBoxSeam size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  Interactive Dockerfile Studio
                  <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-200 font-medium">
                    Hardened
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select a tech stack preset or prompt the Container Agent for custom IaC generation.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyContent}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-all cursor-pointer shadow-2xs"
              >
                {copied ? <BsCheck2 className="text-emerald-600" /> : <BsCopy size={11} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={downloadFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <BsDownload size={11} />
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Framework Presets Bar */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-200">
            {Object.entries(PRESETS).map(([key, item]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedPreset(key as keyof typeof PRESETS)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedPreset === key 
                    ? 'bg-teal-700 text-white shadow-2xs' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100/70 border-b border-slate-200 text-xs">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('dockerfile')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dockerfile' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BsFileEarmarkCode /> Dockerfile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compose')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'compose' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BsHddStack /> docker-compose.yml
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('dockerignore')}
              className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'dockerignore' ? 'bg-white text-slate-900 shadow-2xs border border-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BsTerminal /> .dockerignore
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono hidden sm:inline truncate max-w-xs">
            {preset.description}
          </span>
        </div>

        {/* Code Content Container */}
        <div className="bg-slate-900 p-4 overflow-x-auto">
          <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
            <code>{getCurrentContent()}</code>
          </pre>
        </div>
      </motion.div>
    </PageLayout>
  );
}
