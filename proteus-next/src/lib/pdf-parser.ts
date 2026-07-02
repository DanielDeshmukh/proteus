// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export async function parsePdfBuffer(data: Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const result = await pdfParse(buffer);
  return result.text.trim();
}
