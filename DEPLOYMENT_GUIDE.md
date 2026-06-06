# 🚀 SatyaSetu.AI — Complete Deployment Guide

> **Project**: SatyaSetu.AI (CyberLens) — AI-Powered Digital Forensics & Fraud Detection Platform  
> **Frontend**: Next.js 16 → Deployed on **Vercel**  
> **Backend**: FastAPI + Python ML Pipeline → Deployed on **AWS EC2**  
> **Date**: June 6, 2026  
> **Author**: Jayant Chauhan

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Why Vercel + AWS EC2?](#2-why-vercel--aws-ec2)
3. [Pre-Deployment Code Changes](#3-pre-deployment-code-changes)
4. [Frontend Deployment on Vercel](#4-frontend-deployment-on-vercel)
5. [Backend Deployment on AWS EC2](#5-backend-deployment-on-aws-ec2)
6. [Connecting Frontend to Backend](#6-connecting-frontend-to-backend)
7. [Troubleshooting Issues Faced](#7-troubleshooting-issues-faced)
8. [Cost Breakdown](#8-cost-breakdown)
9. [Maintenance & Updates](#9-maintenance--updates)

---

## 1. Architecture Overview

```
┌──────────────────┐         HTTPS          ┌──────────────────────┐
│                  │ ◄─────────────────────► │                      │
│   Vercel         │      API Calls          │   AWS EC2            │
│   (Frontend)     │      (Axios)            │   (Backend)          │
│                  │                         │                      │
│   • Next.js 16   │                         │   • FastAPI          │
│   • React 19     │                         │   • Python 3.10      │
│   • TailwindCSS  │                         │   • XGBoost ML       │
│   • Recharts     │                         │   • Tesseract OCR    │
│   • Framer Motion│                         │   • spaCy NLP        │
│                  │                         │   • Docker Container │
└──────────────────┘                         └──────────┬───────────┘
                                                        │
                                                        ▼
                                             ┌──────────────────────┐
                                             │   Neon PostgreSQL    │
                                             │   (Cloud Database)   │
                                             └──────────────────────┘
```

**How it works:**
- Users visit the Vercel-hosted frontend (e.g., `https://cyberlens.vercel.app`)
- The frontend makes API calls to the FastAPI backend running on AWS EC2
- The backend processes requests using ML models, OCR, NLP, and returns results
- Data is stored in a Neon PostgreSQL cloud database

---

## 2. Why Vercel + AWS EC2?

### Why Vercel for Frontend?

| Reason | Explanation |
|--------|-------------|
| **Built for Next.js** | Vercel is created by the same team that built Next.js — it offers the best optimization, edge rendering, and zero-config deployment for Next.js apps |
| **Free Hobby Plan** | Vercel's free tier is generous — unlimited deployments, custom domains, HTTPS, and global CDN |
| **Auto-Deploy on Git Push** | Every `git push` to `main` triggers an automatic rebuild and deployment — no manual steps needed |
| **Global CDN** | Your frontend is served from edge nodes worldwide, meaning fast load times for users everywhere |
| **Preview Deployments** | Every pull request gets its own preview URL for testing before merging |

### Why AWS EC2 for Backend?

| Reason | Explanation |
|--------|-------------|
| **System-level dependencies** | Our backend needs **Tesseract OCR** (a system package installed via `apt-get`), which rules out serverless platforms like AWS Lambda or Vercel Functions |
| **Heavy ML models in memory** | We load XGBoost, spaCy, sentence-transformers, and TF-IDF models into RAM (~2-3 GB). Serverless functions have strict memory/time limits that can't handle this |
| **File-based operations** | Evidence uploads, OCR processing, and PDF report generation require persistent disk access — EC2 gives us a real filesystem |
| **Full control** | We have root access to install any system package, configure networking, and manage the Docker container exactly as needed |
| **$100 AWS credits** | With free credits, EC2 is effectively free for ~3 months |

### Why NOT other options?

| Option | Why Not |
|--------|---------|
| **AWS Lambda** | 15-minute timeout, 10 GB max storage, can't install Tesseract OCR, cold starts would kill ML model loading time |
| **Vercel Functions** | Same limitations as Lambda — our backend is too heavy and needs system packages |
| **Heroku** | No longer has a free tier; dynos sleep after 30 min of inactivity |
| **Railway / Render** | Good alternatives but AWS credits made EC2 the better financial choice |

---

## 3. Pre-Deployment Code Changes

Before deploying, we made 4 code changes to prepare the project for production:

---

### 3.1 Removed Unused Import in `next.config.ts`

**File**: `webapp/next.config.ts`

```diff
 import type { NextConfig } from "next";
-import path from "path";
```

**Why**: The `path` module was imported but never used. Vercel runs ESLint during builds, and unused imports cause build failures with strict linting rules. Removing it prevents the build from failing.

---

### 3.2 Made CORS Configurable via Environment Variable

**File**: `backend/app/main.py`

```diff
+import os

 # --- CORS for Frontend Integration ---
-origins = [
-    "http://localhost:3000",
-    "http://127.0.0.1:3000",
-    "https://satyasetu-ai.onrender.com",
-    "*",  # Allow all for hackathon demo
-]
-
-app.add_middleware(
-    CORSMiddleware,
-    allow_origins=["*"],
-    ...
-)
+# Set CORS_ORIGINS env var as comma-separated list
+_cors_env = os.getenv("CORS_ORIGINS", "*")
+origins = [o.strip() for o in _cors_env.split(",")] if _cors_env != "*" else ["*"]
+
+app.add_middleware(
+    CORSMiddleware,
+    allow_origins=origins,
+    ...
+)
```

**Why**: CORS (Cross-Origin Resource Sharing) controls which websites can call your API. In development, `"*"` (allow everyone) is fine. But in production, you want to restrict it to only your Vercel domain — otherwise anyone could use your API. By reading from an environment variable (`CORS_ORIGINS`), we can set different values for development vs. production without changing code.

---

### 3.3 Updated `.dockerignore` to Exclude Runtime Data

**File**: `backend/.dockerignore`

```diff
+# User-generated runtime data (mount as volume instead)
+app/data/uploads/
+app/data/analysis_cache/
+app/data/batches/
+app/data/metadata/
+app/reports/*.pdf
```

**Why**: The Docker image should only contain **code and dependencies** — not user-uploaded files (43 images) or generated PDF reports (9 files). Including them would:
- Bloat the Docker image unnecessarily (~200 MB larger)
- Overwrite production data every time you rebuild the image
- Instead, we mount these directories as **Docker volumes** so data persists on the server's disk independently of the container

---

### 3.4 Created `.env.example` for Backend

**File**: `backend/.env.example`

```env
DATABASE_URL=postgresql://...
JWT_SECRET=change-this-to-a-random-secret-string
Groq_api=your_groq_api_key_here
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
VT_API_KEY=
ABUSEIPDB_KEY=
WHOIS_KEY=
```

**Why**: Environment variables contain secrets (API keys, database passwords) that should **never** be committed to Git. The `.env.example` file serves as documentation — it tells anyone deploying the project exactly which variables they need to set, without exposing actual secret values.

---

## 4. Frontend Deployment on Vercel

### Step 4.1 — Push Code to GitHub

```bash
cd /Users/jayantchauhan/Desktop/satya/cyberlens
git add -A
git commit -m "Prepare for Vercel + AWS EC2 deployment"
git push origin main
```

**Why**: Vercel deploys directly from your GitHub repository. It needs the latest code pushed to GitHub before it can build and deploy. Vercel will also watch this repo for future pushes to auto-deploy updates.

---

### Step 4.2 — Create Vercel Project

1. Went to [vercel.com/new](https://vercel.com/new)
2. Signed in with GitHub account
3. Clicked **"Import"** next to `Pasta-coder/cyberlens`

**Why**: Vercel needs to be connected to your GitHub repo so it can:
- Pull your source code for building
- Set up webhooks for automatic deployments on every push
- Create preview deployments for pull requests

---

### Step 4.3 — Configure Project Settings

| Setting | Value | Why |
|---------|-------|-----|
| **Framework Preset** | Next.js | Auto-detected — tells Vercel to use Next.js-specific build optimizations |
| **Root Directory** | `webapp` | Our repo is a monorepo with `webapp/` and `backend/` — Vercel only needs the frontend folder |
| **Build Command** | `next build` (default) | Standard Next.js build command that compiles React, generates static pages, and creates serverless functions |
| **Install Command** | `pnpm install --no-frozen-lockfile` (override) | We had to override this because the default `pnpm install` uses `--frozen-lockfile` in CI, which fails if the lockfile is slightly out of sync |

---

### Step 4.4 — Set Environment Variables

Added in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Why |
|----------|-------|-----|
| `NEXT_PUBLIC_API_URL` | `http://YOUR_EC2_IP:8000/api` | Tells the frontend where to send API requests. The `NEXT_PUBLIC_` prefix makes it available in browser-side JavaScript (Next.js convention) |

**Why environment variables instead of hardcoding?**: 
- Different values for development (`localhost:8000`) vs. production (EC2 IP)
- Can change the backend URL without modifying code
- Follows the [12-Factor App](https://12factor.net/config) methodology

---

### Step 4.5 — Deploy

Clicked **"Deploy"** — Vercel automatically:
1. Cloned the repo
2. Ran `pnpm install --no-frozen-lockfile` in the `webapp/` directory
3. Ran `next build` to compile the app
4. Deployed to Vercel's global CDN
5. Assigned a URL: `https://cyberlens-pasta-coders-projects.vercel.app`

**Total build time**: ~41 seconds

---

### Step 4.6 — Fixed Next.js Vulnerability (Issue Encountered)

The initial deployment failed because Next.js 16.0.1 had a known security vulnerability. Vercel blocks deployments with vulnerable framework versions.

**Fix**: Updated Next.js locally and pushed:
```bash
cd webapp
pnpm update next@latest    # Updated 16.0.1 → 16.2.7
git add package.json pnpm-lock.yaml
git commit -m "Update Next.js to 16.2.7 (fix vulnerable version)"
git push origin main
```

**Why**: Vercel enforces security policies — it won't deploy apps with known CVEs (Common Vulnerabilities and Exposures) in critical dependencies like Next.js. Always keep framework versions up to date.

---

## 5. Backend Deployment on AWS EC2

### Step 5.1 — Launch EC2 Instance

1. Went to **AWS Console → EC2 → Launch Instance**
2. Configured:

| Setting | Value | Why |
|---------|-------|-----|
| **Name** | `satyasetu-backend` | Descriptive name for easy identification in the AWS console |
| **AMI** | Ubuntu 24.04 LTS | Ubuntu is the most widely supported Linux distro — almost every tutorial, package, and Docker image supports it. LTS = Long Term Support (5 years of security updates) |
| **Instance Type** | `t3.medium` (2 vCPU, 4 GB RAM) | Our backend loads ML models (XGBoost, spaCy, sentence-transformers) that require ~2-3 GB RAM. `t3.small` (2 GB) would crash with Out-of-Memory errors |
| **Key Pair** | `satyasetu-key` (.pem) | SSH keys are how you securely log into your server. The `.pem` file is your private key — never share it. It's like a password file for your server |
| **Storage** | 20 GB gp3 | Docker images + Python packages + ML models need ~10 GB. 20 GB gives room for uploads and logs. `gp3` is the latest SSD type — cheaper and faster than `gp2` |

**Why EC2 specifically?**: It's a virtual machine (VM) in AWS's data center. You get a full Linux server with root access, public IP, and 24/7 uptime — unlike your laptop which you turn off.

---

### Step 5.2 — Configure Security Group (Firewall Rules)

| Port | Type | Source | Why |
|------|------|--------|-----|
| **22** | SSH | My IP | Allows you to connect via terminal (`ssh`). Restricted to "My IP" so only you can SSH in — prevents brute-force attacks |
| **80** | HTTP | 0.0.0.0/0 | Standard web traffic port. Needed if you set up Nginx reverse proxy later |
| **443** | HTTPS | 0.0.0.0/0 | Secure web traffic. Needed for SSL/TLS certificates |
| **8000** | Custom TCP | 0.0.0.0/0 | FastAPI/Uvicorn listens on port 8000. Opening this allows external access to your API directly |

**Why a security group?**: EC2 instances are firewalled by default — NO ports are open. Without these rules, nobody (including you) could connect to the server. The security group acts as a whitelist of allowed traffic.

---

### Step 5.3 — Assign Elastic IP

1. Allocated a new Elastic IP in the EC2 console
2. Associated it with the `satyasetu-backend` instance
3. Received static IP: `13.50.184.227`

**Why**: By default, EC2 instances get a **dynamic public IP** that changes every time the server reboots. An Elastic IP is a **static IP** that stays the same forever. Without it:
- Your Vercel frontend would break every time EC2 restarts (the API URL would change)
- You'd have to update DNS records / environment variables every reboot
- Elastic IPs are **free** as long as they're attached to a running instance

---

### Step 5.4 — SSH Into the Instance

```bash
# Fix permissions — AWS requires the key file to not be publicly readable
chmod 400 ~/Downloads/satyasetu-key.pem

# Connect to the server
ssh -i ~/Downloads/satyasetu-key.pem ubuntu@13.50.184.227
```

**Why `chmod 400`?**: SSH refuses to use a key file that other users on your system could read. `400` means "owner can read, nobody else can do anything." This is a security requirement, not optional.

**Why SSH?**: SSH (Secure Shell) creates an encrypted tunnel between your Mac and the EC2 server. Everything you type is sent securely to the remote machine. It's like remotely controlling another computer's terminal.

---

### Step 5.5 — Install Docker on EC2

```bash
# Update package lists and upgrade existing packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install -y docker.io

# Start Docker and enable it to start on boot
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to the docker group (avoids needing 'sudo' before every docker command)
sudo usermod -aG docker ubuntu

# Apply the group change immediately
newgrp docker
```

**Why Docker?**: Instead of installing Python 3.10, Tesseract, spaCy, and 60+ Python packages directly on the server (which is messy and error-prone), we package everything into a Docker container. Benefits:
- **Reproducible**: The exact same environment every time, on any machine
- **Isolated**: Doesn't conflict with other software on the server
- **Easy updates**: Rebuild the image, restart the container — done
- **Easy rollback**: If an update breaks things, just run the old image

**Why `systemctl enable`?**: This makes Docker start automatically when the server reboots (e.g., after AWS maintenance). Without it, you'd have to SSH in and manually start Docker after every reboot.

---

### Step 5.6 — Clone Repository and Configure Environment

```bash
# Clone the project from GitHub
git clone https://github.com/Pasta-coder/cyberlens.git
cd cyberlens/backend

# Copy the example env file and fill in real values
cp .env.example .env
nano .env
```

**Contents of `.env`:**
```env
DATABASE_URL=postgresql://neondb_owner:npg_xxxxx@ep-rapid-queen-xxxxx.neon.tech/neondb?sslmode=require
JWT_SECRET=satyasetu-prod-secret-2026
Groq_api=gsk_xxxxxxxxxxxxx
CORS_ORIGINS=https://cyberlens-pasta-coders-projects.vercel.app,http://localhost:3000
```

| Variable | Why |
|----------|-----|
| `DATABASE_URL` | Connection string for the Neon PostgreSQL cloud database. Contains host, username, password, and database name. `sslmode=require` ensures the connection is encrypted |
| `JWT_SECRET` | Used to sign JWT (JSON Web Tokens) for user authentication. Must be a random, hard-to-guess string. Anyone who knows this can forge login tokens |
| `Groq_api` | API key for the Groq cloud service that powers the AI Copilot chat feature (runs Llama 3 model) |
| `CORS_ORIGINS` | Comma-separated list of frontend URLs allowed to call the API. Restricts access to only your Vercel domain |

**Why `.env` file and not hardcoding?**: Secrets in source code = security disaster. If someone reads your GitHub repo, they'd have your database password and API keys. The `.env` file stays only on the server and is never committed to Git (it's in `.gitignore`).

---

### Step 5.7 — Build Docker Image

```bash
docker build -t satyasetu-backend .
```

**What this does** (takes 5-10 minutes):
1. Pulls the `python:3.10-slim` base image from Docker Hub
2. Installs system packages: `tesseract-ocr`, `build-essential`, `libgl1`, etc.
3. Copies `requirements.txt` and installs 60+ Python packages
4. Downloads the spaCy English NLP model (`en_core_web_sm`)
5. Copies all application code into the image
6. Tags the final image as `satyasetu-backend`

**Why `-t satyasetu-backend`?**: The `-t` flag assigns a name (tag) to the image. Without it, you'd have to reference the image by a random hash like `sha256:a1b2c3...` — not user-friendly.

**Why `python:3.10-slim`?**: The `slim` variant is ~150 MB instead of ~900 MB for the full image. It removes unnecessary tools (compilers, man pages) but keeps everything Python needs. We install `build-essential` separately because some Python packages (like numpy) need a C compiler during installation.

---

### Step 5.8 — Run the Docker Container

```bash
docker run -d \
  --name satyasetu \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/app/data:/app/app/data \
  -v $(pwd)/app/reports:/app/app/reports \
  satyasetu-backend
```

**Breaking down each flag:**

| Flag | What It Does | Why |
|------|-------------|-----|
| `-d` | Detached mode — runs in background | So the container keeps running after you close the terminal/SSH session |
| `--name satyasetu` | Names the container | Easier to reference in commands like `docker logs satyasetu` instead of using container IDs |
| `--restart unless-stopped` | Auto-restart policy | If the container crashes or the server reboots, Docker will automatically restart it. Only stops if you explicitly run `docker stop` |
| `-p 8000:8000` | Port mapping (host:container) | Maps port 8000 on the EC2 server to port 8000 inside the container. Without this, the API would only be accessible inside the container |
| `--env-file .env` | Load environment variables | Passes all variables from `.env` file into the container. The app reads them with `os.getenv()` |
| `-v $(pwd)/app/data:/app/app/data` | Volume mount for data | Maps the server's data directory into the container. This means uploaded evidence files **persist** even if the container is destroyed and recreated |
| `-v $(pwd)/app/reports:/app/app/reports` | Volume mount for reports | Same concept — generated PDF reports survive container restarts |

**Why volume mounts?**: Docker containers are **ephemeral** — when you remove a container, all data inside it is lost. Volume mounts link a directory on the host server to a directory inside the container, so data persists independently of the container's lifecycle.

---

### Step 5.9 — Verify the Backend is Running

```bash
# Check if container is running (should show 'Up X seconds')
docker ps

# View application logs
docker logs satyasetu

# Test the health endpoint
curl http://localhost:8000/
```

**Expected response:**
```json
{
  "status": "✅ SatyaSetu.AI backend active",
  "version": "2.0",
  "database": "PostgreSQL (Neon)",
  "modules_loaded": ["auth", "dashboards", "upload_evidence", ...]
}
```

**Why verify?**: Just because the container started doesn't mean the app is working. Common issues:
- Database connection failed (wrong `DATABASE_URL`)
- Missing environment variables
- Port already in use
- ML model files not found

The health endpoint confirms the FastAPI app booted successfully with all modules loaded.

---

## 6. Connecting Frontend to Backend

### Step 6.1 — Update Vercel Environment Variable

1. Went to **Vercel Dashboard → Project Settings → Environment Variables**
2. Set `NEXT_PUBLIC_API_URL` to `http://13.50.184.227:8000/api`
3. Redeployed the frontend

**Why redeploy?**: `NEXT_PUBLIC_` variables are baked into the JavaScript bundle at **build time**, not read at runtime. Changing the env var doesn't take effect until you rebuild and redeploy the frontend.

### Step 6.2 — Verify End-to-End

Tested these flows:
- ✅ Landing page loads on Vercel URL
- ✅ Login with admin credentials works
- ✅ Fraud prediction returns ML model results
- ✅ Evidence upload + OCR analysis completes
- ✅ Dashboard loads data from PostgreSQL
- ✅ PDF report generation and download works

---

## 7. Troubleshooting Issues Faced

### Issue 1: `pnpm-lock.yaml` Out of Sync

**Error:**
```
ERR_PNPM_OUTDATED_LOCKFILE Cannot install with "frozen-lockfile" 
because pnpm-lock.yaml is not up to date with package.json
```

**Cause**: Two dependencies (`leaflet`, `react-leaflet`) were added to `package.json` but the `pnpm-lock.yaml` wasn't regenerated. Vercel runs `pnpm install --frozen-lockfile` by default in CI, which refuses to modify the lockfile.

**Fix**: 
1. Ran `pnpm install --no-frozen-lockfile` locally to regenerate the lockfile
2. Set Vercel's Install Command override to `pnpm install --no-frozen-lockfile`

**Lesson**: Always run `pnpm install` after manually editing `package.json`, and commit the updated lockfile.

---

### Issue 2: Vulnerable Next.js Version Blocking Deployment

**Error:** `Vulnerable version of Next.js detected, please update immediately.`

**Cause**: Next.js 16.0.1 had a known security vulnerability (CVE). Vercel blocks deployments with vulnerable framework versions to protect users.

**Fix**:
```bash
cd webapp
pnpm update next@latest  # 16.0.1 → 16.2.7
git add package.json pnpm-lock.yaml
git commit -m "Update Next.js to 16.2.7"
git push
```

**Lesson**: Keep framework versions up to date, especially for security patches. Vercel enforces this automatically.

---

## 8. Cost Breakdown

### Monthly Costs

| Resource | Service | Monthly Cost |
|----------|---------|-------------|
| Frontend hosting | Vercel (Hobby) | **$0** (free) |
| Backend server | EC2 t3.medium | **~$30** |
| Static IP | Elastic IP (attached) | **$0** |
| Storage | 20 GB EBS gp3 | **~$1.60** |
| Data transfer | First 100 GB/month | **$0** |
| Database | Neon PostgreSQL (free tier) | **$0** |
| SSL Certificate | Let's Encrypt | **$0** |
| **Total** | | **~$32/month** |

### Budget

- **AWS Credits Available**: $100
- **Estimated Monthly Cost**: ~$32
- **Credits Last**: ~3 months

### Cost Optimization Tips

- **If you need to save money**: Use `t3.small` ($15/mo, 2 GB RAM) — but you may need to remove `sentence-transformers` from requirements (it's the heaviest dependency)
- **Stop the instance when not in use**: You only pay for running time. Stop via AWS Console when not demoing
- **Spot instances**: Up to 90% cheaper but can be interrupted — not recommended for production

---

## 9. Maintenance & Updates

### Updating Code After Changes

```bash
# SSH into EC2
ssh -i ~/Downloads/satyasetu-key.pem ubuntu@13.50.184.227

# Pull latest code
cd ~/cyberlens/backend
git pull origin main

# Rebuild and restart
docker stop satyasetu && docker rm satyasetu
docker build -t satyasetu-backend .
docker run -d --name satyasetu --restart unless-stopped \
  -p 8000:8000 --env-file .env \
  -v $(pwd)/app/data:/app/app/data \
  -v $(pwd)/app/reports:/app/app/reports \
  satyasetu-backend
```

**Frontend updates**: Just `git push` — Vercel auto-deploys.

### Monitoring

```bash
# Live logs
docker logs -f satyasetu

# CPU & memory usage
docker stats satyasetu

# Disk usage
df -h
```

### Backup

```bash
# Backup uploaded evidence & analysis data
tar -czf backup-$(date +%Y%m%d).tar.gz app/data/ app/reports/

# Download to your Mac
scp -i ~/Downloads/satyasetu-key.pem ubuntu@13.50.184.227:~/cyberlens/backend/backup-*.tar.gz ~/Desktop/
```

---

## 📝 Summary

| Component | Platform | URL | Status |
|-----------|----------|-----|--------|
| Frontend | Vercel | `https://cyberlens-pasta-coders-projects.vercel.app` | ✅ Live |
| Backend | AWS EC2 | `http://13.50.184.227:8000` | ✅ Live |
| Database | Neon | PostgreSQL cloud | ✅ Connected |
| Repository | GitHub | `github.com/Pasta-coder/cyberlens` | ✅ Auto-deploy |

---

*This guide was created during the deployment of SatyaSetu.AI for production use. All steps were tested and verified on macOS with an AWS account (eu-north-1 region) and Vercel Hobby plan.*
