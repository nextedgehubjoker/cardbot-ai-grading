"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const CENTERING_OPTIONS = [
  { label: "Perfect (50/50)", score: 10, hint: "Dead centered on all sides" },
  { label: "Good (55/45)",    score: 9,  hint: "Slight offset, PSA 10 eligible" },
  { label: "Fair (60/40)",    score: 8,  hint: "Noticeable offset, PSA 9 territory" },
  { label: "Off (65/35)",     score: 7,  hint: "Clearly off-center" },
  { label: "Poor (75/25+)",   score: 5,  hint: "Heavily off-center" },
]

const CORNER_OPTIONS = [
  { label: "Mint",          score: 10, hint: "Sharp corners, no wear" },
  { label: "Very Light",    score: 9,  hint: "Tiny wear only under magnification" },
  { label: "Light",         score: 8,  hint: "Slight corner fuzzing" },
  { label: "Moderate",      score: 6,  hint: "Visible fraying or blunting" },
  { label: "Heavy",         score: 4,  hint: "Rounded or badly worn corners" },
]

const EDGE_OPTIONS = [
  { label: "Mint",          score: 10, hint: "Smooth, clean edges" },
  { label: "Very Light",    score: 9.5, hint: "Barely perceptible roughness" },
  { label: "Light",         score: 8,  hint: "Minor nicks or roughness" },
  { label: "Moderate",      score: 6,  hint: "Chipping or whitening visible" },
  { label: "Heavy",         score: 4,  hint: "Significant edge damage" },
]

const SURFACE_OPTIONS = [
  { label: "Perfect",       score: 10, hint: "No marks, pristine surface" },
  { label: "Very Light",    score: 9.5, hint: "Barely visible light marks" },
  { label: "Light",         score: 8.5, hint: "Minor scratches or print lines" },
  { label: "Moderate",      score: 7,  hint: "Visible scratches or marks" },
  { label: "Heavy",         score: 4,  hint: "Major surface damage or staining" },
]

const PRINT_OPTIONS = [
  { label: "None",   adjustment: 0,    hint: "No print defects" },
  { label: "Minor",  adjustment: -0.5, hint: "Slight miscut or minor spot" },
  { label: "Major",  adjustment: -2,   hint: "Significant print defect or misprint" },
]

const gradeColor = (g: number) =>
  g >= 10 ? "bg-amber-500 text-black" :
  g >= 9  ? "bg-blue-600 text-white"  :
  g >= 8  ? "bg-green-600 text-white" :
  g >= 7  ? "bg-yellow-500 text-black":
            "bg-zinc-600 text-white"

const gradeLabel = (g: number) =>
  g >= 10 ? "Gem Mint" : g >= 9 ? "Mint" : g >= 8 ? "Near Mint–Mint" : g >= 7 ? "Near Mint" : g >= 6 ? "Excellent–Mint" : "Excellent"

