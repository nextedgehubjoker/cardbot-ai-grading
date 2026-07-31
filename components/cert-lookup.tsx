"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Shield, Search, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { CardPhotoAttach } from "@/components/card-photo-attach"

const SERVICES = [
  { id: "PSA", label: "PSA",     color: "border-blue-500 bg-blue-500",     light: "text-blue-400",   hint: "8 digits, e.g. 12345678" },
  { id: "BGS", label: "Beckett", color: "border-yellow-500 bg-yellow-500", light: "text-yellow-400", hint: "8 digits, e.g. 00123456" },
  { id: "CGC", label: "CGC",     color: "border-purple-500 bg-purple-500", light: "text-purple-400", hint: "7–8 digits" },
  { id: "SGC", label: "SGC",     color: "border-green-500 bg-green-500",   light: "text-green-400",  hint: "8 digits" },
  { id: "TAG", label: "TAG",     color: "border-red-500 bg-red-500",       light: "text-red-400",    hint: "Cert number from slab" },
]

interface CertResult {
  source: string
  certNumber: string
  service: string
  verifyUrl: string
  grade?: string
  cardName?: string
  setName?: string
  year?: string
  category?: string
  note?: string
}

export function CertLookup() {
  const [certNumber, setCertNumber] = useState("")
  const [service, setService]       = useState("PSA")
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<CertResult | null>(null)
  const [error, setError]           = useState<string | null>(null)

  const selected = SERVICES.find((s) => s.id === service)!
  const cleanCert = certNumber.replace(/\D/g, "")

  const lookup = async () => {
    if (!cleanCert) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`/api/cert?cert=${cleanCert}&service=${service}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (e: any) {
      setError(e.message || "Lookup failed")
    } finally {
      setLoading(false)
    }
  }

  const openOfficial = (url?: string) => {
    window.open(url || result?.verifyUrl, "_blank", "noopener")
  }

  // Generate all verify links for quick access
  const allLinks = SERVICES.map((s) => {
    const urls: Record<string, string> = {
      PSA: `https://www.psacard.com/cert/${cleanCert}`,
      BGS: `https://www.beckett.com/grading/cert-lookup/?certNumber=${cleanCert}`,
      CGC: `https://www.cgccards.com/certlookup/${cleanCert}`,
      SGC: `https://www.sgccard.com/cert-lookup/?cert=${cleanCert}`,
      TAG: `https://www.tag.grading/cert/${cleanCert}`,
    }
    return { ...s, url: urls[s.id] }
  })

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Service selector */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Shield className="h-5 w-5 text-amber-400" /> Cert Lookup
          </CardTitle>
          <p className="text-xs text-zinc-500">Verify PSA, BGS, CGC, SGC &amp; TAG certification details</p>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Photo attach — zoom in to read the cert number off the slab */}
          <CardPhotoAttach label="Attach a photo of the slab (optional)" />

          {/* Service tabs */}
          <div>
            <Label className="text-zinc-400 text-xs mb-2 block">Grading Service</Label>
            <div className="flex gap-2 flex-wrap">
              {SERVICES.map((s) => (
                <button key={s.id}
                  onClick={() => { setService(s.id); setResult(null); setError(null) }}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-bold transition-all",
                    service === s.id
                      ? `${s.color} text-white`
                      : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
                  )}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cert number input */}
          <div>
            <Label className="text-zinc-400 text-xs mb-1.5 block">Certification Number</Label>
            <div className="flex gap-2">
              <Input
                value={certNumber}
                onChange={(e) => { setCertNumber(e.target.value); setResult(null); setError(null) }}
                placeholder={selected.hint}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-lg tracking-widest"
                onKeyDown={(e) => e.key === "Enter" && lookup()}
              />
              <Button onClick={lookup} disabled={loading || !cleanCert}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold shrink-0 gap-1.5">
                {loading
                  ? <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full" />
                  : <Search className="h-4 w-4" />}
                Look Up
              </Button>
            </div>
            <p className="text-xs text-zinc-600 mt-1">Numbers only — found on the label inside the slab. Zoom the photo above if you can't read it.</p>
          </div>

          {error && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-4">
              {/* Live data */}
              {result.source === "live" ? (
                <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-bold">Cert Verified — Live Data</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs ml-auto">
                      {result.service}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-800/80 rounded-lg p-3">
                      <div className="text-xs text-zinc-500 mb-0.5">Grade</div>
                      <div className="text-2xl font-black text-amber-400">{result.grade}</div>
                    </div>
                    <div className="bg-zinc-800/80 rounded-lg p-3">
                      <div className="text-xs text-zinc-500 mb-0.5">Year</div>
                      <div className="text-xl font-bold text-zinc-100">{result.year}</div>
                    </div>
                  </div>
                  {result.cardName && (
                    <div className="bg-zinc-800/80 rounded-lg p-3">
                      <div className="text-xs text-zinc-500 mb-0.5">Card</div>
                      <div className="text-zinc-100 font-medium">{result.cardName}</div>
                      {result.setName && <div className="text-xs text-zinc-400">{result.setName}</div>}
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="border-amber-500/30 bg-amber-500/5">
                  <AlertDescription className="text-zinc-300 text-sm">
                    {result.note}
                  </AlertDescription>
                </Alert>
              )}

              {/* Verify button */}
              <Button onClick={() => openOfficial(result.verifyUrl)}
                className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 gap-2">
                <ExternalLink className="h-4 w-4" />
                Verify on Official {result.service} Site
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links (show when cert number is entered) */}
      {cleanCert.length >= 4 && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-zinc-400 font-normal">Quick Verify Links</CardTitle>
            <p className="text-xs text-zinc-600">Open cert #{cleanCert} on any official platform</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {allLinks.map((s) => (
                <button key={s.id} onClick={() => openOfficial(s.url)}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-800 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800 transition-all text-left group">
                  <div>
                    <span className={cn("font-bold text-sm", s.light)}>{s.label}</span>
                    <div className="text-xs text-zinc-600 mt-0.5 font-mono truncate max-w-[160px]">
                      #{cleanCert}
                    </div>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Where to find the cert number</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { service: "PSA", desc: "Front label — 8-digit number below barcode" },
              { service: "BGS", desc: "Front label — 8-digit number near bottom" },
              { service: "CGC", desc: "Label — cert number printed in small text" },
              { service: "SGC", desc: "Label — see barcode area for cert ID" },
            ].map((item) => (
              <div key={item.service} className="bg-zinc-800/50 rounded-lg p-3">
                <div className="text-xs font-bold text-zinc-300 mb-0.5">{item.service}</div>
                <div className="text-xs text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
