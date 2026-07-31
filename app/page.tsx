"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { SidebarNav, type NavItem } from "@/components/sidebar-nav"
import { AutoScan } from "@/components/auto-scan"
import { AiGrader } from "@/components/ai-grader"
import { CenteringCalc } from "@/components/centering-calc"
import { ValueCalc } from "@/components/value-calc"
import { GradePredictor } from "@/components/grade-predictor"
import { CertLookup } from "@/components/cert-lookup"
import { MarketValue } from "@/components/market-value"
import { PriceCheck } from "@/components/price-check"
import { HkGuide } from "@/components/hk-guide"
import { HowItWorks } from "@/components/how-it-works"
import { GradingStandards } from "@/components/grading-standards"
import {
  Sparkles, Zap, Activity, DollarSign, Star, Shield, TrendingUp, MapPin, Coins,
  Menu, BookOpen, HelpCircle, ArrowRight,
} from "lucide-react"

const HERO_BANNER = "https://galaxy-prod.tlcdn.com/gen/user_33YetNbj0sVMIYxGUQQ1b31A57R/02503129-5724-4af6-a1eb-37dfc56e027c.png"

const NAV_ITEMS: NavItem[] = [
  { id: "home",       label: "Dashboard",     icon: Sparkles,   group: "Overview" },
  { id: "auto",       label: "Auto Scan",     icon: Sparkles,   group: "Grading Tools", highlight: true, badge: "⚡" },
  { id: "grader",     label: "AI Grader",     icon: Zap,        group: "Grading Tools" },
  { id: "centering",  label: "Centering",     icon: Activity,   group: "Grading Tools" },
  { id: "predictor",  label: "Grade Predict", icon: Star,       group: "Grading Tools" },
  { id: "value",      label: "Value Calc",    icon: DollarSign, group: "Money Tools" },
  { id: "pricecheck", label: "Price Check",   icon: Coins,      group: "Money Tools" },
  { id: "market",     label: "Market Search", icon: TrendingUp, group: "Money Tools" },
  { id: "cert",       label: "Cert Lookup",   icon: Shield,     group: "Verification" },
  { id: "hkguide",    label: "HK Guide",      icon: MapPin,     group: "Guides", badge: "🇭🇰" },
  { id: "howitworks", label: "How It Works",  icon: HelpCircle, group: "Guides" },
  { id: "standards",  label: "Grading Standards", icon: BookOpen, group: "Guides" },
]

const TOOL_CARDS = [
  { id: "auto",       title: "Auto Scan",        desc: "One photo → grade, centering, fees & ROI automatically", icon: Sparkles,   color: "from-amber-500/20 to-amber-500/0", accent: "text-amber-400", tag: "⚡ Fastest" },
  { id: "grader",     title: "AI Grader",        desc: "Manual upload/camera grading pre-screen", icon: Zap,        color: "from-blue-500/20 to-blue-500/0", accent: "text-blue-400" },
  { id: "centering",  title: "Centering Calc",   desc: "Measure or auto-estimate L/R and T/B centering", icon: Activity,   color: "from-green-500/20 to-green-500/0", accent: "text-green-400" },
  { id: "predictor",  title: "Grade Predictor",  desc: "Click-to-rate condition for an instant estimate", icon: Star,       color: "from-purple-500/20 to-purple-500/0", accent: "text-purple-400" },
  { id: "value",      title: "Value Calculator", desc: "Submission fees, break-even & ROI math", icon: DollarSign, color: "from-emerald-500/20 to-emerald-500/0", accent: "text-emerald-400" },
  { id: "pricecheck", title: "Price Check",      desc: "Raw vs PSA/BGS/CGC/SGC prices by grade", icon: Coins,      color: "from-cyan-500/20 to-cyan-500/0", accent: "text-cyan-400" },
  { id: "market",     title: "Market Search",    desc: "Quick links to eBay, PWCC, Carousell & more", icon: TrendingUp, color: "from-rose-500/20 to-rose-500/0", accent: "text-rose-400" },
  { id: "cert",       title: "Cert Lookup",      desc: "Verify PSA/BGS/CGC/SGC/TAG certifications", icon: Shield,     color: "from-indigo-500/20 to-indigo-500/0", accent: "text-indigo-400" },
  { id: "hkguide",    title: "HK Guide",         desc: "Step-by-step submission guide for Hong Kong", icon: MapPin,     color: "from-red-500/20 to-red-500/0", accent: "text-red-400", tag: "🇭🇰" },
]

