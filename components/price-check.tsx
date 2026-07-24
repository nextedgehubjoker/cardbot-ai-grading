"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ExternalLink, TrendingUp, AlertCircle, Sparkles, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const LANGUAGES = ["Any / Not sure", "English", "Japanese", "Traditional Chinese", "Simplified Chinese", "Korean", "German", "French", "Spanish", "Italian", "Portuguese", "Indonesian"]

interface GradeRow { label: string; price: number | null }
interface Match { id: string; "product-name": string; "console-name": string }

interface PriceResult {
  source: "live" | "demo" | "error"
  productName?: string
  consoleName?: string
  grades?: GradeRow[]
  multipleMatches?: boolean
  matches?: Match[]
  notFound?: boolean
  note?: string
  manualSearchUrl: string
}

const gradeBadgeColor = (label: string) => {
  if (label.includes("10")) return "text-amber-400 border-amber-500/40"
  if (label.includes("9")) return "text-blue-400 border-blue-500/40"
  if (label.includes("8")) return "text-green-400 border-green-500/40"
  if (label.includes("7")) return "text-yellow-400 border-yellow-500/40"
  return "text-zinc-400 border-zinc-600"
}

export function PriceCheck() {
  const [cardName, setCardName] = useState("")
  const [setName, setSetName]   = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [language, setLanguage] = useState("Any / Not sure")

  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<PriceResult | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const buildQuery = () =>
    [cardName, setName, cardNumber, language !== "Any / Not sure" ? language : ""].filter(Boolean).join(" ").trim()

  const search = async (overrideId?: string) => {
    const q = buildQuery()
    if (!q && !overrideId) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const url = overrideId
        ? `/api/price-check?id=${encodeURIComponent(overrideId)}&q=${encodeURIComponent(q)}`
        : `/api/price-check?q=${encodeURIComponent(q)}`
      const res = await fetch(url)
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Price lookup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const maxPrice = result?.grades?.length ? Math.max(...result.grades.map((g) => g.price || 0)) : 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Alert className="border-amber-500/30 bg-amber-500/10">
        <TrendingUp className="h-4 w-4 text-amber-400" />
        <AlertDescription className="text-zinc-300">
          <strong className="text-amber-400">PriceCharting Price Check</strong> — Compare Raw vs. PSA 7–10, BGS 10, CGC 10, and SGC 10 prices for the same card, across languages and sets.
        </AlertDescription>
      </Alert>

      {/* Search form */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Search className="h-5 w-5 text-amber-400" /> Search Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Card Name *</Label>
            <Input value={cardName} onChange={(e) => setCardName(e.target.value)}
              placeholder='e.g. "Charizard ex" or "Mega Gardevoir ex 078/063"'
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
              onKeyDown={(e) => e.key === "Enter" && search()} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Set / Edition</Label>
              <Input value={setName} onChange={(e) => setSetName(e.target.value)}
                placeholder="e.g. Mega Symphonia, Base Set"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
            <div>
              <Label className="text-zinc-400 text-xs mb-1.5 block">Card Number</Label>
              <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}
                placeholder="e.g. 078/063"
                className="bg-zinc-800 border-zinc-700 text-zinc-100" />
            </div>
          </div>
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Language / Region (prices vary a lot by this)</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {LANGUAGES.map((l) => (
                  <SelectItem key={l} value={l} className="text-zinc-100 focus:bg-zinc-800">{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => search()} disabled={loading || !cardName.trim()}
            className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2">
            {loading
              ? <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
              : <Search className="h-4 w-4" />}
            Check Prices
          </Button>
          {error && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300 text-sm">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Multiple matches — disambiguation */}
      {result?.multipleMatches && result.matches && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400 font-normal">Multiple cards found — pick the exact one</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.matches.map((m) => (
              <button key={m.id}
                onClick={() => search(m.id)}
                className="w-full text-left px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-800/40 hover:border-amber-500/50 hover:bg-zinc-800 transition-all">
                <div className="text-sm font-semibold text-zinc-200">{m["product-name"]}</div>
                <div className="text-xs text-zinc-500">{m["console-name"]}</div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Demo / not-found / error states */}
      {result && !result.multipleMatches && (result.source === "demo" || result.notFound || result.source === "error") && (
        <Alert className="border-amber-500/30 bg-amber-500/5">
          <Info className="h-4 w-4 text-amber-400" />
          <AlertDescription className="text-zinc-300 text-sm space-y-2">
            <p>{result.note}</p>
            <Button variant="outline" size="sm"
              onClick={() => window.open(result.manualSearchUrl, "_blank", "noopener")}
              className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5 mt-1">
              <ExternalLink className="h-3.5 w-3.5" /> Search on PriceCharting.com
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Live results — grade ladder */}
      {result?.source === "live" && !result.multipleMatches && !result.notFound && result.grades && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-zinc-100">
              <Sparkles className="h-5 w-5 text-amber-400" /> {result.productName}
            </CardTitle>
            {result.consoleName && <p className="text-xs text-zinc-500">{result.consoleName}</p>}
          </CardHeader>
          <CardContent className="space-y-3">
            {result.grades.map((g) => (
              <div key={g.label} className="flex items-center gap-3">
                <Badge variant="outline" className={cn("w-40 shrink-0 justify-center text-xs", gradeBadgeColor(g.label))}>
                  {g.label}
                </Badge>
                <div className="flex-1">
                  <div className="h-6 bg-zinc-800 rounded-md overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 flex items-center justify-end pr-2"
                      style={{ width: `${maxPrice ? ((g.price || 0) / maxPrice) * 100 : 0}%`, minWidth: "3rem" }}>
                      <span className="text-xs font-bold text-black">${g.price?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm"
              onClick={() => window.open(result.manualSearchUrl, "_blank", "noopener")}
              className="text-zinc-500 hover:text-zinc-300 gap-1.5 mt-2">
              <ExternalLink className="h-3.5 w-3.5" /> View full listing on PriceCharting
            </Button>
            <p className="text-xs text-zinc-600 pt-1">
              Prices reflect recent market sales tracked by PriceCharting. Raw vs. graded spread shows exactly how much submission could add — compare against the Value Calculator's submission fees to check ROI.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info footer */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 text-xs text-zinc-500 space-y-1.5">
          <p>💡 <strong className="text-zinc-400">Tip:</strong> Include the card number (e.g. 078/063) and language for the most accurate match — the same character often has wildly different prices across languages and print runs.</p>
          <p>⚠️ Live pricing requires this deployment to be configured with a PriceCharting Pro API token. Without one, every search still gives you a direct manual-search link.</p>
        </CardContent>
      </Card>
    </div>
  )
}
