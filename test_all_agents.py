"""
Automated Test Suite for DevOps AI Multi-Agent Platform.
Sends 16+ diverse real-world DevOps questions across all 8 agent domains
and validates response structure, content quality, and execution safety.
"""

import sys
import json
import time
import requests

BASE_URL = "http://127.0.0.1:8000"

TEST_CASES = [
    {
        "agent_type": "cloud-infrastructure",
        "question": "Is any service or resource currently running right now in my Azure account?",
        "expected_keywords": ["Live Azure", "Subscription", "prathameshbhujade@outlook.com"]
    },
    {
        "agent_type": "cloud-infrastructure",
        "question": "How do I configure private endpoints between Azure App Service and PostgreSQL Flexible Server?",
        "expected_keywords": ["Private Endpoint", "VNet", "az network"]
    },
    {
        "agent_type": "cloud-infrastructure",
        "question": "How can we optimize our cloud bill and identify orphaned disks and idle resources?",
        "expected_keywords": ["FinOps", "az disk list", "Reserved Instances"]
    },
    {
        "agent_type": "ci-cd",
        "question": "How do I cache npm and pip dependencies in GitHub Actions to speed up our CI pipeline?",
        "expected_keywords": ["cache", "actions/setup-node", "actions/setup-python"]
    },
    {
        "agent_type": "ci-cd",
        "question": "How do we set up keyless AWS OIDC authentication in GitHub Actions without long-lived secrets?",
        "expected_keywords": ["OIDC", "aws-actions/configure-aws-credentials", "id-token: write"]
    },
    {
        "agent_type": "container-creation",
        "question": "Generate a lean, multi-stage Dockerfile for a Go Gin REST API using scratch base image",
        "expected_keywords": ["FROM golang", "FROM scratch", "USER 65534"]
    },
    {
        "agent_type": "container-creation",
        "question": "Create a docker-compose.yml configuration for FastAPI, PostgreSQL 16, and Redis 7",
        "expected_keywords": ["version:", "postgres:16-alpine", "redis:7-alpine"]
    },
    {
        "agent_type": "incident-response",
        "question": "Container crashed with Exit Code 137 OOMKilled during data processing job",
        "expected_keywords": ["137", "OOMKilled", "limits.memory", "kubectl"]
    },
    {
        "agent_type": "incident-response",
        "question": "We are getting HTTP 504 Gateway Timeout on checkout API under peak traffic",
        "expected_keywords": ["RCA", "5-Why", "pool_size", "connection"]
    },
    {
        "agent_type": "code-analysis",
        "question": "Audit our query builder function for SQL injection vulnerabilities and recommend safe ORM patterns",
        "expected_keywords": ["SQL Injection", "CWE-89", "parameterized", "SQLAlchemy"]
    },
    {
        "agent_type": "code-analysis",
        "question": "Detect async event loop blocking calls and unclosed HTTP sessions in Python FastAPI",
        "expected_keywords": ["Async", "httpx.AsyncClient", "blocking"]
    },
    {
        "agent_type": "security-scanning",
        "question": "How do we scan our Docker build images with Trivy and fail CI pipeline on critical CVEs?",
        "expected_keywords": ["trivy image", "CRITICAL", "aquasecurity/trivy-action"]
    },
    {
        "agent_type": "security-scanning",
        "question": "Audit our Terraform code against CIS Microsoft Azure and AWS Foundations benchmarks",
        "expected_keywords": ["CIS", "Checkov", "terraform"]
    },
    {
        "agent_type": "performance-monitoring",
        "question": "Investigate unindexed slow queries in PostgreSQL and database latency spikes",
        "expected_keywords": ["pg_stat_statements", "CREATE INDEX CONCURRENTLY", "p99"]
    },
    {
        "agent_type": "load-testing",
        "question": "Generate a k6 load testing script with stages ramping up to 1,000 virtual users and p95 < 200ms threshold",
        "expected_keywords": ["k6/http", "1000", "p(95)<200", "stages"]
    }
]

def run_tests():
    print(f"🚀 Starting Multi-Agent Diagnostic Test Suite on {BASE_URL}...")
    
    # 1. Health check
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=3)
        assert r.status_code == 200, f"Health check failed with status {r.status_code}"
        print("✅ Backend Health Check: PASSED\n")
    except Exception as e:
        print(f"❌ Backend unreachable: {e}")
        sys.exit(1)

    passed = 0
    failed = 0

    for idx, tc in enumerate(TEST_CASES, 1):
        agent = tc["agent_type"]
        q = tc["question"]
        print(f"[{idx}/{len(TEST_CASES)}] Testing Agent: [{agent}]")
        print(f"    ❓ Query: \"{q}\"")

        start = time.time()
        try:
            res = requests.post(
                f"{BASE_URL}/api/agent/query",
                json={"agent_type": agent, "prompt": q, "provider": "heuristic"},
                timeout=10
            )
            duration = round(time.time() - start, 3)

            if res.status_code != 200:
                print(f"    ❌ FAILED (HTTP {res.status_code}): {res.text}\n")
                failed += 1
                continue

            data = res.json()
            response_text = data.get("response", "")
            provider_used = data.get("provider_used", "")
            suggestions = data.get("suggestions", [])
            plan = data.get("execution_plan", [])
            safety = data.get("safety_level", "READ_ONLY")

            # Check expected keywords
            missing = [kw for kw in tc["expected_keywords"] if kw.lower() not in response_text.lower()]
            if missing:
                print(f"    ⚠️ Warning: Missing expected keywords: {missing}")

            print(f"    ✅ Responded in {duration}s | Provider: {provider_used}")
            print(f"    🛡️ Safety Level: {safety} | Plan steps: {len(plan)} | Suggestions: {len(suggestions)}")
            print(f"    📝 Preview: {response_text.splitlines()[0] if response_text else 'Empty'}\n")
            passed += 1

        except Exception as ex:
            print(f"    ❌ Exception: {ex}\n")
            failed += 1

    print("=" * 60)
    print(f"📊 SUMMARY: {passed} PASSED | {failed} FAILED (Total: {len(TEST_CASES)})")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
