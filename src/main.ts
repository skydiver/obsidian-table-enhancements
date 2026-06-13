import { Plugin } from 'obsidian';
import { livePreviewEnhancements } from './live-preview';
import { processReadingViewTables } from './reading-view';
import { TableEnhancementsSettingTab } from './settings';
import { DEFAULT_SETTINGS, type TableEnhancementsSettings } from './types';

export default class TableEnhancementsPlugin extends Plugin {
  settings!: TableEnhancementsSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TableEnhancementsSettingTab(this));

    this.registerMarkdownPostProcessor((el, ctx) => {
      processReadingViewTables(this.app, this.settings, el, ctx);
    });

    this.registerEditorExtension(livePreviewEnhancements(() => this.settings));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
