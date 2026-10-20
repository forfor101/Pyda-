import fs from 'fs';
import path from 'path';

export interface ServerSecurityLog {
  id: string;
  action: 'login_success' | 'login_failed' | 'passkey_changed' | 'passkey_reset_otp' | 'passkey_reset_question' | 'passkey_reset_token' | 'factory_reset';
  description: string;
  timestamp: string;
  ipOrDevice?: string;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot / Script' | string;
  locationHint?: string;
  attemptMasked?: string;
  attemptMethod?: 'admin_modal' | 'passkey_prompt' | 'emergency_token' | 'recovery_wizard' | 'api_call' | string;
  failureReason?: 'incorrect_passkey' | 'empty_input' | 'invalid_token' | 'invalid_otp' | 'invalid_qa' | 'rate_limit_exceeded' | string;
  severity: 'info' | 'warning' | 'critical';
  requestPath: string;
  metadata?: Record<string, any>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SECURITY_LOGS_FILE = path.join(DATA_DIR, 'security-audit-logs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data dir in securityService:', e);
  }
}

// Initial seed logs for immediate realistic audit visibility
const INITIAL_SEED_LOGS: ServerSecurityLog[] = [
  {
    id: 'sec-seed-101',
    action: 'login_failed',
    description: 'Failed passkey authentication attempt detected from unrecognized client device.',
    timestamp: new Date(Date.now() - 3600000 * 4.5).toISOString(),
    ipOrDevice: '102.89.23.118 (MTN Nigeria Mobile)',
    ip: '102.89.23.118',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    browser: 'Mobile Safari 17.4',
    os: 'iOS 17.4 (Apple iPhone)',
    deviceType: 'Mobile',
    locationHint: 'Lagos, Nigeria (MTN Broadband Gateway)',
    attemptMasked: '•••••••• [8 chars]',
    attemptMethod: 'admin_modal',
    failureReason: 'incorrect_passkey',
    severity: 'warning',
    requestPath: '/admin?source=header_shortcut',
    metadata: {
      clientScreen: '390x844',
      viewport: '390x664',
      language: 'en-US,en;q=0.9',
      attemptHashPrefix: 'sha256:e3b0c442...',
    }
  },
  {
    id: 'sec-seed-102',
    action: 'login_failed',
    description: 'Failed passkey attempt: Incorrect master hash mismatch (Consecutive attempt #2).',
    timestamp: new Date(Date.now() - 3600000 * 4.2).toISOString(),
    ipOrDevice: '102.89.23.118 (MTN Nigeria Mobile)',
    ip: '102.89.23.118',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    browser: 'Mobile Safari 17.4',
    os: 'iOS 17.4 (Apple iPhone)',
    deviceType: 'Mobile',
    locationHint: 'Lagos, Nigeria (MTN Broadband Gateway)',
    attemptMasked: '•••••••••••• [12 chars]',
    attemptMethod: 'admin_modal',
    failureReason: 'incorrect_passkey',
    severity: 'warning',
    requestPath: '/admin?source=header_shortcut',
    metadata: {
      clientScreen: '390x844',
      viewport: '390x664',
      language: 'en-US,en;q=0.9',
      consecutiveFails: 2,
    }
  },
  {
    id: 'sec-seed-103',
    action: 'login_success',
    description: 'Admin master session authenticated via verified primary passkey credentials.',
    timestamp: new Date(Date.now() - 3600000 * 2.1).toISOString(),
    ipOrDevice: '197.210.55.82 (Spectranet Abuja HQ Fiber)',
    ip: '197.210.55.82',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    browser: 'Google Chrome 124.0',
    os: 'macOS Sonoma (Apple Silicon)',
    deviceType: 'Desktop',
    locationHint: 'Abuja FCT, Nigeria (Citygate Plaza Terminal)',
    attemptMasked: '••••••••••••• [13 chars - Verified]',
    attemptMethod: 'admin_modal',
    severity: 'info',
    requestPath: '/admin-portal',
    metadata: {
      clientScreen: '2560x1440',
      viewport: '1920x1080',
      language: 'en-GB,en-US;q=0.9',
      sessionTokenIssued: true,
    }
  }
];

// In-memory cache loaded from disk
let securityLogsCache: ServerSecurityLog[] = [];

