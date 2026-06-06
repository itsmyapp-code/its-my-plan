import { jsPDF } from 'jspdf';
import type { RoomPlan, PlanMetadata } from '@/types';
import { wallsBoundingBox } from '@/utils/geometry';
import { migratePlan } from '@/utils/storage';
import { DEFAULT_PRINT_SCALE } from '@/constants';

function sanitizeFilename(name: string, suffix: string): string {
  const base = (name || 'plan')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'plan';
  const cleanSuffix = suffix.startsWith('.') ? suffix : `.${suffix}`;
  return `${base}${cleanSuffix}`;
}

/** Download PDF via blob to ensure correct .pdf MIME type and extension */
function downloadPdf(doc: jsPDF, filename: string): void {
  const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = pdfFilename;
  link.type = 'application/pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function getMetadata(plan: RoomPlan): PlanMetadata {
  return plan.metadata ?? {
    jobNumber: '',
    version: '1.0',
    operator: '',
    scale: DEFAULT_PRINT_SCALE,
    clientName: '',
  };
}

interface ImagePlacement {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Fit image into box preserving aspect ratio */
function fitImageInBox(
  imgWidth: number,
  imgHeight: number,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number
): ImagePlacement {
  const imgAspect = imgWidth / imgHeight;
  const boxAspect = boxW / boxH;
  let w = boxW;
  let h = boxH;
  if (imgAspect > boxAspect) {
    h = boxW / imgAspect;
  } else {
    w = boxH * imgAspect;
  }
  return {
    x: boxX + (boxW - w) / 2,
    y: boxY + (boxH - h) / 2,
    width: w,
    height: h,
  };
}

function drawPDFDecorations(
  doc: jsPDF,
  title: string,
  subtitle: string,
  plan: RoomPlan,
  docWidth: number,
  docHeight: number
): number {
  const meta = getMetadata(plan);

  // White print-friendly page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, docWidth, docHeight, 'F');

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, docWidth - 16, docHeight - 16, 'S');

  // Header
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('its my plan', 15, 20);

  doc.setFillColor(59, 130, 246);
  doc.rect(15, 22, 4, 4, 'F');
  doc.setFillColor(249, 115, 22);
  doc.rect(20, 22, 4, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(title, 28, 23);
  doc.text(subtitle, docWidth - 15, 20, { align: 'right' });

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, 28, docWidth - 15, 28);

  // Footer zone — fixed height so metadata never overlaps branding
  const FOOTER_HEIGHT = 34;
  const footerTop = docHeight - FOOTER_HEIGHT;
  const metaLineHeight = 4.5;
  const metaStartY = footerTop + 5;
  const brandDividerY = docHeight - 12;
  const brandTextY = docHeight - 7;

  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerTop, docWidth - 15, footerTop);

  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const leftRows = [
    `Job: ${meta.jobNumber || '—'}`,
    ...(meta.clientName ? [`Client: ${meta.clientName}`] : []),
    `Version: ${meta.version || '1.0'}`,
    `Operator: ${meta.operator || '—'}`,
    `Scale: ${meta.scale || DEFAULT_PRINT_SCALE}`,
    `Date: ${new Date().toLocaleDateString('en-GB')}`,
  ];

  const rightRows = [
    `Plan: ${plan.name}`,
    `Exported: ${new Date().toLocaleString('en-GB')}`,
  ];

  leftRows.forEach((row, i) => {
    doc.text(row, 15, metaStartY + i * metaLineHeight);
  });

  rightRows.forEach((row, i) => {
    doc.text(row, docWidth - 15, metaStartY + i * metaLineHeight, { align: 'right' });
  });

  doc.setDrawColor(200, 200, 200);
  doc.line(15, brandDividerY, docWidth - 15, brandDividerY);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('itsmyplan.co.uk  |  Design Tooling', 15, brandTextY);
  doc.text('Client-Side Browser Plan — Confidential', docWidth - 15, brandTextY, { align: 'right' });

  // Return Y coordinate where drawing area ends
  return footerTop - 4;
}

/**
 * Export a RoomPlan object to a JSON file.
 */
export function exportToJSON(plan: RoomPlan): void {
  try {
    const filename = sanitizeFilename(plan.name, '_layout.json');
    const dataStr = JSON.stringify(plan, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export JSON:', error);
    alert('Failed to export JSON file.');
  }
}

/**
 * Import a RoomPlan object from a JSON file.
 */
export function importFromJSON(file: File): Promise<RoomPlan> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const raw = JSON.parse(content) as RoomPlan;
        const plan = migratePlan(raw);

        if (!plan.id || !plan.name || !Array.isArray(plan.walls) || !Array.isArray(plan.fixtures) || !Array.isArray(plan.openings)) {
          throw new Error('Invalid layout file format.');
        }

        resolve(plan);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
}

