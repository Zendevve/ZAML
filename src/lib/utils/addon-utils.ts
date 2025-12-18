/**
 * Utility functions extracted for testing.
 * These are copied from electron/main.ts to enable unit testing
 * without requiring Electron dependencies.
 */

/**
 * Map WoW interface version to version labels
 */
export function mapInterfaceToVersion(interfaceVersion: number): string[] {
  const versions: string[] = [];

  if (interfaceVersion >= 11200 && interfaceVersion < 20000) versions.push('1.12');
  if (interfaceVersion >= 20400 && interfaceVersion < 30000) versions.push('2.4.3');
  if (interfaceVersion >= 30300 && interfaceVersion < 40000) versions.push('3.3.5');
  if (interfaceVersion >= 40300 && interfaceVersion < 50000) versions.push('4.3.4');
  if (interfaceVersion >= 50400 && interfaceVersion < 100000) versions.push('5.4.8');
  if (interfaceVersion >= 110000) {
    versions.push('retail');
    versions.push('classic');
  }

  return versions;
}

/**
 * Parse GitHub URL to extract repo URL and branch
 */
export function parseGithubUrl(url: string): { repoUrl: string; branch?: string } {
  try {
    // Handle standard GitHub URLs with tree/branch
    // Format: https://github.com/user/repo/tree/branch/path...
    const treeMatch = url.match(/github\.com\/([^/]+)\/([^/]+)\/tree\/([^/]+)/);
    if (treeMatch) {
      const [, user, repo, branch] = treeMatch;
      return {
        repoUrl: `https://github.com/${user}/${repo}.git`,
        branch
      };
    }

    // Handle standard URLs without tree
    // Format: https://github.com/user/repo
    const repoMatch = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?$/);
    if (repoMatch) {
      const [, user, repo] = repoMatch;
      return {
        repoUrl: `https://github.com/${user}/${repo}.git`
      };
    }

    // Return original if not matched (might be other git host or raw git url)
    return { repoUrl: url };
  } catch {
    return { repoUrl: url };
  }
}

export interface ParsedTocData {
  title: string;
  version: string;
  author: string;
  description: string;
  interface?: number;
}

/**
 * Parse TOC file content and extract metadata
 */
export function parseTocContent(tocContent: string): ParsedTocData {
  const lines = tocContent.split('\n');
  const data: ParsedTocData = {
    title: 'Unknown',
    version: 'Unknown',
    author: 'Unknown',
    description: '',
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## Title:')) {
      data.title = trimmed.replace('## Title:', '').trim();
    } else if (trimmed.startsWith('## Version:')) {
      data.version = trimmed.replace('## Version:', '').trim();
    } else if (trimmed.startsWith('## Author:') || trimmed.startsWith('## Authors:')) {
      data.author = trimmed.replace(/^## Authors?:/, '').trim();
    } else if (trimmed.startsWith('## X-Author:') || trimmed.startsWith('## X-Authors:')) {
      if (data.author === 'Unknown') {
        data.author = trimmed.replace(/^## X-Authors?:/, '').trim();
      }
    } else if (trimmed.startsWith('## Notes:')) {
      data.description = trimmed.replace('## Notes:', '').trim();
    } else if (trimmed.startsWith('## Interface:')) {
      const interfaceStr = trimmed.replace('## Interface:', '').trim();
      const interfaceNum = parseInt(interfaceStr, 10);
      if (!isNaN(interfaceNum)) {
        data.interface = interfaceNum;
      }
    }
  }

  return data;
}

// ============================================
// Virtual Profile System Utilities
// ============================================

import type { ExpansionType } from '@/types/server-profile';

/**
 * Get possible realmlist.wtf file paths based on expansion
 * Returns array of relative paths from WoW installation root
 */
export function getRealmlistPaths(expansion: ExpansionType): string[] {
  switch (expansion) {
    case '1.12':
      // Vanilla: root or Data/{Locale}
      return [
        'realmlist.wtf',
        'Data/enUS/realmlist.wtf',
        'Data/enGB/realmlist.wtf',
        'Data/deDE/realmlist.wtf',
        'Data/frFR/realmlist.wtf',
        'Data/esES/realmlist.wtf',
        'Data/ruRU/realmlist.wtf',
      ];
    case '2.4.3':
    case '3.3.5':
    case '4.3.4':
      // TBC/WotLK/Cata: Data/{Locale}
      return [
        'Data/enUS/realmlist.wtf',
        'Data/enGB/realmlist.wtf',
        'Data/deDE/realmlist.wtf',
        'Data/frFR/realmlist.wtf',
        'Data/esES/realmlist.wtf',
        'Data/ruRU/realmlist.wtf',
      ];
    case '5.4.8':
      // MoP: Uses Config.wtf instead
      return [];
    default:
      return [];
  }
}

/**
 * Get Config.wtf path for MoP+ clients
 */
export function getConfigWtfPath(): string {
  return 'WTF/Config.wtf';
}

/**
 * Parse realmlist.wtf content and extract current server address
 */
export function parseRealmlist(content: string): string | null {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith('set realmlist')) {
      // Format: set realmlist logon.example.com
      const match = line.match(/set\s+realmlist\s+["']?([^"'\r\n]+)["']?/i);
      if (match) {
        return match[1].trim();
      }
    }
  }
  return null;
}

