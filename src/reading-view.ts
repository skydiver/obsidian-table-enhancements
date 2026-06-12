import { type App, type MarkdownPostProcessorContext, TFile } from 'obsidian';
import { enhanceTable, type TableSource } from './enhancer';
import { findMarkerForTable } from './marker';
import { bodyRowSourceLine, findHeaderLine, replaceCellToken } from './table-source';
import type { TableEnhancementsSettings } from './types';

/**
 * Reading-view adapter: for each rendered table, resolve its marker from the
 * source, and (when enhanced) wire a {@link TableSource} that writes cell
 * changes back through the vault.
 */
export function processReadingViewTables(
  app: App,
  settings: TableEnhancementsSettings,
  el: HTMLElement,
  ctx: MarkdownPostProcessorContext
): void {
  const tables = el.querySelectorAll('table');

  tables.forEach((table) => {
    const info = ctx.getSectionInfo(table) ?? ctx.getSectionInfo(el);
    if (!info) return;

    const lines = info.text.split('\n');
    const flags = findMarkerForTable(lines, info.lineStart);
    if (!flags) return;

    const headerLine = findHeaderLine(lines, info.lineStart);
    const source: TableSource = {
      flags,
      writeCell: (bodyRow, col, oldToken, newToken) =>
        writeCell(app, ctx.sourcePath, headerLine, bodyRow, col, oldToken, newToken),
    };

    enhanceTable(table, source, settings);
  });
}

async function writeCell(
  app: App,
  sourcePath: string,
  headerLine: number,
  bodyRow: number,
  col: number,
  oldToken: string,
  newToken: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(sourcePath);
  if (!(file instanceof TFile)) return;

  const lineIndex = bodyRowSourceLine(headerLine, bodyRow);
  await app.vault.process(file, (data) => {
    const lines = data.split('\n');
    const line = lines[lineIndex];
    if (line === undefined) return data;

    const replaced = replaceCellToken(line, col, oldToken, newToken);
    if (replaced === null) return data;

    lines[lineIndex] = replaced;
    return lines.join('\n');
  });
}
