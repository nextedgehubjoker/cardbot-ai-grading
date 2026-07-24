"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Package, DollarSign, Clock, ExternalLink, AlertTriangle, CheckCircle, Info } from "lucide-react"

const SUBMISSION_STEPS = [
  { step: "01", title: "Create Account", desc: "Sign up at psacard.com, beckett.com, or cgccards.com. Free accounts available.", tip: "Use the same email for all services to keep your submissions organized." },
  { step: "02", title: "Fill Submission Form", desc: "Log in → Submit Cards → choose service tier → enter card details. Print the form and include it with your shipment.", tip: "Economy tier saves money but takes ~6 months. Express if it's a hot card right now." },
  { step: "03", title: "Pack Cards Properly", desc: "Each card: penny sleeve → toploader → team bag. Then bubble wrap in a rigid box. Don't let cards rattle.", tip: "Toploaders should be tight but removable. Tape the team bag, not the toploader." },
  { step: "04", title: "Ship from Hong Kong", desc: "Use DHL Express or FedEx Priority. Ship to PSA Santa Ana CA, BGS Flower Mound TX, or CGC Sarasota FL.", tip: "Get door-to-door tracking. Declare as 'Collectible Trading Cards — Personal Property' on customs form." },
  { step: "05", title: "Insure Your Shipment", desc: "Insure for the full replacement value of raw cards. DHL/FedEx both offer declared value coverage.", tip: "Don't under-declare value to save on insurance — you're gambling your cards." },
  { step: "06", title: "Track & Wait", desc: "PSA/BGS/CGC will email when your order arrives. Track progress in your account dashboard.", tip: "Economy orders from HK total ~8–10 months with shipping both ways." },
]

const COSTS_HKD = [
  { service: "PSA", tier: "Economy",    usd: 18,  hkd: "~HK$140",  turnaround: "6 months",   min: "20 cards" },
  { service: "PSA", tier: "Value",      usd: 25,  hkd: "~HK$195",  turnaround: "90 days",    min: "10 cards" },
  { service: "PSA", tier: "Standard",   usd: 50,  hkd: "~HK$390",  turnaround: "30 days",    min: "1 card" },
  { service: "PSA", tier: "Express",    usd: 150, hkd: "~HK$1,170",turnaround: "5 days",     min: "1 card" },
  { service: "BGS", tier: "Economy",    usd: 17,  hkd: "~HK$135",  turnaround: "6 months",   min: "1 card" },
  { service: "BGS", tier: "Standard",   usd: 27,  hkd: "~HK$210",  turnaround: "45 days",    min: "1 card" },
  { service: "BGS", tier: "Express",    usd: 55,  hkd: "~HK$430",  turnaround: "10 days",    min: "1 card" },
  { service: "CGC", tier: "Economy",    usd: 20,  hkd: "~HK$155",  turnaround: "6 months",   min: "1 card" },
  { service: "CGC", tier: "Standard",   usd: 30,  hkd: "~HK$235",  turnaround: "45 days",    min: "1 card" },
]

const RESOURCES = [
  { name: "PSA Authorized Dealers HK", url: "https://www.psacard.com/authorized-dealers", desc: "Find PSA authorized submitters in HK — group submissions can save on shipping" },
  { name: "HK Pokemon Card Facebook Groups", url: "https://www.facebook.com/groups/hkpokemoncard", desc: "Active community for pricing and trading" },
  { name: "Carousell HK Cards", url: "https://www.carousell.com.hk/search/pokemon%20card", desc: "Local buy/sell platform" },
  { name: "PSA Set Registry HK", url: "https://www.psacard.com/setregistry", desc: "Track your PSA graded collection" },
]

