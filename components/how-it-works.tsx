"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Camera, Activity, DollarSign, Shield, TrendingUp, HelpCircle } from "lucide-react"

const STEPS = [
  { icon: Camera, title: "Upload or Snap a Photo", desc: "Drop a card photo, upload from your gallery, or take one live with your phone camera — front face, flat, out of the toploader if possible." },
  { icon: Sparkles, title: "Auto Scan Runs Everything", desc: "Grading, centering, subgrades, and a lighting/glare quality check all run automatically in a few seconds — no button-mashing." },
  { icon: Activity, title: "Get PSA / BGS / CGC Predictions", desc: "See predicted grades across all three major services with confidence scores, plus which specific factor (centering, corners, edges, surface) is limiting your grade." },
  { icon: DollarSign, title: "Auto Fee + ROI Estimate", desc: "The tool picks a recommended submission tier and fee based on how strong your card looks, then estimates profit and ROI automatically." },
  { icon: TrendingUp, title: "Check Real Market Prices", desc: "Compare Raw vs PSA 7–10, BGS 10, CGC 10, and SGC 10 pricing for your exact card, set, and language via Price Check." },
  { icon: Shield, title: "Verify Before You Trust It", desc: "Already graded? Use Cert Lookup to verify the slab is real before buying, selling, or trusting a listing." },
]

const FAQS = [
  { q: "Is this an official PSA/BGS/CGC grade?", a: "No. CardBot is an AI pre-screening tool that estimates likely grades from a photo. Only the actual grading company can issue an official, certified grade after physical inspection." },
  { q: "Why did my grade estimate change between photos?", a: "Lighting and glare heavily affect the estimate. A glossy toploader reflection can hide scratches or whitening, making the estimate too optimistic OR too conservative. Always reshoot flat, out of the sleeve, in diffused light for the most reliable read." },
  { q: "Does CardBot replace professional grading?", a: "No — think of it as a filter. It helps you decide whether a card is worth the submission fee and turnaround time before you commit real money to PSA/BGS/CGC." },
  { q: "Why is Price Check sometimes just a link instead of live numbers?", a: "Live pricing requires a paid PriceCharting API subscription. Without one configured, every search still gives you a direct link to check the same data manually." },
  { q: "Can I trust the auto-picked submission tier?", a: "It's a reasonable default based on your predicted grade and PSA 10 odds — faster tiers for strong candidates, economy for uncertain ones. You can always override the tier in the Value Calculator." },
]

export function HowItWorks() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <Badge variant="outline" className="border-amber-500/40 text-amber-400">Guide</Badge>
        <h2 className="text-2xl font-black text-white">How CardBot Works</h2>
        <p className="text-zinc-400 text-sm max-w-xl mx-auto">
          One photo, six automatic steps — from raw upload to a submit-or-hold decision.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {STEPS.map((s, i) => (
          <Card key={s.title} className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-5 flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-sm">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className="h-4 w-4 text-amber-400" />
                  <h3 className="font-semibold text-zinc-100 text-sm">{s.title}</h3>
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <HelpCircle className="h-5 w-5 text-amber-400" /> Frequently Asked Questions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="border-b border-zinc-800 last:border-0 pb-4 last:pb-0">
              <p className="font-semibold text-zinc-100 text-sm mb-1.5">{f.q}</p>
              <p className="text-xs text-zinc-500 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