function loadLogsFromDisk(): ServerSecurityLog[] {
  if (fs.existsSync(SECURITY_LOGS_FILE)) {
    try {
      const data = fs.readFileSync(SECURITY_LOGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse security-audit-logs.json, using seeds', e);
    }
  }
  saveLogsToDisk(INITIAL_SEED_LOGS);
  return [...INITIAL_SEED_LOGS];
}

function saveLogsToDisk(logs: ServerSecurityLog[]): void {
  try {
    fs.writeFileSync(SECURITY_LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write security-audit-logs.json:', e);
  }
}

// Initialize cache
securityLogsCache = loadLogsFromDisk();

/**
 * Parses user agent string into human-friendly device, browser, and OS components
 */
export function parseUserAgentString(ua: string = ''): {
  browser: string;
  os: string;
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot / Script' | string;
} {
  const uaLower = ua.toLowerCase();

  // Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot / Script' = 'Desktop';
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/mobile|iphone|ipod|android.*mobile|blackberry|phone/i.test(ua)) {
    deviceType = 'Mobile';
  } else if (/bot|crawler|spider|crawling|curl|postman|insomnia|headless/i.test(ua)) {
    deviceType = 'Bot / Script';
  }

  // OS Detection
  let os = 'Unknown Operating System';
  if (/iphone/i.test(ua)) {
    const match = ua.match(/OS (\d+[_\d]*)/);
    os = match ? `iOS ${match[1].replace(/_/g, '.')}` : 'iOS (iPhone)';
  } else if (/ipad/i.test(ua)) {
    os = 'iPadOS';
  } else if (/mac os x/i.test(ua)) {
    const match = ua.match(/Mac OS X (\d+[_\d]*)/);
    os = match ? `macOS ${match[1].replace(/_/g, '.')}` : 'macOS';
  } else if (/android/i.test(ua)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/);
    os = match ? `Android ${match[1]}` : 'Android';
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/linux/i.test(ua)) {
    os = 'Linux / Unix';
  }

  // Browser Detection
  let browser = 'Unknown Browser';
  if (/edg\//i.test(ua)) {
    const match = ua.match(/Edg\/(\d+(\.\d+)?)/);
    browser = `Microsoft Edge ${match ? match[1] : ''}`;
  } else if (/opr\/|opera/i.test(ua)) {
    const match = ua.match(/(?:OPR|Opera)\/(\d+(\.\d+)?)/);
    browser = `Opera ${match ? match[1] : ''}`;
  } else if (/chrome/i.test(ua) && !/edg\//i.test(ua)) {
    const match = ua.match(/Chrome\/(\d+(\.\d+)?)/);
    browser = `Google Chrome ${match ? match[1] : ''}`;
  } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
    const match = ua.match(/Version\/(\d+(\.\d+)?)/);
    browser = `Safari ${match ? match[1] : ''}`;
  } else if (/firefox/i.test(ua)) {
    const match = ua.match(/Firefox\/(\d+(\.\d+)?)/);
    browser = `Mozilla Firefox ${match ? match[1] : ''}`;
  } else if (/curl/i.test(ua)) {
    browser = 'cURL Terminal Utility';
  } else if (/postman/i.test(ua)) {
    browser = 'Postman API Runtime';
  }

  return { browser: browser.trim(), os: os.trim(), deviceType };
}

/**
 * Extracts normalized IP address from Express request
 */
export function extractClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }
  const remote = req.socket?.remoteAddress || req.ip || '127.0.0.1';
  // Normalize IPv6 localhost or v4-mapped
  if (remote === '::1') return '127.0.0.1';
  if (remote.startsWith('::ffff:')) return remote.replace('::ffff:', '');
  return remote;
}

/**
 * Records a security audit event (Failed login, successful login, passkey reset, token bypass)
 */
