declare module "react-icons/fa6" {
  import { ComponentType } from "react";
  export const FaCopy: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "react-icons/md" {
  import { ComponentType } from "react";
  export const MdFileDownloadDone: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "react-icons/fi" {
  import { ComponentType } from "react";
  export const FiDownload: ComponentType<{ size?: number; color?: string; className?: string }>;
}

declare module "jspdf" {
  export default class jsPDF {
    constructor();
    setFont(font: string, style: string): void;
    setFontSize(size: number): void;
    text(text: string, x: number, y: number): void;
    splitTextToSize(text: string, maxWidth: number): string[];
    addPage(): void;
    save(filename: string): void;
  }
}
