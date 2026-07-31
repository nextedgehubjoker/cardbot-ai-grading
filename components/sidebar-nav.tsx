"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Shield, X } from "lucide-react"
import { motion } from "framer-motion"

export interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  group: string
  highlight?: boolean
  badge?: string
}

const GROUP_THEME: Record<string, { active: string; text: string; dot: string }> = {
  "Overview":       { active: "bg-amber-500 text-black shadow-amber-500/30",   text: "text-amber-400",   dot: "bg-amber-400" },
  "Grading Tools":  { active: "bg-blue-500 text-white shadow-blue-500/30",     text: "text-blue-400",    dot: "bg-blue-400" },
  "Money Tools":    { active: "bg-emerald-500 text-black shadow-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-400" },
  "Verification":   { active: "bg-indigo-500 text-white shadow-indigo-500/30", text: "text-indigo-400",  dot: "bg-indigo-400" },
  "Guides":         { active: "bg-rose-500 text-white shadow-rose-500/30",     text: "text-rose-400",    dot: "bg-rose-400" },
}

export function SidebarNav({
  items, active, onSelect, mobileOpen, onCloseMobile,
}: {
  items: NavItem[]
  active: string
  onSelect: (id: string) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}) {
  const groups = Array.from(new Set(items.map((i) => i.group)))

  const content = (
    <div className="flex flex-col h-full bg-gradient-to-b from-zinc-950 via-zinc-950 to-black">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800/80">
        <Shield className="h-6 w-6 text-amber-400 shrink-0" />
        <span className="text-lg font-black shimmer-text tracking-tight">CardBot</span>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">AI</Badge>
        <button onClick={onCloseMobile} className="ml-auto lg:hidden text-zinc-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => {
          const theme = GROUP_THEME[group] ?? GROUP_THEME["Overview"]
          return (
            <div key={group}>
              <p className={cn("px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", theme.text)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
                {group}
              </p>
              <div className="space-y-0.5">
                {items.filter((i) => i.group === group).map((item) => {
                  const Icon = item.icon
                  const isActive = active === item.id
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { onSelect(item.id); onCloseMobile() }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                        isActive
                          ? cn(theme.active, "font-bold shadow-lg")
                          : item.highlight
                            ? "text-amber-400 border border-amber-500/30 hover:bg-amber-500/10"
                            : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge className={cn("text-[9px] px-1.5", isActive ? "bg-black/20 text-white" : "bg-zinc-800 text-zinc-500")}>
                          {item.badge}
                        </Badge>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800/80">
        <p className="text-[11px] text-zinc-600 leading-relaxed">
          AI pre-screening tool. Estimates only — not official grades. Not affiliated with PSA, BGS, CGC, SGC, TAG, or PriceCharting.
        </p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-zinc-800 lg:sticky lg:top-0 lg:h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onCloseMobile} />
          <motion.aside
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: "spring", damping: 25 }}
            className="absolute left-0 top-0 h-full w-72 bg-zinc-950 border-r border-zinc-800 shadow-2xl"
          >
            {content}
          </motion.aside>
        </div>
      )}
    </>
  )
}
