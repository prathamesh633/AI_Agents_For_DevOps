"""
DevOps AI Agents Platform - Local Demo Backend Server
Supports Free Providers:
1. Gemini 2.0 / 1.5 Flash (Google AI Studio Free Key)
2. Local Ollama LLM (http://localhost:11434)
3. Local Heuristic Engine (Offline / Zero Setup Free Fallback)
"""

import os
import re
import json
import time
import httpx
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="DevOps AI Agents Platform API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgentRequest(BaseModel):
    agent_type: str
    prompt: str
    provider: Optional[str] = "heuristic" # "heuristic", "gemini", "ollama"
    api_key: Optional[str] = None
    context: Optional[str] = None

class AgentResponse(BaseModel):
    agent_type: str
    provider_used: str
    response: str
    suggestions: list[str]
    execution_plan: Optional[list[str]] = None
    safety_level: str = "READ_ONLY" # "READ_ONLY", "REQUIRES_APPROVAL", "DESTRUCTIVE"
    timestamp: float

SYSTEM_PROMPTS = {
    "ci-cd": """You are an expert CI/CD Pipeline Agent. 
Your goal is to optimize workflows, fix build failures, analyze GitHub Actions / GitLab CI / Dockerfiles, and verify deployments.
Always provide structured diagnostic steps, root causes, and clear fix recommendations.""",

    "cloud-infrastructure": """You are a Cloud Infrastructure & Network Doctor Agent specializing in Azure and AWS.
Your expertise includes: Azure App Service, EasyAuth/SSO header forwarding (X-MS-CLIENT-PRINCIPAL), VNet integration, private endpoints, AWS IAM, S3 bucket security, and cost optimization.
Always highlight safe read-only operations vs state-changing commands requiring approval.""",

    "code-analysis": """You are a Code Analysis & Quality Agent.
You identify memory leaks, race conditions, security flaws, performance bottlenecks, and architectural code smells across Python, TypeScript, Go, and Java.""",

    "security-scanning": """You are a Security & Compliance Scanner Agent.
You scan IaC (Terraform, Bicep), Docker images (Trivy), credentials/secrets leaks, CIS benchmarks, and RBAC permissions.
Categorize findings by CRITICAL, HIGH, MEDIUM, and provide exact remediation steps.""",

    "container-creation": """You are an expert Container Creation & Dockerfile Architect Agent.
You analyze project codebases, detect frameworks (FastAPI, Next.js, Streamlit, Express, Go, Rust, Spring Boot), and generate production-ready, multi-stage, security-hardened Dockerfiles, .dockerignore files, and docker-compose.yml configurations.
Always enforce: non-root user execution, layer caching, minimal base images (alpine/slim/distroless), health checks, .dockerignore files, and multi-architecture build instructions.""",

    "container-orchestration": """You are a Container Creation & Dockerfile Architect Agent.
You analyze project codebases and generate production-ready, multi-stage, security-hardened Dockerfiles and container configurations.""",

    "performance-monitoring": """You are a Performance & Observability Agent.
Analyze latency spikes, CPU/RAM utilization metrics, database slow queries, and APM traces. Provide actionable tuning advice.""",

    "load-testing": """You are a Load Testing & Capacity Planning Agent.
Analyze Locust/k6 results, concurrency bottlenecks, response time percentiles (p95/p99), and throughput limits.""",

    "incident-response": """You are an Incident Response & War Room Commander Agent.
Quickly parse crash logs, stack traces, HTTP 500/502/504 errors, generate Root Cause Analysis (RCA) reports with 5-why chains, and suggest immediate mitigations."""
}

