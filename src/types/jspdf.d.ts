import 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    internal: {
      pageSize: {
        width: number;
        height: number;
        getWidth: () => number;
        getHeight: () => number;
      };
      pages: any[];
    };
  }
}