export function parseBoolean(value: unknown, fallback = false) {
  if (typeof value !== "string") return fallback;
  const clean = value.trim().toLowerCase();
  if (["true", "1", "sim", "yes", "y"].includes(clean)) return true;
  if (["false", "0", "nao", "não", "no", "n"].includes(clean)) return false;
  return fallback;
}

export function parseCsv(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim());

  const rows = lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? "";
    });
    return row;
  });

  return { headers, rows };
}