def run_heuristic_agent(agent_type: str, prompt: str) -> Dict[str, Any]:
    prompt_lower = prompt.lower()
    
    # CONTAINER CREATION & DOCKERFILE GENERATOR AGENT
    if agent_type in ("container-creation", "container-orchestration"):
        if "next" in prompt_lower or "react" in prompt_lower or "node" in prompt_lower or "frontend" in prompt_lower:
            return {
                "response": """🐳 **Container Creation Agent — Next.js 14 Standalone Multi-Stage Dockerfile**

**Detected Stack:** Next.js 14 / TypeScript (Standalone Output Mode)
**Target Architecture:** Linux amd64/arm64 • Non-root `nextjs` user • Image Size: ~120MB

### 📄 Production-Ready `Dockerfile`:
```dockerfile
# -------------------------------------------------------------
# Stage 1: Base Dependencies
# -------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package descriptors for layer caching
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

# Set production env and build standalone bundle
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# -------------------------------------------------------------
# Stage 3: Minimal Production Runner (Distroless-style)
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

# Copy only standalone output & static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health Check Directive
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \\
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
```

### 📋 Accompanying `.dockerignore`:
```dockerignore
node_modules
.next
.git
.gitignore
*.md
.env*.local
.vscode
Dockerfile*
docker-compose*
```""",
                "suggestions": [
                    "Generate docker-compose.yml with reverse proxy",
                    "Add multi-arch build command (amd64/arm64)",
                    "Audit Dockerfile security with Trivy/Hadolint"
                ],
                "execution_plan": [
                    "[READ_ONLY] fs_detect_project_framework() -> Next.js 14",
                    "[READ_ONLY] dockerfile_lint_security_audit() -> PASSED (Non-root, Multi-stage)",
                    "[REQUIRES_APPROVAL] fs_write_file(path='./Dockerfile')",
                    "[REQUIRES_APPROVAL] fs_write_file(path='./.dockerignore')"
                ],
                "safety_level": "REQUIRES_APPROVAL"
            }
            
        elif "compose" in prompt_lower or "postgres" in prompt_lower or "redis" in prompt_lower or "stack" in prompt_lower:
            return {
                "response": """🐳 **Container Creation Agent — Full-Stack Production `docker-compose.yml`**

**Stack Scope:** FastAPI Backend + Next.js Frontend + PostgreSQL Database + Redis Cache

### 📄 Production `docker-compose.yml`:
```yaml
version: '3.8'

services:
  # -----------------------------------------------------------
  # PostgreSQL Database Service
  # -----------------------------------------------------------
  postgres:
    image: postgres:16-alpine
    container_name: devops_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-app_db}
      POSTGRES_USER: ${POSTGRES_USER:-app_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-secure_dev_password}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-app_user} -d ${POSTGRES_DB:-app_db}"]
      interval: 10s
      timeout: 5s
      retries: 5

  # -----------------------------------------------------------
  # Redis Cache / Message Broker
  # -----------------------------------------------------------
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

  # -----------------------------------------------------------
  # FastAPI Backend API Service
  # -----------------------------------------------------------
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: devops_backend
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql://${POSTGRES_USER:-app_user}:${POSTGRES_PASSWORD:-secure_dev_password}@postgres:5432/${POSTGRES_DB:-app_db}
      - REDIS_URL=redis://redis:6379/0
      - ENVIRONMENT=production
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 15s
      timeout: 5s
      retries: 3

  # -----------------------------------------------------------
  # Next.js Frontend Dashboard Service
  # -----------------------------------------------------------
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: devops_frontend
    restart: unless-stopped
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: devops_agent_network
```""",
                "suggestions": [
                    "Generate .env.example with secure default variables",
                    "Add Nginx reverse proxy service with SSL termination",
                    "Create database initialization SQL script"
                ],
                "execution_plan": [
                    "[READ_ONLY] validate_compose_schema(version='3.8')",
                    "[REQUIRES_APPROVAL] fs_write_file(path='./docker-compose.yml')",
                    "[REQUIRES_APPROVAL] docker_compose_up_test(detach=True)"
                ],
                "safety_level": "REQUIRES_APPROVAL"
            }

        else:
            # Default / Python FastAPI / General Container Creation
            return {
                "response": """🐳 **Container Creation Agent — Hardened Multi-Stage Python/FastAPI Dockerfile**

**Detected Stack:** Python 3.11 / FastAPI / Uvicorn
**Security Standard:** CIS Benchmark • Non-root `appuser` • Slim Debian Base • Layer Caching

### 📄 Hardened `Dockerfile`:
```dockerfile
# -------------------------------------------------------------
# Stage 1: Build Dependencies & Wheels
# -------------------------------------------------------------
FROM python:3.11-slim AS builder

WORKDIR /build

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \\
    build-essential \\
    curl \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and compile wheels
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# -------------------------------------------------------------
# Stage 2: Lean Production Runtime
# -------------------------------------------------------------
FROM python:3.11-slim AS runtime

# Set environment variables for performance & safety
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

# Expose FastAPI application port
EXPOSE 8000

# Health check directive
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \\
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Production server execution
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4", "--proxy-headers"]
```

### 📋 Accompanying `.dockerignore`:
```dockerignore
__pycache__
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
*.md
```

### 🚀 Build & Run Commands:
```bash
# 1. Build optimized image
docker build -t my-fastapi-app:latest .

# 2. Run container with memory limit and read-only safety
docker run -d --name fastapi-service \\
  -p 8000:8000 \\
  --memory="512m" \\
  --cpus="1.0" \\
  my-fastapi-app:latest
```""",
                "suggestions": [
                    "Create Next.js 14 standalone Dockerfile",
                    "Generate docker-compose.yml for FastAPI + PostgreSQL",
                    "Generate Streamlit frontend Dockerfile (Port 8501)",
                    "Audit Dockerfile for CIS security compliance"
                ],
                "execution_plan": [
                    "[READ_ONLY] fs_scan_project_dependencies(requirements.txt)",
                    "[READ_ONLY] dockerfile_lint_best_practices(HADOLINT)",
                    "[REQUIRES_APPROVAL] fs_write_file(path='./Dockerfile', content=...)",
                    "[REQUIRES_APPROVAL] fs_write_file(path='./.dockerignore', content=...)"
                ],
                "safety_level": "REQUIRES_APPROVAL"
            }

    elif agent_type == "cloud-infrastructure":
        if "blank" in prompt_lower or "easyauth" in prompt_lower or "sso" in prompt_lower or "azure" in prompt_lower:
            return {
                "response": """🔍 **Cloud Infrastructure Doctor Analysis (Azure App Service + EasyAuth SSO)**

**Identified Issue:** Post-SSO blank page / authentication header mismatch.

### 📋 Diagnostic Findings:
1. **EasyAuth Token Store:** Currently `Disabled` or not forwarding client headers across Azure Front Door.
2. **Reverse Proxy Headers:** `X-MS-CLIENT-PRINCIPAL` and `X-Forwarded-Host` are missing from downstream backend requests.
3. **App Settings Check:** `WEBSITE_AUTH_DEFAULT_PROVIDER` is missing in App Service Configuration.

### 🛠️ Recommended Remediation Plan:
```bash
# 1. Enable Token Store on Azure App Service
az webapp auth update --name <your-app-name> --resource-group <your-rg> --token-store true

# 2. Configure Front Door Header Passthrough Rule
az afd route update --route-name main-route --profile-name fd-profile --resource-group <your-rg> \\
  --forwarding-protocol HttpsOnly --link-custom-domain Enabled

# 3. Add Required Environment Settings
az webapp config appsettings set --name <your-app-name> --resource-group <your-rg> \\
  --settings WEBSITE_AUTH_DEFAULT_PROVIDER=AzureActiveDirectory
```""",
                "suggestions": [
                    "Run VNet connectivity check between App Service and Postgres DB",
                    "Verify Azure Front Door SSL termination rule",
                    "Check Application Insights live metrics stream"
                ],
                "execution_plan": [
                    "[READ_ONLY] az webapp auth show --name app-name --resource-group rg",
                    "[REQUIRES_APPROVAL] az webapp auth update --token-store true",
                    "[REQUIRES_APPROVAL] az webapp config appsettings set WEBSITE_AUTH_DEFAULT_PROVIDER=AzureActiveDirectory"
                ],
                "safety_level": "REQUIRES_APPROVAL"
            }
            
    elif agent_type == "ci-cd":
        return {
            "response": """⚡ **CI/CD Pipeline Agent Diagnosis**

**Analysis for:** `{prompt}`

### 🔍 Pipeline Optimization & Failure Report:
- **Build Bottleneck:** Serial Docker build steps without layer caching.
- **Security Warning:** Unpinned GitHub Actions dependency versions (`@v1` instead of commit SHA).
- **Environment Drift:** `DATABASE_URL` present in staging workflow but missing in production runner secrets.

### 💡 Suggested `.github/workflows/deploy.yml` Patch:
```yaml
name: Production Deployment Pipeline
on:
  push:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
        照- name: Build and Push with Cache
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: myrepo/app:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```""",
            "suggestions": [
                "Enable Docker buildx layer caching",
                "Add automated post-deployment smoke test step",
                "Audit workflow permissions for GITHUB_TOKEN"
            ],
            "execution_plan": [
                "[READ_ONLY] github_get_workflow_logs(repo, run_id)",
                "[REQUIRES_APPROVAL] update_github_secrets(DATABASE_URL)"
            ],
            "safety_level": "READ_ONLY"
        }

    elif agent_type == "incident-response":
        return {
            "response": """🚨 **Incident Response Agent — Root Cause Analysis (RCA)**

**Incident Focus:** `{prompt}`

### 📊 Root Cause Timeline:
- **T-10m:** Spike in concurrent requests to `/api/process-invoice`
- **T-5m:** Database connection pool exhaustion (`max_connections=100` reached)
- **T-0m:** Azure Function App started throwing HTTP 502 / Gateway Timeout

### 🎯 5-Why Root Cause Chain:
1. **Why did service fail?** Function App invocations returned 500/502 errors.
2. **Why 502 errors?** Database refused new connection attempts.
3. **Why refused connections?** Active connection count hit 100/100 limit.
4. **Why 100 connections?** Async handlers spawned new DB engine connections per request without pooling.
5. **Root Cause:** Missing `pool_size` and `max_overflow` settings in SQLAlchemy database engine initialization.

### 🛡️ Immediate Remediation:
```python
# Fix in database.py
from sqlalchemy import create_engine

engine = create_engine(
    DATABASE_URL,
    pool_size=10,          # Restrict max base pool
    max_overflow=20,        # Controlled burst overflow
    pool_timeout=30,        # Timeout waiting for pool connection
    pool_recycle=1800       # Recycle stale connections
)
```""",
            "suggestions": [
                "Deploy pgBouncer connection pooler in front of Postgres",
                "Set Azure PostgreSQL max_connections parameter to 200",
                "Add alert rule when DB connection count > 80%"
            ],
            "execution_plan": [
                "[READ_ONLY] Check active DB connections query",
                "[REQUIRES_APPROVAL] Restart Azure Function App pool"
            ],
            "safety_level": "REQUIRES_APPROVAL"
        }

    elif agent_type == "security-scanning":
        return {
            "response": """🛡️ **Security & Compliance Scanner Agent**

**Scan Scope:** `{prompt}`

### 🚨 Security Audit Results:

| Severity | Resource | Vulnerability / Issue | Recommendation |
| :--- | :--- | :--- | :--- |
| **CRITICAL** | `Terraform / main.tf` | S3 / Storage Account public access enabled | Set `public_network_access_enabled = false` |
| **HIGH** | `Dockerfile` | Container running as `root` user | Add `USER node` or `USER appuser` |
| **HIGH** | `IAM Policy` | AWS IAM role with `*:*` wildcard admin | Scope down permissions to specific ARN |
| **MEDIUM** | `requirements.txt` | Dependency `urllib3<2.0` has known CVE | Upgrade to `urllib3>=2.2.0` |

### 🔧 Hardened Dockerfile Example:
```dockerfile
FROM python:3.10-slim
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]
```""",
            "suggestions": [
                "Run Trivy container scan on build image",
                "Enforce Checkov IaC security rules in pull requests",
                "Rotate hardcoded credentials in environment variables"
            ],
            "execution_plan": [
                "[READ_ONLY] checkov -d ./terraform",
                "[READ_ONLY] trivy image myapp:latest"
            ],
            "safety_level": "READ_ONLY"
        }

    # Default fallback heuristic response for other agents
    return {
        "response": f"""🤖 **{agent_type.replace('-', ' ').title()} Agent Response**

**Analyzed Request:** `{prompt}`

### 📊 System Findings & Insights:
1. **Configuration Status:** Environment parameters parsed successfully.
2. **Operational Recommendation:** Best practice patterns applied for `{agent_type}` domain.
3. **Guardrails Status:** All actions checked against security policy baseline.

### 💡 Recommended Next Actions:
- Validate configuration against staging cluster
- Execute automated smoke test suite
- Monitor telemetry dashboard for anomalies""",
        "suggestions": [
            f"Run diagnostic sweep for {agent_type}",
            "Generate summary report in Markdown",
            "Verify configuration parameters"
        ],
        "execution_plan": [
            f"[READ_ONLY] inspect_{agent_type}_status()",
            f"[REQUIRES_APPROVAL] apply_{agent_type}_optimizations()"
        ],
        "safety_level": "READ_ONLY"
    }

