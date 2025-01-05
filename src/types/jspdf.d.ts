import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
    internal: {
      getNumberOfPages: () => number;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
    };
  }
}