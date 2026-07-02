// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PDFParse } = require("pdf-parse");

export async function parsePdfBuffer(data: Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText();
  await parser.destroy();
  return result.text.trim();
}
