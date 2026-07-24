"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SERVICES = {
  PSA: [
    { tier: "Economy", fee: 18, turnaround: "6 months", minCards: 20 },
    { tier: "Value",   fee: 25, turnaround: "90 days",  minCards: 10 },
    { tier: "Standard", fee: 50, turnaround: "30 days", minCards: 1 },
    { tier: "Express",  fee: 150, turnaround: "5 days", minCards: 1 },
    { tier: "Super Express", fee: 500, turnaround: "Next day", minCards: 1 },
  ],
  BGS: [
    { tier: "Economy",  fee: 17,  turnaround: "6 months", minCards: 1 },
    { tier: "Standard", fee: 27,  turnaround: "45 days",  minCards: 1 },
    { tier: "Express",  fee: 55,  turnaround: "10 days",  minCards: 1 },
    { tier: "Priority", fee: 115, turnaround: "3 days",   minCards: 1 },
    { tier: "Walk-Through", fee: 299, turnaround: "Same day", minCards: 1 },
  ],
  CGC: [
    { tier: "Economy",  fee: 20, turnaround: "6 months", minCards: 1 },
    { tier: "Standard", fee: 30, turnaround: "45 days",  minCards: 1 },
    { tier: "Express",  fee: 55, turnaround: "10 days",  minCards: 1 },
    { tier: "Priority", fee: 100, turnaround: "3 days",  minCards: 1 },
    { tier: "Walk-Through", fee: 300, turnaround: "Same day", minCards: 1 },
  ],
}

export function ValueCalc() {
  const [service, setService] = useState<"PSA" | "BGS" | "CGC">("PSA")
  const [tierIndex, setTierIndex] = useState(0)
  const [rawCost, setRawCost] = useState("")
  const [gradedValue, setGradedValue] = useState("")
  const [shipping, setShipping] = useState("15")
  const [numCards, setNumCards] = useState("1")

  const tiers = SERVICES[service]
  const selectedTier = tiers[tierIndex] || tiers[0]

  const calc = useMemo(() => {
    const raw = parseFloat(rawCost) || 0
    const graded = parseFloat(gradedValue) || 0
    const ship = parseFloat(shipping) || 0
    const cards = parseInt(numCards) || 1

    const subFee = selectedTier.fee * cards
    const totalCost = raw + subFee + ship
    const profit = graded - totalCost
    const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0
    const breakEven = totalCost

    return { raw, graded, subFee, ship, totalCost, profit, roi, breakEven, cards }
  }, [rawCost, gradedValue, shipping, numCards, selectedTier])

  const fmt = (n: number) => `$${n.toFixed(2)}`

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <DollarSign className="h-5 w-5 text-amber-400" /> Submission Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Grading Service</Label>
              <div className="flex gap-2">
                {(["PSA", "BGS", "CGC"] as const).map((s) => (
                  <button key={s}
                    onClick={() => { setService(s); setTierIndex(0) }}
                    className={cn(
                      "flex-1 py-2 rounded-lg text-sm font-bold border transition-all",
                      service === s
                        ? "bg-amber-500 border-amber-500 text-black"
                        : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                    )}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Service Tier</Label>
              <Select value={String(tierIndex)} onValueChange={(v) => setTierIndex(parseInt(v))}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {tiers.map((t, i) => (
                    <SelectItem key={i} value={String(i)} className="text-zinc-100 focus:bg-zinc-800">
                      {t.tier} — ${t.fee}/card ({t.turnaround})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTier.minCards > 1 && (
                <p className="text-xs text-amber-400 mt-1">⚠️ Minimum {selectedTier.minCards} cards required for this tier</p>
              )}
            </div>

            {/* Number of cards */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Number of Cards</Label>
              <Input value={numCards} onChange={(e) => setNumCards(e.target.value)}
                type="number" min="1" placeholder="1"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>

            <Separator className="bg-zinc-800" />

            {/* Cost inputs */}
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Raw Card Purchase Price (total, USD)</Label>
              <Input value={rawCost} onChange={(e) => setRawCost(e.target.value)}
                type="number" placeholder="0.00"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Estimated Graded Value (USD)</Label>
              <Input value={gradedValue} onChange={(e) => setGradedValue(e.target.value)}
                type="number" placeholder="0.00"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
              <p className="text-xs text-zinc-600 mt-0.5">Check eBay sold listings or PWCC for current market data</p>
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1 block">Shipping (both ways, USD)</Label>
              <Input value={shipping} onChange={(e) => setShipping(e.target.value)}
                type="number" placeholder="15"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">ROI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cost breakdown */}
            <div className="space-y-2 bg-zinc-800/50 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Cost Breakdown</h4>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Raw card cost</span>
                <span className="text-zinc-100">{fmt(calc.raw)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">
                  {service} {selectedTier.tier} × {calc.cards} {calc.cards === 1 ? "card" : "cards"}
                </span>
                <span className="text-zinc-100">{fmt(calc.subFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Shipping (est.)</span>
                <span className="text-zinc-100">{fmt(calc.ship)}</span>
              </div>
              <Separator className="bg-zinc-700 my-2" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-zinc-300">Total Cost</span>
                <span className="text-zinc-100">{fmt(calc.totalCost)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Expected Revenue</span>
                <span className="text-zinc-100">{fmt(calc.graded)}</span>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className={cn(
                "rounded-lg p-4 text-center",
                calc.profit > 0 ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
              )}>
                {calc.profit > 0
                  ? <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-1" />
                  : <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />}
                <div className={cn("text-2xl font-black", calc.profit > 0 ? "text-green-400" : "text-red-400")}>
                  {calc.profit >= 0 ? "+" : ""}{fmt(calc.profit)}
                </div>
                <div className="text-xs text-zinc-500 mt-1">Net Profit</div>
              </div>
              <div className={cn(
                "rounded-lg p-4 text-center",
                calc.roi > 0 ? "bg-blue-500/10 border border-blue-500/30" : "bg-zinc-800 border border-zinc-700"
              )}>
                <DollarSign className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <div className={cn("text-2xl font-black", calc.roi > 0 ? "text-blue-400" : "text-zinc-400")}>
                  {calc.roi.toFixed(1)}%
                </div>
                <div className="text-xs text-zinc-500 mt-1">ROI</div>
              </div>
            </div>

            {/* Break-even */}
            <div className="bg-zinc-800/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-400">Break-even graded value</span>
                <span className="font-bold text-amber-400">{fmt(calc.breakEven)}</span>
              </div>
              <p className="text-xs text-zinc-600 mt-1">
                The card must grade &amp; sell for at least {fmt(calc.breakEven)} to recover costs
              </p>
            </div>

            {/* Verdict */}
            {calc.graded > 0 && calc.totalCost > 0 && (
              <div className={cn("rounded-lg p-3 text-sm",
                calc.roi >= 50 ? "bg-green-500/10 border border-green-500/30 text-green-300" :
                calc.roi >= 0  ? "bg-yellow-500/10 border border-yellow-500/30 text-yellow-300" :
                                 "bg-red-500/10 border border-red-500/30 text-red-300"
              )}>
                {calc.roi >= 50 ? "🔥 Strong ROI — worth submitting" :
                 calc.roi >= 20 ? "✅ Solid ROI — submission looks profitable" :
                 calc.roi >= 0  ? "⚡ Marginal — consider if the grade is certain" :
                                  "❌ Negative ROI — may not be worth submitting"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
