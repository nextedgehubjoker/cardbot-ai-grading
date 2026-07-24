"use client"

import { useState, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Upload, Camera, Zap, CheckCircle, AlertCircle, AlertTriangle, Star,
  Image, Activity, DollarSign, TrendingUp, Package, Sparkles, Lightbulb
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FullScanResult {
  imageQuality: { quality: "good" | "fair" | "poor"; glareScore: number; warnings: string[] }
  subgrades: { centering: number; corners: number; edges: number; surface: number }
  centeringDetail: {
    lr: { left: number; right: number }
    tb: { top: number; bottom: number }
    eligibility: { service: string; grade: number; pass: boolean }[]
  }
  grades: {
    psa: { grade: number; confidence: number }
    bgs: { grade: number; confidence: number }
    cgc: { grade: number; confidence: number }
  }
  issues: string[]
  recommendation: "submit" | "consider" | "raw"
  psa10Chance: number
  summary: string
  submissionPlan: { recommendedService: string; recommendedTier: string; fee: number; turnaround: string; reason: string }
  valueEstimate: { gradeMultiplier: number }
  details: { centering: string; corners: string; edges: string; surface: string }
}

const gradeColor = (g: number) =>
  g >= 10 ? "bg-amber-500 text-black" :
  g >= 9  ? "bg-blue-500 text-white" :
  g >= 8  ? "bg-green-500 text-white" :
  g >= 7  ? "bg-yellow-500 text-black" :
            "bg-zinc-600 text-white"

const barColor = (g: number) =>
  g >= 9 ? "bg-green-500" : g >= 8 ? "bg-blue-500" : g >= 7 ? "bg-yellow-500" : "bg-red-500"

const gradeLabel = (g: number) =>
  g >= 10 ? "Gem Mint" : g >= 9 ? "Mint" : g >= 8 ? "Near Mint" : g >= 7 ? "Near Mint–Mint" : "EX–NM"

const SCAN_STAGES = ["Reading image", "Checking lighting & glare", "Checking centering", "Inspecting corners", "Inspecting edges", "Scanning surface", "Calculating fees & ROI"]

export function AutoScan() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [result, setResult] = useState<FullScanResult | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [rawCost, setRawCost] = useState("")
  const [estValue, setEstValue] = useState("")

  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    setSelectedFile(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
    runScan(file)
  }

  const runScan = async (file: File) => {
    setScanning(true)
    setError(null)
    setStageIdx(0)
    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, SCAN_STAGES.length - 1))
    }, 360)
    try {
      const fd = new FormData()
      fd.append("image", file)
      const res = await fetch("/api/full-scan", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Scan failed")
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Scan failed. Please try again.")
    } finally {
      clearInterval(stageTimer)
      setScanning(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setResult(null)
    setError(null)
    setRawCost("")
    setEstValue("")
  }

  const roi = useMemo(() => {
    if (!result) return null
    const raw = parseFloat(rawCost) || 0
    const fee = result.submissionPlan.fee
    const shipping = 15
    const totalCost = raw + fee + shipping
    const autoEstValue = raw > 0 ? raw * result.valueEstimate.gradeMultiplier : 0
    const graded = parseFloat(estValue) || autoEstValue
    const profit = graded - totalCost
    const roiPct = totalCost > 0 ? (profit / totalCost) * 100 : 0
    return { raw, fee, shipping, totalCost, graded, profit, roiPct, isAutoValue: !estValue && autoEstValue > 0 }
  }, [result, rawCost, estValue])

  return (
    <div className="space-y-6">
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <Sparkles className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-zinc-300">
          <strong className="text-amber-400">One-Shot Auto Scan</strong> — upload or snap ONE photo. Grading, centering, submission fees, and ROI are calculated automatically.
        </AlertDescription>
      </Alert>

      <input ref={uploadRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />

      {!previewUrl ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-2xl p-10 text-center transition-all",
            dragActive ? "border-amber-500 bg-amber-500/10" : "border-zinc-700 hover:border-zinc-600"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          <Image className="h-14 w-14 text-zinc-600 mx-auto mb-5" />
          <p className="text-xl font-semibold text-zinc-300 mb-2">Drop your card photo</p>
          <p className="text-zinc-500 text-sm mb-6">Everything runs automatically the second it uploads</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 gap-2"
              onClick={() => uploadRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Photo
            </Button>
            <Button className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2"
              onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" /> Take Photo
              <Badge className="bg-black/20 text-black text-[10px] ml-1">Mobile</Badge>
            </Button>
          </div>
          <p className="text-xs text-zinc-600 mt-5">PNG, JPG, WEBP • Front face, flat & out of toploader • Even lighting = better accuracy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Left: preview + retake */}
          <Card className="bg-zinc-900 border-zinc-800 h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                <Image className="h-4 w-4" /> Card Photo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <img src={previewUrl} alt="Card" className="rounded-lg w-full object-contain max-h-64" />
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                  onClick={() => uploadRef.current?.click()}>
                  <Upload className="h-3 w-3" /> Replace
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                  onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-3 w-3" /> Retake
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={reset} className="w-full border-zinc-700 text-zinc-400 hover:text-white">
                Clear &amp; Start Over
              </Button>
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300 text-xs">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Right: everything auto-generated */}
          <div className="space-y-4">
            {scanning && (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-10 flex flex-col items-center gap-4">
                  <div className="animate-spin h-10 w-10 border-2 border-amber-500 border-t-transparent rounded-full" />
                  <p className="text-zinc-300 font-medium">{SCAN_STAGES[stageIdx]}...</p>
                  <div className="flex gap-1.5 flex-wrap justify-center max-w-sm">
                    {SCAN_STAGES.map((s, i) => (
                      <span key={s} className={cn(
                        "text-xs px-2.5 py-1 rounded-full transition-all",
                        i <= stageIdx ? "bg-amber-500/20 text-amber-400" : "bg-zinc-800 text-zinc-600"
                      )}>{s}</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result && !scanning && (
              <>
                {/* Image quality / glare warning banner — shown first, prominently */}
                {result.imageQuality.quality !== "good" && (
                  <Alert className={cn(
                    "border",
                    result.imageQuality.quality === "poor" ? "border-red-500/40 bg-red-500/10" : "border-yellow-500/40 bg-yellow-500/10"
                  )}>
                    <div className="flex items-start gap-2">
                      {result.imageQuality.quality === "poor"
                        ? <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                        : <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />}
                      <AlertDescription className="text-zinc-200">
                        <strong className={result.imageQuality.quality === "poor" ? "text-red-400" : "text-yellow-400"}>
                          {result.imageQuality.quality === "poor" ? "⚠️ Low-confidence result — glare/lighting issue detected" : "💡 Lighting could be better"}
                        </strong>
                        <ul className="mt-1.5 space-y-1 text-sm text-zinc-300">
                          {result.imageQuality.warnings.map((w, i) => <li key={i}>• {w}</li>)}
                        </ul>
                        {result.imageQuality.quality === "poor" && (
                          <p className="mt-2 text-xs text-zinc-400">
                            Tip: shoot the card flat, out of any toploader/sleeve if possible, under soft diffused light (avoid direct flash or overhead bulbs) — grade confidence below is reduced to reflect this.
                          </p>
                        )}
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                {/* Grades row */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-400" /> Predicted Grades
                      {result.imageQuality.quality !== "good" && (
                        <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 text-[10px] ml-auto">
                          Confidence reduced
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {([
                        { label: "PSA", data: result.grades.psa },
                        { label: "BGS", data: result.grades.bgs },
                        { label: "CGC", data: result.grades.cgc },
                      ] as const).map(({ label, data }) => (
                        <div key={label} className="flex items-center gap-3 bg-zinc-800/40 rounded-xl p-3">
                          <div className={cn("rounded-lg w-14 h-14 flex flex-col items-center justify-center shrink-0", gradeColor(data.grade))}>
                            <span className="text-lg font-black leading-none">{data.grade}</span>
                            <span className="text-[8px] font-bold opacity-70">{label}</span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-zinc-100">{gradeLabel(data.grade)}</div>
                            <div className={cn("text-xs", data.confidence < 50 ? "text-red-400" : "text-zinc-500")}>
                              {data.confidence}% confidence
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Centering — auto-calculated */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-400" /> Centering (auto)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>Left {result.centeringDetail.lr.left}%</span>
                          <span>Right {result.centeringDetail.lr.right}%</span>
                        </div>
                        <div className="h-3 flex rounded-lg overflow-hidden border border-zinc-700">
                          <div className="bg-amber-500/40" style={{ width: `${result.centeringDetail.lr.left}%` }} />
                          <div className="bg-blue-500/40" style={{ width: `${result.centeringDetail.lr.right}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>Top {result.centeringDetail.tb.top}%</span>
                          <span>Bottom {result.centeringDetail.tb.bottom}%</span>
                        </div>
                        <div className="h-3 flex rounded-lg overflow-hidden border border-zinc-700">
                          <div className="bg-green-500/40" style={{ width: `${result.centeringDetail.tb.top}%` }} />
                          <div className="bg-purple-500/40" style={{ width: `${result.centeringDetail.tb.bottom}%` }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {result.centeringDetail.eligibility.map((e, i) => (
                          <Badge key={i} variant="outline" className={cn(
                            "text-[10px]",
                            e.pass ? "border-green-500/40 text-green-400" : "border-zinc-700 text-zinc-600"
                          )}>
                            {e.service} {e.grade} {e.pass ? "✓" : "✗"}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Subgrades */}
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-zinc-400 font-normal">Subgrade Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2.5">
                      {(Object.entries(result.subgrades) as [string, number][]).map(([key, val]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="capitalize text-zinc-400">{key}</span>
                            <span className={cn("font-bold", val >= 9 ? "text-green-400" : val >= 8 ? "text-blue-400" : val >= 7 ? "text-yellow-400" : "text-red-400")}>{val}/10</span>
                          </div>
                          <div className="h-1.5 bg-zinc-800 rounded-full">
                            <div className={cn("h-1.5 rounded-full", barColor(val))} style={{ width: `${val * 10}%` }} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Submission plan — auto-picked tier + fee */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-400" /> Auto-Recommended Submission Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-zinc-500">Service</div>
                        <div className="text-lg font-bold text-zinc-100">{result.submissionPlan.recommendedService}</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-zinc-500">Tier</div>
                        <div className="text-lg font-bold text-amber-400">{result.submissionPlan.recommendedTier}</div>
                      </div>
                      <div className="bg-zinc-800/50 rounded-lg p-3 text-center">
                        <div className="text-xs text-zinc-500">Grading Fee</div>
                        <div className="text-lg font-bold text-green-400">${result.submissionPlan.fee}</div>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500">
                      ⏱️ Turnaround: <span className="text-zinc-300">{result.submissionPlan.turnaround}</span> — {result.submissionPlan.reason}
                    </p>
                  </CardContent>
                </Card>

                {/* ROI */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" /> ROI Estimate
                    </CardTitle>
                    <p className="text-xs text-zinc-600">Fee is auto-filled from the plan above. Add your card cost for a full profit estimate (optional).</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-zinc-500 text-xs mb-1 block">Your Card Cost (USD, optional)</Label>
                        <Input value={rawCost} onChange={(e) => setRawCost(e.target.value)} type="number" placeholder="0.00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                      </div>
                      <div>
                        <Label className="text-zinc-500 text-xs mb-1 block">Est. Graded Value (USD, optional)</Label>
                        <Input value={estValue} onChange={(e) => setEstValue(e.target.value)} type="number"
                          placeholder={roi?.isAutoValue ? `auto: $${roi.graded.toFixed(0)}` : "0.00"}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                      </div>
                    </div>

                    {roi && (
                      <>
                        <div className="bg-zinc-800/50 rounded-lg p-3 space-y-1.5 text-sm">
                          <div className="flex justify-between"><span className="text-zinc-400">Card cost</span><span className="text-zinc-100">${roi.raw.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-400">Grading fee (auto)</span><span className="text-zinc-100">${roi.fee.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-400">Shipping (est.)</span><span className="text-zinc-100">${roi.shipping.toFixed(2)}</span></div>
                          <Separator className="bg-zinc-700 my-1" />
                          <div className="flex justify-between font-bold"><span className="text-zinc-300">Total Cost</span><span className="text-zinc-100">${roi.totalCost.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span className="text-zinc-400">Expected value {roi.isAutoValue && <span className="text-amber-500">(auto-est.)</span>}</span><span className="text-zinc-100">${roi.graded.toFixed(2)}</span></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className={cn("rounded-lg p-3 text-center", roi.profit > 0 ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30")}>
                            <div className={cn("text-xl font-black", roi.profit > 0 ? "text-green-400" : "text-red-400")}>
                              {roi.profit >= 0 ? "+" : ""}${roi.profit.toFixed(2)}
                            </div>
                            <div className="text-xs text-zinc-500">Net Profit</div>
                          </div>
                          <div className="rounded-lg p-3 text-center bg-blue-500/10 border border-blue-500/30">
                            <div className="text-xl font-black text-blue-400">{roi.roiPct.toFixed(1)}%</div>
                            <div className="text-xs text-zinc-500">ROI</div>
                          </div>
                        </div>
                        {roi.raw === 0 && !estValue && (
                          <p className="text-xs text-zinc-600 text-center">Enter your card cost above to see auto-estimated profit/ROI</p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Issues + PSA10 + Recommendation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-zinc-400 font-normal flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" /> Issues Found
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1.5">
                        {result.issues.map((issue, i) => (
                          <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                            <span className="text-zinc-500">•</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-zinc-400 font-normal flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-amber-400" /> PSA 10 Chance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-black text-amber-400">{result.psa10Chance}%</div>
                      <div className="h-2 bg-zinc-800 rounded-full mt-2">
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: `${result.psa10Chance}%` }} />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={cn("border", result.recommendation === "submit" ? "bg-green-500/10 border-green-500/30" : result.recommendation === "consider" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30")}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xs text-zinc-400 font-normal flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5" /> Verdict
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={cn("text-lg font-black mb-1", result.recommendation === "submit" ? "text-green-400" : result.recommendation === "consider" ? "text-yellow-400" : "text-red-400")}>
                        {result.recommendation === "submit" ? "✅ Submit" : result.recommendation === "consider" ? "⚡ Consider" : "❌ Keep Raw"}
                      </div>
                      <p className="text-xs text-zinc-400">{result.summary}</p>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
