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
    // Resolved fresh on every access so a click never relies on the table's
    // line numbers captured at render time (they can drift between tables).
    const resolve = () => ctx.getSectionInfo(table) ?? ctx.getSectionInfo(el);

    const info = resolve();
    if (!info) return;

    const lines = info.text.split('\n');
    const flags = findMarkerForTable(lines, info.lineStart);
    if (!flags) return;

    const source: TableSource = {
      flags,
      writeCell: (bodyRow, col, oldToken, newToken) => {
        const fresh = resolve();
        if (!fresh) return Promise.resolve();

        const freshLines = fresh.text.split('\n');
        const headerLine = findHeaderLine(freshLines, fresh.lineStart);
        const lineIndex = bodyRowSourceLine(headerLine, bodyRow);
        return writeCell(app, ctx.sourcePath, lineIndex, col, oldToken, newToken);
      },
    };

    enhanceTable(table, source, settings);
  });
}

async function writeCell(
  app: App,
  sourcePath: string,
  lineIndex: number,
  col: number,
  oldToken: string,
  newToken: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(sourcePath);
  if (!(file instanceof TFile)) return;

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
