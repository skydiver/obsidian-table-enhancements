import type { EnhancementFlags } from './types';

/**
 * Matches a marker comment such as `%% table-enhance hover checkbox %%`.
 * Capture group 1 holds the space-separated feature tokens.
 */
const MARKER_RE = /^%%\s*table-enhance\b([^%]*)%%$/;

const EMOJI_PREFIX = 'emoji:';

/** Split an inline emoji list (`a,b,c`) into individual emojis. */
function parseEmojiSequence(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

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

  const tokens = match[1].trim().split(/\s+/).filter(Boolean);

  const flags: EnhancementFlags = {
    hover: false,
    checkbox: false,
    tristateBox: false,
    emoji: false,
    emojiSequence: null,
  };
  let known = false;

  for (const token of tokens) {
    if (token === 'hover') {
      flags.hover = true;
      known = true;
    } else if (token === 'checkbox') {
      flags.checkbox = true;
      known = true;
    } else if (token === 'tristate-box') {
      flags.tristateBox = true;
      known = true;
    } else if (token === 'emoji') {
      flags.emoji = true;
      known = true;
    } else if (token.startsWith(EMOJI_PREFIX)) {
      flags.emoji = true;
      known = true;
      const sequence = parseEmojiSequence(token.slice(EMOJI_PREFIX.length));
      flags.emojiSequence = sequence.length > 0 ? sequence : null;
    }
  }

  return known ? flags : null;
}

/** True when at least one checkbox-style enhancement is enabled. */
export function hasCheckboxEnhancement(flags: EnhancementFlags): boolean {
  return flags.checkbox || flags.tristateBox || flags.emoji;
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
