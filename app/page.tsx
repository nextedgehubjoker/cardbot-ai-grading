"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AutoScan }       from "@/components/auto-scan"
import { AiGrader }       from "@/components/ai-grader"
import { CenteringCalc }  from "@/components/centering-calc"
import { ValueCalc }      from "@/components/value-calc"
import { GradePredictor } from "@/components/grade-predictor"
import { CertLookup }     from "@/components/cert-lookup"
import { MarketValue }    from "@/components/market-value"
import { PriceCheck }     from "@/components/price-check"
import { HkGuide }        from "@/components/hk-guide"
import { Sparkles, Zap, Activity, DollarSign, Star, Shield, TrendingUp, MapPin, Coins } from "lucide-react"

const TOOLS = [
  { id: "auto",      label: "Auto Scan ⚡",  icon: Sparkles,    highlight: true },
  { id: "grader",    label: "AI Grader",     icon: Zap },
  { id: "centering", label: "Centering",     icon: Activity },
  { id: "predictor", label: "Grade Predict", icon: Star },
  { id: "value",     label: "Value Calc",    icon: DollarSign },
  { id: "pricecheck",label: "Price Check",   icon: Coins },
  { id: "market",    label: "Market Search", icon: TrendingUp },
  { id: "cert",      label: "Cert Lookup",   icon: Shield },
  { id: "hkguide",   label: "HK Guide 🇭🇰",  icon: MapPin },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-400" />
            <span className="text-xl font-black text-white tracking-tight">CardBot</span>
            <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">AI</Badge>
          </div>
          <div className="text-xs text-zinc-500 hidden sm:block">
            1 photo → grade, centering, fees &amp; ROI — automatically
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-800 py-12 text-center bg-gradient-to-b from-amber-500/5 to-transparent">
        <div className="container mx-auto px-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-400 text-xs font-medium mb-5">
            <Sparkles className="h-3.5 w-3.5" /> One photo. Every answer. Automatically.
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-3 leading-tight">
            Upload Once.<br />
            <span className="text-amber-400">CardBot Does the Rest.</span>
          </h1>
          <p className="text-base text-zinc-400 mb-6 max-w-xl mx-auto">
            Grading, centering, submission fees, ROI, and real market prices by grade — all in one place.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["⚡ Fully automatic","📷 Mobile camera","📐 Auto centering","💰 Auto fee + ROI","🪙 Live price by grade","🎯 PSA 10 odds"].map((tag) => (
              <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-400 py-1 px-2.5 text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="auto" className="w-full">
          <div className="overflow-x-auto pb-2 mb-6">
            <TabsList className="inline-flex min-w-full bg-zinc-900 border border-zinc-800 rounded-xl p-1 gap-1 h-auto">
              {TOOLS.map(({ id, label, icon: Icon, highlight }) => (
                <TabsTrigger key={id} value={id}
                  className={
                    highlight
                      ? "flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap rounded-lg text-amber-400 font-bold text-sm transition-all border border-amber-500/40 data-[state=active]:bg-amber-500 data-[state=active]:text-black"
                      : "flex items-center gap-1.5 px-3 py-2.5 whitespace-nowrap rounded-lg text-zinc-400 text-sm transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black data-[state=active]:font-bold"
                  }>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="auto">      <AutoScan /></TabsContent>
          <TabsContent value="grader">    <AiGrader /></TabsContent>
          <TabsContent value="centering"><CenteringCalc /></TabsContent>
          <TabsContent value="predictor"><GradePredictor /></TabsContent>
          <TabsContent value="value">    <ValueCalc /></TabsContent>
          <TabsContent value="pricecheck"><PriceCheck /></TabsContent>
          <TabsContent value="market">   <MarketValue /></TabsContent>
          <TabsContent value="cert">     <CertLookup /></TabsContent>
          <TabsContent value="hkguide">  <HkGuide /></TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-zinc-800 py-6 mt-4">
        <div className="container mx-auto px-4 text-center text-xs text-zinc-600">
          <p>CardBot is an AI pre-screening tool. All results are estimates — not official grades.</p>
          <p className="mt-1">Not affiliated with PSA, BGS, CGC, SGC, TAG, or PriceCharting. Always verify with official sources.</p>
        </div>
      </footer>
    </div>
  )
}