export function HkGuide() {
  return (
    <div className="space-y-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/30 p-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🇭🇰</div>
          <div>
            <h2 className="text-xl font-black text-white mb-1">Hong Kong Submission Guide</h2>
            <p className="text-zinc-400 text-sm">
              Step-by-step guide for HK collectors submitting to PSA, BGS &amp; CGC from Hong Kong.
              Includes costs in HKD, shipping tips, and local resources.
            </p>
          </div>
        </div>
      </div>

      {/* Shipping addresses */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <MapPin className="h-5 w-5 text-amber-400" /> Submission Addresses
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { service: "PSA", color: "border-blue-500/40 bg-blue-500/5", address: ["PSA", "1610 E. St. Andrew Place", "Santa Ana, CA 92705", "USA"] },
            { service: "BGS (Beckett)", color: "border-yellow-500/40 bg-yellow-500/5", address: ["Beckett Grading Services", "4635 McEwen Rd", "Dallas, TX 75244", "USA"] },
            { service: "CGC", color: "border-purple-500/40 bg-purple-500/5", address: ["CGC", "P.O. Box 4738", "Sarasota, FL 34230", "USA"] },
          ].map((s) => (
            <div key={s.service} className={`rounded-xl border p-4 ${s.color}`}>
              <div className="font-bold text-zinc-200 mb-2 text-sm">{s.service}</div>
              {s.address.map((line, i) => (
                <div key={i} className="text-xs text-zinc-400 font-mono">{line}</div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Step by step */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Package className="h-5 w-5 text-amber-400" /> Step-by-Step Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {SUBMISSION_STEPS.map((s) => (
            <div key={s.step} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm">
                {s.step}
              </div>
              <div className="flex-1 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                <div className="font-semibold text-zinc-100 mb-1">{s.title}</div>
                <div className="text-sm text-zinc-400 mb-2">{s.desc}</div>
                <div className="text-xs text-amber-400/80 bg-amber-500/10 rounded-lg px-3 py-1.5">
                  💡 {s.tip}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Costs table */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <DollarSign className="h-5 w-5 text-amber-400" /> Submission Costs (HKD)
          </CardTitle>
          <p className="text-xs text-zinc-500">Based on approx. USD/HKD 7.8 exchange rate. Check current rates before submitting.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <div className="grid grid-cols-5 gap-2 px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              <span>Service</span><span>Tier</span><span>USD</span><span>~HKD</span><span>Turnaround</span>
            </div>
            <Separator className="bg-zinc-800" />
            {["PSA", "BGS", "CGC"].map((svc) => (
              <div key={svc}>
                <div className="px-3 pt-3 pb-1">
                  <Badge variant="outline" className={
                    svc === "PSA" ? "border-blue-500/50 text-blue-400" :
                    svc === "BGS" ? "border-yellow-500/50 text-yellow-400" :
                    "border-purple-500/50 text-purple-400"
                  }>{svc}</Badge>
                </div>
                {COSTS_HKD.filter((r) => r.service === svc).map((r) => (
                  <div key={r.tier} className="grid grid-cols-5 gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800/50 text-sm transition-all">
                    <span className="text-zinc-600 text-xs">{r.service}</span>
                    <span className="text-zinc-300 font-medium">{r.tier}</span>
                    <span className="text-zinc-400">${r.usd}</span>
                    <span className="text-amber-400 font-bold">{r.hkd}</span>
                    <span className="text-zinc-500 text-xs">{r.turnaround}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <Separator className="bg-zinc-800 my-4" />

          {/* Shipping costs */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Shipping from HK (estimate)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { carrier: "DHL Express", cost: "HK$200–350", note: "Recommended — fast, insured, reliable" },
                { carrier: "FedEx Priority", cost: "HK$220–380", note: "Good alternative to DHL" },
                { carrier: "EMS (HK Post)", cost: "HK$80–150", note: "Cheaper but slower, limited insurance" },
                { carrier: "PSA return shipping", cost: "~HK$155", note: "PSA charges ~$20 USD per order return" },
              ].map((c) => (
                <div key={c.carrier} className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-sm font-medium text-zinc-200">{c.carrier}</span>
                    <span className="text-amber-400 font-bold text-sm">{c.cost}</span>
                  </div>
                  <div className="text-xs text-zinc-500">{c.note}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customs tips */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <AlertTriangle className="h-5 w-5 text-amber-400" /> Customs &amp; Packing Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { icon: "📋", title: "Declare correctly", desc: 'Use "Collectible Trading Cards — Personal Property" on the customs form. Avoid "Gift" — this can cause delays.' },
            { icon: "💰", title: "Declare accurate value", desc: "Insure and declare the actual replacement value of your raw cards. Under-declaring is risky and may void insurance." },
            { icon: "📦", title: "Pack cards well", desc: "Sleeve → toploader → team bag → bubble wrap → rigid box. Include PSA's copy of your submission form inside." },
            { icon: "🔢", title: "Card count matches", desc: "The number of cards in your box must exactly match your online submission form. A mismatch delays processing." },
            { icon: "🏷️", title: "Label the box clearly", desc: "Write the submission number (from PSA/BGS/CGC) on the outside of the box for faster processing." },
            { icon: "📷", title: "Photograph everything", desc: "Take photos of each card, the packed box contents, and the shipping label before dropping off. Proof if anything goes wrong." },
          ].map((tip) => (
            <div key={tip.title} className="flex gap-3 bg-zinc-800/40 rounded-lg p-3">
              <span className="text-xl shrink-0">{tip.icon}</span>
              <div>
                <div className="text-sm font-semibold text-zinc-200 mb-0.5">{tip.title}</div>
                <div className="text-xs text-zinc-400">{tip.desc}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Clock className="h-5 w-5 text-amber-400" /> Total Timeline from HK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { tier: "PSA Economy (20+ cards)", time: "~8–10 months", color: "text-zinc-400" },
              { tier: "PSA Value (10+ cards)",   time: "~4–5 months",  color: "text-zinc-400" },
              { tier: "PSA Standard",            time: "~6–8 weeks",   color: "text-yellow-400" },
              { tier: "PSA Express",             time: "~2–3 weeks",   color: "text-green-400" },
              { tier: "BGS Economy",             time: "~8–10 months", color: "text-zinc-400" },
              { tier: "BGS Standard",            time: "~6–8 weeks",   color: "text-yellow-400" },
              { tier: "BGS Express",             time: "~3–4 weeks",   color: "text-green-400" },
            ].map((row) => (
              <div key={row.tier} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800/50">
                <span className="text-sm text-zinc-300">{row.tier}</span>
                <span className={`text-sm font-bold ${row.color}`}>{row.time}</span>
              </div>
            ))}
          </div>
          <Alert className="border-amber-500/30 bg-amber-500/10 mt-4">
            <Info className="h-4 w-4 text-amber-400" />
            <AlertDescription className="text-zinc-300 text-xs">
              Times include 2–3 business days HK shipping, service processing, and ~1 week return shipping.
              Actual times vary — check the official service dashboard for current turnaround estimates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <CheckCircle className="h-5 w-5 text-amber-400" /> HK Collector Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {RESOURCES.map((r) => (
            <button key={r.name} onClick={() => window.open(r.url, "_blank", "noopener")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-zinc-800 bg-zinc-800/40 hover:border-amber-500/40 hover:bg-zinc-800 transition-all text-left group">
              <div>
                <div className="text-sm font-semibold text-zinc-200">{r.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{r.desc}</div>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-zinc-600 group-hover:text-amber-400 shrink-0 ml-3" />
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
