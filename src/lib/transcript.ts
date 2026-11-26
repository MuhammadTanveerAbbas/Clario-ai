function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

export function formatTranscriptParts(parts: string[]): string {
  const joined = parts
    .map((part) => decodeEntities(part).replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join(" ");

  if (!joined) return "";

  const sentences = joined.split(/(?<=[.!?])\s+/).filter(Boolean);
  const paragraphs: string[] = [];

  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(" "));
  }

  return paragraphs.join("\n\n");
}
