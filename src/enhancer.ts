import {
  type ControlMatch,
  isChecked,
  matchControl,
  nextToken,
  tristateBoxState,
} from './checkbox';
import { hasCheckboxEnhancement } from './marker';
import type { EnhancementFlags, TableEnhancementsSettings } from './types';

/**
 * The bridge the core needs from whichever rendering context (reading view or
 * live preview) hosts the table: the enabled flags, plus a way to persist a
 * single cell's token change back to the markdown source.
 */
export interface TableSource {
  flags: EnhancementFlags;
  writeCell(bodyRow: number, col: number, oldToken: string, newToken: string): void | Promise<void>;
}

const ENHANCED_ATTR = 'teEnhanced';

/**
 * Apply the enabled enhancements to a rendered `<table>`.
 * Idempotent: a table is processed at most once per DOM instance.
 */
export function enhanceTable(
  table: HTMLTableElement,
  source: TableSource,
  settings: TableEnhancementsSettings
): void {
  if (table.dataset[ENHANCED_ATTR] === 'true') return;
  table.dataset[ENHANCED_ATTR] = 'true';

  const { flags } = source;
  if (flags.hover) table.classList.add('te-hover');

  if (!hasCheckboxEnhancement(flags)) return;

  const body = table.tBodies[0];
  if (!body) return;

  Array.from(body.rows).forEach((row, rowIndex) => {
    Array.from(row.cells).forEach((cell, colIndex) => {
      const match = matchControl(cell.textContent ?? '', flags, settings.tristateEmojis);
      if (!match) return;

      renderControl(cell, match, () => {
        const next = nextToken(match, settings.tristateEmojis);
        void source.writeCell(rowIndex, colIndex, match.token, next);
      });
    });
  });
}

/** Replace the leading token text in a cell with an interactive control. */
function renderControl(
  cell: HTMLTableCellElement,
  match: ControlMatch,
  onActivate: () => void
): void {
  const textNode = firstTextNode(cell);
  if (!textNode) return;

  const text = textNode.nodeValue ?? '';
  const index = text.indexOf(match.token);
  if (index === -1) return;

  const before = text.slice(0, index);
  const after = text.slice(index + match.token.length);

  const fragment = document.createDocumentFragment();
  if (before) fragment.appendChild(document.createTextNode(before));
  fragment.appendChild(buildControl(match, onActivate));
  if (after) fragment.appendChild(document.createTextNode(after));

  textNode.replaceWith(fragment);
}

function buildControl(match: ControlMatch, onActivate: () => void): HTMLElement {
  // Emoji control is a clickable text glyph.
  if (match.mode === 'tristate-emoji') {
    const span = document.createElement('span');
    span.classList.add('te-control', 'te-tristate-emoji');
    span.setAttribute('role', 'button');
    span.tabIndex = 0;
    span.textContent = match.token;

    const activate = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      onActivate();
    };
    span.addEventListener('click', activate);
    span.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') activate(event);
    });
    return span;
  }

  // Both 2-state and tristate-box use a native checkbox so they look identical;
  // the tristate "dash" state maps to the checkbox's indeterminate state.
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.classList.add('te-control', 'te-checkbox');

  if (match.mode === 'tristate-box') {
    const state = tristateBoxState(match.token);
    input.checked = state === 'check';
    input.indeterminate = state === 'dash';
  } else {
    input.checked = isChecked(match.token);
  }

  input.addEventListener('click', (event) => {
    // State is driven by the source rewrite + re-render, not the native toggle.
    event.preventDefault();
    event.stopPropagation();
    onActivate();
  });
  return input;
}

function firstTextNode(root: Node): Text | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  return walker.nextNode() as Text | null;
}
