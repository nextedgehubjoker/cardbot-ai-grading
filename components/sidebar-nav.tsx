"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Shield, X } from "lucide-react"

export interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  group: string
  highlight?: boolean
  badge?: string
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
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800/80">
        <Shield className="h-6 w-6 text-amber-400 shrink-0" />
        <span className="text-lg font-black text-white tracking-tight">CardBot</span>
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">AI</Badge>
        <button onClick={onCloseMobile} className="ml-auto lg:hidden text-zinc-500 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{group}</p>
            <div className="space-y-0.5">
              {items.filter((i) => i.group === group).map((item) => {
                const Icon = item.icon
                const isActive = active === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => { onSelect(item.id); onCloseMobile() }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                      isActive
                        ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/20"
                        : item.highlight
                          ? "text-amber-400 border border-amber-500/30 hover:bg-amber-500/10"
                          : "text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge className={cn("text-[9px] px-1.5", isActive ? "bg-black/20 text-black" : "bg-zinc-800 text-zinc-500")}>
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-zinc-800 lg:bg-zinc-950/60 lg:sticky lg:top-0 lg:h-screen">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={onCloseMobile} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-zinc-950 border-r border-zinc-800 shadow-2xl">
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
