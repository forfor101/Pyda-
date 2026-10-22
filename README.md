# 🚛 Pyda Movers & Logistics Platform

> **Nigeria & West Africa's Premier Corporate Relocation, Commercial Haulage & Executive Logistics Platform.**

Built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **Google AI Studio (Gemini 3.8 Flash)** multimodal cargo vision & smart volumetric packing engine.

---

## ✨ Core Platform Capabilities

- **Automated Nigerian Route Pricing Calculator**: High-precision pricing engine across all 36 States + FCT Abuja with LGA-level granularity, intra/interstate toll, staircase, and access terrain logic.
- **Google AI Studio Digital Cargo Inspection**: Camera/upload computer vision that generates labeled cargo manifests, flags fragility ratings, and calculates spatial CBM volumes.
- **Smart Volumetric Packing & Density Engine**: 3D carton sizing, void reduction heuristics, and printable inventory QR codes for warehouse scanning.
- **Executive Car Hire & Armored Escort Portal**: Intra/interstate luxury convoy booking with branded PDF invoices and instant dispatch.
- **Investor Fleet Management Portal**: Telematics vehicle health monitoring, ROI calculator, and FRSC-verified driver certifications directory.
- **Client Document Vault**: Cryptographically sealed Bill of Lading (BOL), Goods-in-Transit (GIT) insurance certificates, and consolidated PDF export.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle & sitemap
npm run build

# 4. Preview production build
npm run preview
```

---

## 🌐 Deploy to GitHub & Link Custom Domain

See [`DEPLOYMENT_AND_DOMAIN_GUIDE.md`](./DEPLOYMENT_AND_DOMAIN_GUIDE.md) for full step-by-step instructions.

### 1. Push to GitHub:
```bash
git add .
git commit -m "feat: initial commit for Pyda Movers"
git remote add origin https://github.com/<your-username>/pyda-movers.git
git branch -M main
git push -u origin main
```

### 2. Connect Your Custom Domain (`pydamovers.com`):
Set the following DNS records on your domain registrar:

- **Apex Domain (`@`)**:
  - `185.199.108.153` (A Record)
  - `185.199.109.153` (A Record)
  - `185.199.110.153` (A Record)
  - `185.199.111.153` (A Record)
- **Subdomain (`www`)**:
  - `<your-username>.github.io` (CNAME Record)

In your GitHub repository:
- Go to **Settings** > **Pages**
- Select **Source**: `GitHub Actions`
- Set **Custom domain**: `pydamovers.com`
- Check **Enforce HTTPS**

---

## 🛡️ License & Copyright
© Pyda Movers & Logistics Ltd. All rights reserved.
Suite A204, AA Rano Citygate Plaza, Airport Road, Abuja FCT | 374/376 Old Ojo Road, Alakija, Lagos State.
Hotlines: `+234 806 246 6212` | `+234 802 560 9972`