export default function Home() {
  const [active, setActive] = useState("home")
  const [mobileOpen, setMobileOpen] = useState(false)

  const renderContent = () => {
    switch (active) {
      case "auto": return <AutoScan />
      case "grader": return <AiGrader />
      case "centering": return <CenteringCalc />
      case "predictor": return <GradePredictor />
      case "value": return <ValueCalc />
      case "pricecheck": return <PriceCheck />
      case "market": return <MarketValue />
      case "cert": return <CertLookup />
      case "hkguide": return <HkGuide />
      case "howitworks": return <HowItWorks />
      case "standards": return <GradingStandards />
      default: return null
    }
  }

  const isHome = active === "home"

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <SidebarNav items={NAV_ITEMS} active={active} onSelect={setActive} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-sm">
          <div className="px-4 sm:px-6 py-3 flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-zinc-400 hover:text-white">
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-zinc-300">
              {isHome ? "Dashboard" : NAV_ITEMS.find((n) => n.id === active)?.label}
            </span>
            <div className="ml-auto text-xs text-zinc-500 hidden sm:block">
              1 photo → grade, centering, fees &amp; ROI — automatically
            </div>
          </div>
        </header>

        {isHome ? (
          <div>
            {/* Hero banner with generated character art */}
            <section className="relative overflow-hidden border-b border-zinc-800">
              <div className="absolute inset-0">
                <img src={HERO_BANNER} alt="" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-transparent to-zinc-950/60" />
              </div>
              <div className="relative px-6 sm:px-10 py-16 sm:py-24 max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1.5 text-amber-400 text-xs font-medium mb-5">
                  <Sparkles className="h-3.5 w-3.5" /> One photo. Every answer. Automatically.
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight">
                  Upload Once.<br />
                  <span className="text-amber-400">CardBot Does the Rest.</span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-300 mb-8 max-w-xl">
                  Grading, centering, submission fees, ROI, and real market prices by grade — all in one place, before you spend a cent on submission.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["⚡ Fully automatic", "📷 Mobile camera", "📐 Auto centering", "💰 Auto fee + ROI", "🪙 Live price by grade", "🎯 PSA 10 odds"].map((tag) => (
                    <Badge key={tag} variant="outline" className="border-zinc-700 text-zinc-300 bg-zinc-900/60 backdrop-blur-sm py-1 px-2.5 text-xs">{tag}</Badge>
                  ))}
                </div>
                <button
                  onClick={() => setActive("auto")}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20"
                >
                  <Sparkles className="h-4 w-4" /> Start Auto Scan <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Tool dashboard grid */}
            <section className="px-4 sm:px-6 py-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">All Tools</h2>
                <span className="text-xs text-zinc-500">{TOOL_CARDS.length} tools available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TOOL_CARDS.map((tool) => (
                  <button key={tool.id} onClick={() => setActive(tool.id)} className="text-left group">
                    <Card className={`bg-gradient-to-br ${tool.color} bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all h-full`}>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`h-10 w-10 rounded-lg bg-zinc-800/80 flex items-center justify-center ${tool.accent}`}>
                            <tool.icon className="h-5 w-5" />
                          </div>
                          {tool.tag && <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">{tool.tag}</Badge>}
                        </div>
                        <h3 className="font-semibold text-zinc-100 mb-1 flex items-center gap-1.5 group-hover:text-white transition-colors">
                          {tool.title}
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all" />
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{tool.desc}</p>
                      </CardContent>
                    </Card>
                  </button>
                ))}
              </div>

              {/* Info tabs quick access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button onClick={() => setActive("howitworks")} className="text-left group">
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500/40 transition-all">
                    <CardContent className="pt-5 pb-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm mb-0.5">How It Works</h3>
                        <p className="text-xs text-zinc-500">Step-by-step guide + FAQ</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-zinc-600 group-hover:text-amber-400 transition-colors" />
                    </CardContent>
                  </Card>
                </button>
                <button onClick={() => setActive("standards")} className="text-left group">
                  <Card className="bg-zinc-900 border-zinc-800 hover:border-amber-500/40 transition-all">
                    <CardContent className="pt-5 pb-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm mb-0.5">Grading Standards Guide</h3>
                        <p className="text-xs text-zinc-500">PSA/BGS scales & centering thresholds</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-zinc-600 group-hover:text-blue-400 transition-colors" />
                    </CardContent>
                  </Card>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="px-4 sm:px-6 py-8">{renderContent()}</div>
        )}

        <footer className="border-t border-zinc-800 py-6">
          <div className="px-4 sm:px-6 text-center text-xs text-zinc-600">
            <p>CardBot is an AI pre-screening tool. All results are estimates — not official grades.</p>
            <p className="mt-1">Not affiliated with PSA, BGS, CGC, SGC, TAG, or PriceCharting. Always verify with official sources.</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
