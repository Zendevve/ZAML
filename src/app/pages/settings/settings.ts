import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddonService } from '../../services/addon';
import { ElectronService } from '../../services/electron';

import { DialogService } from '../../services/dialog.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class SettingsComponent implements OnInit {
  addonService = inject(AddonService);
  electronService = inject(ElectronService);
  dialogService = inject(DialogService);
  toastService = inject(ToastService);

  // UI State
  showAddDialog = signal(false);
  selectedVersion = signal('');
  customDirectory = signal('');

  // Config State
  autoUpdate = signal(true);
  showBetaVersions = signal(false);
  theme = signal<'dark' | 'light'>('dark');

  expandedSections = signal<Set<string>>(new Set(['installations']));

  async ngOnInit() {
    this.addonService.initializeFromStorage();
  }

  toggleSection(section: string) {
    this.expandedSections.update(sections => {
      const newSections = new Set(sections);
      if (newSections.has(section)) {
        newSections.delete(section);
      } else {
        newSections.add(section);
      }
      return newSections;
    });
  }

  isSectionExpanded(section: string): boolean {
    return this.expandedSections().has(section);
  }

  // Installation Management
  showAddInstallationDialog() {
    this.showAddDialog.set(true);
    this.selectedVersion.set('');
    this.customDirectory.set('');
  }

  async browseDirectory() {
    const dir = await this.electronService.openDirectoryDialog();
    if (dir) {
      this.customDirectory.set(dir);
    }
  }

  addInstallation() {
    const versionValue = this.selectedVersion();
    const directory = this.customDirectory();

    if (!versionValue || !directory) return;

    const [name, version] = versionValue.split('|');
    this.addonService.addInstallation(name, version, directory);
    this.showAddDialog.set(false);
    this.toastService.success(`Added ${name} installation`);
  }

  setActive(id: string) {
    this.addonService.setActiveInstallation(id);
  }

  async editDirectory(id: string) {
    try {
      const dir = await this.electronService.openDirectoryDialog();
      if (dir) {
        this.addonService.updateInstallationDirectory(id, dir);
        this.toastService.success('Installation directory updated');
      }
    } catch (error) {
      console.error('[Error] [Edit Directory]', { installationId: id, error });
      this.toastService.error('Failed to update directory. Check permissions.');
    }
  }

  async removeInstallation(id: string) {
    const confirmed = await this.dialogService.confirm({
      title: 'Remove Installation',
      message: 'Are you sure you want to remove this installation? This will not delete the files on disk.',
      confirmText: 'Remove',
      type: 'danger'
    });

    if (confirmed) {
      try {
        this.addonService.removeInstallation(id);
        this.toastService.success('Installation removed');
      } catch (error) {
        console.error('[Error] [Remove Installation]', { installationId: id, error });
        this.toastService.error('Failed to remove installation.');
      }
    }
  }

  // Import/Export
  exportAddons() {
    const addons = this.addonService.addons$();
    const json = JSON.stringify(addons, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zen-addons-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importAddons(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const addons = JSON.parse(json);
        console.log('Imported addons:', addons);
        alert(`Successfully imported ${addons.length} addons`);
      } catch (error) {
        alert('Failed to import: Invalid file format');
      }
    };
    reader.readAsText(file);
  }
}
