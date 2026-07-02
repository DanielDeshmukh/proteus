import mammoth from "mammoth";

export async function parseDocxBuffer(data: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer: data });
  return result.value.trim();
}
