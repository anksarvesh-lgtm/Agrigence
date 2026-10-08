# Agrigence Publication & Kisan Research Suite 🌾📖

> **A peer-reviewed agricultural research journal and smart farmer ecosystem platform.**  
> Volume 1 | Issue 1 | May 2026 • ISSN: Applied For • Publisher: Agrigence Teams, India

---

## 📌 Overview

**Agrigence Publication** is an all-in-one digital platform unifying academic agricultural research and real-world farm intelligence in India. It bridges the gap between agricultural scientists, agronomy scholars, peer reviewers, and grassroots farming communities.

The platform provides two interconnected ecosystems:
1. **Academic Journal & Research Suite**: A peer-reviewed manuscript submission and evaluation lifecycle, editorial workflows, PDF reader, and statistical computation engines (ANOVA, RCBD, CRD, Factorial, PCA).
2. **Kisan Hub**: Practical agro-tech tools for farmers including live APMC Mandi commodity rates across Indian states, Gemini AI-powered crop disease diagnosis, agricultural equipment rentals, produce marketplaces, and government scheme navigators.

---

## ✨ Key Features

### 📖 1. Academic Journal & Editorial Workflow
- **Manuscript Submission**: Seamless paper submission with multi-author metadata, abstract, keywords, and document upload (.docx, .pdf).
- **Peer Review Management**: Structured reviewer dashboards with double-blind review scorecards, recommendation tracking, and revision loops.
- **Editorial Board & Ethics**: Guidelines adhering to COPE (Committee on Publication Ethics), copyright agreements, and publication policies.
- **Publication Archive & Reader**: In-browser document viewer with volume/issue archives, citation generators, and DOI tracking.

### 🔬 2. Agricultural Research Data Lab & Statistical Engines
- **ANOVA Computation Engine**:
  - Completely Randomized Design (CRD)
  - Randomized Complete Block Design (RCBD)
  - Factorial ANOVA experiments (two-factor and multi-factor)
  - Critical Difference (CD / LSD) and Standard Error of Mean (SEm±)
- **Principal Component Analysis (PCA)**: Dimensionality reduction and variance scree plots for agronomic trait datasets.
- **Agricultural Calculators**: Fertilizer N-P-K recommendation calculators, seed rate estimators, and pesticide dilution matrices.
- **Data Visualizer**: Interactive charts using Recharts and dataset imports via CSV/Excel.

### 🌾 3. Kisan Hub & Smart Farming Services
- **Live Mandi Prices**: Real-time mandi price tracker across Indian states, districts, and agricultural commodities with daily price trends and historical analytics.
- **AI Crop Advisory**: Multimodal pest and disease identification powered by Google Gemini AI with localized treatment guidelines.
- **Farmer Connect**: Community forum and consultation portal connecting farmers directly with agricultural university extension scientists.
- **Government Schemes**: Directory of central and state farming welfare schemes (PM-KISAN, PMFBY, Soil Health Card, KCC) with eligibility checker.
- **Equipment Rental & Marketplace**: Peer-to-peer farm machinery rental (tractors, harvesters, drip kits) and produce listings.

### 📱 4. WhatsApp Notification Engine
- **Whapi.Cloud Integration**: Automated transactional alerts for manuscript milestones, peer review reminders, and payment receipts.
- **BullMQ & Redis Queue**: Queue management with automatic rate limiting (150 msgs/day per token) and next-day rollover.

### 💳 5. Payment Processing
- **Razorpay Payment Gateway**: Secure processing for Article Processing Charges (APC), subscription plans, and marketplace deposits with signature verification.

