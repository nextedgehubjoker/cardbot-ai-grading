"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BookOpen, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const PSA_SCALE = [
  { grade: 10, label: "Gem Mint", desc: "Virtually perfect. Sharp corners, perfect centering (within tolerance), no visible flaws even under magnification." },
  { grade: 9,  label: "Mint", desc: "Superb condition with only one minor flaw — slight off-centering, a tiny surface imperfection, or minor print defect." },
  { grade: 8,  label: "Near Mint-Mint", desc: "Sharp corners with slight fraying possible, centering slightly off, minor surface wear tolerated." },
  { grade: 7,  label: "Near Mint", desc: "Very minor wear visible — slight rounding at one or more corners, minor surface scratches." },
  { grade: 6,  label: "Excellent-Mint", desc: "Visible wear including minor corner and edge wear, slight surface scratching." },
  { grade: 5,  label: "Excellent", desc: "Noticeable corner wear, minor creasing possible, centering may be off, surface scratches visible." },
]

const BGS_SCALE = [
  { grade: "10 Black Label", label: "Perfect 10/10/10/10", desc: "All four subgrades (centering, corners, edges, surface) score a perfect 10 — extremely rare." },
  { grade: "9.5", label: "Gem Mint", desc: "Subgrade average of 9.5+ with no single subgrade below 9." },
  { grade: "9", label: "Mint", desc: "Subgrade average around 9, generally sharp with very minor flaws." },
  { grade: "8.5", label: "Near Mint-Mint+", desc: "Strong overall condition with minor detectable flaws." },
]

const CENTERING_STANDARDS = [
  { service: "PSA 10", lr: "55/45", tb: "60/40" },
  { service: "PSA 9",  lr: "65/35", tb: "65/35" },
  { service: "BGS 10", lr: "50/50", tb: "50/50" },
  { service: "BGS 9.5",lr: "55/45", tb: "55/45" },
  { service: "CGC 10", lr: "55/45", tb: "55/45" },
]

export function GradingStandards() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">Reference</Badge>
        <h2 className="text-2xl font-black text-white">Grading Standards Guide</h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          What each grade actually means, side by side across the major services.
        </p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Star className="h-5 w-5 text-blue-400" /> PSA 10-Point Scale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Grade</TableHead>
                <TableHead className="text-zinc-400">Label</TableHead>
                <TableHead className="text-zinc-400">What It Means</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PSA_SCALE.map((row) => (
                <TableRow key={row.grade} className="border-zinc-800">
                  <TableCell>
                    <Badge className={cn(
                      row.grade === 10 ? "bg-amber-500 text-black" : row.grade === 9 ? "bg-blue-500 text-white" : "bg-zinc-700 text-zinc-200"
                    )}>{row.grade}</Badge>
                  </TableCell>
                  <TableCell className="font-medium text-zinc-200 text-sm">{row.label}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{row.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Star className="h-5 w-5 text-yellow-400" /> BGS Scale (Beckett)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Grade</TableHead>
                <TableHead className="text-zinc-400">Label</TableHead>
                <TableHead className="text-zinc-400">What It Means</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BGS_SCALE.map((row) => (
                <TableRow key={row.grade} className="border-zinc-800">
                  <TableCell><Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{row.grade}</Badge></TableCell>
                  <TableCell className="font-medium text-zinc-200 text-sm">{row.label}</TableCell>
                  <TableCell className="text-xs text-zinc-500">{row.desc}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <BookOpen className="h-5 w-5 text-green-400" /> Centering Standards by Grade
          </CardTitle>
          <p className="text-xs text-zinc-500">Maximum acceptable left/right and top/bottom split for each top grade</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400">Grade</TableHead>
                <TableHead className="text-zinc-400">Left/Right Max</TableHead>
                <TableHead className="text-zinc-400">Top/Bottom Max</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CENTERING_STANDARDS.map((row) => (
                <TableRow key={row.service} className="border-zinc-800">
                  <TableCell className="font-medium text-zinc-200 text-sm">{row.service}</TableCell>
                  <TableCell className="text-zinc-400 text-sm font-mono">{row.lr}</TableCell>
                  <TableCell className="text-zinc-400 text-sm font-mono">{row.tb}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-zinc-600 mt-3">
            Use the Centering tab to measure your own card against these thresholds.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
