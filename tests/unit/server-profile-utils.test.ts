import { describe, it, expect } from 'vitest';
import {
  getRealmlistPaths,
  getConfigWtfPath,
  parseRealmlist,
  injectRealmlist,
  parseConfigWtf,
  injectConfigWtf,
  getConfigConnectionKey,
  isValidLocaleFolder,
  sanitizeAddonFolderName
} from '../../src/lib/utils/addon-utils';

describe('getRealmlistPaths', () => {
  it('returns root and locale paths for Vanilla', () => {
    const paths = getRealmlistPaths('1.12');
    expect(paths).toContain('realmlist.wtf');
    expect(paths).toContain('Data/enUS/realmlist.wtf');
    expect(paths).toContain('Data/enGB/realmlist.wtf');
  });

  it('returns only locale paths for TBC/WotLK/Cata', () => {
    const tbcPaths = getRealmlistPaths('2.4.3');
    expect(tbcPaths).not.toContain('realmlist.wtf');
    expect(tbcPaths).toContain('Data/enUS/realmlist.wtf');

    const wotlkPaths = getRealmlistPaths('3.3.5');
    expect(wotlkPaths).toContain('Data/enUS/realmlist.wtf');

    const cataPaths = getRealmlistPaths('4.3.4');
    expect(cataPaths).toContain('Data/enUS/realmlist.wtf');
  });

  it('returns empty array for MoP (uses Config.wtf)', () => {
    const paths = getRealmlistPaths('5.4.8');
    expect(paths).toEqual([]);
  });
});

describe('getConfigWtfPath', () => {
  it('returns WTF/Config.wtf path', () => {
    expect(getConfigWtfPath()).toBe('WTF/Config.wtf');
  });
});

describe('parseRealmlist', () => {
  it('extracts server address from realmlist.wtf content', () => {
    const content = `set realmlist logon.warmane.com
set patchlist wow.example.com`;
    expect(parseRealmlist(content)).toBe('logon.warmane.com');
  });

  it('handles quoted values', () => {
    const content = `set realmlist "logon.turtlewow.org"`;
    expect(parseRealmlist(content)).toBe('logon.turtlewow.org');
  });

  it('returns null if no realmlist found', () => {
    const content = `set patchlist example.com`;
    expect(parseRealmlist(content)).toBeNull();
  });

  it('is case insensitive', () => {
    const content = `SET REALMLIST logon.example.com`;
    expect(parseRealmlist(content)).toBe('logon.example.com');
  });
});

describe('injectRealmlist', () => {
  it('replaces existing realmlist line', () => {
    const content = `set realmlist old.server.com
set patchlist patch.server.com`;
    const result = injectRealmlist(content, 'new.server.com');
    expect(result).toContain('set realmlist new.server.com');
    expect(result).not.toContain('old.server.com');
  });

  it('appends realmlist if not found', () => {
    const content = `set patchlist patch.server.com`;
    const result = injectRealmlist(content, 'new.server.com');
    expect(result).toContain('set realmlist new.server.com');
  });

  it('preserves other lines', () => {
    const content = `set patchlist patch.server.com
set realmlist old.server.com
# comment`;
    const result = injectRealmlist(content, 'new.server.com');
    expect(result).toContain('set patchlist patch.server.com');
    expect(result).toContain('# comment');
  });
});

describe('parseConfigWtf', () => {
  it('parses SET key value pairs', () => {
    const content = `SET portal "logon.stormforge.gg"
SET realmName "Mistblade"
SET locale "enUS"`;
    const config = parseConfigWtf(content);
    expect(config.portal).toBe('logon.stormforge.gg');
    expect(config.realmName).toBe('Mistblade');
    expect(config.locale).toBe('enUS');
  });

  it('handles unquoted values', () => {
    const content = `SET portal logon.example.com`;
    const config = parseConfigWtf(content);
    expect(config.portal).toBe('logon.example.com');
  });

  it('ignores malformed lines', () => {
    const content = `SET portal "valid.com"
invalid line here
SET another "value"`;
    const config = parseConfigWtf(content);
    expect(config.portal).toBe('valid.com');
    expect(config.another).toBe('value');
    expect(Object.keys(config).length).toBe(2);
  });
});

describe('injectConfigWtf', () => {
  it('replaces existing key', () => {
    const content = `SET portal "old.server.com"
SET locale "enUS"`;
    const result = injectConfigWtf(content, 'portal', 'new.server.com');
    expect(result).toContain('SET portal "new.server.com"');
    expect(result).not.toContain('old.server.com');
  });

  it('appends key if not found', () => {
    const content = `SET locale "enUS"`;
    const result = injectConfigWtf(content, 'portal', 'new.server.com');
    expect(result).toContain('SET portal "new.server.com"');
  });

  it('is case insensitive for key matching', () => {
    const content = `SET PORTAL "old.server.com"`;
    const result = injectConfigWtf(content, 'portal', 'new.server.com');
    expect(result).toContain('SET portal "new.server.com"');
    expect(result).not.toContain('old.server.com');
  });
});

describe('getConfigConnectionKey', () => {
  it('returns portal for MoP', () => {
    expect(getConfigConnectionKey('5.4.8')).toBe('portal');
  });
});

describe('isValidLocaleFolder', () => {
  it('validates correct locale formats', () => {
    expect(isValidLocaleFolder('enUS')).toBe(true);
    expect(isValidLocaleFolder('enGB')).toBe(true);
    expect(isValidLocaleFolder('deDE')).toBe(true);
    expect(isValidLocaleFolder('frFR')).toBe(true);
    expect(isValidLocaleFolder('ruRU')).toBe(true);
  });

  it('rejects invalid formats', () => {
    expect(isValidLocaleFolder('english')).toBe(false);
    expect(isValidLocaleFolder('EN')).toBe(false);
    expect(isValidLocaleFolder('enus')).toBe(false);
    expect(isValidLocaleFolder('ENUS')).toBe(false);
    expect(isValidLocaleFolder('enU')).toBe(false);
  });
});

describe('sanitizeAddonFolderName', () => {
  it('removes -master suffix', () => {
    expect(sanitizeAddonFolderName('pfUI-master')).toBe('pfUI');
  });

  it('removes -main suffix', () => {
    expect(sanitizeAddonFolderName('MyAddon-main')).toBe('MyAddon');
  });

  it('removes -develop suffix', () => {
    expect(sanitizeAddonFolderName('Addon-develop')).toBe('Addon');
  });

  it('removes -dev suffix', () => {
    expect(sanitizeAddonFolderName('TestAddon-dev')).toBe('TestAddon');
  });

  it('is case insensitive', () => {
    expect(sanitizeAddonFolderName('Addon-MASTER')).toBe('Addon');
    expect(sanitizeAddonFolderName('Addon-Main')).toBe('Addon');
  });

  it('preserves names without suffixes', () => {
    expect(sanitizeAddonFolderName('pfUI')).toBe('pfUI');
    expect(sanitizeAddonFolderName('ElvUI')).toBe('ElvUI');
  });
});
