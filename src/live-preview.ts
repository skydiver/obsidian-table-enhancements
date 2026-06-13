import type { Extension } from '@codemirror/state';
import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { enhanceTable, type TableSource } from './enhancer';
import { findMarkerForTable } from './marker';
import { bodyRowSourceLine, cellTokenOffset, findHeaderLine } from './table-source';
import type { TableEnhancementsSettings } from './types';

/**
 * Live-preview adapter: a CodeMirror view plugin that finds the tables Obsidian
 * renders inside the editor and runs the same {@link enhanceTable} core used by
 * reading view. The only differences from the reading-view adapter are how a
 * table maps to its source position ({@link EditorView.posAtDOM} instead of
 * `getSectionInfo`) and how a cell change is written back (a CodeMirror
 * transaction instead of `vault.process`, so the edit is undoable and never
 * desyncs the open buffer).
 */
export function livePreviewEnhancements(getSettings: () => TableEnhancementsSettings): Extension {
  return ViewPlugin.fromClass(
    class {
      private readonly observer: MutationObserver;
      private scheduled = false;

      constructor(private readonly view: EditorView) {
        // Obsidian re-renders its table widget on edits, replacing our enhanced
        // DOM; observing childList/subtree lets us re-apply after each rebuild,
        // including async renders that don't coincide with a CodeMirror update.
        this.observer = new MutationObserver(() => this.schedule());
        this.observer.observe(view.contentDOM, { childList: true, subtree: true });
        this.schedule();
      }

      update(update: ViewUpdate): void {
        if (update.docChanged || update.viewportChanged) this.schedule();
      }

      destroy(): void {
        this.observer.disconnect();
      }

      /** Coalesce bursts of updates into a single pass on the next frame. */
      private schedule(): void {
        if (this.scheduled) return;
        this.scheduled = true;
        const win = this.view.contentDOM.ownerDocument.defaultView ?? window;
        win.requestAnimationFrame(() => {
          this.scheduled = false;
          this.enhanceAll();
        });
      }

      private enhanceAll(): void {
        const settings = getSettings();
        // Detach while we mutate so our own DOM edits don't re-trigger the
        // observer; Obsidian's later re-renders are still caught on reconnect.
        this.observer.disconnect();
        try {
          this.view.contentDOM
            .querySelectorAll('table')
            .forEach((table) => this.enhanceOne(table, settings));
        } finally {
          this.observer.observe(this.view.contentDOM, { childList: true, subtree: true });
        }
      }

      private enhanceOne(table: HTMLTableElement, settings: TableEnhancementsSettings): void {
        const tableLine = this.sourceLineOf(table);
        if (tableLine === null) return;

        const lines = this.view.state.doc.toString().split('\n');
        const flags = findMarkerForTable(lines, tableLine);
        if (!flags) return;

        const source: TableSource = {
          flags,
          writeCell: (bodyRow, col, oldToken, newToken) => {
            // Re-resolve at click time so the line numbers never rely on state
            // captured at render time (the document may have changed since).
            const line = this.sourceLineOf(table);
            if (line === null) return;

            const doc = this.view.state.doc;
            const freshLines = doc.toString().split('\n');
            const headerLine = findHeaderLine(freshLines, line);
            const rowLine = bodyRowSourceLine(headerLine, bodyRow);
            const lineText = freshLines[rowLine];
            if (lineText === undefined) return;

            const within = cellTokenOffset(lineText, col, oldToken);
            if (within === null) return;

            const from = doc.line(rowLine + 1).from + within;
            this.view.dispatch({
              changes: { from, to: from + oldToken.length, insert: newToken },
            });
          },
        };

        enhanceTable(table, source, settings);
      }

      /** 0-based source line where `table`'s widget starts, or null if unmappable. */
      private sourceLineOf(table: HTMLTableElement): number | null {
        try {
          const pos = this.view.posAtDOM(table);
          return this.view.state.doc.lineAt(pos).number - 1;
        } catch {
          // posAtDOM throws when the node is briefly detached mid-render; the
          // next observer/update pass retries, so skipping this one is safe.
          return null;
        }
      }
    }
  );
}
