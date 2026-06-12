/**
 * Pure helpers that map a rendered table cell back to its position in the
 * markdown source, and rewrite a single cell's leading token in place.
 *
 * Assumes Obsidian-normalized tables (rows bounded by leading and trailing
 * pipes), which Obsidian produces automatically when editing a table.
 */

export interface CellRange {
  start: number;
  end: number;
}

/** Indices of unescaped `|` characters in a row line. */
function findPipeIndices(line: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < line.length; i++) {
    if (line[i] === '|' && line[i - 1] !== '\\') indices.push(i);
  }
  return indices;
}

/**
 * Content ranges (exclusive of the surrounding pipes) for each cell in a row.
 * The Nth range corresponds to the Nth rendered `<td>`/`<th>`.
 */
export function getCellRanges(line: string): CellRange[] {
  const pipes = findPipeIndices(line);
  const ranges: CellRange[] = [];
  for (let i = 0; i < pipes.length - 1; i++) {
    ranges.push({ start: pipes[i] + 1, end: pipes[i + 1] });
  }
  return ranges;
}

/**
 * The source line index of a body row, given the header line index.
 * Layout: header, delimiter (`|---|`), then body rows.
 */
export function bodyRowSourceLine(headerLine: number, bodyRowIndex: number): number {
  return headerLine + 2 + bodyRowIndex;
}

/** First line at or after `tableStartLine` that looks like a table row. */
export function findHeaderLine(lines: string[], tableStartLine: number): number {
  let i = tableStartLine;
  while (i < lines.length && !lines[i].includes('|')) i++;
  return i;
}

/**
 * Replace the first occurrence of `oldToken` inside cell `colIndex` of `line`.
 *
 * Returns the rewritten line, or `null` when the cell does not exist or no
 * longer contains `oldToken` (a guard against stale state after external edits).
 */
export function replaceCellToken(
  line: string,
  colIndex: number,
  oldToken: string,
  newToken: string
): string | null {
  const range = getCellRanges(line)[colIndex];
  if (!range) return null;

  const cell = line.slice(range.start, range.end);
  const at = cell.indexOf(oldToken);
  if (at === -1) return null;

  const newCell = cell.slice(0, at) + newToken + cell.slice(at + oldToken.length);
  return line.slice(0, range.start) + newCell + line.slice(range.end);
}
