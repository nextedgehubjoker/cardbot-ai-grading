"use client"

import { useState, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Camera, Zap, CheckCircle, AlertCircle, AlertTriangle, Star, Image } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  subgrades: { centering: number; corners: number; edges: number; surface: number }
  psa: { grade: number; confidence: number }
  bgs: { grade: number; confidence: number }
  cgc: { grade: number; confidence: number }
  issues: string[]
  recommendation: "submit" | "consider" | "raw"
  psa10Chance: number
  summary: string
  details: { centering: string; corners: string; edges: string; surface: string }
}

const gradeColor = (g: number) =>
  g >= 10 ? "bg-amber-500 text-black" :
  g >= 9  ? "bg-blue-500 text-white"  :
  g >= 8  ? "bg-green-500 text-white" :
  g >= 7  ? "bg-yellow-500 text-black":
            "bg-zinc-600 text-white"

const barColor = (g: number) =>
  g >= 9 ? "bg-green-500" : g >= 8 ? "bg-blue-500" : g >= 7 ? "bg-yellow-500" : "bg-red-500"

const gradeLabel = (g: number) =>
  g >= 10 ? "Gem Mint" : g >= 9 ? "Mint" : g >= 8 ? "Near Mint" : g >= 7 ? "Near Mint–Mint" : "EX–NM"

export function AiGrader() {
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analyzing, setAnalyzing]     = useState(false)
  const [result, setResult]           = useState<AnalysisResult | null>(null)
  const [dragActive, setDragActive]   = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return
    setSelectedFile(file)
    setResult(null)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const analyzeCard = async () => {
    if (!selectedFile) return
    setAnalyzing(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append("image", selectedFile)
      const res = await fetch("/api/analyze", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Analysis failed")
      setResult(await res.json())
    } catch {
      setError("Analysis failed. Please try again.")
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setPreviewUrl(null)
    setSelectedFile(null)
    setResult(null)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <Star className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-zinc-300">
          <strong className="text-amber-400">AI Pre-Screen</strong> — Upload or photograph your card for instant PSA, BGS &amp; CGC grade predictions.
        </AlertDescription>
      </Alert>

      {/* Hidden file inputs */}
      <input ref={uploadRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />

      {!previewUrl ? (
        /* Upload zone */
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
          <p className="text-xl font-semibold text-zinc-300 mb-2">Add your card</p>
          <p className="text-zinc-500 text-sm mb-6">Drag &amp; drop, upload from gallery, or take a live photo</p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Button variant="outline"
              className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 gap-2"
              onClick={() => uploadRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload Photo
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2"
              onClick={() => cameraRef.current?.click()}>
              <Camera className="h-4 w-4" /> Take Photo
              <Badge className="bg-black/20 text-black text-[10px] ml-1">Mobile</Badge>
            </Button>
          </div>
          <p className="text-xs text-zinc-600 mt-5">PNG, JPG, WEBP • Front face • High resolution = better accuracy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                <Image className="h-4 w-4" /> Card Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <img src={previewUrl} alt="Card" className="rounded-lg w-full object-contain max-h-72" />
              <div className="flex gap-2">
                <Button onClick={analyzeCard} disabled={analyzing}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bold">
                  {analyzing ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                      Analyzing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Analyze Card</span>
                  )}
                </Button>
                <Button variant="outline" onClick={reset} className="border-zinc-700 text-zinc-400 hover:text-white">
                  Clear
                </Button>
              </div>
              {/* Re-capture options */}
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                  onClick={() => uploadRef.current?.click()}>
                  <Upload className="h-3 w-3" /> Replace with Upload
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                  onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-3 w-3" /> Retake Photo
                </Button>
              </div>
              {error && (
                <Alert className="border-red-500/30 bg-red-500/10">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Results */}
          {!result && !analyzing && (
            <Card className="bg-zinc-900 border-zinc-800 flex items-center justify-center min-h-64">
              <p className="text-zinc-600 text-sm">Click Analyze to get grade predictions</p>
            </Card>
          )}

          {analyzing && (
            <Card className="bg-zinc-900 border-zinc-800 flex flex-col items-center justify-center gap-4 min-h-64">
              <div className="animate-spin h-10 w-10 border-2 border-amber-500 border-t-transparent rounded-full" />
              <p className="text-zinc-400 text-sm">AI analyzing your card...</p>
              <div className="flex gap-1 flex-wrap justify-center">
                {["Centering", "Corners", "Edges", "Surface"].map((s) => (
                  <span key={s} className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-500">{s}</span>
                ))}
              </div>
            </Card>
          )}

          {result && (
            <div className="space-y-4">
              {/* Grade Predictions */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-400 font-normal">Grade Predictions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {([
                    { label: "PSA", data: result.psa },
                    { label: "BGS", data: result.bgs },
                    { label: "CGC", data: result.cgc },
                  ] as const).map(({ label, data }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={cn("rounded-xl w-16 h-16 flex flex-col items-center justify-center shrink-0", gradeColor(data.grade))}>
                        <span className="text-xl font-black leading-none">{data.grade}</span>
                        <span className="text-[9px] font-bold opacity-70">{label}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-100">{label} {data.grade} — {gradeLabel(data.grade)}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Confidence: {data.confidence}%</div>
                        <div className="mt-1 h-1.5 bg-zinc-800 rounded-full">
                          <div className="h-1.5 rounded-full bg-amber-500/70" style={{ width: `${data.confidence}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Subgrades */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-400 font-normal">Subgrade Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(Object.entries(result.subgrades) as [string, number][]).map(([key, val]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize text-zinc-400">{key}</span>
                        <span className={cn("font-bold", val >= 9 ? "text-green-400" : val >= 8 ? "text-blue-400" : val >= 7 ? "text-yellow-400" : "text-red-400")}>
                          {val}/10
                        </span>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full">
                        <div className={cn("h-2 rounded-full transition-all", barColor(val))} style={{ width: `${val * 10}%` }} />
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-0.5">
                        {result.details[key as keyof typeof result.details]}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Full results bottom */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400" /> Issues Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.issues.map((issue, i) => (
                  <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="mt-0.5 text-zinc-500">•</span> {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-400" /> PSA 10 Chance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-black text-amber-400 mb-1">{result.psa10Chance}%</div>
              <div className="text-sm text-zinc-400">
                {result.psa10Chance >= 60 ? "🔥 Excellent candidate" :
                 result.psa10Chance >= 30 ? "⚡ Good candidate" :
                 result.psa10Chance >= 15 ? "⚠️ Marginal" : "❌ Unlikely PSA 10"}
              </div>
              <div className="mt-3 h-3 bg-zinc-800 rounded-full">
                <div className="h-3 rounded-full bg-amber-500" style={{ width: `${result.psa10Chance}%` }} />
              </div>
            </CardContent>
          </Card>

          <Card className={cn("border", result.recommendation === "submit" ? "bg-green-500/10 border-green-500/30" : result.recommendation === "consider" ? "bg-yellow-500/10 border-yellow-500/30" : "bg-red-500/10 border-red-500/30")}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
                <CheckCircle className={cn("h-4 w-4", result.recommendation === "submit" ? "text-green-400" : result.recommendation === "consider" ? "text-yellow-400" : "text-red-400")} />
                Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-black mb-2", result.recommendation === "submit" ? "text-green-400" : result.recommendation === "consider" ? "text-yellow-400" : "text-red-400")}>
                {result.recommendation === "submit" ? "✅ Submit" : result.recommendation === "consider" ? "⚡ Consider" : "❌ Keep Raw"}
              </div>
              <p className="text-sm text-zinc-400">{result.summary}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
