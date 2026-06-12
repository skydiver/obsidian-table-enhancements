import type { CheckboxMode, EmojiTrio, EnhancementFlags } from './types';

/** A leading bracket token: `[ ]`, `[x]`, `[X]`, or `[/]`. */
const BRACKET_RE = /^(\[[ xX/]\])(.*)$/;

const TRISTATE_BOX_CYCLE = ['[ ]', '[/]', '[x]'] as const;

export interface ControlMatch {
  mode: CheckboxMode;
  /** The exact token as found in the source (used for write-back). */
  token: string;
  /** Text following the token, for display next to the control. */
  label: string;
}

function normalizeBracket(token: string): string {
  return token.toLowerCase();
}

export function isChecked(token: string): boolean {
  return normalizeBracket(token) === '[x]';
}

export function tristateBoxState(token: string): 'empty' | 'dash' | 'check' {
  const normalized = normalizeBracket(token);
  if (normalized === '[x]') return 'check';
  if (normalized === '[/]') return 'dash';
  return 'empty';
}

/**
 * Detect which control (if any) a cell should render, given the table's flags.
 *
 * `tristate-box` takes precedence over the 2-state `checkbox` for bracket
 * tokens when both are enabled (they are documented as mutually exclusive).
 * Emoji tokens occupy their own token space and coexist with a bracket mode.
 */
export function matchControl(
  cellText: string,
  flags: EnhancementFlags,
  emojis: EmojiTrio
): ControlMatch | null {
  const trimmed = cellText.replace(/^\s+/, '');

  const bracket = trimmed.match(BRACKET_RE);
  if (bracket && (flags.checkbox || flags.tristateBox)) {
    return {
      mode: flags.tristateBox ? 'tristate-box' : 'checkbox',
      token: bracket[1],
      label: bracket[2],
    };
  }

  if (flags.tristateEmoji) {
    const hit = emojis.find((emoji) => trimmed.startsWith(emoji));
    if (hit) {
      return { mode: 'tristate-emoji', token: hit, label: trimmed.slice(hit.length) };
    }
  }

  return null;
}

/** Compute the token a control should advance to when activated. */
export function nextToken(match: ControlMatch, emojis: EmojiTrio): string {
  switch (match.mode) {
    case 'checkbox':
      return isChecked(match.token) ? '[ ]' : '[x]';
    case 'tristate-box': {
      const index = TRISTATE_BOX_CYCLE.indexOf(
        normalizeBracket(match.token) as (typeof TRISTATE_BOX_CYCLE)[number]
      );
      return TRISTATE_BOX_CYCLE[(index + 1) % TRISTATE_BOX_CYCLE.length];
    }
    case 'tristate-emoji': {
      const index = emojis.indexOf(match.token);
      return emojis[(index + 1) % emojis.length];
    }
  }
}
