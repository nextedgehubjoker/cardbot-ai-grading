"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, TrendingUp, Search, DollarSign } from "lucide-react"

const GRADES = ["Raw (Ungraded)", "PSA 7", "PSA 8", "PSA 9", "PSA 10", "BGS 8", "BGS 9", "BGS 9.5", "BGS 10", "CGC 9", "CGC 9.5", "CGC 10"]

const PLATFORMS = [
  { name: "eBay Sold Listings",  flag: "🌍", note: "Largest global market",  buildUrl: (q: string) => `https://www.ebay.com/sch/i.html?_nkw=${q}&LH_Sold=1&LH_Complete=1&_sop=13` },
  { name: "Carousell HK",        flag: "🇭🇰", note: "Popular in Hong Kong",   buildUrl: (q: string) => `https://www.carousell.com.hk/search/${q}` },
  { name: "PWCC Marketplace",    flag: "🏆", note: "Premium card auctions",  buildUrl: (q: string) => `https://www.pwccmarketplace.com/search?query=${q}` },
  { name: "130point.com",        flag: "📊", note: "PSA pop + sales data",   buildUrl: (q: string) => `https://www.130point.com/sales/?keyword=${q}` },
  { name: "Goldin Auctions",     flag: "💎", note: "High-value cards",       buildUrl: (q: string) => `https://goldin.co/search?q=${q}` },
  { name: "MySlabs",             flag: "🔍", note: "Graded card marketplace", buildUrl: (q: string) => `https://myslabs.com/search?q=${q}` },
]

// Grade multiplier reference data
const GRADE_MULTIPLIERS = [
  { grade: "Raw",      psa: "1×",    bgs: "1×",    note: "Baseline price" },
  { grade: "PSA 7",    psa: "1.5–2×", bgs: "—",   note: "Good condition" },
  { grade: "PSA 8",    psa: "2–3×",  bgs: "—",     note: "Near Mint" },
  { grade: "PSA 9",    psa: "3–6×",  bgs: "3–5×",  note: "Strong demand" },
  { grade: "PSA 10",   psa: "8–20×", bgs: "—",     note: "Premium for top pop" },
  { grade: "BGS 9.5",  psa: "—",     bgs: "5–12×", note: "BGS Gem Mint" },
  { grade: "BGS 10",   psa: "—",     bgs: "20–50×",note: "Pristine — rare" },
]

export function MarketValue() {
  const [cardName, setCardName] = useState("")
  const [year,     setYear]     = useState("")
  const [setName,  setSetName]  = useState("")
  const [grade,    setGrade]    = useState("PSA 10")

  const query = encodeURIComponent(
    [grade !== "Raw (Ungraded)" ? grade : "", cardName, year, setName]
      .filter(Boolean).join(" ").trim()
  )
  const rawQuery = encodeURIComponent([cardName, year, setName].filter(Boolean).join(" ").trim())

  const hasInput = cardName.trim().length > 0

  return (
    <div className="space-y-6">
      {/* Search form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <TrendingUp className="h-5 w-5 text-amber-400" /> Market Value Search
          </CardTitle>
          <p className="text-xs text-zinc-500">Generate live sold-listing searches across major platforms</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Card Name *</Label>
            <Input value={cardName} onChange={(e) => setCardName(e.target.value)}
              placeholder='e.g. "Charizard Holo" or "Black Lotus"'
              className="bg-zinc-800 border-zinc-700 text-zinc-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Set / Edition</Label>
              <Input value={setName} onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g. Base Set, EX Dragon"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Year</Label>
              <Input value={year} onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 1999"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Grade / Condition</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {GRADES.map((g) => (
                  <SelectItem key={g} value={g} className="text-zinc-100 focus:bg-zinc-800">{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Platform search links */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
            <Search className="h-4 w-4" /> Search Platforms
          </CardTitle>
          {hasInput && (
            <p className="text-xs text-zinc-600">
              Searching: <span className="text-zinc-400 font-mono">{decodeURIComponent(query)}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.name}
                onClick={() => window.open(p.buildUrl(query || rawQuery || "trading+card"), "_blank", "noopener")}
                disabled={!hasInput && p.name !== "PWCC Marketplace"}
                className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-amber-500/50 hover:bg-zinc-800 transition-all text-left group disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.flag}</span>
                    <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5 ml-6">{p.note}</div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 shrink-0" />
              </button>
            ))}
          </div>
          {!hasInput && (
            <p className="text-xs text-zinc-600 text-center mt-3">Enter a card name to enable search links</p>
          )}
        </CardContent>
      </Card>

      {/* Grade multiplier table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-zinc-400 font-normal flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-amber-400" /> Typical Grade Multipliers
          </CardTitle>
          <p className="text-xs text-zinc-600">Approximate price premium vs. raw card — varies by card and era</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {GRADE_MULTIPLIERS.map((row) => (
              <div key={row.grade} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-800/40 hover:bg-zinc-800/70 transition-all">
                <div className="w-20 shrink-0">
                  <Badge variant="outline" className={
                    row.grade.includes("10") ? "border-amber-500 text-amber-400" :
                    row.grade.includes("9.5") || row.grade.includes("9") ? "border-blue-500 text-blue-400" :
                    "border-zinc-600 text-zinc-400"
                  }>{row.grade}</Badge>
                </div>
                <div className="flex-1 text-sm text-zinc-300">
                  {row.psa !== "—" && <span className="mr-3 font-mono font-bold text-green-400">{row.psa}</span>}
                  {row.bgs !== "—" && <span className="font-mono font-bold text-yellow-400">{row.bgs}</span>}
                </div>
                <div className="text-xs text-zinc-500">{row.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-3">
            * Multipliers are general estimates. Actual premiums depend on card rarity, population report (pop), and current demand.
            Always check recent eBay sold listings for accurate comps.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
