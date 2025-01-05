import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      pages: number[];
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
    };
    setFontSize(size: number): jsPDF;
    setFont(fontName: string, fontStyle?: string): jsPDF;
    getStringUnitWidth(text: string): number;
    text(text: string, x: number, y: number, options?: { align: string }): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    setPage(pageNumber: number): jsPDF;
    save(filename: string): void;
  }
}