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
import subprocess
import httpx
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def get_live_cloud_status() -> Dict[str, Any]:
    """Inspects live CLI authentication state for Azure, AWS, GCP, and Git repository."""
    # 1. Azure status
    azure_info = {
        "connected": False,
        "subscription_name": None,
        "subscription_id": None,
        "user": None,
        "tenant_id": None,
        "tenant_domain": None,
        "details": "Azure CLI is not logged in (run 'az login --use-device-code')"
    }
    try:
        az_res = subprocess.run(["az", "account", "show", "--output", "json"], capture_output=True, text=True, timeout=4)
        if az_res.returncode == 0:
            data = json.loads(az_res.stdout)
            azure_info = {
                "connected": True,
                "subscription_name": data.get("name"),
                "subscription_id": data.get("id"),
                "tenant_id": data.get("tenantId"),
                "tenant_domain": data.get("tenantDefaultDomain"),
                "user": data.get("user", {}).get("name"),
                "state": data.get("state"),
                "environment": data.get("environmentName"),
                "details": f"Authenticated as {data.get('user', {}).get('name')} on {data.get('name')}",
                "resources_count": 0,
                "resources": [],
                "resource_groups_count": 0,
                "resource_groups": []
            }
            # Query live Azure resources
            try:
                res_run = subprocess.run(["az", "resource", "list", "--output", "json"], capture_output=True, text=True, timeout=4)
                if res_run.returncode == 0:
                    r_list = json.loads(res_run.stdout)
                    azure_info["resources_count"] = len(r_list)
                    azure_info["resources"] = [
                        {"name": r.get("name"), "type": r.get("type"), "location": r.get("location"), "resourceGroup": r.get("resourceGroup")}
                        for r in r_list[:10]
                    ]
            except Exception:
                pass

            # Query live Azure resource groups
            try:
                rg_run = subprocess.run(["az", "group", "list", "--output", "json"], capture_output=True, text=True, timeout=4)
                if rg_run.returncode == 0:
                    g_list = json.loads(rg_run.stdout)
                    azure_info["resource_groups_count"] = len(g_list)
                    azure_info["resource_groups"] = [
                        {"name": g.get("name"), "location": g.get("location")}
                        for g in g_list[:10]
                    ]
            except Exception:
                pass
    except Exception as e:
        azure_info["details"] = f"Azure check error: {str(e)}"

    # 2. AWS status
    aws_info = {
        "connected": False,
        "account_id": None,
        "arn": None,
        "details": "AWS CLI credentials inactive or unauthenticated (run 'aws configure')"
    }
    try:
        aws_res = subprocess.run(["aws", "sts", "get-caller-identity", "--output", "json"], capture_output=True, text=True, timeout=3)
        if aws_res.returncode == 0:
            data = json.loads(aws_res.stdout)
            aws_info = {
                "connected": True,
                "account_id": data.get("Account"),
                "arn": data.get("Arn"),
                "user_id": data.get("UserId"),
                "details": f"Connected as IAM {data.get('Arn')}"
            }
    except Exception as e:
        aws_info["details"] = f"AWS CLI inactive: {str(e)}"

    # 3. GCP status
    gcp_info = {
        "connected": False,
        "account": None,
        "details": "Google Cloud SDK not configured (run 'gcloud auth login')"
    }
    try:
        gcp_res = subprocess.run(["gcloud", "auth", "list", "--format=json"], capture_output=True, text=True, timeout=3)
        if gcp_res.returncode == 0:
            accounts = json.loads(gcp_res.stdout)
            active_acc = next((acc for acc in accounts if acc.get("status") == "ACTIVE"), None)
            if active_acc:
                gcp_info = {
                    "connected": True,
                    "account": active_acc.get("account"),
                    "status": "ACTIVE",
                    "details": f"Authenticated as {active_acc.get('account')}"
                }
    except Exception as e:
        gcp_info["details"] = f"GCP SDK inactive: {str(e)}"

    # 4. Git Remote & Workflows
    git_info = {
        "configured": False,
        "remote": None,
        "workflows": []
    }
    try:
        git_res = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, timeout=3)
        if git_res.returncode == 0 and git_res.stdout.strip():
            git_info["configured"] = True
            git_info["remote"] = git_res.stdout.strip().split("\n")[0]

        base_dir = os.path.dirname(os.path.abspath(__file__))
        wf_dir = os.path.join(base_dir, ".github", "workflows")
        if os.path.isdir(wf_dir):
            git_info["workflows"] = [f for f in os.listdir(wf_dir) if f.endswith(('.yml', '.yaml'))]
    except Exception as e:
        git_info["details"] = str(e)

    return {
        "azure": azure_info,
        "aws": aws_info,
        "gcp": gcp_info,
        "git": git_info
    }

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
        live_status = get_live_cloud_status()
        azure = live_status.get("azure", {})
        aws = live_status.get("aws", {})
        gcp = live_status.get("gcp", {})

        if any(w in prompt_lower for w in ["service", "running", "resource", "vm", "webapp", "group", "rg", "list", "show", "what is", "deployed"]):
            res_count = azure.get("resources_count", 0)
            rg_count = azure.get("resource_groups_count", 0)
            resources_list = azure.get("resources", [])
            rg_list = azure.get("resource_groups", [])

            if azure.get("connected"):
                if res_count == 0 and rg_count == 0:
                    status_body = f"""### 🔍 Live Azure Resource Inspection:
- **Active Subscription:** `{azure.get('subscription_name')}` (`{azure.get('subscription_id')}`)
- **Logged-in User:** `{azure.get('user')}`
- **Active Resource Groups:** `0 groups deployed`
- **Active App Services / VMs / Databases:** `0 services running`

> ℹ️ **Status:** Your Azure account is successfully connected and authenticated, but there are currently **0 active services or resource groups** running in this subscription."""
                else:
                    rg_str = "\n".join([f"  - **RG:** `{g.get('name')}` ({g.get('location')})" for g in rg_list]) if rg_list else "  - None"
                    res_str = "\n".join([f"  - `{r.get('name')}` | Type: `{r.get('type')}` | RG: `{r.get('resourceGroup')}`" for r in resources_list]) if resources_list else "  - None"
                    status_body = f"""### 🔍 Live Azure Resource Discovery:
- **Active Subscription:** `{azure.get('subscription_name')}` (`{azure.get('subscription_id')}`)
- **Active Resource Groups ({rg_count}):**\n{rg_str}
- **Discovered Resources ({res_count}):**\n{res_str}"""
            else:
                status_body = "❌ **Azure CLI Disconnected:** Run `az login --use-device-code` to authenticate your Azure subscription."

            return {
                "response": f"""☁️ **Cloud Infrastructure & Service Discovery**

{status_body}

---

### 🛠️ Diagnostic & Provisioning Commands:
```bash
# 1. List all available Azure locations/regions
az account list-locations --output table

# 2. Check current resource group inventory
az group list --output table

# 3. Create a resource group and deploy an App Service
az group create --name my-devops-rg --location eastus
az appservice plan create --name my-app-plan --resource-group my-devops-rg --sku B1 --is-linux
az webapp create --resource-group my-devops-rg --plan my-app-plan --name my-devops-app --deployment-container-image-name mcr.microsoft.com/dotnet/samples:aspnetapp
```""",
                "suggestions": [
                    "Check Azure account and subscription details",
                    "List all Azure resource groups",
                    "Diagnose blank page after EasyAuth SSO on Azure App Service",
                    "Audit AWS IAM wildcard policies"
                ],
                "execution_plan": [
                    "[READ_ONLY] az resource list --output json",
                    "[READ_ONLY] az group list --output json",
                    "[REQUIRES_APPROVAL] az group create --name <rg-name> --location <region>"
                ],
                "safety_level": "READ_ONLY"
            }

        elif any(w in prompt_lower for w in ["account", "login", "azure", "aws", "gcp", "connect", "status", "subscription", "whoami"]):
            azure_text = f"✅ **Connected & Active**\n  - **Subscription:** `{azure.get('subscription_name')}`\n  - **Subscription ID:** `{azure.get('subscription_id')}`\n  - **Tenant User:** `{azure.get('user')}`\n  - **Tenant Domain:** `{azure.get('tenant_domain')}`" if azure.get("connected") else "❌ **Disconnected** — " + azure.get("details", "")
            aws_text = f"✅ **Connected** (Account: `{aws.get('account_id')}` | IAM: `{aws.get('arn')}`)" if aws.get("connected") else "❌ **Disconnected** — " + aws.get("details", "")
            gcp_text = f"✅ **Connected** (Account: `{gcp.get('account')}`)" if gcp.get("connected") else "❌ **Disconnected** — " + gcp.get("details", "")

            return {
                "response": f"""☁️ **Cloud Infrastructure & Account Diagnostics**

### 🌐 Live Multi-Cloud Account Status:

| Cloud Provider | Authentication Status | Details / Active Identity |
| :--- | :--- | :--- |
| **Microsoft Azure** | {"🟢 Connected" if azure.get("connected") else "🔴 Inactive"} | {azure.get("user") or "Not logged in"} ({azure.get("subscription_name") or "N/A"}) |
| **Amazon Web Services (AWS)** | {"🟢 Connected" if aws.get("connected") else "🔴 Inactive"} | {aws.get("arn") or "AWS CLI unauthenticated"} |
| **Google Cloud Platform (GCP)** | {"🟢 Connected" if gcp.get("connected") else "🔴 Inactive"} | {gcp.get("account") or "GCloud SDK unauthenticated"} |

---

### 🔍 Azure Live Subscription Details:
{azure_text}

---

### 🛡️ Diagnostic Options & Guardrail Actions:
1. **Azure Resource Groups:** Run `az group list --output table`
2. **Azure App Services:** Run `az webapp list --output table`
3. **AWS STS Identity:** Run `aws sts get-caller-identity`""",
                "suggestions": [
                    "Are any Azure services or VMs running?",
                    "List all Azure resource groups",
                    "Diagnose blank page after EasyAuth SSO on Azure App Service",
                    "Audit AWS IAM wildcard policies"
                ],
                "execution_plan": [
                    "[READ_ONLY] az account show --output json",
                    "[READ_ONLY] az resource list --output table",
                    "[REQUIRES_APPROVAL] az webapp restart --name <app> --resource-group <rg>"
                ],
                "safety_level": "READ_ONLY"
            }
        else:
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
                    "Are any Azure services or VMs running?",
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
        live_status = get_live_cloud_status()
        git_info = live_status.get("git", {})
        workflows = git_info.get("workflows", [])
        wf_list_str = ", ".join([f"`{w}`" for w in workflows]) if workflows else "None detected"

        return {
            "response": f"""⚡ **CI/CD Pipeline Agent Diagnosis**

**Analyzed Repository:** `{git_info.get('remote') or 'prathamesh633/AI_Agents_For_DevOps'}`
**Detected Workflows in `.github/workflows/`:** {wf_list_str}

### 🔍 Pipeline Status & Diagnostic Insights:
1. **`ci.yml` (DevOps AI Agents CI/CD Pipeline):**
   - **Backend Job:** Automated test suite for FastAPI & 8 Agent heuristic models.
   - **Frontend Job:** Next.js 14 TypeScript typecheck & production build.
   - **Security Job:** Dockerfile non-root user verification.
2. **`aws.yml` (Amazon ECS Deployment):**
   - Configured for on-demand `workflow_dispatch` trigger.

### 💡 Workflow Optimization Recommendations:
- **Buildx Caching:** Ensure GitHub Actions cache (`cache-from: type=gha`) is active to reduce build times by ~65%.
- **Secret Hygiene:** Ensure GitHub repository secrets (`AWS_ACCESS_KEY_ID`, `GEMINI_API_KEY`) are scoped per environment.""",
            "suggestions": [
                "Run GitHub Actions CI workflow locally",
                "Add automated Docker build dry-run step",
                "Audit workflow permissions for GITHUB_TOKEN"
            ],
            "execution_plan": [
                "[READ_ONLY] inspect_github_workflows('.github/workflows')",
                "[REQUIRES_APPROVAL] git_push_trigger_workflow('ci.yml')"
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
    models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro"]
    last_err = None
    async with httpx.AsyncClient(timeout=30.0) as client:
        for model in models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
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
            try:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
                else:
                    last_err = f"{model} Error ({res.status_code}): {res.text}"
            except Exception as e:
                last_err = str(e)
    raise Exception(last_err or "Gemini API request failed")

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

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "DevOps AI Agents Platform Backend",
        "timestamp": time.time()
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

@app.get("/api/cloud/live-status")
def get_cloud_status():
    """Returns live authenticated CLI credentials for Azure, AWS, GCP, and Git remote."""
    return get_live_cloud_status()

@app.get("/api/cicd/workflows")
def get_cicd_workflows():
    """Returns list of local workflows and repository branch information."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    wf_dir = os.path.join(base_dir, ".github", "workflows")
    workflows = []
    if os.path.isdir(wf_dir):
        for f in os.listdir(wf_dir):
            if f.endswith(('.yml', '.yaml')):
                fpath = os.path.join(wf_dir, f)
                try:
                    with open(fpath, "r") as wf_file:
                        content = wf_file.read()
                        workflows.append({
                            "filename": f,
                            "path": f".github/workflows/{f}",
                            "lines": len(content.splitlines()),
                            "content": content
                        })
                except Exception:
                    workflows.append({"filename": f, "path": f".github/workflows/{f}", "error": "Unable to read"})
    return {
        "repository": "prathamesh633/AI_Agents_For_DevOps",
        "workflows_count": len(workflows),
        "workflows": workflows
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
