import pdf from "pdf-parse";

export async function parsePdfBuffer(data: Buffer): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const result = await pdf(buffer);
  return result.text.trim();
}
