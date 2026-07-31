"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Camera, ZoomIn, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Reusable "attach a reference photo" block used across manual-entry tools
 * (Price Check, Value Calc, Market Search, Cert Lookup). We don't have a
 * vision/OCR backend wired into the deployed app, so this deliberately does
 * NOT pretend to auto-read the card — it gives the user a zoomable photo
 * preview so they can read cert numbers / set details straight off the image
 * while typing, instead of needing the physical card in hand.
 */
export function CardPhotoAttach({ label = "Attach Card Photo (optional)" }: { label?: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoomed, setZoomed] = useState(false)
  const uploadRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-2">
      <input ref={uploadRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = "" }} />

      {!previewUrl ? (
        <div className="border border-dashed border-zinc-700 rounded-lg p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-medium text-zinc-300">{label}</p>
            <p className="text-xs text-zinc-600">Zoom in on it while you type — no need to hold the card</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white gap-1.5"
              onClick={() => uploadRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-1.5"
              onClick={() => cameraRef.current?.click()}>
              <Camera className="h-3.5 w-3.5" /> Photo
              <Badge className="bg-black/20 text-black text-[9px] ml-0.5">Mobile</Badge>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-zinc-800/40 border border-zinc-800 rounded-lg p-2">
          <button onClick={() => setZoomed(true)} className="relative shrink-0 group">
            <img src={previewUrl} alt="Card reference" className="h-16 w-16 object-cover rounded-md border border-zinc-700" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 rounded-md flex items-center justify-center transition-all">
              <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100" />
            </div>
          </button>
          <div className="flex-1 text-xs text-zinc-500">Tap the photo to zoom in and read details</div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-300 text-xs h-7 px-2"
              onClick={() => uploadRef.current?.click()}>Replace</Button>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-red-400 text-xs h-7 px-2"
              onClick={() => setPreviewUrl(null)}>Remove</Button>
          </div>
        </div>
      )}

      {/* Zoom overlay */}
      {zoomed && previewUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setZoomed(false)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setZoomed(false)}>
            <X className="h-7 w-7" />
          </button>
          <img src={previewUrl} alt="Card zoomed" className={cn("max-h-[90vh] max-w-[95vw] object-contain rounded-lg")} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
