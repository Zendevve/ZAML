/**
 * Server Profile Types for Virtual Profile System
 *
 * Enables seamless switching between private servers by managing
 * connection strings (realmlist.wtf / Config.wtf) per installation.
 */

/** Supported expansion types matching WoW versions */
export type ExpansionType = '1.12' | '2.4.3' | '3.3.5' | '4.3.4' | '5.4.8' | 'retail' | 'classic';

/**
 * Server profile representing a private server connection
 */
export interface ServerProfile {
  /** Unique identifier */
  id: string;
  /** Display name (e.g., "Warmane - Icecrown") */
  name: string;
  /** Target expansion version */
  expansion: ExpansionType;
  /** Server login address (e.g., "logon.warmane.com") */
  connectionString: string;
  /** Links to an existing WowInstallation */
  installationId: string;
  /** Whether to use a custom patcher executable (Cataclysm+) */
  useCustomPatcher?: boolean;
  /** Path to custom patcher if required */
  customPatcherPath?: string;
  /** Optional port (defaults to 3724) */
  port?: number;
  /** When this profile was last used */
  lastUsed?: number;
  /** Optional icon URL or local path */
  iconUrl?: string;
}

/**
 * Connection file detection result
 */
export interface ConnectionFileInfo {
  /** Type of connection file found */
  type: 'realmlist' | 'config';
  /** Absolute path to the file */
  path: string;
  /** Locale folder if applicable (e.g., "enUS") */
  locale?: string;
  /** Current connection string value */
  currentValue?: string;
}

/**
 * Custom patcher detection result
 */
export interface PatcherInfo {
  /** Whether a custom patcher was found */
  found: boolean;
  /** Path to the patcher executable */
  path?: string;
  /** Type of patcher detected */
  type?: 'connection_patcher' | 'wow_patched' | 'arctium' | 'unknown';
}

/**
 * Result of injecting a server profile
 */
export interface ProfileInjectionResult {
  success: boolean;
  /** Files that were modified */
  modifiedFiles: string[];
  /** Any warnings (e.g., "Created new realmlist.wtf") */
  warnings?: string[];
  error?: string;
}