/**
 * Inject server address into realmlist.wtf content
 * Replaces existing "set realmlist" line or appends if not found
 */
export function injectRealmlist(content: string, serverAddress: string): string {
  const lines = content.split('\n');
  let found = false;

  const newLines = lines.map(line => {
    const trimmed = line.trim().toLowerCase();
    if (trimmed.startsWith('set realmlist')) {
      found = true;
      return `set realmlist ${serverAddress}`;
    }
    return line;
  });

  if (!found) {
    newLines.push(`set realmlist ${serverAddress}`);
  }

  return newLines.join('\n');
}

/**
 * Parse Config.wtf content into key-value pairs
 * Handles: SET portal "logon.example.com"
 */
export function parseConfigWtf(content: string): Record<string, string> {
  const config: Record<string, string> = {};
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    // Match: SET varName "value" or SET varName value
    const match = trimmed.match(/^SET\s+(\w+)\s+["']?([^"'\r\n]*)["']?$/i);
    if (match) {
      const [, key, value] = match;
      config[key] = value.trim();
    }
  }

  return config;
}

/**
 * Inject or update a value in Config.wtf content
 * Properly replaces existing key or appends if not found
 */
export function injectConfigWtf(content: string, key: string, value: string): string {
  const lines = content.split('\n');
  let found = false;
  const keyLower = key.toLowerCase();

  const newLines = lines.map(line => {
    const trimmed = line.trim();
    const match = trimmed.match(/^SET\s+(\w+)\s+/i);
    if (match && match[1].toLowerCase() === keyLower) {
      found = true;
      return `SET ${key} "${value}"`;
    }
    return line;
  });

  if (!found) {
    newLines.push(`SET ${key} "${value}"`);
  }

  return newLines.join('\n');
}

/**
 * Get the connection key used in Config.wtf based on expansion
 * MoP uses "portal", some use "realmName"
 */
export function getConfigConnectionKey(expansion: ExpansionType): string {
  switch (expansion) {
    case '5.4.8':
      return 'portal';
    default:
      return 'portal';
  }
}

/**
 * Known custom patcher executable names
 */
export const KNOWN_PATCHERS = [
  'connection_patcher.exe',
  'WoW_Patched.exe',
  'Wow-64.exe',
  'arctium_launcher.exe',
] as const;

/**
 * Detect locale folders in Data directory
 * Returns array of found locale codes (e.g., ['enUS', 'enGB'])
 */
export function isValidLocaleFolder(folderName: string): boolean {
  // Locale format: two lowercase letters + two uppercase letters
  return /^[a-z]{2}[A-Z]{2}$/.test(folderName);
}

/**
 * Sanitize addon folder name by removing common GitHub suffixes
 */
export function sanitizeAddonFolderName(folderName: string): string {
  // Remove common GitHub suffixes: -master, -main, -develop, -dev
  return folderName
    .replace(/-master$/i, '')
    .replace(/-main$/i, '')
    .replace(/-develop$/i, '')
    .replace(/-dev$/i, '');
}