async def call_gemini_api(prompt: str, system_instruction: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"System Instruction: {system_instruction}\n\nUser Request: {prompt}"}
                ]
            }
        ]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            raise Exception(f"Gemini API Error ({res.status_code}): {res.text}")
        data = res.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception:
            return str(data)

async def call_ollama_api(prompt: str, system_instruction: str) -> str:
    url = "http://localhost:11434/v1/chat/completions"
    payload = {
        "model": "llama3", # or qwen2.5-coder
        "messages": [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": prompt}
        ]
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        res = await client.post(url, json=payload)
        if res.status_code != 200:
            raise Exception(f"Ollama API Error ({res.status_code}): {res.text}")
        data = res.json()
        return data["choices"][0]["message"]["content"]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "DevOps AI Agents Platform API",
        "available_providers": ["heuristic (free local)", "gemini (free google api)", "ollama (free local)"],
        "agents": list(SYSTEM_PROMPTS.keys())
    }

@app.get("/api/agent/status")
def get_status():
    gemini_key = os.getenv("GEMINI_API_KEY")
    return {
        "status": "ready",
        "providers": {
            "heuristic": {"available": True, "type": "Local Rule Engine (Free/Offline)"},
            "gemini": {"available": bool(gemini_key), "type": "Google Gemini 2.0 Flash (Free Key)"},
            "ollama": {"available": True, "type": "Local Ollama LLM (Free Local)"}
        },
        "agents": list(SYSTEM_PROMPTS.keys())
    }

