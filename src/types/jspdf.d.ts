import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    internal: {
      pages: number[];
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      getEncryptor(objectId: number): (data: string) => string;
    };
  }
}