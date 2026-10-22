# 🚀 Pyda Movers & Logistics — GitHub & Custom Domain Deployment Guide

This guide walks you through deploying **Pyda Movers & Logistics** to **GitHub**, enabling automated builds, and linking your custom domain name (e.g. `pydamovers.com` or `www.pydamovers.com`).

---

## 📋 Table of Contents
1. [Option A: Deploy to GitHub & GitHub Pages (Recommended for Static SPA)](#option-a-deploy-to-github--github-pages)
2. [Option B: Deploy via Vercel / Netlify (1-Click GitHub Integration)](#option-b-deploy-via-vercel--netlify)
3. [Option C: Full-Stack Deployment (Render / Railway / Docker / Cloud Run)](#option-c-full-stack-deployment)
4. [Custom Domain DNS Configuration Cheat Sheet](#custom-domain-dns-configuration-cheat-sheet)
5. [Verification & SSL Activation](#verification--ssl-activation)

---

## 1. Step 1: Push Codebase to Your GitHub Account

1. Open your terminal or console in the project root.
2. Initialize and commit all files (if not already staged):
   ```bash
   git add .
   git commit -m "feat: complete Pyda Movers platform with GitHub deployment and domain configuration"
   ```
3. Go to [GitHub.com](https://github.com/new) and create a **New Repository** named `pyda-movers` (public or private).
4. Link your local repo to GitHub and push to the `main` branch:
   ```bash
   git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/pyda-movers.git
   git branch -M main
   git push -u origin main
   ```

---

## Option A: Deploy to GitHub & GitHub Pages

The repository is pre-configured with:
- `.github/workflows/deploy.yml` — Automated GitHub Actions CI/CD pipeline.
- `public/CNAME` — Pre-set to `pydamovers.com`.
- `public/404.html` — Seamless SPA client routing fallback to prevent 404 errors on deep page reloads.

### Setup Steps in GitHub:
1. In your GitHub repository, navigate to **Settings** > **Pages** (in the left sidebar).
2. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**.
3. Push any commit to `main`, or click **Actions** > **Deploy Pyda Movers to GitHub Pages** > **Run workflow**.
4. Under **Custom domain**:
   - Enter your domain: `pydamovers.com` (or `www.pydamovers.com`).
   - Click **Save**.
5. Check **Enforce HTTPS** (available once DNS resolves).

---

## Option B: Deploy via Vercel / Netlify (1-Click GitHub Integration)

### Deploying to Vercel:
1. Log in to [Vercel](https://vercel.com) and click **Add New...** > **Project**.
2. Select your `pyda-movers` GitHub repository.
3. Framework Preset: **Vite** (detected automatically).
4. Click **Deploy**.
5. Once deployed, go to **Project Settings** > **Domains**:
   - Add `pydamovers.com` and `www.pydamovers.com`.
   - The pre-configured `vercel.json` will handle all route rewrites automatically.

### Deploying to Netlify:
1. Log in to [Netlify](https://netlify.com) and click **Add new site** > **Import an existing project**.
2. Connect your GitHub account and pick `pyda-movers`.
3. The included `netlify.toml` automatically handles `npm run build`, `dist` publishing, and SPA redirects.
4. Go to **Domain management** and attach `pydamovers.com`.

---

## Option C: Full-Stack Deployment (Render / Railway / Cloud Run)

If you wish to run the backend Express server (`server.ts` with email dispatch, SMS webhooks, and telematics APIs):

- **Render**: The repository includes `render.yaml`. In Render, select **New** > **Blueprint**, connect your GitHub repo, and it will deploy the Node.js production service automatically.
- **Docker**: The included multi-stage `Dockerfile` packages the production app for any container host (Google Cloud Run, AWS ECS, DigitalOcean App Platform, Fly.io, or VPS).

---

## Custom Domain DNS Configuration Cheat Sheet

Configure the following records with your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare, Whois, Hostinger, Google Domains/Squarespace):

### 1. For GitHub Pages:
| Type | Host / Name | Value / Points To | TTL |
|------|-------------|-------------------|-----|
| **A** | `@` (or blank) | `185.199.108.153` | Automatic / 300 |
| **A** | `@` (or blank) | `185.199.109.153` | Automatic / 300 |
| **A** | `@` (or blank) | `185.199.110.153` | Automatic / 300 |
| **A** | `@` (or blank) | `185.199.111.153` | Automatic / 300 |
| **CNAME** | `www` | `<YOUR-GITHUB-USERNAME>.github.io` | Automatic / 300 |

### 2. For Vercel:
| Type | Host / Name | Value / Points To | TTL |
|------|-------------|-------------------|-----|
| **A** | `@` | `76.76.21.21` | Automatic |
| **CNAME** | `www` | `cname.vercel-dns.com` | Automatic |

---

## Verification & SSL Activation

1. **DNS Propagation**: DNS updates typically take 5 to 30 minutes (up to 24h depending on registrar).
2. **Check DNS propagation**:
   ```bash
   dig +noall +answer pydamovers.com
   ```
3. **SSL Certificate**:
   - Once DNS is pointed correctly, GitHub, Vercel, or Cloudflare will automatically provision a free Let's Encrypt TLS/SSL certificate.
   - On GitHub Pages, check the box: **Enforce HTTPS**.
