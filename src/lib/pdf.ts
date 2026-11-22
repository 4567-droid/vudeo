import { jsPDF } from "jspdf";

const FOREST: [number, number, number] = [31, 77, 58];
const INK: [number, number, number] = [27, 27, 26];
const MUTED: [number, number, number] = [102, 100, 94];
const LINE: [number, number, number] = [230, 226, 217];
const AMBER_INK: [number, number, number] = [122, 62, 0];

/** Las fuentes estándar del PDF no tienen algunos espacios especiales de Intl. */
const clean = (s: string) => s.replace(/[  ]/g, " ").replace(/[–—]/g, "-");

/** Informe simple en A4: encabezado verde, secciones, pares dato-valor y tablas. */
export class PdfReport {
  private doc = new jsPDF({ unit: "mm", format: "a4" });
  private y = 0;
  private readonly margin = 16;
  private readonly width = 210 - 32;

  constructor(title: string, subtitle: string) {
    const d = this.doc;
    d.setFillColor(...FOREST);
    d.rect(0, 0, 210, 34, "F");
    d.setTextColor(255, 255, 255);
    d.setFont("helvetica", "bold");
    d.setFontSize(20);
    d.text(clean(title), this.margin, 17);
    d.setFont("helvetica", "normal");
    d.setFontSize(11);
    d.text(clean(subtitle), this.margin, 26);
    this.y = 46;
  }

  private ensure(space: number) {
    if (this.y + space > 280) {
      this.doc.addPage();
      this.y = 20;
    }
  }

  heading(text: string) {
    this.ensure(16);
    const d = this.doc;
    d.setFont("helvetica", "bold");
    d.setFontSize(13);
    d.setTextColor(...FOREST);
    d.text(clean(text), this.margin, this.y);
    this.y += 3;
    d.setDrawColor(...LINE);
    d.line(this.margin, this.y, this.margin + this.width, this.y);
    this.y += 7;
  }

  paragraph(text: string, tone: "ink" | "muted" | "amber" = "ink") {
    const d = this.doc;
    d.setFont("helvetica", "normal");
    d.setFontSize(10.5);
    d.setTextColor(...(tone === "muted" ? MUTED : tone === "amber" ? AMBER_INK : INK));
    const lines = d.splitTextToSize(clean(text), this.width) as string[];
    for (const line of lines) {
      this.ensure(6);
      d.text(line, this.margin, this.y);
      this.y += 5.2;
    }
    this.y += 2;
  }

  /** Filas "dato: valor" con el valor alineado a la derecha. */
  keyValues(rows: [string, string][]) {
    const d = this.doc;
    d.setFontSize(11);
    for (const [k, v] of rows) {
      this.ensure(7);
      d.setFont("helvetica", "normal");
      d.setTextColor(...MUTED);
      d.text(clean(k), this.margin, this.y);
      d.setFont("helvetica", "bold");
      d.setTextColor(...INK);
      d.text(clean(v), this.margin + this.width, this.y, { align: "right" });
      this.y += 7;
    }
    this.y += 2;
  }

  /** Tabla simple. `widths` en proporciones; las columnas con índice en `right` van a la derecha. */
  table(headers: string[], rows: string[][], widths: number[], right: number[] = []) {
    const d = this.doc;
    const total = widths.reduce((a, b) => a + b, 0);
    const cols = widths.map((w) => (w / total) * this.width);
    const xs = cols.map((_, i) => this.margin + cols.slice(0, i).reduce((a, b) => a + b, 0));

    const drawRow = (cells: string[], header: boolean) => {
      d.setFont("helvetica", header ? "bold" : "normal");
      d.setFontSize(header ? 9.5 : 10);
      d.setTextColor(...(header ? MUTED : INK));
      const wrapped = cells.map((c, i) => d.splitTextToSize(clean(c), cols[i] - 5) as string[]);
      const height = Math.max(...wrapped.map((w) => w.length)) * 4.6 + 2.4;
      this.ensure(height + 2);
      wrapped.forEach((lines, i) => {
        lines.forEach((line, j) => {
          // Las columnas a la derecha dejan aire antes de la siguiente.
          const x = right.includes(i) ? xs[i] + cols[i] - 4 : xs[i];
          d.text(line, x, this.y + j * 4.6, right.includes(i) ? { align: "right" } : undefined);
        });
      });
      this.y += height;
      d.setDrawColor(...LINE);
      d.line(this.margin, this.y - 3.2, this.margin + this.width, this.y - 3.2);
    };

    drawRow(headers, true);
    rows.forEach((r) => drawRow(r, false));
    this.y += 4;
  }

  /** Barra horizontal de avance (0 a 1; más de 1 se marca en ámbar). */
  bar(label: string, value: number, caption: string) {
    this.ensure(14);
    const d = this.doc;
    d.setFont("helvetica", "normal");
    d.setFontSize(10);
    d.setTextColor(...INK);
    d.text(clean(label), this.margin, this.y);
    d.setTextColor(...MUTED);
    d.text(clean(caption), this.margin + this.width, this.y, { align: "right" });
    this.y += 2.5;
    d.setFillColor(...LINE);
    d.roundedRect(this.margin, this.y, this.width, 2.6, 1.3, 1.3, "F");
    d.setFillColor(...(value > 1 ? AMBER_INK : FOREST));
    const w = Math.max(0, Math.min(1, value)) * this.width;
    if (w > 0) d.roundedRect(this.margin, this.y, w, 2.6, 1.3, 1.3, "F");
    this.y += 9;
  }

  space(mm = 4) {
    this.y += mm;
  }

  blob(): Blob {
    const pages = this.doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      this.doc.setPage(i);
      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(8.5);
      this.doc.setTextColor(...MUTED);
      this.doc.text(`Rumbo · página ${i} de ${pages}`, 105, 290, { align: "center" });
    }
    return this.doc.output("blob");
  }
}
