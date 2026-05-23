import { NextResponse } from "next/server";
import { z } from "zod";
import { renderQuotePdf } from "@/src/lib/pdf/render-quote-pdf";
import type { PricedScenario } from "@/src/lib/quotes/types";

const ExportPdfSchema = z.object({
  requestTitle: z.string().min(1),
  scenario: z.custom<PricedScenario>(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = ExportPdfSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Payload PDF non valido.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const pdfBytes = await renderQuotePdf({
    requestTitle: parsed.data.requestTitle,
    scenario: parsed.data.scenario,
    generatedAtIso: new Date().toISOString(),
  });

  return new Response(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${parsed.data.scenario.slug}.pdf"`,
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      message:
        "Usa POST con il payload scenario per generare e scaricare il PDF demo.",
    },
    { status: 405 },
  );
}
