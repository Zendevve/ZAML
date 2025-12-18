import type { WowInstallation } from '@/types/installation'
import type { ServerProfile } from '@/types/server-profile'

const STORAGE_KEYS = {
  INSTALLATIONS: 'wow-installations',
  ACTIVE_INSTALLATION: 'active-installation-id',
  CLEAN_WDB: 'clean-wdb-on-launch',
  SERVER_PROFILES: 'zen-server-profiles',
  ACTIVE_PROFILE: 'active-server-profile-id',
} as const

export const storageService = {
  /**
   * Get all WoW installations
   */
  getInstallations(): WowInstallation[] {
    const stored = localStorage.getItem(STORAGE_KEYS.INSTALLATIONS)
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  },

  /**
   * Save WoW installations
   */
  saveInstallations(installations: WowInstallation[]): void {
    localStorage.setItem(STORAGE_KEYS.INSTALLATIONS, JSON.stringify(installations))
  },

  /**
   * Add a new installation
   */
  addInstallation(installation: Omit<WowInstallation, 'id' | 'isActive'>): WowInstallation {
    const installations = this.getInstallations()
    const newInstallation: WowInstallation = {
      ...installation,
      id: crypto.randomUUID(),
      isActive: installations.length === 0, // First one is active by default
    }

    this.saveInstallations([...installations, newInstallation])
    return newInstallation
  },

  /**
   * Update an existing installation
   */
  updateInstallation(id: string, updates: Partial<WowInstallation>): void {
    const installations = this.getInstallations()
    const updated = installations.map(inst =>
      inst.id === id ? { ...inst, ...updates } : inst
    )
    this.saveInstallations(updated)
  },

  /**
   * Delete an installation
   */
  deleteInstallation(id: string): void {
    const installations = this.getInstallations()
    const filtered = installations.filter(inst => inst.id !== id)
    this.saveInstallations(filtered)
  },

  /**
   * Get active installation
   */
  getActiveInstallation(): WowInstallation | null {
    const installations = this.getInstallations()
    return installations.find(inst => inst.isActive) || installations[0] || null
  },

  /**
   * Set active installation
   */
  setActiveInstallation(id: string): void {
    const installations = this.getInstallations()
    const updated = installations.map(inst => ({
      ...inst,
      isActive: inst.id === id,
    }))
    this.saveInstallations(updated)
  },

  /**
   * Get WDB cleaning setting
   */
  getCleanWdb(): boolean {
    return localStorage.getItem(STORAGE_KEYS.CLEAN_WDB) === 'true'
  },

  /**
   * Set WDB cleaning setting
   */
  setCleanWdb(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.CLEAN_WDB, String(enabled))
  },

  // ===== Server Profiles (Virtual Profile System) =====

  /**
   * Get all server profiles
   */
  getServerProfiles(): ServerProfile[] {
    const stored = localStorage.getItem(STORAGE_KEYS.SERVER_PROFILES)
    if (!stored) return []

    try {
      return JSON.parse(stored)
    } catch {
      return []
    }
  },

  /**
   * Save all server profiles
   */
  saveServerProfiles(profiles: ServerProfile[]): void {
    localStorage.setItem(STORAGE_KEYS.SERVER_PROFILES, JSON.stringify(profiles))
  },

  /**
   * Add a new server profile
   */
  addServerProfile(profile: Omit<ServerProfile, 'id'>): ServerProfile {
    const profiles = this.getServerProfiles()
    const newProfile: ServerProfile = {
      ...profile,
      id: crypto.randomUUID(),
    }

    this.saveServerProfiles([...profiles, newProfile])
    return newProfile
  },

  /**
   * Update an existing server profile
   */
  updateServerProfile(id: string, updates: Partial<ServerProfile>): void {
    const profiles = this.getServerProfiles()
    const updated = profiles.map(profile =>
      profile.id === id ? { ...profile, ...updates } : profile
    )
    this.saveServerProfiles(updated)
  },

  /**
   * Delete a server profile
   */
  deleteServerProfile(id: string): void {
    const profiles = this.getServerProfiles()
    const filtered = profiles.filter(profile => profile.id !== id)
    this.saveServerProfiles(filtered)

    // Clear active profile if it was deleted
    if (this.getActiveServerProfileId() === id) {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE)
    }
  },

  /**
   * Get server profile by ID
   */
  getServerProfile(id: string): ServerProfile | null {
    const profiles = this.getServerProfiles()
    return profiles.find(p => p.id === id) || null
  },

  /**
   * Get profiles for a specific installation
   */
  getProfilesForInstallation(installationId: string): ServerProfile[] {
    const profiles = this.getServerProfiles()
    return profiles.filter(p => p.installationId === installationId)
  },

  /**
   * Get active server profile ID
   */
  getActiveServerProfileId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PROFILE)
  },

  /**
   * Set active server profile
   */
  setActiveServerProfile(id: string | null): void {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_PROFILE, id)
      // Update lastUsed timestamp
      this.updateServerProfile(id, { lastUsed: Date.now() })
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE)
    }
  },

  /**
   * Get the active server profile object
   */
  getActiveServerProfile(): ServerProfile | null {
    const id = this.getActiveServerProfileId()
    if (!id) return null
    return this.getServerProfile(id)
  },
}

