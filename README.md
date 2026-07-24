# CardBot — AI Card Grading

AI-powered trading card pre-screen tool: grading prediction, centering calculator, submission fee/ROI estimator, and price-check by grade (PSA, BGS, CGC, SGC).

## Features
- **Auto Scan** — one photo runs grading, centering, fees, and ROI automatically, with glare/lighting quality detection
- **AI Grader** — manual upload/camera-capture grading pre-screen
- **Centering Calculator** — manual measurement entry or auto-estimate from photo
- **Grade Predictor** — click-to-rate condition factors for instant grade estimate
- **Value Calculator** — submission fee + ROI breakeven calculator
- **Price Check** — PriceCharting-powered grade ladder (Raw → PSA 10 → BGS 10 → CGC 10 → SGC 10), gated behind a `PRICECHARTING_API_TOKEN` env var (falls back to a direct manual-search link if unset)
- **Cert Lookup** — PSA/BGS/CGC/SGC/TAG certification verification links
- **Market Search** — quick links to eBay sold listings, Carousell, PWCC, 130point, Goldin, MySlabs
- **HK Submission Guide** — step-by-step guide for Hong Kong collectors submitting to PSA/BGS/CGC

## Stack
Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui

## Getting Started
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Environment Variables (optional)
- `PRICECHARTING_API_TOKEN` — enables live PriceCharting pricing in the Price Check tab
- `PSA_API_TOKEN` — enables live PSA cert lookups in the Cert Lookup tab

> All grading/condition results are AI-generated estimates only — not official grades. Not affiliated with PSA, BGS, CGC, SGC, TAG, or PriceCharting.
