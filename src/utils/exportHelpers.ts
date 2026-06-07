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

let cachedLogoDataUrl: string | null = null;

async function loadLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  try {
    const res = await fetch('/its-my-plan.png', { cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read logo image'));
      reader.readAsDataURL(blob);
    });

    cachedLogoDataUrl = dataUrl;
    return dataUrl;
  } catch {
    return null;
  }
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

async function drawPDFDecorations(
  doc: jsPDF,
  title: string,
  subtitle: string,
  plan: RoomPlan,
  docWidth: number,
  docHeight: number
): Promise<number> {
  const meta = getMetadata(plan);

  // White print-friendly page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, docWidth, docHeight, 'F');

  // Page border
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, docWidth - 16, docHeight - 16, 'S');

  // NO HEADER. The entire upper canvas is available for content.
  // Compact unified footer at the bottom
  const FOOTER_HEIGHT = 10;
  const footerTop = docHeight - 8 - FOOTER_HEIGHT; // 8mm margin from bottom

  // Divider line above footer
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(12, footerTop, docWidth - 12, footerTop);

  const brandTextY = docHeight - 13;

  // Add brand logo if available
  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', 12, brandTextY - 3.5, 5, 5);
    } catch {
      doc.setFillColor(59, 130, 246);
      doc.rect(12, brandTextY - 3, 2, 2, 'F');
      doc.setFillColor(249, 115, 22);
      doc.rect(14.5, brandTextY - 3, 2, 2, 'F');
    }
  } else {
    doc.setFillColor(59, 130, 246);
    doc.rect(12, brandTextY - 3, 2, 2, 'F');
    doc.setFillColor(249, 115, 22);
    doc.rect(14.5, brandTextY - 3, 2, 2, 'F');
  }

  // Brand Name
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('its my plan', 19, brandTextY);

  // Plan Details (Left-Middle side-by-side)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  const leftParts: string[] = [
    `Plan: ${plan.name || 'Untitled Plan'}`,
    meta.jobNumber ? `Job: ${meta.jobNumber}` : '',
    meta.clientName ? `Client: ${meta.clientName}` : '',
  ].filter(Boolean);

  doc.text(leftParts.join('  |  '), 42, brandTextY);

  // Plan Metadata & Scale (Right side-by-side)
  const rightParts: string[] = [
    meta.operator ? `Operator: ${meta.operator}` : '',
    meta.scale ? `Scale: ${meta.scale}` : `Scale: ${DEFAULT_PRINT_SCALE}`,
    `Date: ${new Date().toLocaleDateString('en-GB')}`,
  ].filter(Boolean);

  doc.text(rightParts.join('  |  '), docWidth - 12, brandTextY, { align: 'right' });

  // Return Y coordinate where drawing area ends (leaving a tiny padding before the line)
  return footerTop - 2;
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
 * Export multiple plans to a single JSON master file.
 */
export function exportAllPlansToJSON(plans: RoomPlan[]): void {
  try {
    const filename = `itsmyplan_master_export_${new Date().toISOString().split('T')[0]}.json`;
    const dataStr = JSON.stringify(plans, null, 2);
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
    console.error('Failed to export master JSON:', error);
    alert('Failed to export master plans file.');
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

    const drawingBottom = await drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      `2D Blueprint — Scale ${meta.scale || DEFAULT_PRINT_SCALE}`,
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 12, y: 12, w: docWidth - 24, h: drawingBottom - 12 };
    const svgElement = document.querySelector(svgSelector) as SVGSVGElement | null;

    if (svgElement) {
      try {
        const { dataUrl, width, height } = await svgToPngDataUrl(svgElement, plan);
        const placement = fitImageInBox(width, height, imageBox.x, imageBox.y, imageBox.w, imageBox.h);
        doc.addImage(dataUrl, 'PNG', placement.x, placement.y, placement.width, placement.height);
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

    const drawingBottom = await drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      '3D Dollhouse View',
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 12, y: 12, w: docWidth - 24, h: drawingBottom - 12 };
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

      // Compute plan bounding box for fit-to-content export, independent of current viewport pan/zoom.
      let exportWidth = 1600;
      let exportHeight = 1000;
      let viewBoxX = 0;
      let viewBoxY = 0;
      let viewBoxW = exportWidth;
      let viewBoxH = exportHeight;

      if (plan.walls.length > 0) {
        const bb = wallsBoundingBox(plan.walls);
        const padding = 800; // mm padding
        const minXmm = bb.minX - padding;
        const minYmm = bb.minY - padding;
        const wmm = bb.width + padding * 2;
        const hmm = bb.height + padding * 2;

        viewBoxX = minXmm * 0.1;
        viewBoxY = minYmm * 0.1;
        viewBoxW = Math.max(100, wmm * 0.1);
        viewBoxH = Math.max(100, hmm * 0.1);

        exportWidth = Math.max(900, Math.min(2600, Math.round(viewBoxW)));
        exportHeight = Math.max(650, Math.min(1800, Math.round(viewBoxH)));
      }

      // Reset viewport transform so export always captures the whole plan rather than current pan/zoom state.
      const transformedGroup = clonedSvg.querySelector('g[transform]');
      if (transformedGroup) {
        transformedGroup.removeAttribute('transform');
      }

      clonedSvg.setAttribute('width', String(exportWidth));
      clonedSvg.setAttribute('height', String(exportHeight));
      clonedSvg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxW} ${viewBoxH}`);

      const style = document.createElement('style');
      style.textContent = `
        :root {
          --canvas-bg: #ffffff;
          --brand-blue: #2563eb;
          --brand-orange: #ea580c;
          --canvas-wall-selected: #2563eb;
          --canvas-dimension-text: #475569;
          --canvas-wall-stroke: #475569;
          --canvas-wall-fill: #94a3b8;
          --canvas-wall-fill-external: #64748b;
        }
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