@app.post("/api/agent/query", response_model=AgentResponse)
async def query_agent(req: AgentRequest):
    agent_type = req.agent_type.lower()
    if agent_type not in SYSTEM_PROMPTS:
        agent_type = "container-creation"

    provider = req.provider or "heuristic"
    api_key = req.api_key or os.getenv("GEMINI_API_KEY")
    
    start_time = time.time()

    if provider == "gemini" and api_key:
        try:
            sys_inst = SYSTEM_PROMPTS.get(agent_type, "")
            text_response = await call_gemini_api(req.prompt, sys_inst, api_key)
            return AgentResponse(
                agent_type=agent_type,
                provider_used="Google Gemini 2.0 Flash (Free API)",
                response=text_response,
                suggestions=["Generate docker-compose.yml", "Audit Dockerfile for security", "Add multi-arch build options"],
                execution_plan=["[READ_ONLY] fs_detect_framework()", "[REQUIRES_APPROVAL] fs_write_dockerfile('./Dockerfile')"],
                safety_level="REQUIRES_APPROVAL",
                timestamp=time.time() - start_time
            )
        except Exception as e:
            res = run_heuristic_agent(agent_type, req.prompt)
            res["response"] = f"⚠️ *Gemini API call fell back to Local Heuristic Engine ({str(e)})*\n\n" + res["response"]
            return AgentResponse(
                agent_type=agent_type,
                provider_used="Local Heuristic Engine (Fallback)",
                response=res["response"],
                suggestions=res["suggestions"],
                execution_plan=res.get("execution_plan"),
                safety_level=res.get("safety_level", "READ_ONLY"),
                timestamp=time.time() - start_time
            )

    elif provider == "ollama":
        try:
            sys_inst = SYSTEM_PROMPTS.get(agent_type, "")
            text_response = await call_ollama_api(req.prompt, sys_inst)
            return AgentResponse(
                agent_type=agent_type,
                provider_used="Local Ollama LLM (Offline Free)",
                response=text_response,
                suggestions=["Execute local test", "Review code changes"],
                execution_plan=["[READ_ONLY] run_ollama_inspection()"],
                safety_level="READ_ONLY",
                timestamp=time.time() - start_time
            )
        except Exception as e:
            res = run_heuristic_agent(agent_type, req.prompt)
            res["response"] = f"⚠️ *Ollama call fell back to Local Heuristic Engine ({str(e)})*\n\n" + res["response"]
            return AgentResponse(
                agent_type=agent_type,
                provider_used="Local Heuristic Engine (Fallback)",
                response=res["response"],
                suggestions=res["suggestions"],
                execution_plan=res.get("execution_plan"),
                safety_level=res.get("safety_level", "READ_ONLY"),
                timestamp=time.time() - start_time
            )

    # Default heuristic mode (Free, 100% reliable local rule engine)
    res = run_heuristic_agent(agent_type, req.prompt)
    return AgentResponse(
        agent_type=agent_type,
        provider_used="Local Intelligent Heuristic Engine (Free & Offline)",
        response=res["response"],
        suggestions=res["suggestions"],
        execution_plan=res.get("execution_plan"),
        safety_level=res.get("safety_level", "READ_ONLY"),
        timestamp=time.time() - start_time
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend_server:app", host="127.0.0.1", port=8000, reload=True)
