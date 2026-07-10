/** Quebra o nome do produto em linhas para o rotulo do frasco. */
export function wrapProductLabelLines(
  name: string,
  maxCharsPerLine = 16,
  maxLines = 3,
): string[] {
  const clean = name.trim().replace(/\s+/g, " ");
  if (!clean) return ["Produto"];

  const words = clean.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      continue;
    }

    if (current) lines.push(current);
    current = word.length > maxCharsPerLine ? `${word.slice(0, maxCharsPerLine - 1)}…` : word;
    if (lines.length >= maxLines - 1) break;
  }

  if (lines.length < maxLines && current) lines.push(current);

  if (lines.length === maxLines) {
    const usedWords = lines.join(" ").split(" ").length;
    if (usedWords < words.length) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.endsWith("…") ? last : `${last}…`;
    }
  }

  return lines.slice(0, maxLines);
}
