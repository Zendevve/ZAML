import { Injectable, signal, computed, inject } from '@angular/core';
import { ElectronService } from './electron';

export interface Addon {
  id: string;
  name: string;
  version: string;
  branch?: string;
  availableBranches?: string[];
  source: 'git' | 'manual';
  sourceUrl?: string;
  status: 'enabled' | 'disabled' | 'outdated';
  lastUpdated: Date;
  path?: string;
  author?: string;
  description?: string;
}

export interface CatalogueAddon {
  id: string;
  name: string;
  description: string;
  category: string;
  sourceUrl: string;
  latestVersion: string;
  author: string;
  downloads?: number;
}

export interface WowInstallation {
  id: string;              // Unique ID (timestamp-based)
  name: string;            // Display name ("Vanilla", "Burning Crusade", etc.)
  version: string;         // Version number ("1.12", "2.4.3", etc.)
  directory: string;       // Full path to Interface/AddOns folder
}

@Injectable({
  providedIn: 'root',
})
export class AddonService {
  private electronService = inject(ElectronService);

  // Multi-version state
  private installations = signal<WowInstallation[]>([]);
  private activeInstallationId = signal<string>('');
  private addons = signal<Addon[]>([]);

  readonly installations$ = this.installations.asReadonly();
  readonly activeInstallationId$ = this.activeInstallationId.asReadonly();
  readonly addons$ = this.addons.asReadonly();

  readonly activeInstallation = computed(() =>
    this.installations().find(i => i.id === this.activeInstallationId())
  );

  // For backward compatibility and ease of use
  readonly addonsDirectory$ = computed(() =>
    this.activeInstallation()?.directory || ''
  );

  readonly stats = computed(() => {
    const all = this.addons();
    return {
      total: all.length,
      enabled: all.filter(a => a.status === 'enabled').length,
      disabled: all.filter(a => a.status === 'disabled').length,
      outdated: all.filter(a => a.status === 'outdated').length,
    };
  });

  // Load real addons from disk
  async loadAddonsFromDisk() {
    const directory = this.addonsDirectory$();
    if (!directory) {
      // console.warn('No active installation set');
      this.addons.set([]);
      return;
    }

    const result = await this.electronService.scanAddonFolder(directory);

    if (!result.success || !result.addons) {
      console.error('Failed to scan addons:', result.error);
      this.addons.set([]);
      return;
    }

    // Convert scanned addons to our Addon interface
    const loadedAddons: Addon[] = result.addons.map((scanned: any) => ({
      id: scanned.name,
      name: scanned.title || scanned.name,
      version: scanned.version || 'Unknown',
      source: 'manual' as const,
      status: 'enabled' as const,
      lastUpdated: new Date(),
      path: scanned.path,
      author: scanned.author,
      description: scanned.description
    }));

    this.addons.set(loadedAddons);
  }

  // Multi-version installation management
  addInstallation(name: string, version: string, directory: string) {
    const newInstall: WowInstallation = {
      id: `install-${Date.now()}`,
      name,
      version,
      directory
    };

    this.installations.update(installs => [...installs, newInstall]);

    // Set as active if it's the first one
    if (this.installations().length === 1) {
      this.activeInstallationId.set(newInstall.id);
    }

    this.persistInstallations();
  }

  removeInstallation(id: string) {
    this.installations.update(installs => installs.filter(i => i.id !== id));

    // If we removed the active one, set a new active
    if (this.activeInstallationId() === id) {
      const remaining = this.installations();
      const newActive = remaining.length > 0 ? remaining[0].id : '';
      this.setActiveInstallation(newActive);
    }

    this.persistInstallations();
  }

  setActiveInstallation(id: string) {
    this.activeInstallationId.set(id);
    localStorage.setItem('zen-active-installation-id', id);
    this.loadAddonsFromDisk();
  }

  updateInstallationDirectory(id: string, newDirectory: string) {
    this.installations.update(installs =>
      installs.map(i => i.id === id ? { ...i, directory: newDirectory } : i)
    );
    this.persistInstallations();

    // Reload if it's the active one
    if (this.activeInstallationId() === id) {
      this.loadAddonsFromDisk();
    }
  }

  private persistInstallations() {
    localStorage.setItem('zen-wow-installations', JSON.stringify(this.installations()));
  }

  // Initialize from localStorage (with migration)
  initializeFromStorage() {
    // Load installations
    const savedInstallations = localStorage.getItem('zen-wow-installations');
    if (savedInstallations) {
      try {
        this.installations.set(JSON.parse(savedInstallations));
      } catch (e) {
        console.error('Failed to parse installations', e);
      }
    } else {
      // Migration: check for old single-directory setup
      const oldDirectory = localStorage.getItem('zen-addons-directory');
      if (oldDirectory) {
        this.addInstallation('WoW', '3.3.5', oldDirectory);
        localStorage.removeItem('zen-addons-directory');
      }
    }

    // Load active installation ID
    const savedActiveId = localStorage.getItem('zen-active-installation-id');
    if (savedActiveId && this.installations().some(i => i.id === savedActiveId)) {
      this.activeInstallationId.set(savedActiveId);
      this.loadAddonsFromDisk();
    } else if (this.installations().length > 0) {
      // Set first as active if none set
      this.setActiveInstallation(this.installations()[0].id);
    }
  }

