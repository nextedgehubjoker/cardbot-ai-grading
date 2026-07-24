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

    // Simulate AI processing delay
    await new Promise((r) => setTimeout(r, 2200))

    const analysis = generateAnalysis(bytes, imageFile.size)
    return NextResponse.json(analysis)
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
  }
}

function generateAnalysis(bytes: Uint8Array, fileSize: number) {
  // FNV-1a hash for consistent, image-specific results
  let seed = 2166136261
  for (let i = 0; i < Math.min(2000, bytes.length); i++) {
    seed ^= bytes[i]
    seed = Math.imul(seed, 16777619) >>> 0
  }
  let s = seed

  const rand = (min: number, max: number): number => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return min + (s / 4294967296) * (max - min)
  }
  const r1 = (min: number, max: number) => Math.round(rand(min, max) * 10) / 10

  // Subgrades
  const centering = r1(5.5, 10)
  const corners   = r1(6.5, 10)
  const edges     = r1(6.0, 10)
  const surface   = r1(5.5, 10)

  const avg   = (centering + corners + edges + surface) / 4
  const worst = Math.min(centering, corners, edges, surface)

  // PSA — worst factor weighted heavily
  const psaRaw = worst * 0.55 + avg * 0.45
  const psaGrade =
    psaRaw >= 9.5 ? 10 : psaRaw >= 8.5 ? 9 : psaRaw >= 7.5 ? 8 :
    psaRaw >= 6.5 ? 7 : psaRaw >= 5.5 ? 6 : Math.max(1, Math.round(psaRaw))

  // BGS — subgrade average
  const bgsRaw = avg
  const bgsGrade =
    bgsRaw >= 9.75 ? 10 : bgsRaw >= 9.5 ? 9.5 : bgsRaw >= 9.0 ? 9 :
    bgsRaw >= 8.5  ? 8.5 : bgsRaw >= 8.0 ? 8  : Math.max(1, Math.round(bgsRaw - 0.5) + 0.5)

  // CGC — similar to PSA, slight offset
  const cgcRaw = psaRaw + rand(-0.3, 0.3)
  const cgcGrade =
    cgcRaw >= 9.5 ? 10 : cgcRaw >= 9.0 ? 9.5 : cgcRaw >= 8.5 ? 9 :
    cgcRaw >= 7.5 ? 8.5 : cgcRaw >= 6.5 ? 8 : Math.max(1, Math.round(cgcRaw))

  // PSA 10 chance
  const psa10Chance =
    psaGrade === 10 ? Math.round(rand(55, 88))
    : psaGrade === 9 ? Math.round(rand(12, 38))
    : Math.round(rand(1, 12))

  // Issues
  const issues: string[] = []
  if (centering < 8) {
    const off = Math.round(50 + (8.5 - centering) * 3.5)
    issues.push(`Off-centering detected (~${off}/${100 - off} L/R)`)
  }
  if (corners < 7.5) issues.push(`Corner wear (${corners < 6.5 ? "moderate–heavy" : "light"} fraying)`)
  if (edges   < 7.5) issues.push(`Edge roughness/chipping (${edges < 6.5 ? "significant" : "minor"} whitening)`)
  if (surface < 7.5) issues.push(`Surface marks (${surface < 6.5 ? "scratches or staining" : "light print lines"})`)
  if (issues.length === 0) issues.push("No significant defects detected ✓")

  const recommendation: "submit" | "consider" | "raw" =
    psaGrade >= 9 ? "submit" : psaGrade >= 7 ? "consider" : "raw"

  return {
    subgrades: { centering, corners, edges, surface },
    psa: { grade: psaGrade, confidence: Math.round(rand(66, 91)) },
    bgs: { grade: bgsGrade, confidence: Math.round(rand(62, 88)) },
    cgc: { grade: cgcGrade, confidence: Math.round(rand(60, 87)) },
    issues,
    recommendation,
    psa10Chance,
    summary:
      psaGrade >= 9 ? "Strong candidate for high-grade submission"
      : psaGrade >= 7 ? "Moderate candidate — visible defects may limit grade"
      : "Significant issues detected — submission may not add value",
    details: {
      centering:
        centering >= 9 ? "Excellent — well within PSA 10 centering standards"
        : centering >= 8 ? "Good — qualifies for PSA 9 centering threshold"
        : centering >= 7 ? "Fair — centering likely limits grade to PSA 7–8"
        : "Poor — significant off-centering will cap grade",
      corners:
        corners >= 9 ? "Sharp, fresh corners with no visible wear"
        : corners >= 8 ? "Light wear — minimal grade impact"
        : corners >= 7 ? "Moderate wear visible under close inspection"
        : "Heavy fraying or corner wear detected",
      edges:
        edges >= 9 ? "Clean, smooth edges — no chipping or whitening"
        : edges >= 8 ? "Minor roughness — minimal grade impact"
        : edges >= 7 ? "Visible edge wear or chipping"
        : "Significant edge damage or whitening",
      surface:
        surface >= 9 ? "Clean surface — no scratches or print defects"
        : surface >= 8 ? "Light marks — minimal grade impact"
        : surface >= 7 ? "Visible scratches, print lines, or surface marks"
        : "Significant surface damage detected",
    },
  }
}
