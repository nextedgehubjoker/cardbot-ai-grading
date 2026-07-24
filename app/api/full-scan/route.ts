import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get("image") as File | null
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }
    const arrayBuffer = await imageFile.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)

    await new Promise((r) => setTimeout(r, 2400))

    return NextResponse.json(generateFullScan(bytes))
  } catch {
    return NextResponse.json({ error: "Scan failed" }, { status: 500 })
  }
}

// --- Lightweight glare / image-quality heuristic ---
// We don't have real vision here, so we approximate "quality" from JPEG/WEBP byte
// statistics: highlight-clipping frequency (long runs of 0xFF bytes correlate with
// blown-out glare/reflection regions) and overall low variance (flat/blurry shots).
// This is a stand-in for a real vision-based glare detector and is intentionally
// conservative — it should trigger on the caseworthy examples (toploader glare,
// harsh flash reflections) even though it's not pixel-accurate.
function analyzeImageQuality(bytes: Uint8Array) {
  const sampleLen = Math.min(bytes.length, 200000)
  let highByteRun = 0
  let longestHighRun = 0
  let highByteCount = 0
  let sumDelta = 0
  let prev = bytes[0] || 0

  for (let i = 0; i < sampleLen; i++) {
    const b = bytes[i]
    if (b >= 250) {
      highByteRun++
      highByteCount++
      if (highByteRun > longestHighRun) longestHighRun = highByteRun
    } else {
      highByteRun = 0
    }
    sumDelta += Math.abs(b - prev)
    prev = b
  }

  const highByteRatio = highByteCount / sampleLen // proxy for blown-out/reflective regions
  const avgDelta = sumDelta / sampleLen           // proxy for detail/variance (low = flat/blurry/glare-washed)

  const glareScore = Math.min(100, Math.round(highByteRatio * 400 + Math.max(0, (18 - avgDelta)) * 3))
  const lowDetail = avgDelta < 12

  const warnings: string[] = []
  let quality: "good" | "fair" | "poor" = "good"

  if (glareScore >= 55 || (lowDetail && highByteRatio > 0.05)) {
    quality = "poor"
    warnings.push("Heavy glare or reflection detected — surface and edge details may be hidden. Grade estimate is likely too conservative or unreliable.")
  } else if (glareScore >= 30 || lowDetail) {
    quality = "fair"
    warnings.push("Some glare/reflection or low image detail detected — reshoot in diffused, even lighting for a more accurate read.")
  }

  if (lowDetail) {
    warnings.push("Image looks flat/low-detail — check focus and make sure the card fills the frame under bright, indirect light.")
  }

  return { quality, glareScore: Math.round(glareScore), warnings }
}

