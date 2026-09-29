import type { FieldRowData } from "./types";

function escapeCsvField(field: string): string {
  if (/[",\n]/.test(field)) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

export function buildCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(","));
  return lines.join("\n");
}

export function recordsToCsv(
  titleHeader: string,
  records: { title: string; fields: FieldRowData[] }[]
): string {
  if (records.length === 0) return "";
  const headers = [titleHeader, ...records[0].fields.map((f) => f.label)];
  const rows = records.map((r) => [r.title, ...r.fields.map((f) => f.value)]);
  return buildCsv(headers, rows);
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
