import { Component, inject, signal, computed } from '@angular/core';
import { AddonService, CatalogueAddon } from '../../services/addon';
import { ElectronService } from '../../services/electron';
import { ToastService } from '../../services/toast.service';
import { FormsModule } from '@angular/forms';

import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideDownload, lucideExternalLink, lucideSearch, lucideCheck } from '@ng-icons/lucide';

@Component({
  selector: 'app-browse',
  standalone: true,
  imports: [FormsModule, HlmInputImports, HlmCardImports, HlmButton, HlmBadgeImports, HlmIconImports],
  providers: [provideIcons({ lucideDownload, lucideExternalLink, lucideSearch, lucideCheck })],
  templateUrl: './browse.html',
  styleUrl: './browse.css'
})
export class BrowseComponent {
  addonService = inject(AddonService);
  electronService = inject(ElectronService);
  toastService = inject(ToastService);

  searchTerm = signal('');
  selectedCategory = signal('All');
  manualUrl = signal('');
  isInstalling = signal(false);

  filteredAddons = computed(() => {
    const search = this.searchTerm().toLowerCase();
    const category = this.selectedCategory();

    return this.addonService.catalogue$().filter(addon => {
      const matchesSearch = addon.name.toLowerCase().includes(search) ||
        addon.description.toLowerCase().includes(search) ||
        addon.author.toLowerCase().includes(search);
      const matchesCategory = category === 'All' || addon.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  isInstalled(catalogueAddon: CatalogueAddon): boolean {
    return this.addonService.addons$().some(
      addon => addon.name === catalogueAddon.name
    );
  }

  async installFromUrl() {
    const url = this.manualUrl().trim();
    if (!url) return;

    // Determine if Git or ZIP
    const isGit = url.includes('github.com') && !url.includes('/archive/') && !url.endsWith('.zip');
    const method = isGit ? 'git' : 'zip';

    // Get addons folder from service
    const addonsFolder = this.addonService.addonsDirectory$();
    if (!addonsFolder) {
      this.toastService.error('Please set WoW directory in Settings first');
      return;
    }

    this.isInstalling.set(true);

    try {
      const result = await this.electronService.installAddon(url, addonsFolder, method);

      if (result.success && result.addonName) {
        this.toastService.success(`Successfully installed "${result.addonName}"`);
        this.manualUrl.set('');

        // Reload addons in Manage page
        await this.addonService.loadAddonsFromDisk();
      } else {
        // Provide user-friendly error messages based on error type
        console.error('[Error] [Install Addon]', { url, method, error: result.error });

        let errorMessage = 'Installation failed';
        if (result.error?.includes('ENOTFOUND') || result.error?.includes('network')) {
          errorMessage = 'Network error. Check your connection and try again.';
        } else if (result.error?.includes('git') || result.error?.includes('clone')) {
          errorMessage = 'Failed to clone repository. Check the URL and try again.';
        } else if (result.error?.includes('EACCES') || result.error?.includes('permission')) {
          errorMessage = 'Permission denied. Check directory permissions.';
        } else if (result.error?.includes('.toc')) {
          errorMessage = 'Invalid addon structure. Missing .toc file.';
        } else if (result.error) {
          errorMessage = `Installation failed: ${result.error}`;
        }

        this.toastService.error(errorMessage);
      }
    } catch (error) {
      console.error('[Error] [Install Addon]', { url, method, error });
      this.toastService.error('An unexpected error occurred. Check the console for details.');
    } finally {
      this.isInstalling.set(false);
    }
  }
}
