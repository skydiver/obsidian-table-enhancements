# Table Enhancements

An Obsidian plugin that adds opt-in, per-table enhancements to markdown tables —
hover row highlighting and clickable checkboxes — enabled with a marker comment
on the line above each table. Tables without a marker are left untouched. Works
in both Reading view and Live Preview.

## Usage

Add a marker comment on the line directly above a table, with a blank line
between the marker and the table. The marker names which features apply:

```text
%% table-enhance hover checkbox %%

| Task        | Done |
| ----------- | ---- |
| Ship plugin | [ ]  |
| Write docs  | [x]  |
```

Clicking a control rewrites the token in the markdown source.

### Features

| Token          | Effect                             | Cell syntax           |
| -------------- | ---------------------------------- | --------------------- |
| `hover`        | Highlight the row under the cursor | — (whole table)       |
| `checkbox`     | 2-state clickable checkbox         | `[ ]` / `[x]`         |
| `tristate-box` | 3-state box, cycles on click       | `[ ]` / `[/]` / `[x]` |
| `emoji`        | N-state emoji, cycles on click     | one of the emoji set  |

### Emoji cycles (any number of states)

`emoji` cycles a cell through an ordered emoji set, so you can have as many
states as you like:

- `%% table-enhance emoji %%` — uses the default set from settings
  (`🔴 🟡 🟢`, configurable).
- `%% table-enhance emoji:⬜,🟨,✅ %%` — a custom per-table set that overrides the
  default (comma-separated; commas keep compound emojis intact).

Example with four states:

```text
%% table-enhance emoji:⬜,🟨,🟧,✅ %%

| Task   | Status |
| ------ | ------ |
| Design | ⬜     |
| Build  | 🟧     |
```

### Notes

- `checkbox` and `tristate-box` share the `[ ]` / `[x]` tokens, so they are
  **mutually exclusive** on the same table. `emoji` uses its own tokens and can
  be combined with either.
- The 2-state checkbox and the 3-state box render as the same native checkbox
  (the box's middle state uses the checkbox's `indeterminate` state).
- Checkbox cells should be a token optionally followed by plain text
  (e.g. `[ ] Buy milk`).

## Requirements

- Obsidian v1.4.0 or later

## Installation

### From Community Plugins

1. Open Settings → Community plugins → Browse
2. Search for "Table Enhancements"
3. Click Install, then Enable

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the latest release
2. Create a folder `.obsidian/plugins/table-enhancements/` in your vault
3. Copy the three files into that folder
4. Enable the plugin in Settings → Community plugins

## Development

```bash
pnpm install
pnpm run dev      # watch mode
pnpm run build    # production build
pnpm run lint     # check with biome
pnpm run lint:fix # auto-fix
```

To test locally, symlink the project folder into your vault:

```bash
ln -s /path/to/obsidian-table-enhancements /path/to/vault/.obsidian/plugins/table-enhancements
```

## License

MIT
