/**
 * Which checkbox control a cell renders. The cell content is self-describing,
 * so the mode is derived from the token, gated by the table's enabled flags.
 */
export type CheckboxMode = 'checkbox' | 'tristate-box' | 'tristate-emoji';

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
  /** 3-state emoji cycle, using the configured emoji trio. */
  tristateEmoji: boolean;
}

/** A configured trio of emojis for the `tristate-emoji` control. */
export type EmojiTrio = [string, string, string];

export interface TableEnhancementsSettings {
  /** Emojis cycled by the `tristate-emoji` control, in order. */
  tristateEmojis: EmojiTrio;
}

export const DEFAULT_SETTINGS: TableEnhancementsSettings = {
  tristateEmojis: ['⬜', '🟨', '✅'],
};
