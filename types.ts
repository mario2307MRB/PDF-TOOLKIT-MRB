
export interface PdfPage {
  id: string;
  docId: string;
  originalPageIndex: number;
  thumbnailUrl: string;
  docName: string;
  pageNumberInDoc: number;
  rotation: number;
}
