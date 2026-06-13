import type { Extension } from '@codemirror/state';
import { Plugin } from 'obsidian';
import { livePreviewEnhancements } from './live-preview';
import { processReadingViewTables } from './reading-view';
import { TableEnhancementsSettingTab } from './settings';
import { DEFAULT_SETTINGS, type TableEnhancementsSettings } from './types';

export default class TableEnhancementsPlugin extends Plugin {
  settings!: TableEnhancementsSettings;

  // Mutated in place so toggling the setting can add/remove the Live Preview
  // extension; `updateOptions()` then reconfigures the open editors.
  private readonly editorExtensions: Extension[] = [];

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TableEnhancementsSettingTab(this));

    this.registerMarkdownPostProcessor((el, ctx) => {
      processReadingViewTables(this.app, this.settings, el, ctx);
    });

    this.registerEditorExtension(this.editorExtensions);
    this.refreshEditorExtensions();
  }

  /** Load or unload the Live Preview extension to match the current setting. */
  refreshEditorExtensions() {
    this.editorExtensions.length = 0;
    if (this.settings.livePreview) {
      this.editorExtensions.push(livePreviewEnhancements(() => this.settings));
    }
    this.app.workspace.updateOptions();
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
