"use client"

import { useState } from "react"
import { motion } from "framer-motion"
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

const HERO_BANNER = "https://galaxy-prod.tlcdn.com/gen/user_33YetNbj0sVMIYxGUQQ1b31A57R/9404a95d-bfdf-452b-b20b-2e5d5235e519.png"
const CHAR_LEFT   = "https://galaxy-prod.tlcdn.com/gen/user_33YetNbj0sVMIYxGUQQ1b31A57R/31248a6f-b503-4806-95c5-e57b50d65dfa.png"
const CHAR_RIGHT  = "https://galaxy-prod.tlcdn.com/gen/user_33YetNbj0sVMIYxGUQQ1b31A57R/040b999a-aada-45c0-a043-40db3fa227b0.png"

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
  { id: "auto",       title: "Auto Scan",        desc: "One photo → grade, centering, fees & ROI automatically", icon: Sparkles,   glow: "shadow-amber-500/20",   ring: "hover:border-amber-500/60",   iconBg: "bg-amber-500/15 text-amber-400",   grad: "from-amber-500/10", tag: "⚡ Fastest" },
  { id: "grader",     title: "AI Grader",        desc: "Manual upload/camera grading pre-screen", icon: Zap,        glow: "shadow-blue-500/20",     ring: "hover:border-blue-500/60",     iconBg: "bg-blue-500/15 text-blue-400",     grad: "from-blue-500/10" },
  { id: "centering",  title: "Centering Calc",   desc: "Measure or auto-estimate L/R and T/B centering", icon: Activity,   glow: "shadow-teal-500/20",     ring: "hover:border-teal-500/60",     iconBg: "bg-teal-500/15 text-teal-400",     grad: "from-teal-500/10" },
  { id: "predictor",  title: "Grade Predictor",  desc: "Click-to-rate condition for an instant estimate", icon: Star,       glow: "shadow-purple-500/20",   ring: "hover:border-purple-500/60",   iconBg: "bg-purple-500/15 text-purple-400", grad: "from-purple-500/10" },
  { id: "value",      title: "Value Calculator", desc: "Submission fees, break-even & ROI math", icon: DollarSign, glow: "shadow-emerald-500/20",  ring: "hover:border-emerald-500/60",  iconBg: "bg-emerald-500/15 text-emerald-400", grad: "from-emerald-500/10" },
  { id: "pricecheck", title: "Price Check",      desc: "Raw vs PSA/BGS/CGC/SGC prices by grade", icon: Coins,      glow: "shadow-cyan-500/20",     ring: "hover:border-cyan-500/60",     iconBg: "bg-cyan-500/15 text-cyan-400",     grad: "from-cyan-500/10" },
  { id: "market",     title: "Market Search",    desc: "Quick links to eBay, PWCC, Carousell & more", icon: TrendingUp, glow: "shadow-rose-500/20",     ring: "hover:border-rose-500/60",     iconBg: "bg-rose-500/15 text-rose-400",     grad: "from-rose-500/10" },
  { id: "cert",       title: "Cert Lookup",      desc: "Verify PSA/BGS/CGC/SGC/TAG certifications", icon: Shield,     glow: "shadow-indigo-500/20",   ring: "hover:border-indigo-500/60",   iconBg: "bg-indigo-500/15 text-indigo-400", grad: "from-indigo-500/10" },
  { id: "hkguide",    title: "HK Guide",         desc: "Step-by-step submission guide for Hong Kong", icon: MapPin,     glow: "shadow-red-500/20",      ring: "hover:border-red-500/60",      iconBg: "bg-red-500/15 text-red-400",       grad: "from-red-500/10", tag: "🇭🇰" },
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
            {/* Animated gradient-mesh hero with character art */}
            <section className="relative overflow-hidden border-b border-zinc-800 gradient-mesh">
              <div className="absolute inset-0 bg-black/40" />

              {/* Wide banner art, subtle parallax float */}
              <motion.img
                src={HERO_BANNER} alt=""
                initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 0.55, scale: 1 }} transition={{ duration: 1.2 }}
                className="absolute inset-0 w-full h-full object-cover mix-blend-luminosity opacity-40"
              />

              {/* Floating character cutouts */}
              <motion.img
                src={CHAR_LEFT} alt=""
                className="hidden md:block absolute left-0 bottom-0 h-[420px] object-contain opacity-90 animate-float pointer-events-none select-none"
                style={{ maskImage: "linear-gradient(to top, black 60%, transparent 100%)" }}
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.9 }}
              />
              <motion.img
                src={CHAR_RIGHT} alt=""
                className="hidden md:block absolute right-0 bottom-0 h-[360px] object-contain opacity-90 pointer-events-none select-none"
                style={{ maskImage: "linear-gradient(to top, black 60%, transparent 100%)", animationDelay: "1.5s" }}
                initial={{ opacity: 0, x: 40 }} animate={{ opacity: 0.9, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
              />
              <div className="hidden md:block absolute right-16 top-24 animate-sparkle">
                <Sparkles className="h-6 w-6 text-amber-300" />
              </div>
              <div className="hidden md:block absolute right-40 top-40 animate-sparkle" style={{ animationDelay: "1s" }}>
                <Star className="h-4 w-4 text-cyan-300" />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                className="relative px-6 sm:px-10 py-16 sm:py-24 max-w-2xl"
              >
                <div className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 rounded-full px-4 py-1.5 text-amber-300 text-xs font-medium mb-5 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" /> One photo. Every answer. Automatically.
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white mb-4 leading-tight drop-shadow-lg">
                  Upload Once.<br />
                  <span className="shimmer-text">CardBot Does the Rest.</span>
                </h1>
                <p className="text-base sm:text-lg text-zinc-200 mb-8 max-w-xl drop-shadow">
                  Grading, centering, submission fees, ROI, and real market prices by grade — all in one place, before you spend a cent on submission.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {["⚡ Fully automatic", "📷 Mobile camera", "📐 Auto centering", "💰 Auto fee + ROI", "🪙 Live price by grade", "🎯 PSA 10 odds"].map((tag) => (
                    <Badge key={tag} variant="outline" className="border-white/20 text-zinc-100 bg-black/40 backdrop-blur-md py-1 px-2.5 text-xs">{tag}</Badge>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setActive("auto")}
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-3 rounded-xl transition-colors animate-glow-pulse"
                >
                  <Sparkles className="h-4 w-4" /> Start Auto Scan <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
            </section>

            {/* Tool dashboard grid */}
            <section className="px-4 sm:px-6 py-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">All Tools</h2>
                <span className="text-xs text-zinc-500">{TOOL_CARDS.length} tools available</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TOOL_CARDS.map((tool, i) => (
                  <motion.button
                    key={tool.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    whileHover={{ y: -4, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActive(tool.id)}
                    className="text-left"
                  >
                    <Card className={`bg-gradient-to-br ${tool.grad} to-transparent bg-zinc-900 border-zinc-800 ${tool.ring} hover:shadow-lg ${tool.glow} transition-all h-full`}>
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tool.iconBg}`}>
                            <tool.icon className="h-5 w-5" />
                          </div>
                          {tool.tag && <Badge className="bg-zinc-800 text-zinc-400 text-[10px]">{tool.tag}</Badge>}
                        </div>
                        <h3 className="font-semibold text-zinc-100 mb-1 flex items-center gap-1.5">
                          {tool.title}
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-all" />
                        </h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{tool.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.button>
                ))}
              </div>

              {/* Info tabs quick access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <motion.button whileHover={{ y: -3 }} onClick={() => setActive("howitworks")} className="text-left">
                  <Card className="bg-gradient-to-br from-amber-500/10 to-transparent bg-zinc-900 border-zinc-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                    <CardContent className="pt-5 pb-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0">
                        <HelpCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm mb-0.5">How It Works</h3>
                        <p className="text-xs text-zinc-500">Step-by-step guide + FAQ</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-zinc-600" />
                    </CardContent>
                  </Card>
                </motion.button>
                <motion.button whileHover={{ y: -3 }} onClick={() => setActive("standards")} className="text-left">
                  <Card className="bg-gradient-to-br from-blue-500/10 to-transparent bg-zinc-900 border-zinc-800 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                    <CardContent className="pt-5 pb-4 flex items-center gap-4">
                      <div className="h-11 w-11 rounded-lg bg-blue-500/15 flex items-center justify-center text-blue-400 shrink-0">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm mb-0.5">Grading Standards Guide</h3>
                        <p className="text-xs text-zinc-500">PSA/BGS scales &amp; centering thresholds</p>
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-zinc-600" />
                    </CardContent>
                  </Card>
                </motion.button>
              </div>
            </section>
          </div>
        ) : (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
            className="px-4 sm:px-6 py-8"
          >
            {renderContent()}
          </motion.div>
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
