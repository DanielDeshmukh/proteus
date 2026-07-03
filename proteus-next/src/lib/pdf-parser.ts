// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

// Set worker source to the bundled file
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export async function parsePdfBuffer(data: Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const uint8 = new Uint8Array(buffer);

  const doc = await pdfjsLib.getDocument({ data: uint8 }).promise;
  const textParts: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    textParts.push(pageText);
  }

  return textParts.join("\n\n").trim();
}