/** Wait for next animation frame(s) — used before 3D capture */
export function waitForRender(frames = 3): Promise<void> {
  return new Promise((resolve) => {
    let count = 0;
    const tick = () => {
      count++;
      if (count >= frames) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/**
 * Export 2D Blueprint as a clean single-page PDF.
 */
export async function export2DPDF(plan: RoomPlan, svgSelector: string): Promise<void> {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();
    const meta = getMetadata(plan);

    const drawingBottom = drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      `2D Blueprint — Scale ${meta.scale || DEFAULT_PRINT_SCALE}`,
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 15, y: 32, w: docWidth - 30, h: drawingBottom - 32 };
    const svgElement = document.querySelector(svgSelector) as SVGSVGElement | null;

    if (svgElement) {
      try {
        const { dataUrl, width, height } = await svgToPngDataUrl(svgElement, plan);
        const placement = fitImageInBox(width, height, imageBox.x, imageBox.y, imageBox.w, imageBox.h);
        doc.addImage(dataUrl, 'PNG', placement.x, placement.y, placement.width, placement.height);

        // Scale annotation below drawing
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(
          `Drawing scale: ${meta.scale || DEFAULT_PRINT_SCALE}  |  All dimensions in millimetres`,
          docWidth / 2,
          Math.min(drawingBottom - 2, imageBox.y + imageBox.h + 5),
          { align: 'center' }
        );
      } catch (err) {
        console.error('Failed to convert 2D SVG to image:', err);
        doc.setFontSize(14);
        doc.setTextColor(185, 28, 28);
        doc.text('Failed to render 2D Blueprint preview', 30, 80);
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text('No 2D viewport available', 30, 80);
    }

    downloadPdf(doc, sanitizeFilename(plan.name, '_blueprint.pdf'));
  } catch (error) {
    console.error('Failed to export 2D PDF:', error);
    alert('Failed to export 2D PDF file.');
  }
}

/**
 * Export 3D Dollhouse as a clean single-page PDF.
 */
export async function export3DPDF(plan: RoomPlan, canvas3dSelector: string): Promise<void> {
  try {
    await waitForRender(5);

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const docWidth = doc.internal.pageSize.getWidth();
    const docHeight = doc.internal.pageSize.getHeight();

    const drawingBottom = drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      '3D Dollhouse View',
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 15, y: 32, w: docWidth - 30, h: drawingBottom - 32 };
    const canvasElement = document.querySelector(canvas3dSelector);
    let canvas3d: HTMLCanvasElement | null = null;

    if (canvasElement) {
      if (canvasElement.tagName === 'CANVAS') {
        canvas3d = canvasElement as HTMLCanvasElement;
      } else {
        canvas3d = canvasElement.querySelector('canvas');
      }
    }

    if (canvas3d && canvas3d.width > 0) {
      try {
        const img3dData = canvas3d.toDataURL('image/png');
        const placement = fitImageInBox(
          canvas3d.width,
          canvas3d.height,
          imageBox.x,
          imageBox.y,
          imageBox.w,
          imageBox.h
        );
        doc.addImage(img3dData, 'PNG', placement.x, placement.y, placement.width, placement.height);
      } catch (err) {
        console.error('Failed to convert 3D Canvas to image:', err);
        doc.setFontSize(14);
        doc.setTextColor(185, 28, 28);
        doc.text('Failed to render 3D preview', 30, 80);
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(71, 85, 105);
      doc.text('No 3D viewport available — switch to 3D view first', 30, 80);
    }

    downloadPdf(doc, sanitizeFilename(plan.name, '_dollhouse.pdf'));
  } catch (error) {
    console.error('Failed to export 3D PDF:', error);
    alert('Failed to export 3D PDF file.');
  }
}

/**
 * Helper to convert an SVG element to a PNG Data URL, fitted to plan bounds.
 */
function svgToPngDataUrl(
  svgElement: SVGSVGElement,
  plan: RoomPlan
): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    try {
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Compute plan bounding box for fit-to-content export
      let exportWidth = 1600;
      let exportHeight = 1000;

      if (plan.walls.length > 0) {
        const bb = wallsBoundingBox(plan.walls);
        const padding = 1000; // mm padding
        const planW = (bb.width + padding * 2) * 0.1; // SCALE_2D
        const planH = (bb.height + padding * 2) * 0.1;
        exportWidth = Math.max(800, Math.min(2400, Math.round(planW)));
        exportHeight = Math.max(600, Math.min(1600, Math.round(planH)));
      }

      clonedSvg.setAttribute('width', String(exportWidth));
      clonedSvg.setAttribute('height', String(exportHeight));

      const style = document.createElement('style');
      style.textContent = `
        svg { background: #ffffff !important; }
        text { fill: #334155 !important; font-family: sans-serif; }
        .grid-line { stroke: #e2e8f0; }
        .grid-major { stroke: #cbd5e1; }
      `;
      clonedSvg.appendChild(style);

      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, exportWidth, exportHeight);
          ctx.drawImage(image, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(blobURL);
          resolve({ dataUrl, width: exportWidth, height: exportHeight });
        } else {
          reject(new Error('Failed to get 2D canvas context'));
        }
      };
      image.onerror = (err) => reject(err);
      image.src = blobURL;
    } catch (err) {
      reject(err);
    }
  });
}
