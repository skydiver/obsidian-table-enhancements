import { MarkdownRenderer, PluginSettingTab, Setting } from 'obsidian';
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

    this.renderHelp(this.containerEl);
  }

  /** A short "how it works" reference: the marker, its tokens, and cell syntax. */
  private renderHelp(container: HTMLElement): void {
    container.createEl('hr', { cls: 'te-help-divider' });

    new Setting(container).setName('How it works').setHeading();

    const box = container.createDiv({ cls: 'te-help' });

    box.createEl('p', {
      text:
        'Enhancements are opt-in per table. Add a marker comment on the line ' +
        'directly above a table, with a blank line between the marker and the ' +
        'table. Tables without a marker are left untouched.',
    });

    box.createEl('pre').createEl('code', { text: '%% table-enhance hover checkbox %%' });

    // Render the example as a real table so it reads as a table, not ASCII.
    const example = box.createDiv({ cls: 'te-help-table markdown-rendered' });
    void MarkdownRenderer.render(
      this.plugin.app,
      '| Task | Done |\n| ---- | ---- |\n| Ship plugin | [ ] |\n| Write docs | [x] |',
      example,
      '',
      this.plugin
    );

    box.createEl('p', { text: 'The marker lists which features apply:' });

    const list = box.createEl('ul');
    const addToken = (token: string, description: string) => {
      const item = list.createEl('li');
      item.createEl('code', { text: token });
      item.appendText(` — ${description}`);
    };
    addToken('hover', 'highlight the row under the cursor');
    addToken('checkbox', '2-state checkbox: [ ] / [x]');
    addToken('tristate-box', '3-state box: [ ] / [/] / [x]');
    addToken('emoji', 'cycle a cell through the default emoji set');
    addToken('emoji:a,b,c', 'cycle a custom, comma-separated emoji set for that table');

    box.createEl('p', {
      text: 'Click a control to cycle it; the new value is written back to the note.',
    });
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
