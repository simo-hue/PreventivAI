import "server-only";

import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { PricedScenario } from "@/src/lib/quotes/types";
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils/format";

export type PdfPayload = {
  requestTitle: string;
  generatedAtIso: string;
  scenario: PricedScenario;
};

// Colors
const PRIMARY_COLOR = rgb(0.14, 0.38, 0.89); // Blue 600
const TEXT_DARK = rgb(0.06, 0.09, 0.16); // Slate 900
const TEXT_NORMAL = rgb(0.2, 0.25, 0.33); // Slate 700
const TEXT_MUTED = rgb(0.4, 0.45, 0.52); // Slate 500
const BORDER_COLOR = rgb(0.89, 0.91, 0.94); // Slate 200
const LIGHT_BG = rgb(0.97, 0.98, 0.99); // Slate 50

export async function renderQuotePdf(payload: PdfPayload) {
  const pdf = await PDFDocument.create();
  
  // Define standard fonts
  const fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  
  const pageWidth = 595.28; // A4 Width
  const pageHeight = 841.89; // A4 Height
  const margin = 50;
  
  let currentPage = pdf.addPage([pageWidth, pageHeight]);
  let currentY = pageHeight - margin;

  // Load Logo if possible
  let logoImage: any = null;
  let logoDims = { width: 0, height: 0 };
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    const logoBytes = await fs.promises.readFile(logoPath);
    logoImage = await pdf.embedPng(logoBytes);
    
    // Scale logo
    const maxLogoHeight = 40;
    const maxLogoWidth = 150;
    const aspect = logoImage.width / logoImage.height;
    
    if (logoImage.width > maxLogoWidth) {
      logoDims.width = maxLogoWidth;
      logoDims.height = maxLogoWidth / aspect;
    } else {
      logoDims.width = logoImage.width;
      logoDims.height = logoImage.height;
    }
    
    if (logoDims.height > maxLogoHeight) {
      logoDims.height = maxLogoHeight;
      logoDims.width = maxLogoHeight * aspect;
    }
  } catch (error) {
    console.warn("Could not load logo.png for PDF:", error);
  }

  // --- Helper Functions ---
  
  function checkPageBreak(requiredSpace: number) {
    if (currentY - requiredSpace < margin) {
      currentPage = pdf.addPage([pageWidth, pageHeight]);
      currentY = pageHeight - margin;
      drawFooter(); // Draw footer on new page
      return true;
    }
    return false;
  }

  function drawText(text: string, x: number, font: PDFFont, size: number, color: any, align: 'left' | 'right' | 'center' = 'left') {
    let finalX = x;
    if (align === 'right') {
      finalX = x - font.widthOfTextAtSize(text, size);
    } else if (align === 'center') {
      finalX = x - font.widthOfTextAtSize(text, size) / 2;
    }
    currentPage.drawText(text, { x: finalX, y: currentY, size, font, color });
  }

  function writeLine(text: string, options: { font?: PDFFont, size?: number, color?: any, indent?: number, align?: 'left' | 'right' | 'center' } = {}) {
    const font = options.font ?? fontRegular;
    const size = options.size ?? 10;
    const color = options.color ?? TEXT_NORMAL;
    const indent = options.indent ?? 0;
    const align = options.align ?? 'left';
    
    const lines = wrapText(text, font, size, pageWidth - margin * 2 - indent);
    
    for (const line of lines) {
      checkPageBreak(size + 6);
      drawText(line, margin + indent + (align === 'center' ? (pageWidth - margin * 2)/2 : 0), font, size, color, align);
      currentY -= size + 6;
    }
  }

  function drawLine(yPos: number) {
    currentPage.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 1,
      color: BORDER_COLOR,
    });
  }

  function drawFooter() {
    const pageNum = pdf.getPageCount();
    currentPage.drawText(`Pagina ${pageNum}`, {
      x: pageWidth - margin - 40,
      y: margin - 20,
      size: 9,
      font: fontRegular,
      color: TEXT_MUTED,
    });
    currentPage.drawText("Preventivo generato automaticamente tramite IA", {
      x: margin,
      y: margin - 20,
      size: 9,
      font: fontItalic,
      color: TEXT_MUTED,
    });
  }

  // --- Render Document ---
  
  // 1. HEADER
  if (logoImage) {
    currentPage.drawImage(logoImage, {
      x: margin,
      y: currentY - logoDims.height + 10,
      width: logoDims.width,
      height: logoDims.height,
    });
  } else {
    drawText("SOFTWARE HOUSE", margin, fontBold, 16, PRIMARY_COLOR);
  }
  
  const dateStr = new Date(payload.generatedAtIso).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' });
  drawText("PREVENTIVO UFFICIALE", pageWidth - margin, fontBold, 12, TEXT_DARK, 'right');
  currentY -= 15;
  drawText(`Data: ${dateStr}`, pageWidth - margin, fontRegular, 10, TEXT_MUTED, 'right');
  
  currentY -= 40;
  drawLine(currentY);
  currentY -= 20;

  // 2. PROJECT INFO
  writeLine(payload.requestTitle, { font: fontBold, size: 22, color: TEXT_DARK });
  currentY -= 4;
  writeLine(`Scenario Proposto: ${payload.scenario.name}`, { font: fontBold, size: 14, color: PRIMARY_COLOR });
  currentY -= 15;
  
  writeLine("EXECUTIVE SUMMARY", { font: fontBold, size: 11, color: TEXT_DARK });
  currentY -= 5;
  writeLine(payload.scenario.description, { size: 10, color: TEXT_NORMAL });
  currentY -= 15;
  
  // Metriche in linea
  currentY -= 15;
  const metricsY = currentY;
  currentPage.drawRectangle({ x: margin, y: metricsY - 15, width: pageWidth - margin * 2, height: 35, color: LIGHT_BG, borderColor: BORDER_COLOR, borderWidth: 1 });
  
  drawText("Timeline:", margin + 15, fontBold, 10, TEXT_DARK);
  drawText(`${payload.scenario.estimatedWeeksExpected} settimane`, margin + 65, fontRegular, 10, TEXT_NORMAL);
  
  drawText("Confidenza:", margin + 180, fontBold, 10, TEXT_DARK);
  drawText(`${formatPercent(payload.scenario.confidence)}`, margin + 245, fontRegular, 10, TEXT_NORMAL);
  
  drawText("Costo Stimato:", margin + 340, fontBold, 10, PRIMARY_COLOR);
  drawText(`${formatCurrency(payload.scenario.totals.totalEur)}`, margin + 420, fontBold, 11, PRIMARY_COLOR);
  
  currentY -= 40;
  
  // 3. DETTAGLIO MODULI (SCOPE)
  writeLine("DETTAGLIO DEI SERVIZI E SCOPE", { font: fontBold, size: 12, color: TEXT_DARK });
  drawLine(currentY + 5);
  currentY -= 10;
  
  const showHours = payload.scenario.displayOptions?.showHours ?? true;
  const showRate = payload.scenario.displayOptions?.showHourlyRate ?? true;
  
  const modules = payload.scenario.modules.filter((item) => item.isIncluded);
  
  for (const mod of modules) {
    checkPageBreak(50);
    // Titolo Modulo
    writeLine(mod.name.toUpperCase(), { font: fontBold, size: 11, color: PRIMARY_COLOR });
    currentY -= 2;
    writeLine(mod.description, { size: 9, color: TEXT_NORMAL });
    currentY -= 5;
    
    // Lista Task
    for (const task of mod.tasks) {
      checkPageBreak(30);
      drawText("•", margin + 10, fontBold, 10, TEXT_MUTED);
      writeLine(task.title, { font: fontBold, size: 10, indent: 20 });
      writeLine(task.description || "", { size: 9, color: TEXT_MUTED, indent: 20 });
      currentY -= 2;
      
      // Breakdown dei ruoli nel task
      for (const eff of task.efforts) {
        checkPageBreak(15);
        let effLine = `- ${eff.roleName} (${eff.seniority})`;
        
        // Logica visibilità ore/tariffe (Risponde direttamente al requisito: "se le ore sono visibili... lo saranno anche nel download del pdf, altrimenti no")
        if (showHours && showRate) {
           effLine += `  |  ${formatNumber(eff.estimatedHoursExpected)}h x ${formatCurrency(eff.hourlyRateEur)}/h = ${formatCurrency(eff.costEur)}`;
        } else if (showHours && !showRate) {
           effLine += `  |  ${formatNumber(eff.estimatedHoursExpected)}h = ${formatCurrency(eff.costEur)}`;
        } else if (!showHours && showRate) {
           effLine += `  |  Tariffa: ${formatCurrency(eff.hourlyRateEur)}/h = ${formatCurrency(eff.costEur)}`;
        } else {
           // Solo costo totale ruolo, niente ore o tariffa
           effLine += `  |  ${formatCurrency(eff.costEur)}`;
        }
        
        writeLine(effLine, { size: 8, color: TEXT_NORMAL, indent: 35 });
      }
      currentY -= 6;
    }
    
    // Subtotale modulo
    checkPageBreak(20);
    const modHours = mod.tasks?.reduce((sum, t) => sum + (t.efforts?.reduce((es, e) => es + (Number(e.estimatedHoursExpected) || 0), 0) || 0), 0) || 0;
    const modSubtotalLabel = showHours ? `Totale ${mod.name} (${formatNumber(modHours)}h):` : `Totale ${mod.name}:`;
    drawText(modSubtotalLabel, pageWidth - margin - 70, fontRegular, 9, TEXT_MUTED, 'right');
    drawText(`${formatCurrency(mod.subtotalEur)}`, pageWidth - margin, fontBold, 10, TEXT_DARK, 'right');
    currentY -= 15;
  }
  
  // 4. TOTALI FINALI
  checkPageBreak(100);
  currentY -= 10;
  drawLine(currentY + 5);
  currentY -= 15;
  
  // Subtotale
  drawText("Subtotale Servizi:", pageWidth - margin - 100, fontRegular, 10, TEXT_NORMAL, 'right');
  drawText(`${formatCurrency(payload.scenario.totals.subtotalEur)}`, pageWidth - margin, fontBold, 10, TEXT_DARK, 'right');
  currentY -= 15;
  
  // Project Management
  const pmLabel = showHours ? `Project Management (${formatNumber(payload.scenario.totals.pmHours)}h):` : "Project Management:";
  drawText(pmLabel, pageWidth - margin - 80, fontRegular, 10, TEXT_NORMAL, 'right');
  drawText(`${formatCurrency(payload.scenario.totals.pmCostEur)}`, pageWidth - margin, fontBold, 10, TEXT_DARK, 'right');
  currentY -= 28;
  
  // Totale Generale
  currentPage.drawRectangle({ x: pageWidth - margin - 220, y: currentY - 8, width: 220, height: 28, color: PRIMARY_COLOR });
  drawText("TOTALE PREVENTIVO:", pageWidth - margin - 90, fontBold, 11, rgb(1,1,1), 'right');
  drawText(`${formatCurrency(payload.scenario.totals.totalEur)}`, pageWidth - margin - 15, fontBold, 12, rgb(1,1,1), 'right');
  
  currentY -= 40;
  
  // 5. ASSUMPTIONS ED ESCLUSIONI
  if (payload.scenario.assumptions.length > 0 || payload.scenario.exclusions.length > 0) {
    checkPageBreak(80);
    writeLine("ASSUNZIONI ED ESCLUSIONI", { font: fontBold, size: 11, color: TEXT_DARK });
    currentY -= 5;
    
    if (payload.scenario.assumptions.length > 0) {
      writeLine("Assunzioni:", { font: fontBold, size: 9, color: TEXT_NORMAL });
      for (const a of payload.scenario.assumptions) {
        checkPageBreak(15);
        writeLine(`• ${a}`, { size: 9, color: TEXT_MUTED, indent: 10 });
      }
      currentY -= 5;
    }
    
    if (payload.scenario.exclusions.length > 0) {
      writeLine("Esclusioni:", { font: fontBold, size: 9, color: TEXT_NORMAL });
      for (const e of payload.scenario.exclusions) {
        checkPageBreak(15);
        writeLine(`• ${e}`, { size: 9, color: TEXT_MUTED, indent: 10 });
      }
    }
  }

  drawFooter();
  return pdf.save();
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}
