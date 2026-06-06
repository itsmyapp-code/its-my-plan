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
): void {
  const meta = getMetadata(plan);

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, docWidth, docHeight, 'F');

  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(1);
  doc.rect(8, 8, docWidth - 16, docHeight - 16, 'S');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('its my plan', 15, 22);

  doc.setFillColor(59, 130, 246);
  doc.rect(15, 25, 4, 4, 'F');
  doc.setFillColor(249, 115, 22);
  doc.rect(20, 25, 4, 4, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text(title, 28, 26);
  doc.text(subtitle, docWidth - 15, 22, { align: 'right' });

  // Title block — job metadata
  const blockY = docHeight - 28;
  doc.setDrawColor(51, 65, 85);
  doc.setLineWidth(0.5);
  doc.line(15, blockY - 4, docWidth - 15, blockY - 4);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const rows = [
    `Job: ${meta.jobNumber || '—'}`,
    `Version: ${meta.version || '1.0'}`,
    `Operator: ${meta.operator || '—'}`,
    `Scale: ${meta.scale || DEFAULT_PRINT_SCALE}`,
    `Date: ${new Date().toLocaleDateString('en-GB')}`,
  ];
  if (meta.clientName) rows.splice(1, 0, `Client: ${meta.clientName}`);

  rows.forEach((row, i) => {
    doc.text(row, 15, blockY + i * 4);
  });

  doc.text(`Plan: ${plan.name}`, docWidth - 15, blockY, { align: 'right' });
  doc.text(`Exported: ${new Date().toLocaleString('en-GB')}`, docWidth - 15, blockY + 4, { align: 'right' });

  doc.setDrawColor(51, 65, 85);
  doc.line(15, docHeight - 17, docWidth - 15, docHeight - 17);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('itsmyplan.co.uk  |  Design Tooling', 15, docHeight - 11);
  doc.text('Client-Side Browser Plan - Confidential', docWidth - 15, docHeight - 11, { align: 'right' });
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

    drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      `2D Blueprint — Scale ${meta.scale || DEFAULT_PRINT_SCALE}`,
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 15, y: 38, w: docWidth - 30, h: docHeight - 72 };
    const svgElement = document.querySelector(svgSelector) as SVGSVGElement | null;

    if (svgElement) {
      try {
        const { dataUrl, width, height } = await svgToPngDataUrl(svgElement, plan);
        const placement = fitImageInBox(width, height, imageBox.x, imageBox.y, imageBox.w, imageBox.h);
        doc.addImage(dataUrl, 'PNG', placement.x, placement.y, placement.width, placement.height);

        // Scale annotation below drawing
        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Drawing scale: ${meta.scale || DEFAULT_PRINT_SCALE}  |  All dimensions in millimetres`,
          docWidth / 2,
          imageBox.y + imageBox.h + 6,
          { align: 'center' }
        );
      } catch (err) {
        console.error('Failed to convert 2D SVG to image:', err);
        doc.setFontSize(14);
        doc.setTextColor(239, 68, 68);
        doc.text('Failed to render 2D Blueprint preview', 30, 80);
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
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

    drawPDFDecorations(
      doc,
      `Project: ${plan.name}`,
      '3D Dollhouse View',
      plan,
      docWidth,
      docHeight
    );

    const imageBox = { x: 15, y: 38, w: docWidth - 30, h: docHeight - 72 };
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
        doc.setTextColor(239, 68, 68);
        doc.text('Failed to render 3D preview', 30, 80);
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(148, 163, 184);
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
        svg { background: #0f172a !important; }
        text { fill: #94a3b8 !important; font-family: sans-serif; }
        .grid-line { stroke: #1e293b; }
        .grid-major { stroke: #334155; }
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
          ctx.fillStyle = '#0f172a';
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