  // Legacy method for backward compatibility / single directory setting
  setAddonsDirectory(path: string) {
    // If we have installations, update the active one
    const activeId = this.activeInstallationId();
    if (activeId) {
      this.updateInstallationDirectory(activeId, path);
    } else {
      // Create first installation
      this.addInstallation('WoW', '3.3.5', path);
      // addInstallation sets it active if it's the first one, but we persist inside addInstallation
    }
  }

  toggleStatus(id: string) {
    this.addons.update(addons =>
      addons.map(addon =>
        addon.id === id
          ? { ...addon, status: addon.status === 'enabled' ? 'disabled' : 'enabled' }
          : addon
      )
    );
  }

  async removeAddon(id: string) {
    const addon = this.addons().find(a => a.id === id);
    if (!addon?.path) return;

    const result = await this.electronService.deleteAddon(addon.path);
    if (result.success) {
      this.addons.update(addons => addons.filter(a => a.id !== id));
    }
  }

  async updateAddon(id: string) {
    const addon = this.addons().find(a => a.id === id);
    if (!addon?.path) return;

    if (addon.source === 'git') {
      const result = await this.electronService.gitPull(addon.path);
      if (result.success) {
        this.addons.update(addons =>
          addons.map(a =>
            a.id === id
              ? { ...a, status: 'enabled', lastUpdated: new Date() }
              : a
          )
        );
      }
    }
  }

  async switchBranch(id: string, branch: string) {
    const addon = this.addons().find(a => a.id === id);
    if (!addon?.path) return;

    const result = await this.electronService.gitCheckout(addon.path, branch);
    if (result.success) {
      this.addons.update(addons =>
        addons.map(a =>
          a.id === id
            ? { ...a, branch, lastUpdated: new Date() }
            : a
        )
      );
    }
  }

  // Catalogue
  private catalogue = signal<CatalogueAddon[]>([
    {
      id: 'cat-1',
      name: 'AtlasLoot Enhanced',
      description: 'Comprehensive loot browser for dungeons and raids',
      category: 'Database',
      sourceUrl: 'https://github.com/Hoizame/AtlasLootClassic',
      latestVersion: '3.0.5',
      author: 'Hoizame',
      downloads: 15000
    },
    {
      id: 'cat-2',
      name: 'TomTom',
      description: 'Coordinate waypoint tracking and navigation',
      category: 'Map & Minimap',
      sourceUrl: 'https://github.com/Ludovicus-Maior/TomTom-for-WoW-Classic',
      latestVersion: '1.6.2',
      author: 'Ludovicus',
      downloads: 12000
    },
    {
      id: 'cat-3',
      name: 'Skada Damage Meter',
      description: 'Lightweight damage and threat meter',
      category: 'Combat',
      sourceUrl: 'https://github.com/Skada-Damage-Meter/Skada',
      latestVersion: '1.8.71',
      author: 'Zarnivoop',
      downloads: 20000
    },
    {
      id: 'cat-4',
      name: 'Auctioneer',
      description: 'Advanced auction house tools and pricing data',
      category: 'Auction & Economy',
      sourceUrl: 'https://github.com/Norganna/Auctioneer',
      latestVersion: '5.21.7568',
      author: 'Norganna',
      downloads: 18000
    },
    {
      id: 'cat-5',
      name: 'Healbot',
      description: 'Click-to-heal raid frames for healers',
      category: 'Unit Frames',
      sourceUrl: 'https://github.com/Healbot/HealBot',
      latestVersion: '3.3.5.0',
      author: 'Strife',
      downloads: 14000
    },
    {
      id: 'cat-6',
      name: 'Gatherer',
      description: 'Track herb and ore locations on your map',
      category: 'Professions',
      sourceUrl: 'https://github.com/Norganna/Gatherer',
      latestVersion: '3.1.16',
      author: 'Norganna',
      downloads: 11000
    }
  ]);

  readonly catalogue$ = this.catalogue.asReadonly();
  readonly categories = computed(() => {
    const cats = new Set(this.catalogue().map(a => a.category));
    return ['All', ...Array.from(cats)];
  });

  async installFromCatalogue(catalogueAddon: CatalogueAddon) {
    const directory = this.addonsDirectory$();
    if (!directory) {
      console.error('No addons directory set');
      return;
    }

    const isGit = catalogueAddon.sourceUrl.includes('github.com');
    const method = isGit ? 'git' : 'zip';

    const result = await this.electronService.installAddon(
      catalogueAddon.sourceUrl,
      directory,
      method
    );

    if (result.success) {
      // Reload addons to include the newly installed one
      await this.loadAddonsFromDisk();
    }
  }
}
