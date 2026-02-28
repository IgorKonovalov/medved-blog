const WORDS_PER_MINUTE = 200;

/** Strip markdown syntax to get plain text for word counting */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '') // headings
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/[*_~`]/g, '') // emphasis, code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // images
    .replace(/^[-*+]\s+/gm, '') // list markers
    .replace(/^\d+\.\s+/gm, '') // ordered list markers
    .replace(/^>\s+/gm, '') // blockquotes
    .replace(/---/g, '') // horizontal rules
    .trim();
}

export function getReadingTime(text: string): number {
  const plain = stripMarkdown(text);
  const words = plain.split(/\s+/).filter((w) => w.length > 0).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
