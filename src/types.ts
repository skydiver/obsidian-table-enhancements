/**
 * Which control a cell renders. The cell content is self-describing, so the
 * mode is derived from the token, gated by the table's enabled flags.
 */
export type CheckboxMode = 'checkbox' | 'tristate-box' | 'emoji';

/** An ordered list of emojis cycled by the `emoji` control. */
export type EmojiSequence = string[];

/**
 * The set of enhancements enabled for a single table, parsed from its marker
 * comment (e.g. `%% table-enhance hover checkbox %%`).
 */
export interface EnhancementFlags {
  hover: boolean;
  /** 2-state checkbox: `[ ]` / `[x]`. */
  checkbox: boolean;
  /** 3-state box: `[ ]` / `[/]` / `[x]`. */
  tristateBox: boolean;
  /** N-state emoji cycle. */
  emoji: boolean;
  /**
   * Per-table emoji sequence from `emoji:a,b,c`, or `null` when the marker is a
   * bare `emoji` (falls back to the settings default).
   */
  emojiSequence: EmojiSequence | null;
}

export interface TableEnhancementsSettings {
  /** Default emoji cycle used by a bare `emoji` marker, in order. */
  defaultEmojis: EmojiSequence;
}

export const DEFAULT_SETTINGS: TableEnhancementsSettings = {
  defaultEmojis: ['🔴', '🟡', '🟢'],
};
