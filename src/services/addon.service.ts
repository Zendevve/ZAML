import { Injectable, signal, WritableSignal, computed } from '@angular/core';
import { Addon, AddonStatus, Installation } from '../models/addon.model';

@Injectable({
  providedIn: 'root',
})
export class AddonService {
  installations: WritableSignal<Installation[]> = signal<Installation[]>([]);
  activeInstallationId = signal<string | null>(null);

  activeInstallation = computed(() => {
    const installations = this.installations();
    const activeId = this.activeInstallationId();
    return installations.find(inst => inst.id === activeId) ?? null;
  });

  addons = computed(() => this.activeInstallation()?.addons ?? []);

  settings = signal({
    autoUpdate: false,
    showBetaVersions: false,
    scanInterval: 60,
    theme: 'dark'
  });

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    const initialInstallations: Installation[] = [
      {
        id: 'wotlk',
        name: 'Wrath of the Lich King',
        path: 'D:/Games/WoW/3.3.5a',
        addons: [
          { id: '1', name: 'GearScore', author: 'Mirrikat45', version: '3.1.15', description: 'Calculates a score based on the item level of a player\'s gear.', repositoryUrl: 'https://github.com/user/GearScore', status: 'enabled', category: 'Utility', updateAvailable: '3.1.17' },
          {
            id: '2',
            name: 'Deadly Boss Mods',
            author: 'MysticalOS',
            version: '3.3.5',
            description: 'Raid and dungeon warnings.',
            repositoryUrl: 'https://github.com/user/DBM',
            status: 'enabled',
            category: 'Combat',
            subAddons: [
              { id: '2-1', name: 'DBM-Core', author: 'MysticalOS', version: '3.3.5', description: 'Core functionality', repositoryUrl: '', status: 'enabled', category: 'Combat' },
              { id: '2-2', name: 'DBM-Raids-WotLK', author: 'MysticalOS', version: '3.3.5', description: 'WotLK Raids', repositoryUrl: '', status: 'enabled', category: 'Combat' }
            ]
          },
          { id: '3', name: 'QuestHelper', author: 'Zorb', version: '1.4.1', description: 'Quest objective tracker and route optimizer.', repositoryUrl: 'https://github.com/user/QuestHelper', status: 'disabled', category: 'Questing', currentBranch: 'master', availableBranches: ['master', 'dev', 'feature/new-ui'] }
        ]
      },
      {
        id: 'cata',
        name: 'Cataclysm',
        path: 'D:/Games/WoW/4.3.4',
        addons: [
          { id: '4', name: 'Recount', author: 'Cryect', version: '4.3.0', description: 'Damage and healing meter.', repositoryUrl: 'https://github.com/user/Recount', status: 'enabled', category: 'Combat' },
          { id: '5', name: 'Bagnon', author: 'Tuller', version: '4.3.4', description: 'Single window display for your inventory and bank.', repositoryUrl: 'https://github.com/user/Bagnon', status: 'broken', category: 'UI', brokenReason: 'Incompatible API version' }
        ]
      },
      {
        id: 'mop',
        name: 'Mists of Pandaria',
        path: 'D:/Games/WoW/5.4.8',
        addons: [
          { id: '6', name: 'ElvUI', author: 'Elv', version: '6.02', description: 'A full UI replacement.', repositoryUrl: 'https://github.com/user/ElvUI', status: 'enabled', category: 'UI' },
          { id: '7', name: 'WeakAuras 2', author: 'Mirrormn', version: '2.0.8', description: 'Powerful and flexible framework for displaying graphics.', repositoryUrl: 'https://github.com/user/WeakAuras2', status: 'enabled', category: 'Combat' }
        ]
      }
    ];
    this.installations.set(initialInstallations);
    this.activeInstallationId.set(initialInstallations[0]?.id ?? null);
  }

  switchInstallation(id: string) {
    this.activeInstallationId.set(id);
  }

  private updateActiveInstallationAddons(updateFn: (addons: Addon[]) => Addon[]) {
    const activeId = this.activeInstallationId();
    if (!activeId) return;

    this.installations.update(installations =>
      installations.map(inst =>
        inst.id === activeId
          ? { ...inst, addons: updateFn(inst.addons) }
          : inst
      )
    );
  }

  addAddon(repoUrl: string) {
    const urlParts = repoUrl.replace(/\/$/, '').split('/');
    const repoName = urlParts.pop()?.replace('.git', '') || 'new-addon';
    const author = urlParts.pop() || 'Git User';

    const tempId = self.crypto.randomUUID();
    const tempAddon: Addon = {
      id: tempId,
      name: `Installing: ${repoName}`,
      author: author,
      version: '0.0.0',
      description: `Automating installation from ${repoUrl}`,
      repositoryUrl: repoUrl,
      status: 'installing',
      category: 'Utility',
      installProgress: 0,
    };

    this.updateActiveInstallationAddons(addons => [...addons, tempAddon]);

    const installInterval = setInterval(() => {
      let isComplete = false;
      this.updateActiveInstallationAddons(addons =>
        addons.map(a => {
          if (a.id === tempId && a.installProgress !== undefined && a.installProgress < 100) {
            return { ...a, installProgress: a.installProgress + 10 };
          }
          if (a.id === tempId && a.installProgress !== undefined && a.installProgress >= 100) {
            isComplete = true;
          }
          return a;
        })
      );

      if (isComplete) {
        clearInterval(installInterval);
        const finalName = repoName.replace(/-main$/, '').replace(/-master$/, '');
        const newAddon: Addon = {
          id: tempId,
          name: finalName,
          author: author,
          version: '1.0.0',
          description: `A newly installed addon: ${finalName}`,
          repositoryUrl: repoUrl,
          status: 'disabled',
          category: 'Utility'
        };
        this.updateActiveInstallationAddons(addons => addons.map(a => a.id === tempId ? newAddon : a));
      }
    }, 300);
  }

  toggleStatus(id: string) {
    this.updateActiveInstallationAddons(addons =>
      addons.map(addon =>
        addon.id === id
          ? { ...addon, status: addon.status === 'enabled' ? 'disabled' : 'enabled' }
          : addon
      )
    );
  }

  updateAddonCategory(id: string, category: string) {
    this.updateActiveInstallationAddons(addons =>
      addons.map(addon =>
        addon.id === id ? { ...addon, category } : addon
      )
    );
  }

  switchBranch(id: string, branch: string) {
    this.updateActiveInstallationAddons(addons =>
      addons.map(addon =>
        addon.id === id ? { ...addon, currentBranch: branch, version: `${addon.version.split('-')[0]}-${branch}` } : addon
      )
    );
  }

  updateAddon(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.updateActiveInstallationAddons(addons =>
          addons.map(addon =>
            addon.id === id && addon.updateAvailable
              ? { ...addon, version: addon.updateAvailable, updateAvailable: undefined, status: 'enabled' }
              : addon
          )
        );
        resolve();
      }, 1000);
    });
  }

  repairAddon(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.updateActiveInstallationAddons(addons =>
          addons.map(addon =>
            addon.id === id ? { ...addon, status: 'enabled', brokenReason: undefined } : addon
          )
        );
        resolve();
      }, 1500);
    });
  }

  deleteAddon(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        this.updateActiveInstallationAddons(addons => addons.filter(addon => addon.id !== id));
        resolve();
      }, 700);
    });
  }

  bulkEnable(ids: Set<string>) {
    this.updateActiveInstallationAddons(addons =>
      addons.map(addon =>
        ids.has(addon.id) && addon.status !== 'installing' && addon.status !== 'broken'
          ? { ...addon, status: 'enabled' }
          : addon
      )
    );
  }

  bulkDisable(ids: Set<string>) {
    this.updateActiveInstallationAddons(addons =>
      addons.map(addon =>
        ids.has(addon.id) && addon.status !== 'installing' && addon.status !== 'broken'
          ? { ...addon, status: 'disabled' }
          : addon
      )
    );
  }

  bulkDelete(ids: Set<string>) {
    this.updateActiveInstallationAddons(addons => addons.filter(addon => !ids.has(addon.id)));
  }
  exportAddons(): string {
    return JSON.stringify(this.addons(), null, 2);
  }

  importAddons(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (Array.isArray(imported)) {
        const activeId = this.activeInstallationId();
        if (activeId) {
          this.installations.update(insts => insts.map(inst => {
            if (inst.id === activeId) {
              return { ...inst, addons: imported };
            }
            return inst;
          }));
          return true;
        }
      }
    } catch (e) {
      console.error('Failed to import addons', e);
    }
    return false;
  }

  updateSetting(key: string, value: any) {
    this.settings.update(s => ({ ...s, [key]: value }));
  }
}
