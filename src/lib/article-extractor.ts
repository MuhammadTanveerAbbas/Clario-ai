import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

function normalizeText(text: string): string {
  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function textFromElement(element: Element): string {
  const block = new Set(["P", "DIV", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BR", "ARTICLE", "MAIN"]);
  const parts: string[] = [];

  function walk(node: Node): void {
    if (node.nodeType === 3) {
      parts.push(node.textContent ?? "");
      return;
    }
    if (node.nodeType !== 1) return;
    const el = node as Element;
    if (["SCRIPT", "STYLE", "NOSCRIPT", "NAV", "FOOTER", "HEADER", "FORM", "ASIDE"].includes(el.tagName)) return;
    if (block.has(el.tagName)) parts.push("\n");
    for (const child of Array.from(el.childNodes)) walk(child);
    if (block.has(el.tagName)) parts.push("\n");
  }

  walk(element);
  return normalizeText(parts.join(""));
}

function fallbackExtract(doc: Document): string {
  const candidates = [
    doc.querySelector("article"),
    doc.querySelector("main"),
    ...Array.from(doc.querySelectorAll("div")).filter((node) =>
      /(?:content|post|article|entry|story|body)/i.test(`${node.className} ${node.id}`)
    ),
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const text = textFromElement(candidate);
    if (text.length >= 100) return text;
  }
  return "";
}

export function extractReadableArticle(html: string): { title: string; text: string } | null {
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const rawTitle =
    doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
    doc.querySelector("title")?.textContent ||
    "";
  const title = normalizeText(rawTitle);

  let text = "";
  try {
    const parsed = new Readability(doc.cloneNode(true) as Document).parse();
    if (parsed?.textContent) text = normalizeText(parsed.textContent);
  } catch {
    text = "";
  }

  if (text.length < 100) text = fallbackExtract(doc);
  if (text.length < 100) return null;

  return { title, text };
}
