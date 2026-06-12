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

| Token            | Effect                             | Cell syntax           |
| ---------------- | ---------------------------------- | --------------------- |
| `hover`          | Highlight the row under the cursor | — (whole table)       |
| `checkbox`       | 2-state clickable checkbox         | `[ ]` / `[x]`         |
| `tristate-box`   | 3-state box, cycles on click       | `[ ]` / `[/]` / `[x]` |
| `tristate-emoji` | 3-state emoji, cycles on click     | configurable trio     |

Clicking a control rewrites the token in the markdown source.

### Notes

- `checkbox` and `tristate-box` share the `[ ]` / `[x]` tokens, so they are
  **mutually exclusive** on the same table. `tristate-emoji` uses its own
  tokens and can be combined with either.
- The default emoji trio is `⬜ 🟨 ✅`, configurable in the plugin settings.
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
