import "server-only";

import { PDFDocument, type PDFFont, StandardFonts, rgb } from "pdf-lib";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency } from "@/src/lib/utils/format";

export type PdfPayload = {
  requestTitle: string;
  generatedAtIso: string;
  scenario: PricedScenario;
};

export async function renderQuotePdf(payload: PdfPayload) {
  const pdf = await PDFDocument.create();
  pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const margin = 48;
  let y = 790;

  const drawText = (
    text: string,
    options: { size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const size = options.size ?? 10;
    const selectedFont = options.bold ? bold : font;
    const lines = wrapText(text, selectedFont, size, 500);

    for (const line of lines) {
      if (y < 70) {
        y = 790;
        pdf.addPage([595.28, 841.89]);
      }

      pdf.getPages()[pdf.getPageCount() - 1].drawText(line, {
        x: margin,
        y,
        size,
        font: selectedFont,
        color: options.color ?? rgb(0.12, 0.15, 0.2),
      });
      y -= size + 6;
    }
  };

  drawText("Italians quote it better", { size: 18, bold: true, color: rgb(0.04, 0.22, 0.38) });
  y -= 8;
  drawText(payload.requestTitle, { size: 24, bold: true });
  drawText(`Scenario: ${payload.scenario.name}`, { size: 14, bold: true });
  drawText(`Totale stimato: ${formatCurrency(payload.scenario.totals.totalEur)}`, {
    size: 16,
    bold: true,
    color: rgb(0.02, 0.39, 0.3),
  });
  drawText(
    `Timeline attesa: ${payload.scenario.estimatedWeeksExpected} settimane | Confidenza: ${Math.round(
      payload.scenario.confidence * 100,
    )}%`,
  );
  y -= 12;
  drawText("Executive summary", { size: 14, bold: true });
  drawText(payload.scenario.description);
  y -= 8;
  drawText("Scope incluso", { size: 14, bold: true });

  for (const quoteModule of payload.scenario.modules.filter((item) => item.isIncluded)) {
    drawText(`${quoteModule.name} - ${formatCurrency(quoteModule.subtotalEur)}`, {
      size: 11,
      bold: true,
    });
    drawText(quoteModule.description);
  }

  y -= 8;
  drawText("Breakdown economico", { size: 14, bold: true });
  for (const role of payload.scenario.roleBreakdown) {
    drawText(
      `${role.roleName} ${role.seniority}: ${role.hours}h x ${formatCurrency(
        role.hourlyRateEur,
      )}/h = ${formatCurrency(role.costEur)}`,
    );
  }
  drawText(
    `PM/Agile Coach: ${payload.scenario.totals.pmHours}h = ${formatCurrency(
      payload.scenario.totals.pmCostEur,
    )}`,
  );

  y -= 8;
  drawText("Assumptions ed esclusioni", { size: 14, bold: true });
  for (const assumption of payload.scenario.assumptions) {
    drawText(`Assumption: ${assumption}`);
  }
  for (const exclusion of payload.scenario.exclusions) {
    drawText(`Esclusione: ${exclusion}`);
  }

  return pdf.save();
}

function wrapText(
  text: string,
  font: PDFFont,
  size: number,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines;
}
