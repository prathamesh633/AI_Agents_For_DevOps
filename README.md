# 🤖 Autonomous DevOps AI Agents Platform 🚀

<div align="center">
  <img src="Images/home.png" alt="DevOps AI Agents Platform Banner" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</div>

<div align="center">

  ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
  ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
  ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
  ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
  ![Next JS](https://img.shields.io/badge/Next.js%2014-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](https://github.com/prathamesh633/AI_Agents_For_DevOps/pulls)
  [![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg?style=for-the-badge)](https://github.com/prathamesh633/AI_Agents_For_DevOps/graphs/commit-activity)
  
</div>

<p align="center">
  <b>🌟 Transform your DevOps workflow with Autonomous AI Agents 🌟</b>
  <br>
  <i>An enterprise-grade, multi-agent AI platform built to automate cloud infrastructure, diagnose CI/CD pipeline failures, audit security vulnerabilities, generate hardened Dockerfiles, and triage production incidents with deterministic safety guardrails.</i>
</p>

<div align="center">

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/prathamesh633/AI_Agents_For_DevOps/pulls)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/prathamesh633/AI_Agents_For_DevOps?style=flat-square)](https://github.com/prathamesh633/AI_Agents_For_DevOps/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/prathamesh633/AI_Agents_For_DevOps?style=flat-square)](https://github.com/prathamesh633/AI_Agents_For_DevOps/network/members)

</div>

---

## 📋 Table of Contents

- [⚡ Quick Start (Single Command)](#-quick-start-single-command)
- [✨ Core Capabilities](#-core-capabilities)
- [🤖 Specialized DevOps Agents](#-specialized-devops-agents)
- [📸 Screenshots & Visual Walkthrough](#-screenshots--visual-walkthrough)
- [🛠️ Technology Stack](#️-technology-stack)
- [🧠 AI Engine & Safety Guardrails](#-ai-engine--safety-guardrails)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [📞 Author & Support](#-author--support)

---

## ⚡ Quick Start (Single Command)

Get the complete platform running locally (both FastAPI Backend and Next.js Frontend) with a single command:

```bash
# 1. Clone the repository
git clone https://github.com/prathamesh633/AI_Agents_For_DevOps.git
cd AI_Agents_For_DevOps

# 2. Run the end-to-end local demo runner
python3 run_demo.py
```

### Manual Individual Service Setup

```bash
# Backend (FastAPI on Port 8000)
cd repo
pip install fastapi uvicorn pydantic requests
python3 backend_server.py

# Frontend (Next.js on Port 3000)
cd repo/devops-ai-agents
npm install
npm run dev
```

- 🌐 **Frontend UI:** [http://localhost:3000](http://localhost:3000)
- ⚙️ **Backend API:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- 📖 **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## ✨ Core Capabilities

- 🔒 **100% Free & Offline Mode Available** — Embedded Local Intelligent Heuristic Rule Engine requires zero API keys or cloud spend to run.
- ⚡ **Multi-Provider AI Switching** — Switch seamlessly between **Local Heuristic Engine**, **Google Gemini 2.0 Flash (Free API)**, and **Local Ollama**.
- 🛡️ **Two-Phase Deterministic Guardrails** — Every AI response differentiates between `[READ_ONLY]` inspections and `[REQUIRES_APPROVAL]` destructive operations.
- 🎨 **Modern White & Grey Enterprise Design** — High-contrast, clean UI system with soft-toned agent accents and clear semantic status indicators.
- 🎙️ **Multi-Modal Interaction** — Text, audio voice queries, and file attachments integrated into the global chat.

---

## 🤖 Specialized DevOps Agents

| Module | Route | Key Capabilities |
|---|---|---|
| 🐳 **Container Creation** | `/container-creation` | Generates hardened, multi-stage, non-root Dockerfiles and `docker-compose.yml` configurations with CIS benchmark compliance. |
| 🔄 **CI/CD Pipeline** | `/ci-cd` | Optimizes GitHub Actions/GitLab CI, automates dependency caching, heals failing jobs, and provides build intelligence. |
| ☁️ **Cloud Infrastructure** | `/cloud-infrastructure` | Diagnoses Azure App Service EasyAuth/SSO, VNet/DB boundaries, AWS IAM wildcard policies, and FinOps savings. |
| 🧪 **Code Analysis** | `/code-analysis` | Analyzes codebases for memory leaks, async deadlocks, unindexed database queries, and code smells. |
| 🔒 **Security Scanning** | `/security-scanning` | Runs SAST/SCA security audits, secret leakage detection, and CIS compliance benchmarks. |
| 📊 **Performance Monitoring** | `/performance-monitoring` | Real-time APM telemetry, p99 latency percentile histograms, and anomaly detection. |
| ⚡ **Load Testing & FinOps** | `/load-testing` | Generates k6 and Locust load-testing scenarios with concurrency benchmarking and cost projections. |
| 🚨 **Incident Response** | `/incident-response` | Live War Room with automated 5-Why Root Cause Analysis (RCA) and deterministic remediation runbooks. |

---

## 📸 Screenshots & Visual Walkthrough

### 🏠 1. Main Dashboard & Agent Matrix
*Central DevOps Command Center with real-time health metrics and one-click access to all 8 specialized agents.*
<p align="center">
  <img src="Images/home.png" alt="DevOps AI Agents Main Dashboard" width="95%" />
</p>

---

### 🐳 2. Container Creation Studio
*Generates hardened, CIS-benchmark compliant, multi-stage Dockerfiles with non-root user enforcement and docker-compose configurations.*
<p align="center">
  <img src="Images/Container.png" alt="Container Creation Studio" width="95%" />
</p>

---

### 🔄 3. CI/CD Pipeline Management & Healing
*Intelligent pipeline diagnostics, buildx layer caching, and automatic workflow error resolution.*
<p align="center">
  <img src="Images/ci.png" alt="CI/CD Pipeline Agent" width="95%" />
</p>

---

### ☁️ 4. Cloud Infrastructure & FinOps Optimization
*Multi-cloud telemetry, Azure EasyAuth diagnostics, AWS IAM audits, and resource cost reduction insights.*
<p align="center">
  <img src="Images/infra.png" alt="Cloud Infrastructure Studio" width="95%" />
</p>

---

### 🔒 5. Security & Compliance Scanning
*Automated vulnerability scanning, SAST/SCA policy checks, and secret leak prevention.*
<p align="center">
  <img src="Images/security.png" alt="Security Scanning Studio" width="95%" />
</p>

---

### 🧪 6. Code Analysis & Quality Audit
*Detects memory leaks, async deadlocks, unindexed DB queries, and cyclomatic complexity hotspots.*
<p align="center">
  <img src="Images/code_analysis.png" alt="Code Analysis Studio" width="95%" />
</p>

---

### 📊 7. Real-Time Performance Monitoring
*APM telemetry dashboard displaying p99 latency percentiles, worker CPU spikes, and memory throughput.*
<p align="center">
  <img src="Images/performance.png" alt="Performance Monitoring Studio" width="95%" />
</p>

---

### ⚡ 8. Load Testing & Concurrency Benchmarking
*Simulates high-traffic scenarios using k6 and Locust scripts with auto-scaling stress tests.*
<p align="center">
  <img src="Images/loadtest.png" alt="Load Testing Studio" width="95%" />
</p>

---

### 🚨 9. Incident Response War Room
*Live incident triage featuring automated 5-Why Root Cause Analysis and deterministic runbook execution.*
<p align="center">
  <img src="Images/incident.png" alt="Incident Response War Room" width="95%" />
</p>

---

## 🛠️ Technology Stack

```mermaid
graph TD
    subgraph Frontend [Next.js 14 Enterprise UI]
        A[Next.js 14 App Router]
        B[React 18]
        C[TailwindCSS - White & Grey System]
        D[Framer Motion Animations]
        E[React Icons]
    end

    subgraph Backend [FastAPI Multi-Agent Engine]
        F[FastAPI Server :8000]
        G[Local Heuristic Rule Engine]
        H[Google Gemini 2.0 Flash Client]
        I[Ollama Local LLM Connector]
        J[Two-Phase Safety Guardrail Engine]
    end

    A <-->|REST API / JSON| F
    F --> G
    F --> H
    F --> I
    F --> J
```

---

## 🧠 AI Engine & Safety Guardrails

Every agent response adheres to strict DevOps safety standards:

```json
{
  "agent_type": "container-creation",
  "provider_used": "Local Intelligent Heuristic Engine (Free & Offline)",
  "response": "...",
  "suggestions": [
    "Generate docker-compose.yml with reverse proxy",
    "Add multi-arch build command (amd64/arm64)",
    "Audit Dockerfile security with Trivy"
  ],
  "execution_plan": [
    "[READ_ONLY] fs_detect_project_framework() -> Next.js 14",
    "[READ_ONLY] dockerfile_lint_security_audit() -> PASSED (Non-root)",
    "[REQUIRES_APPROVAL] fs_write_file(path='./Dockerfile')"
  ],
  "safety_level": "REQUIRES_APPROVAL"
}
```

---

## 🤝 Contributing

Contributions are always welcome! Follow these steps to contribute:

1. **Fork the Repository**
2. **Create your Feature Branch**:
   ```bash
   git checkout -b feature/amazing-agent
   ```
3. **Commit your Changes**:
   ```bash
   git commit -m 'feat: Add Kubernetes auto-scaler agent'
   ```
4. **Push to Branch**:
   ```bash
   git push origin feature/amazing-agent
   ```
5. **Open a Pull Request** on [GitHub PRs](https://github.com/prathamesh633/AI_Agents_For_DevOps/pulls)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 📞 Author & Support

<div align="center">

**Prathamesh Bhujade**

[![GitHub](https://img.shields.io/badge/GitHub-prathamesh633-181717?style=for-the-badge&logo=github)](https://github.com/prathamesh633)
[![Repository](https://img.shields.io/badge/Repository-AI__Agents__For__DevOps-blue?style=for-the-badge&logo=github)](https://github.com/prathamesh633/AI_Agents_For_DevOps)

**[⭐ Star this Repository](https://github.com/prathamesh633/AI_Agents_For_DevOps) if you find it helpful!**

</div>
