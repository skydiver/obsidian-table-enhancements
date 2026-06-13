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

    new Setting(this.containerEl)
      .setName('Live Preview support (experimental)')
      .setDesc(
        'Also enhance tables while editing in Live Preview. This relies on ' +
          "Obsidian's internal table rendering and may break with future Obsidian " +
          'updates. Reading view works regardless of this setting.'
      )
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings.livePreview).onChange(async (value) => {
          this.plugin.settings.livePreview = value;
          await this.plugin.saveSettings();
          // Add/remove the editor extension so the change applies without a restart.
          this.plugin.refreshEditorExtensions();
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
