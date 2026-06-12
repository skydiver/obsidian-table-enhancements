import { PluginSettingTab, Setting } from 'obsidian';
import type TableEnhancementsPlugin from './main';
import { DEFAULT_SETTINGS, type EmojiSequence } from './types';

export class TableEnhancementsSettingTab extends PluginSettingTab {
  private plugin: TableEnhancementsPlugin;

  constructor(plugin: TableEnhancementsPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName('Default emoji cycle')
      .setDesc(
        'Emojis cycled by a bare `emoji` marker, in order, separated by spaces. ' +
          'A table can override this inline with `emoji:a,b,c`.'
      )
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.defaultEmojis.join(' '))
          .setValue(this.plugin.settings.defaultEmojis.join(' '))
          .onChange(async (value) => {
            const sequence = parseEmojiSequence(value);
            if (!sequence) return;
            this.plugin.settings.defaultEmojis = sequence;
            await this.plugin.saveSettings();
          })
      );
  }
}

/** Parse a space- or comma-separated emoji list (needs at least two), else `null`. */
function parseEmojiSequence(value: string): EmojiSequence | null {
  const parts = value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean);
  return parts.length >= 2 ? parts : null;
}
