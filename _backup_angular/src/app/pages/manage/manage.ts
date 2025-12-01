import { Component, inject, signal } from '@angular/core';
import { AddonService, Addon } from '../../services/addon';
import { DatePipe } from '@angular/common';
import { LoadingService } from '../../services/loading.service';
import { DialogService } from '../../services/dialog.service';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideRefreshCw, lucideTrash2, lucideCheck, lucideX, lucideAlertTriangle, lucideArrowUpCircle } from '@ng-icons/lucide';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    HlmBadgeImports,
    HlmButton,
    HlmInputImports,
    HlmTableImports,
    BrnSelectImports,
    HlmSelectImports,
    HlmIconImports
  ],
  providers: [provideIcons({ lucideSearch, lucideRefreshCw, lucideTrash2, lucideCheck, lucideX, lucideAlertTriangle, lucideArrowUpCircle })],
  templateUrl: './manage.html',
  styleUrl: './manage.css'
})
export class ManageComponent {
  addonService = inject(AddonService);
  loadingService = inject(LoadingService);
  dialogService = inject(DialogService);
  toastService = inject(ToastService);

  // Track which addon is currently being operated on
  operatingAddonId = signal<string | null>(null);

  isAddonDisabled(addonId: string): boolean {
    const operatingId = this.operatingAddonId();
    return operatingId !== null && operatingId !== addonId;
  }

  getStatusIcon(status: Addon['status']): string {
    switch (status) {
      case 'enabled': return '✓';
      case 'disabled': return '○';
      case 'outdated': return '▲';
    }
  }

  getStatusClass(status: Addon['status']): string {
    switch (status) {
      case 'enabled': return 'status-enabled';
      case 'disabled': return 'status-disabled';
      case 'outdated': return 'status-outdated';
    }
  }

  switchVersion(id: string | string[] | undefined) {
    if (typeof id === 'string') {
      this.addonService.setActiveInstallation(id);
    }
  }

  async updateAddon(id: string) {
    this.operatingAddonId.set(id);
    this.loadingService.show('Updating addon...');
    try {
      await this.addonService.updateAddon(id);
      this.toastService.success('Addon updated successfully');
    } catch (error) {
      console.error('[Error] [Update Addon]', { addonId: id, error });
      this.toastService.error('Failed to update addon. Check the console for details.');
    } finally {
      this.loadingService.hide();
      this.operatingAddonId.set(null);
    }
  }

  async removeAddon(id: string) {
    const confirmed = await this.dialogService.confirm({
      title: 'Remove Addon',
      message: 'Are you sure you want to remove this addon? This action cannot be undone.',
      confirmText: 'Remove',
      type: 'danger'
    });

    if (!confirmed) return;

    this.operatingAddonId.set(id);
    this.loadingService.show('Removing addon...');
    try {
      await this.addonService.removeAddon(id);
      this.toastService.success('Addon removed successfully');
    } catch (error) {
      console.error('[Error] [Remove Addon]', { addonId: id, error });
      this.toastService.error('Failed to remove addon. Check permissions and try again.');
    } finally {
      this.loadingService.hide();
      this.operatingAddonId.set(null);
    }
  }

  async switchBranch(id: string, branch: string | string[] | undefined) {
    if (typeof branch !== 'string') return;

    this.operatingAddonId.set(id);
    this.loadingService.show(`Switching to branch ${branch}...`);
    try {
      await this.addonService.switchBranch(id, branch);
      this.toastService.success(`Switched to branch ${branch}`);
    } catch (error) {
      console.error('[Error] [Switch Branch]', { addonId: id, branch, error });
      this.toastService.error('Failed to switch branch. Check the addon repository.');
    } finally {
      this.loadingService.hide();
      this.operatingAddonId.set(null);
    }
  }
}
