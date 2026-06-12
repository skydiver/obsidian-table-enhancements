import { PluginSettingTab, Setting } from 'obsidian';
import type TableEnhancementsPlugin from './main';
import { DEFAULT_SETTINGS, type EmojiTrio } from './types';

export class TableEnhancementsSettingTab extends PluginSettingTab {
  private plugin: TableEnhancementsPlugin;

  constructor(plugin: TableEnhancementsPlugin) {
    super(plugin.app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    this.containerEl.empty();

    new Setting(this.containerEl)
      .setName('Tristate emojis')
      .setDesc('Three emojis cycled by the tristate-emoji control, separated by spaces.')
      .addText((text) =>
        text
          .setPlaceholder(DEFAULT_SETTINGS.tristateEmojis.join(' '))
          .setValue(this.plugin.settings.tristateEmojis.join(' '))
          .onChange(async (value) => {
            const trio = parseTrio(value);
            if (!trio) return;
            this.plugin.settings.tristateEmojis = trio;
            await this.plugin.saveSettings();
          })
      );
  }
}

/** Parse exactly three space-separated emojis, or `null` when malformed. */
function parseTrio(value: string): EmojiTrio | null {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (parts.length !== 3) return null;
  return [parts[0], parts[1], parts[2]];
}