function OptionGroup({
  title, options, value, onChange
}: {
  title: string
  options: { label: string; score: number; hint: string }[]
  value: number
  onChange: (s: number) => void
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-1.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange(opt.score)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
              value === opt.score
                ? "border-amber-500 bg-amber-500/15 text-amber-300"
                : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            )}
          >
            <span className="font-medium">{opt.label}</span>
            <span className="text-xs ml-2 opacity-60">{opt.hint}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function GradePredictor() {
  const [centering, setCentering] = useState<number | null>(null)
  const [corners, setCorners]     = useState<number | null>(null)
  const [edges, setEdges]         = useState<number | null>(null)
  const [surface, setSurface]     = useState<number | null>(null)
  const [printAdj, setPrintAdj]   = useState(0)

  const prediction = useMemo(() => {
    if (!centering || !corners || !edges || !surface) return null

    const scores = [centering, corners, edges, surface]
    const avg   = scores.reduce((a, b) => a + b, 0) / 4
    const worst = Math.min(...scores)

    // Apply print defect adjustment
    const adjustedAvg   = avg + printAdj
    const adjustedWorst = worst + printAdj

    // PSA — worst factor weighted
    const psaRaw = adjustedWorst * 0.55 + adjustedAvg * 0.45
    const psaGrade =
      psaRaw >= 9.5 ? 10 : psaRaw >= 8.5 ? 9 : psaRaw >= 7.5 ? 8 :
      psaRaw >= 6.5 ? 7  : psaRaw >= 5.5 ? 6 : Math.max(1, Math.round(psaRaw))

    // BGS — subgrade average
    const bgsRaw = adjustedAvg
    const bgsGrade =
      bgsRaw >= 9.75 ? 10 : bgsRaw >= 9.5 ? 9.5 : bgsRaw >= 9 ? 9 :
      bgsRaw >= 8.5  ? 8.5 : bgsRaw >= 8  ? 8   : Math.max(1, Math.round(bgsRaw - 0.5) + 0.5)

    // CGC — similar to PSA
    const cgcRaw = psaRaw - 0.1
    const cgcGrade =
      cgcRaw >= 9.5 ? 10 : cgcRaw >= 9.0 ? 9.5 : cgcRaw >= 8.5 ? 9 :
      cgcRaw >= 7.5 ? 8.5 : cgcRaw >= 6.5 ? 8   : Math.max(1, Math.round(cgcRaw))

    // Weakest link
    const factorNames = ["Centering", "Corners", "Edges", "Surface"]
    const worstFactor = factorNames[scores.indexOf(worst)]

    const psa10Chance =
      psaGrade === 10 ? (adjustedWorst >= 9.5 ? "High (70–85%)" : "Moderate (40–60%)")
      : psaGrade === 9 ? "Low (10–25%)"
      : "Very Low (<10%)"

    return { psaGrade, bgsGrade, cgcGrade, worstFactor, psa10Chance, adjustedAvg }
  }, [centering, corners, edges, surface, printAdj])

  const allSelected = centering && corners && edges && surface

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Condition inputs */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Star className="h-5 w-5 text-amber-400" /> Rate Your Card
          </CardTitle>
          <p className="text-xs text-zinc-500">Select the condition for each factor</p>
        </CardHeader>
        <CardContent className="space-y-5">
          <OptionGroup title="Centering" options={CENTERING_OPTIONS} value={centering ?? 0} onChange={setCentering} />
          <Separator className="bg-zinc-800" />
          <OptionGroup title="Corners" options={CORNER_OPTIONS} value={corners ?? 0} onChange={setCorners} />
          <Separator className="bg-zinc-800" />
          <OptionGroup title="Edges" options={EDGE_OPTIONS} value={edges ?? 0} onChange={setEdges} />
          <Separator className="bg-zinc-800" />
          <OptionGroup title="Surface" options={SURFACE_OPTIONS} value={surface ?? 0} onChange={setSurface} />
          <Separator className="bg-zinc-800" />

          {/* Print defects */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Print Defects</p>
            <div className="flex gap-2">
              {PRINT_OPTIONS.map((opt) => (
                <button key={opt.label}
                  onClick={() => setPrintAdj(opt.adjustment)}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm transition-all",
                    printAdj === opt.adjustment
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600"
                  )}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prediction output */}
      <div className="space-y-4">
        {!allSelected ? (
          <Card className="bg-zinc-900 border-zinc-800 flex items-center justify-center min-h-64">
            <div className="text-center text-zinc-600">
              <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Rate all four condition factors<br />to see your grade prediction</p>
            </div>
          </Card>
        ) : prediction ? (
          <>
            {/* Main grade cards */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-zinc-100 text-base">Predicted Grades</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { service: "PSA", grade: prediction.psaGrade },
                  { service: "BGS", grade: prediction.bgsGrade },
                  { service: "CGC", grade: prediction.cgcGrade },
                ].map(({ service, grade }) => (
                  <div key={service} className="flex items-center gap-4">
                    <div className={cn("rounded-xl w-16 h-16 flex flex-col items-center justify-center shrink-0 font-black", gradeColor(grade))}>
                      <span className="text-xl leading-none">{grade}</span>
                      <span className="text-[9px] font-bold opacity-70">{service}</span>
                    </div>
                    <div>
                      <div className="text-zinc-100 font-semibold">{service} {grade} — {gradeLabel(grade)}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">Based on your condition ratings</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Key indicators */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4">
                  <div className="text-xs text-zinc-500 mb-1">PSA 10 Likelihood</div>
                  <div className="text-amber-400 font-bold text-sm">{prediction.psa10Chance}</div>
                </CardContent>
              </Card>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4">
                  <div className="text-xs text-zinc-500 mb-1">Weakest Factor</div>
                  <div className="text-red-400 font-bold text-sm flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> {prediction.worstFactor}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" /> Key Insight
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-zinc-300 space-y-2">
                {prediction.psaGrade >= 9 ? (
                  <p>🔥 <strong className="text-green-400">Strong candidate</strong> — condition looks great for high-grade submission. Focus on verifying centering with the calculator.</p>
                ) : prediction.psaGrade >= 7 ? (
                  <p>⚡ <strong className="text-yellow-400">{prediction.worstFactor}</strong> is limiting your grade. Improving it would be the biggest impact on final grade.</p>
                ) : (
                  <p>❌ <strong className="text-red-400">Grade may not justify submission cost</strong> — run the Value Calculator to see if it pencils out at this grade.</p>
                )}
                <p className="text-xs text-zinc-600">
                  This is an estimate only. Actual grades may differ. PSA/BGS/CGC use trained graders with physical inspection.
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  )
}
