import type { EnhancementFlags } from './types';

/**
 * Matches a marker comment such as `%% table-enhance hover checkbox %%`.
 * Capture group 1 holds the space-separated feature tokens.
 */
const MARKER_RE = /^%%\s*table-enhance\b([^%]*)%%$/;

const KNOWN_TOKENS = ['hover', 'checkbox', 'tristate-box', 'tristate-emoji'] as const;

/**
 * Parse a single source line into enhancement flags.
 *
 * Returns `null` when the line is not a marker, or is a marker that names no
 * known feature (per design, features must be named explicitly).
 */
export function parseMarker(line: string | null | undefined): EnhancementFlags | null {
  if (!line) return null;

  const match = line.trim().match(MARKER_RE);
  if (!match) return null;

  const tokens = new Set(match[1].trim().split(/\s+/).filter(Boolean));
  if (!KNOWN_TOKENS.some((token) => tokens.has(token))) return null;

  return {
    hover: tokens.has('hover'),
    checkbox: tokens.has('checkbox'),
    tristateBox: tokens.has('tristate-box'),
    tristateEmoji: tokens.has('tristate-emoji'),
  };
}

/** True when at least one checkbox-style enhancement is enabled. */
export function hasCheckboxEnhancement(flags: EnhancementFlags): boolean {
  return flags.checkbox || flags.tristateBox || flags.tristateEmoji;
}

/**
 * Find the marker governing a table whose source block begins at `tableStartLine`.
 *
 * The marker must be the nearest non-blank line directly above the table's
 * header row (a `%%` comment may share the block, so we locate the header first).
 */
export function findMarkerForTable(
  lines: string[],
  tableStartLine: number
): EnhancementFlags | null {
  let headerLine = tableStartLine;
  while (headerLine < lines.length && !lines[headerLine].includes('|')) {
    headerLine++;
  }

  for (let i = headerLine - 1; i >= 0; i--) {
    if (lines[i].trim() === '') continue;
    return parseMarker(lines[i]);
  }

  return null;
}