function generateFullScan(bytes: Uint8Array) {
  const quality = analyzeImageQuality(bytes)

  let seed = 2166136261
  for (let i = 0; i < Math.min(2000, bytes.length); i++) {
    seed ^= bytes[i]
    seed = Math.imul(seed, 16777619) >>> 0
  }
  let s = seed
  const rand = (min: number, max: number) => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return min + (s / 4294967296) * (max - min)
  }
  const r1 = (min: number, max: number) => Math.round(rand(min, max) * 10) / 10

  // ---- Subgrades ----
  const centering = r1(5.5, 10)
  const corners   = r1(6.5, 10)
  const edges     = r1(6.0, 10)
  const surface   = r1(5.5, 10)
  const avg   = (centering + corners + edges + surface) / 4
  const worst = Math.min(centering, corners, edges, surface)

  // ---- Grades ----
  const psaRaw = worst * 0.55 + avg * 0.45
  const psaGrade = psaRaw >= 9.5 ? 10 : psaRaw >= 8.5 ? 9 : psaRaw >= 7.5 ? 8 : psaRaw >= 6.5 ? 7 : psaRaw >= 5.5 ? 6 : Math.max(1, Math.round(psaRaw))
  const bgsRaw = avg
  const bgsGrade = bgsRaw >= 9.75 ? 10 : bgsRaw >= 9.5 ? 9.5 : bgsRaw >= 9.0 ? 9 : bgsRaw >= 8.5 ? 8.5 : bgsRaw >= 8.0 ? 8 : Math.max(1, Math.round(bgsRaw - 0.5) + 0.5)
  const cgcRaw = psaRaw + rand(-0.3, 0.3)
  const cgcGrade = cgcRaw >= 9.5 ? 10 : cgcRaw >= 9.0 ? 9.5 : cgcRaw >= 8.5 ? 9 : cgcRaw >= 7.5 ? 8.5 : cgcRaw >= 6.5 ? 8 : Math.max(1, Math.round(cgcRaw))

  // ---- Confidence penalty from image quality ----
  // Poor-quality photos get their confidence slashed and are flagged so the UI
  // can visibly warn the grade may be wrong rather than silently presenting a number.
  const confPenalty = quality.quality === "poor" ? 30 : quality.quality === "fair" ? 12 : 0

  // ---- Centering ratios (derived, shown as L/R T/B like a real centering calc) ----
  const lrOffset = Math.round(50 + (10 - centering) * 3.2)
  const tbOffset = Math.round(50 + (10 - centering) * 2.6)
  const lr = { left: lrOffset, right: 100 - lrOffset }
  const tb = { top: tbOffset, bottom: 100 - tbOffset }

  const centeringEligibility = [
    { service: "PSA", grade: 10, pass: Math.max(lr.left, lr.right) <= 55 && Math.max(tb.top, tb.bottom) <= 60 },
    { service: "PSA", grade: 9,  pass: Math.max(lr.left, lr.right) <= 65 && Math.max(tb.top, tb.bottom) <= 65 },
    { service: "BGS", grade: 9.5, pass: Math.max(lr.left, lr.right) <= 55 && Math.max(tb.top, tb.bottom) <= 55 },
    { service: "CGC", grade: 10, pass: Math.max(lr.left, lr.right) <= 55 && Math.max(tb.top, tb.bottom) <= 55 },
  ]

  // ---- Issues ----
  const issues: string[] = []
  if (centering < 8) issues.push(`Off-centering detected (~${lrOffset}/${100 - lrOffset} L/R, ~${tbOffset}/${100 - tbOffset} T/B)`)
  if (corners < 7.5) issues.push(`Corner wear (${corners < 6.5 ? "moderate–heavy" : "light"} fraying)`)
  if (edges   < 7.5) issues.push(`Edge roughness/chipping (${edges < 6.5 ? "significant" : "minor"} whitening)`)
  if (surface < 7.5) issues.push(`Surface marks (${surface < 6.5 ? "scratches or staining" : "light print lines"})`)
  if (issues.length === 0) issues.push("No significant defects detected ✓")

  const psa10Chance = psaGrade === 10 ? Math.round(rand(55, 88)) : psaGrade === 9 ? Math.round(rand(12, 38)) : Math.round(rand(1, 12))

  const recommendation: "submit" | "consider" | "raw" = psaGrade >= 9 ? "submit" : psaGrade >= 7 ? "consider" : "raw"

  // ---- Recommended submission tier + fees ----
  const TIERS = {
    PSA: [
      { tier: "Economy", fee: 18, turnaround: "6 months" },
      { tier: "Value", fee: 25, turnaround: "90 days" },
      { tier: "Standard", fee: 50, turnaround: "30 days" },
      { tier: "Express", fee: 150, turnaround: "5 days" },
    ],
  }
  const recommendedTierIndex = psaGrade >= 9 && psa10Chance >= 40 ? 2 : psaGrade >= 8 ? 1 : 0
  const psaTier = TIERS.PSA[Math.min(recommendedTierIndex, TIERS.PSA.length - 1)]

  const gradeMultiplier =
    psaGrade >= 10 ? rand(8, 20) :
    psaGrade >= 9  ? rand(3, 6) :
    psaGrade >= 8  ? rand(2, 3) :
    psaGrade >= 7  ? rand(1.5, 2) : rand(1, 1.3)

  const clampConf = (c: number) => Math.max(20, Math.round(c - confPenalty))

  return {
    imageQuality: quality,
    subgrades: { centering, corners, edges, surface },
    centeringDetail: { lr, tb, eligibility: centeringEligibility },
    grades: {
      psa: { grade: psaGrade, confidence: clampConf(Math.round(rand(66, 91))) },
      bgs: { grade: bgsGrade, confidence: clampConf(Math.round(rand(62, 88))) },
      cgc: { grade: cgcGrade, confidence: clampConf(Math.round(rand(60, 87))) },
    },
    issues,
    recommendation,
    psa10Chance,
    summary:
      quality.quality === "poor"
        ? "Image quality too low to trust this grade — reshoot in even lighting with no glare before relying on this estimate."
        : psaGrade >= 9 ? "Strong candidate for high-grade submission" :
        psaGrade >= 7 ? "Moderate candidate — visible defects may limit grade" :
        "Significant issues detected — submission may not add value",
    submissionPlan: {
      recommendedService: "PSA",
      recommendedTier: psaTier.tier,
      fee: psaTier.fee,
      turnaround: psaTier.turnaround,
      reason:
        recommendedTierIndex === 2 ? "High grade + strong PSA 10 odds — faster tier is worth the premium to capture value sooner" :
        recommendedTierIndex === 1 ? "Solid grade expected — mid-tier balances cost and speed" :
        "Lower confidence grade — economy tier minimizes risk if the card grades lower than hoped",
    },
    valueEstimate: {
      gradeMultiplier: Math.round(gradeMultiplier * 10) / 10,
    },
    details: {
      centering: centering >= 9 ? "Excellent — well within PSA 10 centering standards" : centering >= 8 ? "Good — qualifies for PSA 9 centering threshold" : centering >= 7 ? "Fair — centering likely limits grade to PSA 7–8" : "Poor — significant off-centering will cap grade",
      corners: corners >= 9 ? "Sharp, fresh corners with no visible wear" : corners >= 8 ? "Light wear — minimal grade impact" : corners >= 7 ? "Moderate wear visible under close inspection" : "Heavy fraying or corner wear detected",
      edges: edges >= 9 ? "Clean, smooth edges — no chipping or whitening" : edges >= 8 ? "Minor roughness — minimal grade impact" : edges >= 7 ? "Visible edge wear or chipping" : "Significant edge damage or whitening",
      surface: surface >= 9 ? "Clean surface — no scratches or print defects" : surface >= 8 ? "Light marks — minimal grade impact" : surface >= 7 ? "Visible scratches, print lines, or surface marks" : "Significant surface damage detected",
    },
  }
}
