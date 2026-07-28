import path from 'path';

export interface SecurityAuditLog {
  timestamp: string;
  studentId: string;
  command: string;
  reason: string;
  ip?: string;
}

export class SecurityValidator {
  private static auditLogs: SecurityAuditLog[] = [];

  // Blacklisted dangerous binaries & execution patterns
  private static BLACKLISTED_PATTERNS = [
    /\bsudo\b/i,
    /\bsu\b/i,
    /\breboot\b/i,
    /\bshutdown\b/i,
    /\bdocker\b/i,
    /\bkubectl\b/i,
    /\bchown\b/i,
    /\bchmod\s+777\b/i,
    /\bmkfs\b/i,
    /\bdd\b/i,
    /rm\s+-[rRfF]*\s+[\/\*]/i,
    /:\(\)\{\s*:\|\:&\s*\};:/i, // Fork bomb
    />\s*\/dev\/sd[a-z]/i,
    /\bcurl\b.*\|.*bash\b/i,
    /\bwget\b.*\|.*sh\b/i,
  ];

  // Restricted directory paths & sensitive files
  private static RESTRICTED_PATHS = [
    '/.env',
    '/.git',
    '/node_modules',
    '/backend',
    '/frontend',
    '/root',
    '/etc',
    '/var',
    '/proc',
    '/sys',
    '/boot',
    '/dev',
    '..',
  ];

  /**
   * Validates command safety and ensures it operates within the isolated workspace.
   */
  public static validateCommand(
    commandStr: string,
    studentId: string,
    workspacePath: string,
    clientIp?: string
  ): { allowed: boolean; reason?: string } {
    const trimmed = commandStr.trim();

    if (!trimmed) {
      return { allowed: true };
    }

    // 1. Check Blacklisted Command Patterns
    for (const pattern of this.BLACKLISTED_PATTERNS) {
      if (pattern.test(trimmed)) {
        const reason = 'Permission Denied: Dangerous command execution blocked by Security Protocol.';
        this.logSecurityAttempt(studentId, trimmed, reason, clientIp);
        return { allowed: false, reason };
      }
    }

    // 2. Check Restricted Path Traversals in command parameters
    const lowerCmd = trimmed.toLowerCase();
    for (const restricted of this.RESTRICTED_PATHS) {
      // Allow relative git subdirectories, but block system or root traversal
      if (
        lowerCmd.includes(restricted) &&
        !lowerCmd.includes('.git/') &&
        !lowerCmd.includes('.gitignore')
      ) {
        // Double check path normalization
        if (
          lowerCmd.includes('../') ||
          lowerCmd.includes('/.env') ||
          lowerCmd.includes('/backend') ||
          lowerCmd.includes('/frontend') ||
          lowerCmd.includes('node_modules') ||
          lowerCmd.includes('/root')
        ) {
          const reason = `Permission Denied: Access to restricted path or source directory is forbidden.`;
          this.logSecurityAttempt(studentId, trimmed, reason, clientIp);
          return { allowed: false, reason };
        }
      }
    }

    return { allowed: true };
  }

  /**
   * Validates if a file path stays within the designated workspace sandbox directory.
   */
  public static validatePathInSandbox(
    targetPath: string,
    workspacePath: string
  ): boolean {
    const resolvedTarget = path.resolve(workspacePath, targetPath);
    const resolvedWorkspace = path.resolve(workspacePath);
    return resolvedTarget.startsWith(resolvedWorkspace);
  }

  /**
   * Audit log recorder for security violations.
   */
  public static logSecurityAttempt(
    studentId: string,
    command: string,
    reason: string,
    ip?: string
  ): void {
    const entry: SecurityAuditLog = {
      timestamp: new Date().toISOString(),
      studentId,
      command,
      reason,
      ip,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    console.warn(`[SECURITY AUDIT ALERT] Student: ${studentId} | Command: "${command}" | Reason: ${reason}`);
  }

  /**
   * Retrieves security audit logs for admin inspection.
   */
  public static getAuditLogs(): SecurityAuditLog[] {
    return [...this.auditLogs];
  }
}
