import { NextResponse } from "next/server"

const VERIFY_URLS: Record<string, (c: string) => string> = {
  PSA: (c) => `https://www.psacard.com/cert/${c}`,
  BGS: (c) => `https://www.beckett.com/grading/cert-lookup/?certNumber=${c}`,
  CGC: (c) => `https://www.cgccards.com/certlookup/${c}`,
  SGC: (c) => `https://www.sgccard.com/cert-lookup/?cert=${c}`,
  TAG: (c) => `https://www.tag.grading/cert/${c}`,
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cert    = searchParams.get("cert")?.replace(/\D/g, "") // digits only
  const service = (searchParams.get("service") || "PSA").toUpperCase()

  if (!cert || cert.length < 4) {
    return NextResponse.json({ error: "Invalid cert number" }, { status: 400 })
  }

  const verifyUrl = VERIFY_URLS[service]?.(cert) ?? VERIFY_URLS.PSA(cert)

  // Try PSA public API if token is set
  if (service === "PSA") {
    const token = process.env.PSA_API_TOKEN
    if (token) {
      try {
        const res = await fetch(
          `https://api.psacard.com/publicapi/cert/GetByCertNumber/${cert}`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
            signal: AbortSignal.timeout(6000),
          }
        )
        if (res.ok) {
          const json = await res.json()
          const c = json?.PSACert
          if (c) {
            return NextResponse.json({
              source:     "live",
              certNumber: cert,
              service:    "PSA",
              grade:      c.CardGrade,
              cardName:   c.Subject || c.Variety || "Unknown",
              setName:    c.Brand || "Unknown",
              year:       c.Year || "—",
              category:   c.Category || "Trading Card",
              verifyUrl,
            })
          }
        }
      } catch { /* fall through */ }
    }
  }

  // Demo mode — return link + formatted cert for manual lookup
  return NextResponse.json({
    source:     "demo",
    certNumber: cert,
    service,
    verifyUrl,
    note: `Live lookup requires API credentials. Use the button below to verify on the official ${service} site.`,
  })
}