### 🛡️ 6. Security & Hardening
- **Strict Rate Limiting**: Endpoint-specific rate limiting (`authRateLimiter`, `strictRateLimiter`, `aiRateLimiter`, `publicApiRateLimiter`).
- **File Upload Security**: Magic-byte inspection, strict MIME type whitelisting, and file size sanitization.
- **Input Validation**: Rigorous schema validation for payment callbacks, chat inputs, and generation requests.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Framer Motion |
| **Interactive UI** | Leaflet / React-Leaflet, Recharts, React Flow, React-Quill, Jodit-React |
| **Backend** | Node.js, Express 5, TypeScript (`tsx`) |
| **Database & Auth** | Firebase Firestore & Firebase Authentication |
| **File Storage** | Vercel Blob Storage (`@vercel/blob`) |
| **AI & ML** | Google Gemini API (`@google/genai`) |
| **Queues & Cache** | BullMQ, Redis (`ioredis`), Node-Cron |
| **Payments** | Razorpay Node.js SDK |
| **Math & Stats** | `ml-matrix`, `ml-pca`, `simple-statistics`, `jstat` |

---

## 📂 Project Structure

```text
├── app/                      # Application route layouts & providers
├── components/               # Reusable UI components & navigation
│   ├── auth/                 # Authentication modals and forms
│   ├── common/               # Badges, loaders, buttons, cards
│   ├── journal/              # Article cards, citation modals, PDF viewer
│   └── kisan/                # Mandi price tables, crop advisory cards
├── config/                   # Firebase and application configuration
├── docs/                     # Architecture specifications & documentation
├── middleware/               # Express security, rate limiting, and validation
│   ├── errorLogger.ts        # Centralized error sanitization
│   ├── fileUploadSecurity.ts # Magic byte and file type verification
│   ├── inputValidation.ts    # Request payload sanitization
│   └── rateLimiter.ts        # Redis/in-memory rate limiters
├── pages/                    # Application route views
│   ├── AdvancedStatsSuite/   # ANOVA and statistical calculation engines
│   ├── KisanHub/             # Mandi prices, equipment rental, farmer tools
│   ├── Admin.tsx             # Administrative dashboard
│   ├── Dashboard.tsx         # Author and researcher dashboard
│   ├── Home.tsx              # Landing homepage
│   ├── Journals.tsx          # Volume and issue archive
│   ├── MandiCityPage.tsx     # City-specific mandi rates
│   └── Submission.tsx        # Manuscript submission portal
├── public/                   # Static assets, logos, and icons
├── services/                 # API client services & Firebase SDK bindings
├── src/                      # Server-side background jobs & WhatsApp engine
├── server.ts                 # Full-stack Express server & API routes
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore configuration
├── metadata.json             # Applet metadata and permissions
├── package.json              # Project dependencies and scripts
└── vite.config.ts            # Vite build configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm** or **bun**
- *(Optional)* **Redis**: Required for BullMQ WhatsApp background queueing (in-memory fallback available if Redis is absent).

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/agrigence-journal.git
   cd agrigence-journal
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and provide your credentials:
   ```bash
   cp .env.example .env
   ```

   Fill in the required keys:
   ```env
   # Razorpay Gateway
   RAZORPAY_KEY_ID=rzp_test_xxxxxxx
   RAZORPAY_KEY_SECRET=your_secret_here
   VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxx

   # Vercel Blob Storage
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxx

   # Google Gemini AI
   GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxx

   # (Optional) Redis URL for BullMQ
   REDIS_URL=redis://127.0.0.1:6379
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application will be live at `http://localhost:3000`.

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs the full-stack Express server with Vite middleware on port 3000 |
| `npm run build` | Typechecks with TypeScript (`tsc`) and compiles the frontend bundle with Vite |
| `npm run start` | Starts the production server using `tsx server.ts` |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the compiled production build locally |

---

## 🔌 API Routes Overview

- `POST /api/ai/chat` — Gemini AI conversational agronomy and crop advice.
- `POST /api/ai/generate` — Text generation for abstracts, article summaries, and peer feedback.
- `POST /api/razorpay/order` — Create payment orders for APC and journal subscriptions.
- `POST /api/razorpay/verify` — Cryptographic signature verification for payment completion.
- `POST /api/upload` — Secure document and manuscript asset upload with MIME verification.
- `GET /api/proxy-pdf` — Safe PDF document proxy for the journal reader.
- `GET /api/health` — Application and database health verification endpoint.

---

## 📄 License & Attribution

© 2026 **Agrigence Teams, India**. All rights reserved.  
Published for academic research advancement and sustainable agricultural development.
