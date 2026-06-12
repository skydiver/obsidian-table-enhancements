# Table Enhancements

Opt-in enhancements for Obsidian markdown tables. Enable features **per table**
by adding a marker comment on the line directly above it — tables without a
marker are left untouched.

## Marker

```text
%% table-enhance hover checkbox %%
| Task        | Done |
| ----------- | ---- |
| Ship plugin | [ ]  |
| Write docs  | [x]  |
```

The marker names which features apply to the table that follows.

## Features

| Token          | Effect                             | Cell syntax           |
| -------------- | ---------------------------------- | --------------------- |
| `hover`        | Highlight the row under the cursor | — (whole table)       |
| `checkbox`     | 2-state clickable checkbox         | `[ ]` / `[x]`         |
| `tristate-box` | 3-state box, cycles on click       | `[ ]` / `[/]` / `[x]` |
| `emoji`        | N-state emoji, cycles on click     | one of the emoji set  |

Clicking a control rewrites the token in the markdown source.

### Emoji cycles (any number of states)

`emoji` cycles a cell through an ordered emoji set, so you can have as many
states as you like:

- `%% table-enhance emoji %%` — uses the default set from settings (`⬜ 🟨 ✅`).
- `%% table-enhance emoji:🔴,🟡,🟢 %%` — a custom per-table set (comma-separated;
  commas keep compound emojis intact).

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

## Status

Reading view is supported. Live Preview support is planned.

## Development

```bash
pnpm install
pnpm dev     # watch build
pnpm build   # type-check + production build
pnpm lint    # biome
```

## License

MIT