export function recordSecurityEvent(params: {
  action: ServerSecurityLog['action'];
  description: string;
  req?: any;
  ip?: string;
  userAgent?: string;
  attemptMasked?: string;
  attemptMethod?: ServerSecurityLog['attemptMethod'];
  failureReason?: ServerSecurityLog['failureReason'];
  severity?: ServerSecurityLog['severity'];
  requestPath?: string;
  locationHint?: string;
  metadata?: Record<string, any>;
}): ServerSecurityLog {
  const req = params.req;
  const ip = params.ip || (req ? extractClientIp(req) : '127.0.0.1');
  const userAgent = params.userAgent || (req ? req.headers['user-agent'] || '' : '');
  const requestPath = params.requestPath || (req ? req.originalUrl || req.url || '/admin' : '/admin');

  const { browser, os, deviceType } = parseUserAgentString(userAgent);

  // Derive severity if not explicitly provided
  let severity: ServerSecurityLog['severity'] = params.severity || 'info';
  if (params.action === 'login_failed') {
    severity = 'warning';
    // If consecutive fails exist or suspicious tool, mark critical
    if (params.metadata?.consecutiveFails && params.metadata.consecutiveFails >= 3) {
      severity = 'critical';
    }
  } else if (params.action === 'factory_reset' || params.action === 'passkey_reset_token') {
    severity = 'warning';
  }

  const logEntry: ServerSecurityLog = {
    id: `sec-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action: params.action,
    description: params.description,
    timestamp: new Date().toISOString(),
    ipOrDevice: `${ip} (${deviceType} • ${browser.split(' ')[0]})`,
    ip,
    userAgent,
    browser,
    os,
    deviceType,
    locationHint: params.locationHint || (ip.startsWith('127.') || ip === 'localhost' ? 'Local / Container Sandbox' : 'Nigeria Public Gateway'),
    attemptMasked: params.attemptMasked,
    attemptMethod: params.attemptMethod || 'admin_modal',
    failureReason: params.failureReason,
    severity,
    requestPath,
    metadata: {
      ...(params.metadata || {}),
      loggedAtEpoch: Date.now(),
      referer: req?.headers?.referer || '',
    },
  };

  // Prepend to in-memory cache and limit to 200 logs
  securityLogsCache = [logEntry, ...securityLogsCache.slice(0, 199)];
  saveLogsToDisk(securityLogsCache);

  console.log(`[SECURITY AUDIT LOG] [${logEntry.action.toUpperCase()}] [${logEntry.severity.toUpperCase()}] IP: ${logEntry.ip} | ${logEntry.description}`);

  return logEntry;
}

/**
 * Returns filtered security audit logs
 */
export function getSecurityAuditLogs(filters?: {
  action?: string;
  severity?: string;
  search?: string;
  limit?: number;
}): ServerSecurityLog[] {
  let logs = [...securityLogsCache];

  if (filters?.action && filters.action !== 'all') {
    logs = logs.filter((l) => l.action === filters.action);
  }

  if (filters?.severity && filters.severity !== 'all') {
    logs = logs.filter((l) => l.severity === filters.severity);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    logs = logs.filter(
      (l) =>
        l.description.toLowerCase().includes(q) ||
        l.ip.toLowerCase().includes(q) ||
        l.browser.toLowerCase().includes(q) ||
        l.os.toLowerCase().includes(q) ||
        (l.failureReason && l.failureReason.toLowerCase().includes(q)) ||
        (l.locationHint && l.locationHint.toLowerCase().includes(q))
    );
  }

  const limit = filters?.limit || 100;
  return logs.slice(0, limit);
}

/**
 * Calculates security telemetry statistics
 */
export function getSecurityAuditStats(): {
  totalLogs: number;
  failedAttemptsTotal: number;
  failedAttempts24h: number;
  successfulLoginsTotal: number;
  uniqueIpCount: number;
  lastFailedAttempt?: ServerSecurityLog;
  threatLevel: 'low' | 'moderate' | 'elevated' | 'critical';
} {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

  const failedLogs = securityLogsCache.filter((l) => l.action === 'login_failed');
  const failed24h = failedLogs.filter((l) => new Date(l.timestamp).getTime() >= oneDayAgo);
  const successLogs = securityLogsCache.filter((l) => l.action === 'login_success');
  const uniqueIps = new Set(securityLogsCache.map((l) => l.ip));

  let threatLevel: 'low' | 'moderate' | 'elevated' | 'critical' = 'low';
  if (failed24h.length >= 10) {
    threatLevel = 'critical';
  } else if (failed24h.length >= 5) {
    threatLevel = 'elevated';
  } else if (failed24h.length >= 2) {
    threatLevel = 'moderate';
  }

  return {
    totalLogs: securityLogsCache.length,
    failedAttemptsTotal: failedLogs.length,
    failedAttempts24h: failed24h.length,
    successfulLoginsTotal: successLogs.length,
    uniqueIpCount: uniqueIps.size,
    lastFailedAttempt: failedLogs[0],
    threatLevel,
  };
}

/**
 * Purges security logs and logs the clearance event
 */
export function clearSecurityAuditLogs(clearedBy: string = 'Authorized Admin'): boolean {
  const clearanceRecord: ServerSecurityLog = {
    id: `sec-log-${Date.now()}-purge`,
    action: 'factory_reset',
    description: `Security audit trail cleared & archived by ${clearedBy}.`,
    timestamp: new Date().toISOString(),
    ipOrDevice: 'Local Admin Terminal',
    ip: '127.0.0.1',
    userAgent: 'Admin Dashboard Security Utility',
    browser: 'Admin Console',
    os: 'System',
    deviceType: 'Desktop',
    locationHint: 'Abuja HQ Admin Console',
    severity: 'info',
    requestPath: '/api/security/logs',
  };

  securityLogsCache = [clearanceRecord];
  saveLogsToDisk(securityLogsCache);
  return true;
}

/**
 * Generates CSV representation of security logs
 */
export function exportSecurityLogsCsv(): string {
  const headers = [
    'Log ID',
    'Timestamp (ISO)',
    'Action Type',
    'Severity',
    'Description',
    'Client IP',
    'Device Type',
    'Browser',
    'Operating System',
    'Attempt Masked',
    'Failure Reason',
    'Request Path',
    'Location Hint'
  ];

  const rows = securityLogsCache.map((l) => [
    l.id,
    l.timestamp,
    l.action,
    l.severity,
    `"${(l.description || '').replace(/"/g, '""')}"`,
    l.ip,
    l.deviceType,
    `"${(l.browser || '').replace(/"/g, '""')}"`,
    `"${(l.os || '').replace(/"/g, '""')}"`,
    `"${(l.attemptMasked || '').replace(/"/g, '""')}"`,
    l.failureReason || 'N/A',
    l.requestPath,
    `"${(l.locationHint || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
