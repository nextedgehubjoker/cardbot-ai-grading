"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Activity, CheckCircle, XCircle, Upload, Camera, AlertTriangle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const STANDARDS = [
  { service: "PSA", grade: 10,  lr: 55, tb: 60 },
  { service: "PSA", grade: 9,   lr: 65, tb: 65 },
  { service: "PSA", grade: 8,   lr: 70, tb: 70 },
  { service: "PSA", grade: 7,   lr: 75, tb: 75 },
  { service: "BGS", grade: 10,  lr: 50, tb: 50 },
  { service: "BGS", grade: 9.5, lr: 55, tb: 55 },
  { service: "BGS", grade: 9,   lr: 60, tb: 60 },
  { service: "BGS", grade: 8.5, lr: 65, tb: 65 },
  { service: "CGC", grade: 10,  lr: 55, tb: 55 },
  { service: "CGC", grade: 9.5, lr: 60, tb: 60 },
  { service: "CGC", grade: 9,   lr: 65, tb: 65 },
  { service: "CGC", grade: 8.5, lr: 70, tb: 70 },
]

export function CenteringCalc() {
  const [left, setLeft]     = useState("")
  const [right, setRight]   = useState("")
  const [top, setTop]       = useState("")
  const [bottom, setBottom] = useState("")

  // Photo-based auto-estimate state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scanning, setScanning]     = useState(false)
  const [scanError, setScanError]   = useState<string | null>(null)
  const [scanQuality, setScanQuality] = useState<"good" | "fair" | "poor" | null>(null)
  const [autoFilled, setAutoFilled] = useState(false)

  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    setScanError(null)
    setScanQuality(null)
    setAutoFilled(false)

    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)

    setScanning(true)
    try {
      const fd = new FormData()
      fd.append("image", file)
      const res = await fetch("/api/centering-scan", { method: "POST", body: fd })
      if (!res.ok) throw new Error("Scan failed")
      const data = await res.json()
      setLeft(String(data.left))
      setRight(String(data.right))
      setTop(String(data.top))
      setBottom(String(data.bottom))
      setScanQuality(data.imageQuality.quality)
      setAutoFilled(true)
    } catch {
      setScanError("Couldn't auto-read the photo. Try another shot, or enter measurements manually below.")
    } finally {
      setScanning(false)
    }
  }

  const clearPhoto = () => {
    setPreviewUrl(null)
    setScanQuality(null)
    setAutoFilled(false)
    setScanError(null)
  }

  const calc = useMemo(() => {
    const l = parseFloat(left)
    const r = parseFloat(right)
    const t = parseFloat(top)
    const b = parseFloat(bottom)

    if (isNaN(l) || isNaN(r) || isNaN(t) || isNaN(b) || l + r === 0 || t + b === 0) return null

    const lrTotal = l + r
    const tbTotal = t + b
    const leftPct  = (l / lrTotal) * 100
    const rightPct = (r / lrTotal) * 100
    const topPct   = (t / tbTotal) * 100
    const botPct   = (b / tbTotal) * 100

    const lrMax = Math.max(leftPct, rightPct)
    const tbMax = Math.max(topPct, botPct)

    const checks = STANDARDS.map((s) => ({
      ...s,
      lrPass: lrMax <= s.lr,
      tbPass: tbMax <= s.tb,
      pass: lrMax <= s.lr && tbMax <= s.tb,
    }))

    return { leftPct, rightPct, topPct, botPct, lrMax, tbMax, checks }
  }, [left, right, top, bottom])

  const gradeColor = (grade: number) =>
    grade >= 10 ? "text-amber-400" : grade >= 9 ? "text-blue-400" : grade >= 8 ? "text-green-400" : "text-zinc-400"

  return (
    <div className="space-y-6">
      {/* NEW: Photo-based auto measurement */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Sparkles className="h-5 w-5 text-amber-400" /> Auto-Measure from Photo
          </CardTitle>
          <p className="text-xs text-zinc-500">Upload or snap a straight-on photo — border widths below are filled in automatically. You can still edit them by hand.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <input ref={uploadRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />

          {!previewUrl ? (
            <div className="flex gap-3 flex-wrap">
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
          ) : (
            <div className="flex gap-4 items-start flex-col sm:flex-row">
              <img src={previewUrl} alt="Card" className="rounded-lg w-32 object-contain border border-zinc-800" />
              <div className="flex-1 space-y-2 w-full">
                {scanning && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <span className="animate-spin h-4 w-4 border-2 border-amber-500 border-t-transparent rounded-full" />
                    Reading borders from photo...
                  </div>
                )}
                {autoFilled && !scanning && (
                  <Alert className="border-green-500/30 bg-green-500/10 py-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-300 text-xs">
                      Border measurements auto-filled below — adjust manually if they look off.
                    </AlertDescription>
                  </Alert>
                )}
                {scanQuality && scanQuality !== "good" && (
                  <Alert className={cn("py-2", scanQuality === "poor" ? "border-red-500/30 bg-red-500/10" : "border-yellow-500/30 bg-yellow-500/10")}>
                    <AlertTriangle className={cn("h-4 w-4", scanQuality === "poor" ? "text-red-400" : "text-yellow-400")} />
                    <AlertDescription className="text-xs text-zinc-300">
                      {scanQuality === "poor"
                        ? "Heavy glare detected — these auto-estimates are unreliable. Reshoot flat, out of the toploader, in even light, or enter exact measurements manually."
                        : "Some glare detected — double-check the auto-filled numbers before trusting them."}
                    </AlertDescription>
                  </Alert>
                )}
                {scanError && (
                  <Alert className="border-red-500/30 bg-red-500/10 py-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-300 text-xs">{scanError}</AlertDescription>
                  </Alert>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                    onClick={() => uploadRef.current?.click()}>
                    <Upload className="h-3 w-3" /> Replace
                  </Button>
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300 gap-1 text-xs"
                    onClick={() => cameraRef.current?.click()}>
                    <Camera className="h-3 w-3" /> Retake
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearPhoto}
                    className="border-zinc-700 text-zinc-400 hover:text-white text-xs">
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs — unchanged manual entry */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <Activity className="h-5 w-5 text-amber-400" /> Border Measurements
            </CardTitle>
            <p className="text-xs text-zinc-500">Enter border widths in mm (or any unit — ratios are relative). Auto-filled from photo above, or type your own.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Left Border</Label>
                <Input value={left} onChange={(e) => setLeft(e.target.value)}
                  placeholder="e.g. 4.5" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Right Border</Label>
                <Input value={right} onChange={(e) => setRight(e.target.value)}
                  placeholder="e.g. 5.5" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Top Border</Label>
                <Input value={top} onChange={(e) => setTop(e.target.value)}
                  placeholder="e.g. 5.0" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs mb-1 block">Bottom Border</Label>
                <Input value={bottom} onChange={(e) => setBottom(e.target.value)}
                  placeholder="e.g. 6.0" className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              </div>
            </div>

            {/* Visual centering */}
            {calc && (
              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Left / Right centering</p>
                  <div className="h-6 flex rounded-lg overflow-hidden border border-zinc-700">
                    <div className="bg-amber-500/30 flex items-center justify-end pr-1"
                      style={{ width: `${calc.leftPct}%` }}>
                      <span className="text-[9px] text-amber-300 font-bold">{Math.round(calc.leftPct)}%</span>
                    </div>
                    <div className="bg-blue-500/30 flex items-center pl-1"
                      style={{ width: `${calc.rightPct}%` }}>
                      <span className="text-[9px] text-blue-300 font-bold">{Math.round(calc.rightPct)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                    <span>Left</span><span>Right</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Top / Bottom centering</p>
                  <div className="h-6 flex rounded-lg overflow-hidden border border-zinc-700">
                    <div className="bg-green-500/30 flex items-center justify-end pr-1"
                      style={{ width: `${calc.topPct}%` }}>
                      <span className="text-[9px] text-green-300 font-bold">{Math.round(calc.topPct)}%</span>
                    </div>
                    <div className="bg-purple-500/30 flex items-center pl-1"
                      style={{ width: `${calc.botPct}%` }}>
                      <span className="text-[9px] text-purple-300 font-bold">{Math.round(calc.botPct)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                    <span>Top</span><span>Bottom</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ratio summary */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Centering Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!calc ? (
              <div className="flex flex-col items-center justify-center h-32 text-zinc-600">
                <Activity className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-sm">Upload a photo above, or enter border measurements to calculate</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className={cn("text-3xl font-black",
                      calc.lrMax <= 55 ? "text-green-400" : calc.lrMax <= 65 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {Math.round(calc.lrMax)}/{Math.round(100 - calc.lrMax)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Left / Right ratio</div>
                  </div>
                  <div className="bg-zinc-800 rounded-lg p-4 text-center">
                    <div className={cn("text-3xl font-black",
                      calc.tbMax <= 55 ? "text-green-400" : calc.tbMax <= 65 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {Math.round(calc.tbMax)}/{Math.round(100 - calc.tbMax)}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">Top / Bottom ratio</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 space-y-1">
                  <p>⬅️ L/R: <strong className="text-zinc-300">{calc.lrMax.toFixed(1)}%</strong> on the larger side</p>
                  <p>⬆️ T/B: <strong className="text-zinc-300">{calc.tbMax.toFixed(1)}%</strong> on the larger side</p>
                  <p className="text-zinc-600">Lower % = better centering. 50/50 = perfect.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Standards table */}
      {calc && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 text-base">Grade Eligibility by Standard</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800">
                  <TableHead className="text-zinc-400">Service</TableHead>
                  <TableHead className="text-zinc-400">Grade</TableHead>
                  <TableHead className="text-zinc-400">LR Standard</TableHead>
                  <TableHead className="text-zinc-400">TB Standard</TableHead>
                  <TableHead className="text-zinc-400">LR</TableHead>
                  <TableHead className="text-zinc-400">TB</TableHead>
                  <TableHead className="text-zinc-400">Eligible?</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calc.checks.map((c, i) => (
                  <TableRow key={i} className={cn("border-zinc-800", c.pass ? "bg-green-500/5" : "")}>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-300 text-xs">{c.service}</Badge>
                    </TableCell>
                    <TableCell className={cn("font-bold", gradeColor(c.grade))}>{c.grade}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">{c.lr}/{100-c.lr}</TableCell>
                    <TableCell className="text-zinc-400 text-sm">{c.tb}/{100-c.tb}</TableCell>
                    <TableCell>
                      {c.lrPass
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <XCircle className="h-4 w-4 text-red-400" />}
                    </TableCell>
                    <TableCell>
                      {c.tbPass
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <XCircle className="h-4 w-4 text-red-400" />}
                    </TableCell>
                    <TableCell>
                      {c.pass
                        ? <span className="text-green-400 font-bold text-sm">✓ Eligible</span>
                        : <span className="text-zinc-600 text-sm">✗ No</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-zinc-600 mt-3">
              * Standards are approximate and may vary by card set and era. Always verify with official service guidelines.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
