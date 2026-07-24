import { NextResponse } from "next/server"

const BASE = "https://www.pricecharting.com/api"

// Field → grade-ladder mapping, per PriceCharting's own API docs for the
// "Cards" product category (https://www.pricecharting.com/api-documentation).
// PriceCharting does not expose a distinct "Pristine" tier — condition-17-price
// (CGC 10) is the closest available field and is used for CGC 10 / Pristine 10 alike.
const GRADE_FIELDS: { key: string; label: string }[] = [
  { key: "loose-price",       label: "Raw / Ungraded" },
  { key: "cib-price",         label: "Graded 7 – 7.5" },
  { key: "new-price",         label: "Graded 8 – 8.5" },
  { key: "graded-price",      label: "Graded 9 (PSA 9)" },
  { key: "box-only-price",    label: "Graded 9.5" },
  { key: "manual-only-price", label: "PSA 10" },
  { key: "bgs-10-price",      label: "BGS 10" },
  { key: "condition-17-price",label: "CGC 10 / Pristine 10" },
  { key: "condition-18-price",label: "SGC 10" },
]

function centsToUsd(v: unknown): number | null {
  if (typeof v !== "number") return null
  return Math.round((v / 100) * 100) / 100 // PriceCharting returns prices in cents
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q  = searchParams.get("q")?.trim()
  const id = searchParams.get("id")?.trim()
  const token = process.env.PRICECHARTING_API_TOKEN

  if (!q && !id) {
    return NextResponse.json({ error: "Missing search query" }, { status: 400 })
  }

  const manualSearchUrl = `https://www.pricecharting.com/search-products?q=${encodeURIComponent(q || "")}&type=prices`

  if (!token) {
    return NextResponse.json({
      source: "demo",
      note: "Live PriceCharting pricing requires a PRICECHARTING_API_TOKEN (paid PriceCharting Pro subscription). Use the link below to check this card's grade-by-grade prices manually.",
      manualSearchUrl,
    })
  }

  try {
    // Look up by id (specific product picked from a prior search) or fetch a single best match by query
    const url = id
      ? `${BASE}/product?t=${token}&id=${encodeURIComponent(id)}`
      : `${BASE}/product?t=${token}&q=${encodeURIComponent(q!)}`

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()

    if (data.status !== "success") {
      // Fall back to multi-result search so the user can disambiguate
      const searchRes = await fetch(`${BASE}/products?t=${token}&q=${encodeURIComponent(q!)}`, { signal: AbortSignal.timeout(8000) })
      const searchData = await searchRes.json()
      if (searchData.status === "success" && searchData.products?.length) {
        return NextResponse.json({
          source: "live",
          multipleMatches: true,
          matches: searchData.products.slice(0, 10),
          manualSearchUrl,
        })
      }
      return NextResponse.json({
        source: "live",
        notFound: true,
        note: "No matching card found on PriceCharting. Try simplifying the search (just the card name + set) or check manually.",
        manualSearchUrl,
      })
    }

    const grades = GRADE_FIELDS.map((g) => ({
      label: g.label,
      price: centsToUsd(data[g.key]),
    })).filter((g) => g.price !== null && g.price! > 0)

    return NextResponse.json({
      source: "live",
      productName: data["product-name"],
      consoleName: data["console-name"],
      genre: data["genre"],
      id: data["id"],
      grades,
      manualSearchUrl,
    })
  } catch {
    return NextResponse.json({
      source: "error",
      note: "PriceCharting lookup failed — check manually instead.",
      manualSearchUrl,
    })
  }
}
