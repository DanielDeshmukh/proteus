import { extractText } from "unpdf";

export async function parsePdfBuffer(data: Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const uint8 = new Uint8Array(buffer);

  const result = await extractText(uint8);
  const pages = result.text as unknown;
  if (Array.isArray(pages)) return pages.join("\n\n").trim();
  return String(pages).trim();
}
